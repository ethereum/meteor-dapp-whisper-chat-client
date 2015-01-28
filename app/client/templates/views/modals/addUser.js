/**
Template Controllers

@module Templates
*/

/**
The add user template

@class [template] view_modals_addUser
@constructor
*/

Template['view_modals_addUser'].created = function(){
    TemplateVar.set('invitedUsers', []);
};


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
    Highlight invited people

    @method (isInvited)
    */
    'isInvited': function(){
        return _.contains(TemplateVar.get('invitedUsers'), this.identity);
    },
    /**
    Show either the ok or invite users button text

    @method (inviteButtonText)
    */
    'inviteButtonText': function(){
        var selectedUsers = TemplateVar.get('invitedUsers');

        if(_.isEmpty(selectedUsers))
            return TAPi18n.__('buttons.ok');
        else if(selectedUsers.length === 1 && Router.current().route.getName() === 'createChat')
            return TAPi18n.__('whisper.app.buttons.startPrivateChat');
        else
            return TAPi18n.__('whisper.app.buttons.inviteUsers');
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
    Add a user to the invitation queue

    @event click .whisper-user-list button
    */
    'click .whisper-user-list button': function(e){
        var list = TemplateVar.get('invitedUsers');
        // add or remove from the list
        if(_.contains(list, this.identity))
            list = _.without(list, this.identity);
        else
            list.push(this.identity);
        TemplateVar.set('invitedUsers', list);
    },
    /**
    Send invites and close the window

    @event click button.invite
    */
    'click button.invite': function(e){
        var invitedUsers = TemplateVar.get('invitedUsers');
        
        // invite users
        if(!_.isEmpty(invitedUsers)) {

            // SINGLE CHAT
            if(invitedUsers.length === 1 && Router.current().route.getName() === 'createChat') {
                // remove current chat
                // create new one
                // send invite message
                // redirect

            // GROUP CHAT
            } else {
                // send invite messages
                // redirect
                Router.go('chat', {sessionKey: this._id});
            }


        // if nobody was explicityly invited, just redirect
        } else {
            Router.go('chat', {sessionKey: this._id});
        }

    }
});
