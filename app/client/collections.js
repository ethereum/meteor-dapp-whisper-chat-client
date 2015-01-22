
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