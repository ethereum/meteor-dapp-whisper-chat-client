/**
Template Controllers

@module Templates
*/

/**
The add user template

@class [template] view_modals_addUser
@constructor
*/

Template['view_modals_addUser'].helpers({
    /**
    List the users you're following

    @method (following)
    */
    'following': function(){
        var user = User.findOne();

        if(user && _.isArray(user.following))
            return Users.find({_id: {$in: user.following}});
    },
    /**
    Show either the ok or invite users button text

    @method (inviteButtonText)
    */
    'inviteButtonText': function(){
        var selectedUsers = TemplateVar.get('invitedUsers');
        return (_.isEmpty(selectedUsers))
            ? TAPi18n.__('buttons.ok')
            : TAPi18n.__('whisper.app.buttons.inviteUsers');
    }
});

Template['view_modals_addUser'].events({
    /**
    Select the whole text of the input

    @event click input[type="text"]
    */
    'click input[type="text"]': function(e){
        $(e.currentTarget).focus().select();
    },
    /**
    Send invites and close the window

    @event click button.invite
    */
    'click button.invite': function(e){
        var selectedUsers = TemplateVar.get('invitedUsers');
        
        // invite users
        if(!_.isEmpty(selectedUsers)) {

        }

        Router.go('chat', {sessionKey: this._id});
    }
});
