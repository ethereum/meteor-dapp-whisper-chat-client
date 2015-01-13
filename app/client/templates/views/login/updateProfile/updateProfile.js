/**
Template Controllers

@module Templates
**/

/**
The login update profile template

@class [template] views_loginSignUp_updateProfile
@constructor
**/

Template['views_loginSignUp_updateProfile'].helpers({
    /**
    disable the email if logged in (as the user can't edit it client side)
    
    @method ((disabledEmail))
    */
    'disabledEmail': function(){
        return (this.profile) ? 'disabled': '';
    },
    /**
    Shows texts only visible to newly created users using facebook or google

    @method ((isService))
    */
    'isService': function(){
        return !_.isEmpty(this.services);
    }
});


Template['views_loginSignUp_updateProfile'].events({
    /**
    Save the profile

    @event submit #save-profile
    */
    'submit #save-profile': function(event, t) {
        var fields = Helpers.formValuesToParameters(t.$('input'));


        // show loading
        Session.set('loading', true);


        // update profile
        Meteor.users.update(Meteor.userId(), {
        $unset: {
            'profile.accountCreated': ''
        },
        $set: {
            'profile.firstName': fields.firstName,
            'profile.lastName': fields.lastName,
            'profile.birthday': (fields.birthday) ? moment(fields.birthday).toDate() : null
        
        }}, function(error){
            Session.set('loading', false);

            if(!Helpers.displayError(error)) {
                // redirect, when successfull
                if(Session.get('lastRoute')) {
                    Router.go(Session.get('lastRoute'));
                    Session.set('lastRoute', undefined);
                } else
                    Router.go(AccountsLogin.config.dashboardRoute);
            }

        });
    }
});