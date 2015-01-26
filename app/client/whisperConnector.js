/**
Template Controllers

@module WhisperConnection
*/


var appName = web3.fromAscii('whisper-chat-client'),
    user = User.findOne();


// if NO USER exists, CREATE a NEW ONE
if(!user) {
    var identity = null;
    try {
        identity = web3.shh.newIdentity();
    } catch(error) {

    }

    User.insert({
        identities: [{
            name: chance.capitalize(chance.word()), // random username!
            identity: identity,
            selected: true
        }],
        following: []
    });

// CHECK if the IDENTITY IS still VALID, if not create a new one
} else if(!web3.shh.haveIdentity(web3.toDecimal(user.identities[0].identity))) {
    var identity = null;
    try {
        identity = web3.shh.newIdentity();
    } catch(error) {

    }

    if(identity) {
        User.update(user._id, {$set: {
                identities: [{
                    name: 'frozeman',
                    identity: web3.shh.newIdentity(),
                    selected: true
                }]
            }
        });
    }
}



// START observing for changes



// WATCH for personal messages
web3.shh.watch({
    "filter": [ appName, Whisper.getIdentity().identity ],
    // "from": Whisper.getIdentity().identity,
    // "to": Whisper.getIdentity().identity,

/**
Personal message arrives.

Example data:

    {    
        expiry: 1422283652,
        from: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        hash: "0x8805d98bd7ee00bfd7d0a55d0b98539f927d0206763b3a3a47f1b60f6eb9db19",
        payload: "0x5768617420697320796f7572206e616d653f",
        sent: 1422283552,
        to: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        ttl: 100,
        workProved: 0
    }
    
@method arrived
*/
}).arrived(function(message){

    // if i got a message, create a new chat, if none exists already
    // console.log('Personal message');

    // console.log(message);
    // new message m
    // console.log(EJSON.parse(web3.toAscii(message.payload)));
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

    @method added
    */
    added: function(newDocument) {

        watchers[newDocument._id] = web3.shh.watch({
            "filter": [ appName, newDocument._id ]
        });

        // IF a MESSAGE ARRIVED
        watchers[newDocument._id].arrived(function(message){

            var payload = EJSON.parse(web3.toAscii(message.payload));

            // DONT add/edit messages, if its from myself, or is from another chat
            if(payload.from.identity !== Whisper.getIdentity().identity && //  TODO: later change to message.from
               payload.chat === newDocument._id) { 
                
                console.log('Chat message');
                console.log(message.payload.message);

                // INSERT IF its a NEW MESSAGE
                if(payload.type === 'message') {

                    // if the chat got a message, store it as entry
                    var messageId = Messages.insert({
                        _id: payload.id, // use the same id, as your opponen has, so we can prevent duplicates
                        chat: payload.chat,
                        timestamp: moment.unix(message.sent).toDate(),
                        topic: payload.topic,
                        unread: true,
                        from: payload.from, // TODO: later change to message.from, be aware the we have here also the {identity: 'dsfsd', name:'sdfsd'}
                        message: payload.message,
                    });

                    // add the entry to the chats entry list
                    Chats.update(newDocument._id, {
                        $addToSet: {messages: messageId}
                    });

                    // Add/UPDATE the current messages USER
                    Users.upsert(payload.from.identity, {
                        _id: payload.from.identity,
                        name: payload.from.name
                    });


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
            chat: '2ff34f34f', // the parent chats id/secret-key
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
        
        // if a chat for that entry was found, propagate it to the whisper network
        // But only send messages, which come from myself, otherwise i would re-send received messages!
        if(Chats.findOne(newDocument.chat) &&
           newDocument.type && // check for type, as existing messages, don't have any
           newDocument.from.identity === Whisper.getIdentity().identity) {
            
            // change _id to id
            newDocument.id = newDocument._id;
            delete newDocument._id;

            console.log('Send message', newDocument.message);

            web3.shh.post({
                "from": Whisper.getIdentity().identity.identity,
                // "to": Whisper.getIdentity().identity,
                "topics": [appName , newDocument.chat],
                "payload": web3.fromAscii(EJSON.stringify(newDocument)),
                "ttl": 100,
                "priority": 1000
            });

            // remove the type, after storing
            Messages.update(newDocument.id, {$unset: {type: ''}});
        }

    },
    removed: function(oldDocument) {
    },
    /**
    Sends an edit for an message, which will patch the message on the receiver side.
        
        {
            type: 'edit',
            topic: 'my new topic',
            message: 'my edited message',
            edited: new Date() // some iso date
        }
        
    @method changed
    */
    changed: function (newDocument, oldDocument) {
        console.log(newDocument);


        if(newDocument.type === 'edit') {
            // change _id to id
            newDocument.id = newDocument._id;
            delete newDocument._id;

            web3.shh.post({
                "from": newDocument.from.identity,
                // "to": Whisper.getIdentity().identity,
                "topics": [appName , newDocument.chat],
                "payload": web3.fromAscii(EJSON.stringify(newDocument)),
                "ttl": 100,
                "priority": 1000
            });

            // remove the type, after storing
            Messages.update(newDocument.id, {$unset: {type: ''}});
        }
    }
});


