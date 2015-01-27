/**
Template Controllers

@module Templates
*/

/**
The user profile template

@class [template] view_modals_userProfile
@constructor
*/

/**
Inititate the geo pattern.

@method rendered
*/
Template['view_modals_userProfile'].rendered = function(){

    // initiate the geo pattern
    var pattern = GeoPattern.generate(this.data.identity);
    this.$('.dapp-modal-header.dapp-pattern').css('background-image', pattern.toDataUrl());
};


// Template['view_modals_userProfile'].helpers({
// });

Template['view_modals_userProfile'].events({
    /**
    Change username

    @event click button.save-username
    */
    'click button.save-username': function(e, template){
        var user = User.findOne(),
            username = template.find('input[name="username"]').value;

        // change username
        var currentIdentity = null;
        user.identities = _.map(user.identities, function(item){
            if(item.selected) {
                currentIdentity = item.identity;
                item.name = username;
            }
            return item;
        });

        // UPDATE IDENTITY username
        User.update(user._id, {$set: {
            identities: user.identities
        }});

        // also UPDATE un the USERS COLLECTION
        Users.update(currentIdentity, {$set: {
            name: username
        }});

        // close the modal
        history.back();
    },
    /**
    Add the user to the follow list

    @event click button.follow
    */
    'click button.follow': function(e){
        User.update(User.findOne()._id, {$addToSet: {
            following: this.identity
        }});
    },
    /**
    Send a private message

    @event click button.follow
    */
    // 'click button.send-message': function(e){
        
    // }
});
