/**
Template Controllers

@module Routes
*/

/**
The app routes

@class App routes
@constructor
*/


/**
We use this variable, to store the current selected chat,
so we can show it in the background when e.g. the user profile is loaded.

@property currentSelectedChat
*/
var currentSelectedChat = null;



// Change the URLS to use #! instead of real paths
// Iron.Location.configure({useHashPaths: true});


// Router defaults
Router.configure({
    layoutTemplate: 'layout_main',
    notFoundTemplate: 'layout_notFound',
    yieldRegions: {
        'views_chats_aside': {to: 'aside'}
    }
});


// ROUTES

/**
The default route, will redirect to the public stream.

TODO: in the future this will be the chats/public route

@method home
*/
Router.route('/', {
    template: 'views_home',
    name: 'home'
});


/**
Shows the modal with a users profile

@method userProfile
*/
Router.route('/user/:userId', function () {

    this.render('dapp_modal', {
        to: 'modal',
        data: {
            closePath: Router.routes.chat.path({sessionKey: currentSelectedChat})
        }
    });
    this.render('view_modals_userProfile', {
        to: 'modalContent',
        data: function(){
            var user = Users.findOne(this.params.userId);
            
            // return myself
            if(Whisper.getIdentity().identity === this.params.userId) {
                return Whisper.getIdentity();
            // return username
            } else if (user) {
                return user;

            // return anonymous
            } else {
                return {
                    name: 'anonymous',
                    identity: this.params.userId
                };
            }
        }
    });
},{
    name: 'userProfile',
    data: function(){
        // make sure the last chat is still the data context
        return Chats.findOne(currentSelectedChat);
    }

});


// CHAT ROUTES
ChatController = RouteController.extend({
    template: 'views_chats',
    yieldRegions: {
        'views_chats_aside': {to: 'aside'},
        'views_chats_actionbar': {to: 'actionbar'}
    },
    onBeforeAction: function(){

        // store the current selected chat
        currentSelectedChat = this.params.sessionKey;

        this.render(null, {to: 'modal'});
        this.next();
    },
    data: function(){
        var chat = Chats.findOne(currentSelectedChat);

        // MIST
        // if(typeof mist !== 'undefined') {
        //     Tracker.afterFlush(function(){
        //         mist.menu.update(chat._id, {
        //             selected: true,
        //         });
        //     });
        // }

        return chat;
    }
});


/**
Shows the modal with the user invitation screen.

@method createChat
*/
Router.route('/chat/create/:sessionKey', function () {
    this.render();
    this.render('dapp_modal', {
        to: 'modal',
        data: {
            closePath: Router.routes.chat.path(this.params)
        }
    });
    this.render('view_modals_addUser', {
        to: 'modalContent',
        data: function(){
            return Chats.findOne(this.params.sessionKey);
        }
    });
},{
    name: 'createChat',
    controller: ChatController
});

/**
Prevent that a chat is created, when directed to null

@method /chat/null
*/
Router.route('/chat/null',{
    template: 'layout_notFound',
    controller: ChatController
});

/**
Shows the chat itself, with all recent messages.

@method createChat
*/
Router.route('/chat/:sessionKey', function () {
    var chat = Chats.findOne(this.params.sessionKey);

    // check if this chat already exists, if not create a new one
    if(this.params.sessionKey !== 'public' &&
       !chat) {
        
        // ADD new PRIVATE CHAT
        if(Users.findOne(this.params.sessionKey, {reactive: false}) ||
           (this.params.sessionKey.length === 130 && this.params.sessionKey.indexOf('0x') === 0)) {

            Chats.insert({
                _id: this.params.sessionKey,
                name: null,
                filteredTopics: null,
                lastActivity: moment().unix(),
                messages: [],
                privateChat: this.params.sessionKey,
                users: [this.params.sessionKey]
            });


            // SEND PRIVATE MESSAGE INVITATION
            Invitations.insert({
                type: 'invite',
                chat: this.params.sessionKey,
                timestamp: moment().unix(),
                from: {
                    identity: Whisper.getIdentity().identity,
                    name: Whisper.getIdentity().name
                },
                privateChat: this.params.sessionKey,
                to: this.params.sessionKey
            });


        // ADD new group CHAT
        } else {

            Chats.insert({
                _id: this.params.sessionKey,
                name: null,
                filteredTopics: null,
                lastActivity: moment().unix(),
                messages: [],
                users: [] // should i add myself? Whisper.getIdentity().identity
            });
        }


    // IF existing, check if its has the invitation property and remove it
    } else if(chat && chat.invitation) {
        Chats.update(chat._id, {$unset: {invitation: ''}});
    }


    // MARK messages and READ after 2s
    // TODO: make add unread count to the chat itself?
    if(chat && _.isArray(chat.messages)) {
        Meteor.setTimeout(function(){
            _.each(Messages.find({_id: {$in: chat.messages}},{reactive: false}).fetch(), function(item) {
                if(item.unread)
                    Messages.update(item._id, {$set: {unread: false}});
            });
        }, 2000);
    }

    this.render();
},{
    name: 'chat',
    controller: ChatController
});


/**
Shows the modal with the user invitation screen.

@method addUser
*/
Router.route('/chat/:sessionKey/add-user', function () {
    this.render();
    this.render('dapp_modal', {
        to: 'modal',
        data: {
            closePath: Router.routes.chat.path(this.params)
        }
    });
    this.render('view_modals_addUser', {
        to: 'modalContent',
        data: function(){
            return Chats.findOne(this.params.sessionKey);
        }
    });
},{
    name: 'addUser',
    controller: ChatController
});
