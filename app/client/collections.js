
// Basic (local) collections, which will be observed by whisper (see whisperConnection.js)
// we use {connection: null} to prevent them from syncing with our not existing Meteor server

User = new Mongo.Collection('user', {connection: null}); // the current users identity
new PersistentMinimongo(User);

Users = new Mongo.Collection('users', {connection: null}); // other users
new PersistentMinimongo(Users);

Chats = new Mongo.Collection('chats', {connection: null});
new PersistentMinimongo(Chats);

Messages = new Mongo.Collection('messages', {connection: null});
new PersistentMinimongo(Messages);