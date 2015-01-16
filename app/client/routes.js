// Router defaults
Router.configure({
    layoutTemplate: 'layout_main',
    notFoundTemplate: 'layout_notFound'
});


// ROUTES
Router.route('/', function () {
    // this.redirect('/signin');
    
    this.render('views_chats');
    this.render('views_chats_aside', {to: 'aside'});
    this.render('views_chats_actionbar', {to: 'actionbar'});
    this.render(null, {to: 'modal'});
});

Router.route('/modal', function () {
    this.render('elements_modal', {to: 'modal'});
});

// Router.route('/items/:_id', function () {
//     var item = Items.findOne({_id: this.params._id});
//     this.render('ShowItem', {data: item});
// });