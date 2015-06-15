/**
Template Controllers

@module Templates
*/

/**
The chats aside template

@class [template] views_chats_aside
@constructor
*/

Template['views_chats_aside'].onCreated(function(){
    this.autorun(function(){

        var unreadCount = Messages.find({unread: true}).count();
        if(typeof mist !== 'undefined') {
            if(unreadCount)
                mist.menu.setBadge(unreadCount + ' unread messages');
            else
                mist.menu.setBadge('');
        }
    });
});



Template['views_chats_aside'].helpers({
    /**
    Get all my chats

    @method (chats)
    */
    'chats': function(){
        var chats = Chats.find({}, {sort: {lastActivity: -1}});

        // Add mist custom menu
        if(typeof mist !== 'undefined') {
            Tracker.afterFlush(function(){
                // clear the menu before re-creating it
                mist.menu.clear();

                _.each(chats.fetch(), function(chat, index){
                    mist.menu.add(chat._id, {
                        position: index,
                        selected: (location.pathname.indexOf(chat._id) !== -1),
                        name: chat.name || chat._id,
                        badge: chat.messages.length
                    }, function(){
                        Router.go('/chat/'+ chat._id);
                    });
                });
            });
        }

        chats.rewind();
        return chats;
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
        Meteor.setTimeout(function(){
            Router.go('createChat', {sessionKey: sessionKey});
        }, 10);
    }
});