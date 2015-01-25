
// Basic (local) collections, which will be filled by whisper
// we use {connection: null} to prevent them from syncing with our not existing Meteor server

User = new Mongo.Collection('user', {connection: null}); // the current users identity
new PersistentMinimongo(User);

Users = new Mongo.Collection('users', {connection: null}); // other users
new PersistentMinimongo(Users);

Chats = new Mongo.Collection('chats', {connection: null});
new PersistentMinimongo(Chats);

Entries = new Mongo.Collection('entries', {connection: null});
new PersistentMinimongo(Entries);



// ADD example data
if(User.find().count() === 0) {
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
}