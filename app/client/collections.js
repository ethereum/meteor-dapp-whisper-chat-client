
// Basic (local) collections, which will be observed by whisper (see whisperConnection.js)
// we use {connection: null} to prevent them from syncing with our not existing Meteor server

// Contains the users identities
User = new Mongo.Collection('whisper-chat-user', {connection: null}); // the current users identity
new PersistentMinimongo(User);

// contains collected identities and usernames
Users = new Mongo.Collection('whisper-chat-users', {connection: null}); // other users
new PersistentMinimongo(Users);

// contains the chats
Chats = new Mongo.Collection('whisper-chat-chats', {connection: null});
new PersistentMinimongo(Chats);

// contains the messages, which belong to chats
Messages = new Mongo.Collection('whisper-chat-messages', {connection: null});
new PersistentMinimongo(Messages);

// contains temporarily inviations
// don't make them persistent, as we need them only once
Invitations = new Mongo.Collection('whisper-chat-invitations', {connection: null});