/**
Helper functions

@module Helpers
**/

/**
The login verify email template.

@class LoginHelpers
@constructor
**/
LoginHelpers = {};


/**
Logs the user out

@method logout
*/
LoginHelpers.logout = function() {
    Session.set('resetToken', null);
    Session.set('login_email', null);

    Meteor.logout(function(){
        // do after logout to prevent the resetting in the autorun
        LocalStore.set('currentTeam', null);
    });
};

/**
A global helper function to check passwords

@method checkPassword
*/
LoginHelpers.checkPassword = function(password, confirm) {
    var errMsg, msg;
    errMsg = [];
    msg = false;
    if (password !== confirm) {
        errMsg.push(TAPi18n.__("accounts.error.noMatch"));
    }
    if (password.length < 4) {
        errMsg.push(TAPi18n.__("accounts.error.minChar"));
    }
    if (password.search(/[a-z]/i) < 0) {
        errMsg.push(TAPi18n.__("accounts.error.pwOneLetter"));
    }
    if (errMsg.length > 0) {
        msg = "";
        errMsg.forEach(function(e) {
            return msg = msg.concat("" + e + "\r\n");
        });
        GlobalNotification.warning({
            content: msg,
            duration: 8
        });
        return false;
    }
    return true;
};


/**

@method ((emailAddress))
*/
Template.registerHelper('emailAddress', function() {
    if (Meteor.user() && Meteor.user().emails && Meteor.user().emails[0].address) {
        return Meteor.user().emails[0].address;
    } else {
        return Session.get('login_email');
    }
});
/**

@method ((capitalize))
*/
Template.registerHelper('capitalize', function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
});

/**

@method ((loginServices))
*/
Template.registerHelper('loginServices', function() {
    return Accounts.oauth.serviceNames();
});
