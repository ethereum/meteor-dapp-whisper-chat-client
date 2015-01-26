
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
} else if(!web3.shh.haveIdentity(web3.fromAscii(user.identities[0].identity))) {
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
var replyWatch = web3.shh.watch({
  "filter": [ appName, Whisper.getIdentity().identity ],
  // "to": Whisper.getIdentity().identity
});
// could be "filter": [ web3.fromAscii(appName), null ] if we wanted to filter all such
// messages for this app, but we'd be unable to read the contents.


console.log(replyWatch);
replyWatch.arrived(function(m){
    console.log(m);
    // new message m
    console.log("Reply from " + web3.toAscii(m.payload));
});


// OBSERVE CHATS
Chats.find({}).observe({
    added: function(newDocument) {

    },

    removed: function(oldDocument) {
    },

    changed: function (newDocument, oldDocument) {

        web3.shh.post({
  // "from": Whisper.getIdentity().identity,
  // "to": Whisper.getIdentity().identity,
  "topics": [ appName , Whisper.getIdentity().identity],
  "payload": web3.fromAscii("What is your name?"),
  "ttl": 100,
  "priority": 1000
});

    }
});
