/**
Template Controllers

@module Routes
*/

/**
The app routes

@class App routes
@constructor
*/

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

@method home
*/
Router.route('/', function () {
    this.redirect('chat', {sessionKey: 'public'});
    this.render('views_chats_aside', {to: 'aside'});
},{
    name: 'home'
});


/**
Shows the modal with a users profile

@method userProfile
*/
Router.route('/user/:userId', function () {

    this.render('elements_modal', {to: 'modal'});
    this.render('view_modals_userProfile', {
        to: 'modalContent',
        data: function(){
            var user = Users.findOne(this.params.userId);
            
            // return username
            if (user) {
                return user;
            // return myself
            } else if(Whisper.getIdentity().identity === this.params.userId) {
                return Whisper.getIdentity();

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
    name: 'userProfile'
});


// CHAT ROUTES
ChatController = RouteController.extend({
    template: 'views_chats',
    yieldRegions: {
        'views_chats_aside': {to: 'aside'},
        'views_chats_actionbar': {to: 'actionbar'}
    },
    data: function(){
        return Chats.findOne(this.params.sessionKey);
    },
    onBeforeAction: function(){
        this.render(null, {to: 'modal'});
        this.next();
    }
});


/**
Shows the modal with the user invitation screen.

@method createChat
*/
Router.route('/chat/create/:sessionKey', function () {
    this.render();
    this.render('elements_modal', {
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
Shows the chat itself, with all recent messages.

@method createChat
*/
Router.route('/chat/:sessionKey', function () {

    // check if this chat already exists, if not create a new one
    if(this.params.sessionKey !== 'public' &&
       !Chats.findOne(this.params.sessionKey)) {
        
        // ADD new CHAT
        Chats.insert({
            _id: this.params.sessionKey,
            name: null,
            lastActivity: new Date(),
            messages: [],
            users: [Whisper.getIdentity().identity]
        });
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
    this.render('elements_modal', {
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
