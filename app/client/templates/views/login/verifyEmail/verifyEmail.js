/**
Template Controllers

@module Templates
**/

/**
The login verify email template.

@class [template] views_verifyEmail
@constructor
**/

Template['views_verifyEmail'].events({
    /**
    Log the user out, when he clicks on the back link <

    @event click a.back
    */
    'click a.back': function(){
        Meteor.logout();
    },
    /**
    Resend the current users verification email

    @event click button.resendVerificationEmail
    */
    'click button.resendVerificationEmail': function(event) {
        Helpers.callMethod('resendVerificationEmail');

        GlobalNotification.success({
            content: 'i18n:accounts.verificationEmail.send',
            duration: 8
        });
    }
});