/**
Template Controllers

@module WhisperConnection
*/


var appName = web3.fromAscii('whisper-chat-client'),
    user = User.findOne();


// if NO USER exists, CREATE a NEW ONE
if(!user) {
    User.insert({
        identities: [{
            name: 'frozeman',
            identity: web3.shh.newIdentity(),
            selected: true
        }],
        following: []
    });

// CHECK if the IDENTITY IS still VALID, if not create a new one
} else if(!web3.shh.haveIdentity(web3.toDecimal(user.identities[0].identity))) {
    User.update(user._id, {$set: {
            identities: [{
                name: 'frozeman',
                identity: web3.shh.newIdentity(),
                selected: true
            }]
        }
    });
}


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
}).arrived(function(m){

    // if i got a message, create a new chat, if none exists already

    console.log(m);
    // new message m
    console.log(EJSON.parse(web3.toAscii(m.payload)));
});



/**
Observe chats, listen for new messages.

@class Chats.find({}).observe
@constructor
*/
Chats.find({}).observe({
    /**
    This will observe the chats.
    If a new chat is created it will start listening for messages containing the chats _id (topic or sessionkey).

    If a new message arrives, it will add it as entry to the entries collection, connected to this chat.

    @method added
    */
    added: function(newDocument) {

        var watcher = web3.shh.watch({
            "filter": [ appName, newDocument._id ],

        });

        // IF a MESSAGE ARRIVED
        watcher.arrived(function(message){
            var payload = EJSON.parse(web3.toAscii(message.payload));

            // DONT add entry, if its from myself
            if(payload.from !== Whisper.getIdentity().identity) { // later change to message.from

                // if the chat got a message, store it as entry
                var entryId = Entries.insert({
                    chat: newDocument._id,
                    timestamp: moment.unix(message.sent).toDate(),
                    topic: payload.topic,
                    unread: true,
                    from: payload.from, // later change to message.from
                    message: payload.message,
                });
                // add the entry to the chats entry list
                Chats.update(this._id, {
                    $addToSet: {entries: entryId}
                });
            }
        });

        // add the watcher to the chat document
        Chats.update(newDocument._id, {$set: {
                watcher: watcher
            }
        });
    },
    /**
    Checks if a chat was removed, if so it will stop watching for messages for that chat.

    @method removed
    */
    removed: function(oldDocument) {

        // stop watching on that chat
        oldDocument.watcher.uninstall();
    },
    changed: function (newDocument, oldDocument) {

    }
});


/**
Observe entries, send messages.

@class Chats.find({}).observe
@constructor
*/
Entries.find({}).observe({
    /**
    Checks if a new message entry was created, if so propagate it to the whisper network.
    See the chats.js for more.

    The whisper paylod can look like this:

        {
            chat: '2ff34f34f', // the parent chats id
            // timestamp: new Date(),
            topic: 'my topic', // the topic set for the chat, to filter chats with many participants
            // unread: true,
            from: '0x4324234..', // the users identity, later we use the protocols native "from"
            message: 'Hello its me!',
        }

    @method added
    */
    added: function(newDocument) {
        var chat = Chats.findOne(newDocument.chat);

        // if a chat for that entry was found, propagate it to the whisper network
        // But only send messages, which come from myself, otherwise i would re-send received messages!
        if(chat && newDocument.from === Whisper.getIdentity().identity) {

            web3.shh.post({
                "from": Whisper.getIdentity().identity,
                // "to": Whisper.getIdentity().identity,
                "topics": [ appName , chat._id],
                "payload": web3.fromAscii(EJSON.stringify(newDocument)),
                "ttl": 100,
                "priority": 1000
            });
        }

    },
    removed: function(oldDocument) {
    },
    changed: function (newDocument, oldDocument) {
    }
});
