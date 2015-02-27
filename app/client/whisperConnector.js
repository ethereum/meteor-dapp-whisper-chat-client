/**
Template Controllers

@module WhisperConnection
*/

Meteor.startup(function(){
    var appName = 'whisper-chat-client',
        user = User.findOne();


    // CREATE IDENTITY ---------------------------------------------------------------------

    // if NO USER exists, CREATE a NEW ONE
    if(!user) {
        var identity = null;
        try {
            identity = web3.shh.newIdentity();
        } catch(error) {
            Whisper.showIdentityErrorModal();
        }

        if(identity) {
            // random username!
            var username = chance.capitalize(chance.word());

            User.insert({
                identities: [{
                    name: username,
                    identity: identity,
                    selected: true
                }],
                following: []
            });

            // ADD CURRENT USER ALSO as a USER IDENTITY
            Users.upsert(identity, {
                _id: identity,
                identity: identity,
                name: username
            });
        }

    // CHECK if the IDENTITY IS still VALID, if not create a new one
    } else {
        try {
            if(!web3.shh.hasIdentity(Whisper.getIdentity().identity)) {
                var identity = web3.shh.newIdentity();

                // random username!
                var username = chance.capitalize(chance.word());

                if(identity) {
                    User.update(user._id, {$set: {
                            identities: [{
                                name: username,
                                identity: identity,
                                selected: true
                            }]
                        }
                    });


                    // ADD CURRENT USER ALSO as a USER IDENTITY
                    Users.upsert(identity, {
                        _id: identity,
                        identity: identity,
                        name: username
                    });
                }
            }
        } catch(error) {
            Whisper.showIdentityErrorModal();
        }
    }




    // COMMUNICATE with WHISPER ---------------------------------------------------------------------
    

    // TEST encryption watcher
    // web3.shh.filter({
    //     "topic": [ appName, Whisper.getIdentity().identity ]
    // }).watch(function(message){
    //     console.log(web3.toAscii(message.payload));
    // });


    // WATCH for personal messages
    /**
    When a personal message arrives. Create a new private chat.
        
    @method personalMessageArrived
    */
    web3.shh.filter({
        "topic": [ appName, Whisper.getIdentity().identity ],
        "to": Whisper.getIdentity().identity
    }).watch(function(message){

        // if i got a message, create a new chat, if none exists already
        // console.log('Personal message', message);

        // Makes sure it comes from somebody and is ment for me, and doesn't already exists
        if(message.to === Whisper.getIdentity().identity) {

            var payload = {};

            // check if it was a json
            try {
                EJSON.parse(web3.toAscii(message.payloadRaw));

            } catch(error) {
                return;
            }

            // add anonymous (user without username)
            if(!payload.from)
                payload.from = {};


            // add to the users collection
            Users.upsert(message.from, {
                _id: message.from,
                identity: message.from,
                name: payload.from.name
            });

            var chatId = payload.privateChat ? message.from : payload.chat;


            // IF INVITE add group or private chat
            if(chatId && 
               (payload.type === 'invite' || payload.type === 'message') &&
               !Chats.findOne(chatId) && 
               (!_.isEmpty(web3.toAscii(message.from)) || !payload.privateChat)) {

                var users = [message.from];


                // add the identities of the users invited
                if(!payload.privateChat && _.isArray(payload.data)) {
                    _.each(payload.data, function(item) {
                        
                        users.push(item.identity);

                        Users.upsert(item.identity, {
                            _id: item.identity,
                            identity: item.identity,
                            name: item.name
                        });
                    });
                }

                // remove myself from the users list
                users = _.without(users, message.to);

                // add invited chat, if its not already existing
                Chats.insert({
                    _id: chatId,
                    name: (!payload.privateChat) ? payload.name : undefined,
                    filteredTopics: null,
                    lastActivity: moment().unix(),
                    messages: [],
                    users: users,
                    privateChat: (payload.privateChat) ? message.from : undefined,
                    invitation: true
                });

                // SOUND
                $('#sound-invite')[0].play();
            }
        }
    });

    /**
    List of collected watchers, which will be used to cancel listening.

    @property watchers
    */
    var watchers = {};

    /**
    Observe chats, listen for new messages.

    @class Chats.find({}).observe
    @constructor
    */
    Chats.find({}).observe({
        /**
        This will observe the chats.
        If a new chat is created it will start listening for messages containing the chats _id (topic or sessionkey).

        If a new message arrives, it will add it as entry to the messages collection, connected to this chat.

        The chats document `_id` is also the chats topic.


        Also works when send plain messages e.g.:

            web3.shh.post({    
                "topic": ['whisper-chat-client' , '6SCuCN4X4eSoQNSK7'],
                "payload": 'hello',
                "ttl": 100,
                "priority": 1000
            })


        @method added
        */
        added: function(newDocument) {
            var chatOptions = {
                "topic": [
                    appName,
                    (newDocument.privateChat) ? Whisper.getIdentity().identity : newDocument._id
                ]
            };

            // set a "to", if its a PRIVATE CHAT (means its ID is a user identity)
            if(newDocument.privateChat) {
                chatOptions.to = Whisper.getIdentity().identity; // use the current identity to decrypt
                chatOptions.from = newDocument.privateChat
            }

            // start watching
            watchers[newDocument._id] = web3.shh.filter(chatOptions);

 
            // IF a MESSAGE ARRIVED
            watchers[newDocument._id].watch(function(message){
                var payload = {};

                // try to decode
                try {
                    EJSON.parse(web3.toAscii(message.payloadRaw));

                    if(!_.isObject(payload.from))
                        message.payload.from = {};

                    // SET the GIVEN IDENTITY, if not empty (overwriting the one from the payload.from.identity)
                    if(!_.isEmpty(web3.toAscii(message.from)))
                        message.payload.from.identity = message.from;


                // build message from anonymous
                } catch(error) {

                    console.warn('Couldn\'t parse message', error);

                    payload = {
                        id: Random.id(),
                        // put it to this chat TODO: bad idea! waiting for callback issue to be fixed. https://github.com/ethereum/cpp-ethereum/issues/884
                        chat: newDocument._id,
                        from: {
                            identity: message.from
                        },
                        message: message.payload
                    };
                }


                // IF PRIVATECHAT, USE the OTHER USERS IDENTITY AS CHAT ID
                if(newDocument.privateChat)
                    message.payload.chat = message.from || message.payload.from.identity;


                // DONT add/edit messages, if its from myself, or is from another chat
                if(message.payload.from.identity !== Whisper.getIdentity().identity && //  TODO: later change to message.from
                   message.payload.chat === newDocument._id &&
                   Chats.findOne(newDocument._id)) { 

                    console.log('Chat message');
                    console.log(message, message.payload);

                    // INSERT IF its a NEW MESSAGE or NOTIFICATIONs
                    if((message.payload.type === 'message' ||
                        message.payload.type === 'notification' ||
                        !message.payload.type) &&
                       !Messages.findOne(message.payload.id)) {

                        // cut to long messages and username
                        if(message.payload.message)
                            message.payload.message = message.payload.message.substr(0, 50000);
                        if(message.payload.from.name)
                            message.payload.from.name = message.payload.from.name.substr(0, 100);


                        // if the chat got a message, store it as entry
                        if(Whisper.addMessage(newDocument._id, {
                            _id: message.payload.id, // use the same id, as your opponen has, so we can prevent duplicates
                            type: message.payload.type,
                            chat: message.payload.chat,
                            timestamp: message.sent || message.payload.timestamp,
                            topic: message.payload.topic,
                            unread: true,
                            from: message.payload.from,
                            message: message.payload.message,
                            data: message.payload.data
                        })) {

                            // add the entry to the chats entry list
                            Chats.update(newDocument._id, {
                                $addToSet: {
                                    users: payload.from.identity
                                }
                            });
                        }


                        // -> Add/UPDATE the current messages USER
                        if(!_.isEmpty(web3.toAscii(message.payload.from.identity))) {
                            Users.upsert(message.payload.from.identity, {
                                _id: message.payload.from.identity,
                                identity: message.payload.from.identity,
                                name: message.payload.from.name
                            });
                        }


                        // CHANGE the current CHATS NAME
                        if(message.payload.type === 'notification' &&
                           message.payload.message === 'chatNameChanged') {
                            Chats.update(newDocument._id, {
                                $set: {
                                    name: message.payload.data
                                }
                            });
                        }

                        // SOUND
                        if(message.payload.type === 'message')
                            $('#sound-message')[0].play();
                        
                        // update also badge
                        $('meta[name="ethereum-dapp-badge"]').prop('content', Math.floor(Math.random()*999));

                        


                    // EDIT if existing message
                    // should exist already
                    // and should not be older than 1 hour
                    } else if(message.payload.type === 'edit') {

                        var oldMessage = Messages.findOne(message.payload.id);
                        if(oldMessage &&
                           oldMessage.timestamp > moment().subtract(1, 'hour').unix()) {

                            Messages.update(message.payload.id, {
                                $set: {
                                    topic: message.payload.topic,
                                    message: message.payload.message,
                                    edited: message.sent || message.payload.timestamp
                                }
                            });
                        }
                    }

                }
            });


            // TODO: TRIGGER to get still floating messages
            // watchers[newDocument._id].messages();
        },
        /**
        Checks if a chat was removed, if so it will stop watching for messages for that chat.

        @method removed
        */
        removed: function(oldDocument) {

            // stop watching on that chat
            if(watchers[oldDocument._id]) {
                // TODO?: uninstall watchers private watchers (will remove also personal watcher)
                if(!oldDocument.privateChat)
                    watchers[oldDocument._id].uninstall();
                delete watchers[oldDocument._id];
            }
        },
        changed: function (newDocument, oldDocument) {

        }
    });


    /**
    Observe messages, send messages.

    @class Messages.find({}).observe
    @constructor
    */
    Messages.find({}).observe({
        /**
        Checks if a new message entry was created, if so propagate it to the whisper network.
        See the chats.js for more.

        The whisper message paylod should look like this:

            {
                type: 'message',
                id: '231rewf23', // the unique id of the message
                chat: '2ff34f34f', // the parent chats id/secret-key. Can also be the identity of a user, so it will be an encrypted private chat
                timestamp: 142354534,
                topic: 'my topic', // the topic set for the chat, to filter chats with many participants
                from: {
                    identity: '0x4324234..', // the users identity, later we use the protocols native "from"
                    name: 'my username'
                },
                message: 'Hello its me!',
            }

        The whisper invitation notification paylod should look like this:

            {
                type: 'notification',
                message: 'invitation',
                chat: '234sdfasdasd',
                timestamp: 14445345,
                from: {
                    identity: Whisper.getIdentity().identity,
                    name: Whisper.getIdentity().name
                },
                data: [{
                    identity: '0x345345345..',
                    name: 'user x'
                },
                {
                    identity: '0x67554345..',
                    name: 'user y'
                }]
            }


        @method added
        */
        added: function(newDocument) {
            var chat = Chats.findOne(newDocument.chat);

            // if a chat for that entry was found, propagate it to the whisper network
            // But only send messages, which come from myself, otherwise i would re-send received messages!
            if(chat &&
               newDocument.sending &&
               newDocument.from.identity === Whisper.getIdentity().identity) {
                
                // change _id to id
                newDocument.id = newDocument._id;
                delete newDocument._id;

                var message = {
                    "from": Whisper.getIdentity().identity,
                    "topic": [
                        appName,
                        chat.privateChat || newDocument.chat
                    ],
                    "payload": newDocument,
                    "ttl": 100,
                    "priority": 1000
                };

                // add the "to", if its a private message (means the chat id is the one of a user)
                if(chat.privateChat)
                    message.to = chat.privateChat;

                console.log('Send message', newDocument);

                try {
                    // SEND
                    web3.shh.post(message);

                    // remove the send, after storing
                    Messages.update(newDocument.id, {$unset: {sending: ''}});

                } catch(error) {
                    Whisper.showIdentityErrorModal();
                }


            }

        },
        /**
        Sends an edit for an message, which will patch the message on the receiver side.

        Edits are only allowed withing one hour of the message creation.
        
        The whisper edit paylod should look like this:
            {
                type: 'edit',
                id: 'fsdf32sdfs',
                topic: 'my new topic',
                message: 'my edited message',
                edited: 12354566 // timestamp
            }
            
        @method changed
        */
        changed: function (newDocument, oldDocument) {
            var chat = Chats.findOne(newDocument.chat);

            if(newDocument.type === 'edit') {
                // change _id to id
                newDocument.id = newDocument._id;
                delete newDocument._id;

                var message = {
                    "from": newDocument.from.identity,
                    "topic": [
                        appName,
                        chat.privateChat || newDocument.chat
                    ],
                    "payload": newDocument,
                    "ttl": 100,
                    "priority": 1000
                };

                // add the "to", if its a private message (means the chat id is the one of a user)
                if(chat.privateChat)
                    message.to = chat.privateChat;

                console.log('Edited message', newDocument);


                try {

                    // SEND
                    web3.shh.post(message);

                } catch(error) {
                    Whisper.showIdentityErrorModal();
                }

                // remove the type, after storing
                Messages.update(newDocument.id, {$unset: {type: ''}});
            }
        }
    });



    /**
    Observe invitations, send inviation and remove it from the collection.

    @class Chats.find({}).observe
    @constructor
    */
    Invitations.find({}).observe({
        /**
        Checks if an invitation was add, send it out and remove it from the collection.

        The whisper invitation paylod should look like this:

            {
                type: 'invite',
                chat: '234sdfasdasd',
                name: 'My Chatroom',
                timestamp: 12334455,
                from: {
                    identity: Whisper.getIdentity().identity,
                    name: Whisper.getIdentity().name
                },
                to: '0x34556456..',
                // the users invited
                data: [{
                    identity: '0x345345345..',
                    name: 'user x'
                },
                {
                    identity: '0x67554345..',
                    name: 'user y'
                }]
            }

        @method added
        */
        added: function(newDocument) {
            var chat = Chats.findOne(newDocument.chat);

            // if a chat for that entry was found, propagate it to the whisper network
            // But only send messages, which come from myself, otherwise i would re-send received messages!
            if(chat &&
               newDocument.type === 'invite' &&
               newDocument.from.identity === Whisper.getIdentity().identity) {

                var message = {
                    "from": Whisper.getIdentity().identity,
                    "to": newDocument.to,
                    "topic": [
                        appName,
                        newDocument.to
                    ],
                    "payload": newDocument,
                    "ttl": 100,
                    "priority": 1000
                };
                
                console.log('Send invite', newDocument);


                try {
                    // SEND
                    web3.shh.post(message);

                } catch(error) {
                    Whisper.showIdentityErrorModal();
                }

                // remove the invitation, after
                Invitations.remove(newDocument._id);
            }

        }
    });

});


