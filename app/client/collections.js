
// Basic (local) collections, which will be filled by whisper
// we use {connection: null} to prevent them from syncing with our not existing Meteor server

User = new Mongo.Collection('user', {connection: null}); // the current users identity
Users = new Mongo.Collection('users', {connection: null}); // other users

Chats = new Mongo.Collection('chats', {connection: null});
Entries = new Mongo.Collection('entries', {connection: null});


// ADD example data
User.insert({
    identities: [{
        name: 'frozeman',
        identity: Random.id(),
        selected: true
    }],
    following: []
});



Users.insert({
    _id: Random.id(),
    name: 'Gerd Hammer'
});
Users.insert({
    _id: Random.id(),
    name: 'Alex van de Sande'
});
Users.insert({
    _id: Random.id(),
    name: 'Maria'
});


Entries.insert({
    timestamp: new Date(),
    topic: 'Courses',
    unread: true,
    from: Users.find().fetch()[0]._id,
    message: 'Lorem ipsum Irure elit commodo adipisicing magna Duis exercitation proident Duis cillum consequat eiusmod minim aute.',
});
Entries.insert({
    timestamp: new Date(),
    topic: 'Courses',
    unread: false,
    from: Users.find().fetch()[0]._id,
    message: 'Proident Duis cillum consequat eiusmod minim aute.',
});
Entries.insert({
    timestamp: new Date(),
    topic: 'Courses',
    unread: true,
    from: Users.find().fetch()[1]._id,
    message: 'Ipsum Irure elit commodo adipisicing magna Duis exercitation proident Duis cillum consequat eiusmod minim aute.',
});
Entries.insert({
    timestamp: new Date(),
    topic: 'Courses',
    unread: false,
    from: Users.find().fetch()[2]._id,
    message: 'Irure elit commodo adipisicing magna Duis exercitation proident Duis cillum consequat eiusmod minim aute.',
});
Entries.insert({
    timestamp: new Date(),
    topic: 'Courses',
    unread: false,
    from: Users.find().fetch()[2]._id,
    message: 'Commodo adipisicing magna Duis exercitation proident Duis cillum consequat eiusmod minim aute.',
});
Entries.insert({
    timestamp: new Date(),
    topic: 'Courses',
    unread: false,
    from: Users.find().fetch()[1]._id,
    message: 'Adipisicing magna Duis exercitation proident Duis cillum consequat eiusmod minim aute.',
});