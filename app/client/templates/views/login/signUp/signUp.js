/**
Template Controllers

@module Templates
**/

/**
The login sign up template

@class [template] views_loginSignUp
@constructor
**/


Template['views_loginSignUp'].helpers({
    /**
    Returns the privacy url

    @method ((privacyUrl))
    */
    privacyUrl: function() {
        return AccountsLogin.config.privacyUrl;
    },
    /**
    Returns the terms url

    @method ((termsUrl))
    */
    termsUrl: function() {
        return AccountsLogin.config.termsUrl;
    }
});

Template['views_loginSignUp'].events({
    /**
    @event submit #signUp
    */
    'submit #signUp': function(event, t) {
        var fields = Helpers.formValuesToParameters(t.$('input'));
        
        // trim spaces
        _.each(fields, function(value, key){
            if(key !== 'password' && key !== 'passwordConfirm')
                fields[key] = value.replace(/^\s*|\s*$/g, "");
        });


        fields.email = (fields.email) ? fields.email.toLowerCase() : null;
        Session.set('login_email', fields.email);

        /// make sure password is string
        fields.password = String(fields.password);
        fields.passwordConfirm = String(fields.passwordConfirm);


        if(!LoginHelpers.checkPassword(fields.password, fields.passwordConfirm)){
            event.preventDefault();
            return;
        }

        if (!fields.email) {
            GlobalNotification.warning({
                content: "i18n:accounts.error.emailRequired",
                duration: 10
            });
            event.preventDefault();
            return;
        }

        Session.set('loading', true);

        // create actual user
        Accounts.createUser({
            email: fields.email,
            password: fields.password,
            profile: {
                firstName: fields.firstName,
                lastName: fields.lastName
            }
        }, function(error){
            Session.set('loading', false);

            if(!Helpers.displayError(error, true)) {
                return Router.go('loginUpdateProfile');
            }

        });
    }
});

