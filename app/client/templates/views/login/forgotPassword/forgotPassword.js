/**
Template Controllers

@module Templates
**/

/**
The login forgot password template
sends a reset token to the users email.

@class [template] views_loginForgotPassword
@constructor
**/

Template['views_loginForgotPassword'].events({
    /**
    @event submit #forgotPassword
    */
    'submit #forgotPassword': function(event, t) {
        var fields = Helpers.formValuesToParameters(t.$('input'));

        Session.set('login_email', fields.forgottenEmail);

        if (!Session.get('login_email')) {
            GlobalNotification.warning({
                content: 'i18n:accounts.error.emailRequired',
                duration: 9
            });
            return;
        }

        // show loading
        Session.set('loading', true);
    
        Accounts.forgotPassword({
            email: Session.get('login_email')
        }, function(error) {
            Session.set('loading', false);

            if (!Helpers.displayError(error, true)) {

                Router.go('loginSignIn');

                Meteor.setTimeout(function(){
                    GlobalNotification.info({
                        content: 'i18n:accounts.resetPasswordEmailSend',
                        duration: 8
                    });
                }, 1000);
            }
        });
    }
});