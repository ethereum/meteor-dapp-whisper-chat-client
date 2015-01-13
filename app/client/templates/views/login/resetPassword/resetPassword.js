/**
Template Controllers

@module Templates
**/

/**
The login reset password template

@class [template] views_loginResetPassword
@constructor
**/


Template['views_loginResetPassword'].events({
    /**
    @event submit #resetPassword
    */
    'submit #resetPassword': function(event, t) {
        var fields = Helpers.formValuesToParameters(t.$('input'));

        fields.password = String(fields.password);
        fields.passwordConfirm = String(fields.passwordConfirm);
        if (!LoginHelpers.checkPassword(fields.password, fields.passwordConfirm)) {
            return;
        }

        Session.set('loading', true);

        Accounts.resetPassword(Session.get('resetToken'), fields.password, function(error) {
            Session.set('loading', false);

            if (error) {
                GlobalNotification.error({
                    content: error.reason || "Unknown error",
                    duration: 10
                });
            } else {
                Session.set('resetToken', null);
                Session.set('login_email', null);

                Meteor.logout(function(){
                    Router.go('loginSignIn');
                });
            }
        });
    }
});