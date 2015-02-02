# ethereum-dapp-whisper-client

## Development

Start an eth node using the following,
or open the http://localhost:3000 in *mist*, *mix* or *alethzero*

    $ eth -j -b // for a mining node: $ eth -j -b -f -n no -m yes

Start your app using meteor

    $ cd ethereum-dapp-whisper-client/app
    $ meteor

Go to http://localhost:3000


## Deployment

To create a build version of your app run:

    $ meteor build ../dist
    $ cd ../dist
    $ tar zxvf app.tar.gz

Copy the `app` folder, *.js and *.css from `bundle/programs/web.browser/`
to your dist folder and ad

## The Whisper chat app

The collections used are:

- `User` - contains the users identities (persistet via localStorage)
- `Users` - contains collected identities and usernames (persistet via localStorage)
- `Chats` - contains the chats (persistet via localStorage)
- `Messages` - contains the messages, which belong to chats (persistet via localStorage)
- `Invitations` - contains temporarily store inviations

The `web3` object is created in `client/lib/thirdpartyConfig.js`.

The whole whisper protocol integration can be found in the `client/whisperConnection.js`.
Removing it won't break app, just cut the connection to whisper.
Some helper functions for whisper can be found at `client/WhisperHelperFunctions.js`.


### Protocol specs

The following specs need to be transfered as stringified JSON in the payload.

You can also send messages to a chatroom by simply providing the correct chatroom topic including the `whisper-chat-client` topic.
The user will then appear as anonymous:

    web3.shh.post({
        "topic": [web3.fromAscii('whisper-chat-client'), web3.fromAscii('ethereum')],
        "payload": web3.fromAscii('Hello world'),
        "ttl": 100,
        "priority": 1000
    });


#### Invite to a group chat

```js
// Topics
[
    web3.fromAscii('whisper-chat-client'),
    '0x34556456..' // the user to invite
]

// TO and FROM parameters
to: '0x34556456..' // the user to invite,
from: '0x12344...'


// Payload
{
    type: 'invite',
    chat: 'ethereum', // chat topic
    name: 'My Chatroom',
    from: {
        identity: '0x12344...', // the current user identity, if you set a from in the whisper `shh.post()` it will be used instead
        name: 'Mr. X'
    },
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
```

#### Invite to a private chat

```js
// Topics
[
    web3.fromAscii('whisper-chat-client'),
    '0x34556456..' // the user to invite
]

// TO and FROM parameters
to: '0x34556456..' // the user to invite,
from: '0x12344...' // required

// Payload
{
    type: 'invite',
    privateChat: true,
    from: {
        identity: '0x12344...', // the current user identity, if you set a from in the whisper `shh.post()` it will be used instead
        name: 'Mr. X'
    }
}
```

#### Send message

```js
// Topics
[
    web3.fromAscii('whisper-chat-client'),
    web3.fromAscii('ethereum') // the chats topic or HEX user identity for private chats
]

// TO and FROM parameters
to: '0x34556456..' // only for private chats
from: '0x12344...'

// Payload
{
    type: 'message',
    id: '231rewf23', // the unique id of the message
    chat: 'ethereum', // the parent chats topic. For private chats the identity of the user
    topic: 'my topic', // the topic set for the chat, to filter chats with many participants. Has nothing to do with whisper topics
    from: {
        identity: '0x4324234..', // the current user identity, if you set a from in the whisper `shh.post()` it will be used instead
        name: 'my username'
    },
    message: 'Hello its me!'
}
```

#### Edit message

Will only be allowed for messages which are less than 1 hour old.

```js
// Topics
[
    web3.fromAscii('whisper-chat-client'),
    web3.fromAscii('ethereum') // the chats topic or HEX user identity for private chats
]

// TO and FROM parameters
to: '0x34556456..' // only for private chats
from: '0x12344...'

// Payload
{
    type: 'edit',
    id: '231rewf23', // the unique id of the message
    chat: 'ethereum', // the parent chats topic. For private chats the identity of the user
    from: {
        identity: '0x4324234..', // the current user identity, if you set a from in the whisper `shh.post()` it will be used instead
        name: 'my username'
    },
    topic: 'my new topic', // the changed topic
    message: 'my edited message' // the changed message
}
```

#### Notifications

```js
// Topics
[
    web3.fromAscii('whisper-chat-client'),
    web3.fromAscii('ethereum') // the chats topic or HEX user identity for private chats
]

// TO and FROM parameters
to: '0x34556456..' // only for private chats
from: '0x12344...'

// Payload
{
    type: 'notification',
    message: 'invitation',
    id: '231rewf23', // the unique id of the message
    chat: 'ethereum', // the parent chats topic. For private chats the identity of the user
    from: {
        identity: Whisper.getIdentity().identity,
        name: Whisper.getIdentity().name
    },
    data: 'some data, see below'
}
```

There are currently three types of notifications implemented:

 - `invitation` will list all the users the user has invited into the group chat
    The `data` property should contain the identities and usernames:

    ```js
    [{
        identity: '0x345345345..',
        name: 'user x'
    },
    {
        identity: '0x67554345..',
        name: 'user y'
    }]
    ```

- `topicChanged` will tell the other participants about a change of the users personal (non-whisper) topic
    The `data` property should contain the new topic name e.g. `my new topic`

- `chatNameChanged` will tell the other users that the group chat name has changed.
    The `data` property should contain the new chat name e.g. `Hello kitty fans`.
    All users will then update their group chat name accordingly. (Everybody can change the group chat name)




