/**
Template Controllers

@module Templates
*/

/**
The chats aside template

@class [template] views_chats_aside
@constructor
*/


Template['views_chats_aside'].helpers({
    /**
    Get all my chats

    @method (chats)
    */
    'chats': function(){

        return Chats.find({}, {sort: {lastActivity: -1}});
    },
    /**
    Get all my chats

    @method (chats)
    */
    'unreadCount': function(){
        return Entries.find({_id: {$in: this.entries}, unread: true}).count();
    }
});


Template['views_chats_aside'].events({
    /**
    Add a new chat by generating a new session key and route to the add user screen.

    @event click button.add-chat
    */
    'click button.add-chat': function(e){
        var sessionKey = Random.id();
        
        // create a new chat
        Router.go('chat', {sessionKey: sessionKey});

        // and immediately after, show the invite screen
        Tracker.afterFlush(function(){
            Router.go('createChat', {sessionKey: sessionKey});
        });
    }
});