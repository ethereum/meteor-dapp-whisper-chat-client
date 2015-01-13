/**
Template Controllers

@module Templates
**/

/**
The login sign in template

@class [template] views_loginSignIn
@constructor
**/

Template['views_loginSignIn'].events({
    /**
    @event submit #signIn
    */
    'submit #signIn': function(event) {
        var email;
        email = $('input[name="email"]').val().toLowerCase();
        Session.set('login_email', email);
        
        Session.set('loading', true);
        
        Meteor.loginWithPassword(Session.get('login_email'), $('input[name="password"]').val(), function(error) {
            Session.set('loading', false);

            if (!Helpers.displayError(error, true)) {

                if (Session.get('lastRoute')) {
                    Router.go(Session.get('lastRoute'));
                    return Session.set('lastRoute', void 0);
                } else {
                    return Router.go(AccountsLogin.config.dashboardRoute);
                }

            }
        });
    }
});