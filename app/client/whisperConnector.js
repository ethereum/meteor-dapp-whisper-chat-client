/**
Template Controllers

@module WhisperConnection
*/


Meteor.startup(function(){
    var appName = web3.fromAscii('whisper-chat-client'),
        user = User.findOne();

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
            if(!web3.shh.haveIdentity(Whisper.getIdentity().identity)) {
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




    // START observing for changes
    

    // TEST encruyption watcher
    // web3.shh.watch({
    //     "topic": [ appName, Whisper.getIdentity().identity ]
    // }).arrived(function(message){
    //     console.log(web3.toAscii(message.payload));
    // });


    // WATCH for personal messages
    web3.shh.watch({
        "topic": [ appName, Whisper.getIdentity().identity ],
        "to": Whisper.getIdentity().identity

    /**
    When a personal message arrives. Create a new private chat.
        
    @method personalMessageArrived
    */
    }).arrived(function(message){

        // if i got a message, create a new chat, if none exists already
        // console.log('Personal message', message, web3.toAscii(message.payload));

        // Makes sure it comes from somebody and is ment for me, and doesn't already exists
        if(!Chats.findOne(message.from) &&
           !_.isEmpty(web3.toAscii(message.from)) &&
           message.to === Whisper.getIdentity().identity) {

            var payload = {};

            try {
                payload = EJSON.parse(web3.toAscii(message.payload));

            // build anonymous message
            } catch(error) {
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

            // add privat chat, if its not already existing
            Chats.insert({
                _id: message.from,
                name: null,
                lastActivity: new Date(),
                messages: [],
                privateChat: message.from,
                users: [message.from]
            });

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
                "topics": [web3.fromAscii('whisper-chat-client') , web3.fromAscii('6SCuCN4X4eSoQNSK7')],
                "payload": web3.fromAscii('hello'),
                "ttl": 100,
                "priority": 1000
            })


        @method added
        */
        added: function(newDocument) {
            var chatOptions = {
                "topic": [
                    appName,
                    (newDocument.privateChat) ? Whisper.getIdentity().identity : web3.fromAscii(newDocument._id)
                ]
            };

            // set a "to", if its a PRIVATE CHAT (means its ID is a user identity)
            if(newDocument.privateChat) {
                chatOptions.to = Whisper.getIdentity().identity; // use the current identity to decrypt
                // chatOptions.from = newDocument.privateChat
            }

            // start watching
            watchers[newDocument._id] = web3.shh.watch(chatOptions);

            // TODO: GET EXISITNG MESSAGES??
            // watchers[newDocument._id].messages();


            // IF a MESSAGE ARRIVED
            watchers[newDocument._id].arrived(function(message){

                var payload = {};

                // try to decode
                try {
                    payload = EJSON.parse(web3.toAscii(message.payload));

                    if(!_.isObject(payload.from))
                        payload.from = {};

                    // SET the GIVEN IDENTITY, if not empty (overwriting the one from the payload.from.identity)
                    if(!_.isEmpty(web3.toAscii(message.from)))
                        payload.from.identity = message.from;


                // build anonymous message
                } catch(error) {
                    payload = {
                        id: Random.id(),
                        // put it to this chat TODO: bad idea! waiting for callback issue to be fixed. https://github.com/ethereum/cpp-ethereum/issues/884
                        chat: newDocument._id,
                        from: {
                            identity: message.from
                        },
                        message: web3.toAscii(message.payload)
                    };
                }


                // IF PRIVATECHAT, USE the OTHER USERS IDENTITY AS CHAT ID
                if(newDocument.privateChat)
                    payload.chat = payload.from.identity;


                // DONT add/edit messages, if its from myself, or is from another chat
                if(payload.from.identity !== Whisper.getIdentity().identity && //  TODO: later change to message.from
                   payload.chat === newDocument._id) { 
                    
                    // console.log('Chat message', message.from);
                    // console.log(message, payload);

                    // INSERT IF its a NEW MESSAGE
                    if((payload.type === 'message' || !payload.type) &&
                       !Messages.findOne(payload.id)) {

                        // FILTER
                        // cut to long messages and username
                        payload.message = payload.message.substr(0, 50000);
                        if(payload.from.name)
                            payload.from.name = payload.from.name.substr(0, 100);

                        // if the chat got a message, store it as entry
                        var messageId = Messages.insert({
                            _id: payload.id, // use the same id, as your opponen has, so we can prevent duplicates
                            chat: payload.chat,
                            timestamp: moment.unix(message.sent).toDate(),
                            topic: payload.topic,
                            unread: true,
                            from: payload.from,
                            message: payload.message,
                        });

                        // add the entry to the chats entry list
                        Chats.update(newDocument._id, {
                            $addToSet: {
                                messages: messageId,
                                users: payload.from.identity
                            }
                        });

                        // -> Add/UPDATE the current messages USER
                        if(!_.isEmpty(web3.toAscii(payload.from.identity))) {
                            Users.upsert(payload.from.identity, {
                                _id: payload.from.identity,
                                identity: payload.from.identity,
                                name: payload.from.name
                            });
                        }

                        // SOUND downloaded from http://www.pdsounds.org/sounds/blip listed as Public Domain
                        var beep = new Audio('/sounds/bip.mp3');
                        beep.play();


                    // EDIT if existing message
                    // should exist already
                    } else if(payload.type === 'edit' &&
                              Messages.findOne(payload.id)) {

                        Messages.update(payload.id, {
                            $set: {
                                topic: payload.topic,
                                message: payload.message,
                                edited: moment(payload.edited).toDate()
                            }
                        });
                    }

                }
            });
        },
        /**
        Checks if a chat was removed, if so it will stop watching for messages for that chat.

        @method removed
        */
        removed: function(oldDocument) {

            // stop watching on that chat
            if(watchers[oldDocument._id]) {
                watchers[oldDocument._id].uninstall();
                delete watchers[oldDocument._id];
            }
        },
        changed: function (newDocument, oldDocument) {

        }
    });


    /**
    Observe messages, send messages.

    @class Chats.find({}).observe
    @constructor
    */
    Messages.find({}).observe({
        /**
        Checks if a new message entry was created, if so propagate it to the whisper network.
        See the chats.js for more.

        The whisper paylod can look like this:

            {
                id: '231rewf23', // the unique id of the message
                chat: '2ff34f34f', // the parent chats id/secret-key. Can also be the identity of a user, so it will be an encrypted private chat
                type: 'message', // or 'edit'
                timestamp: new Date(),
                topic: 'my topic', // the topic set for the chat, to filter chats with many participants
                from: {
                    identity: '0x4324234..', // the users identity, later we use the protocols native "from"
                    name: 'my username'
                },
                message: 'Hello its me!',
            }

        @method added
        */
        added: function(newDocument) {
            var chat = Chats.findOne(newDocument.chat);

            // if a chat for that entry was found, propagate it to the whisper network
            // But only send messages, which come from myself, otherwise i would re-send received messages!
            if(chat &&
               newDocument.type && // check for type, as existing messages, don't have any
               newDocument.from.identity === Whisper.getIdentity().identity) {
                
                // change _id to id
                newDocument.id = newDocument._id;
                delete newDocument._id;


                var message = {
                    "from": Whisper.getIdentity().identity,
                    "topic": [
                        appName,
                        chat.privateChat || web3.fromAscii(newDocument.chat)
                    ],
                    "payload": web3.fromAscii(EJSON.stringify(newDocument)),
                    "ttl": 100,
                    "priority": 1000
                };

                // add the "to", if its a private message (means the chat id is the one of a user)
                if(chat.privateChat)
                    message.to = chat.privateChat;

                // console.log('Send message', newDocument.message, message);

                // SEND
                web3.shh.post(message);

                // remove the type, after storing
                Messages.update(newDocument.id, {$unset: {type: ''}});
            }

        },
        removed: function(oldDocument) {
        },
        /**
        Sends an edit for an message, which will patch the message on the receiver side.
            
            {
                id: 'fsdf32sdfs',
                type: 'edit',
                topic: 'my new topic',
                message: 'my edited message',
                edited: new Date() // some iso date
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
                        chat.privateChat || web3.fromAscii(newDocument.chat)
                    ],
                    "payload": web3.fromAscii(EJSON.stringify(newDocument)),
                    "ttl": 100,
                    "priority": 1000
                };

                // add the "to", if its a private message (means the chat id is the one of a user)
                if(chat.privateChat)
                    message.to = chat.privateChat;

                // SEND
                web3.shh.post(message);

                // remove the type, after storing
                Messages.update(newDocument.id, {$unset: {type: ''}});
            }
        }
    });

});


