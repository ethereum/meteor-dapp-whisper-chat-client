// Router defaults
Router.configure({
    layoutTemplate: 'layout_main',
    notFoundTemplate: 'layout_notFound'
});


// ROUTES
Router.route('/', function () {
    this.redirect('chat', {sessionKey: 'public'});
},{
    name: 'home'
});


Router.route('/user/:userId', function () {

    this.render('elements_modal', {to: 'modal'});
    this.render('view_modals_userProfile', {to: 'modalContent'});
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


Router.route('/chat/:sessionKey', function () {

    // check if this chat already exists, if not create a new one
    if(this.params.sessionKey !== 'public' &&
       !Chats.findOne(this.params.sessionKey)) {
        
        // ADD new CHAT
        Chats.insert({
            _id: this.params.sessionKey,
            name: null,
            lastActivity: new Date(),
            entries: [],
            users: [User.findOne().identities[0].identity]
        });
    }


    this.render();
},{
    name: 'chat',
    controller: ChatController
});


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
