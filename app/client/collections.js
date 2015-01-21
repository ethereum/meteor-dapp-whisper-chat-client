
// Basic (local) collections, which will be filled by whisper
// we use {connection: null} to prevent them from syncing with our not existing Meteor server
Users = new Mongo.Collection('users', {connection: null});
Following = new Mongo.Collection('following', {connection: null});
Chats = new Mongo.Collection('chats', {connection: null});
Entries = new Mongo.Collection('entries', {connection: null});