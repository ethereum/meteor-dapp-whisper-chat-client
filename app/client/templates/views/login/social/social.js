/**
Template Controllers

@module Templates
**/

/**
The social buttons

@class [template] views_loginSocial
@constructor
**/

/**
Simple capitalization function

@method capitalize
*/
var capitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

Template['views_loginSocial'].helpers({
    /**
    Gets the social buttons text, either "login" or "register with" ...
    
    @method ((buttonText))
    */
    buttonText: function() {
        var buttonText;
        buttonText = Session.get('login_socialButtonText');
        if (buttonText === 'up') {
            return TAPi18n.__('accounts.signUp');
        } else {
            return TAPi18n.__('accounts.signIn');
        }
    },
    /**
    Determines if the services are unconfigured
    
    @method ((unconfigured))
    */
    unconfigured: function() {
        return ServiceConfiguration.configurations.find({
            service: this.toString()
        }).fetch().length === 0;
    },
    /**
    Get the icons
    
    @method ((icon))
    */
    icon: function() {
        switch (this.toString()) {
            case 'google':
                return 'googleplus';
            case 'meteor-developer':
                return 'rocket';
            default:
                return this;
        }
    }
});

Template['views_loginSocial'].events({
    /**
    Login/register with service

    @event click .btn
    */
    'click .btn': function(event) {
        var callback, loginWithService, options, serviceName;
        event.preventDefault();
        serviceName = $(event.target).attr('id').replace('login-', '');
        callback = function(err) {
            if (!err) {
                if (Meteor.user() && Meteor.user().profile.accountCreated) {
                    return Router.go('loginUpdateProfile');

                } else {
                    if (Session.get('lastRoute')) {
                        Router.go(Session.get('lastRoute'));
                        return Session.set('lastRoute', void 0);
                    } else {
                        return Router.go(AccountsLogin.config.dashboardRoute);
                    }
                }
            } else if (err instanceof Accounts.LoginCancelledError) {

            } else if (err instanceof ServiceConfiguration.ConfigError) {
                Accounts._loginButtonsSession.configureService(serviceName);
            } else {
                Helpers.displayError(err, true);
            }
        };
        if (serviceName === 'meteor-developer') {
            loginWithService = Meteor["loginWithMeteorDeveloperAccount"];
        } else {
            loginWithService = Meteor["loginWith" + capitalize(serviceName)];
        }
        options = {};
        if (Accounts.ui._options.requestPermissions[serviceName]) {
            options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName];
        }
        if (Accounts.ui._options.requestOfflineToken && Accounts.ui._options.requestOfflineToken[serviceName]) {
            options.requestOfflineToken = Accounts.ui._options.requestOfflineToken[serviceName];
        }
        return loginWithService(options, callback);
    }
});