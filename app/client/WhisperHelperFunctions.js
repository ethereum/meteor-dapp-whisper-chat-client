/**
Helper functions

@module Helpers
**/

/**
Whisper helper functions

@class Whisper
@constructor
**/

Whisper = {};


/**
Get the current selected identity e.g.

    {
        name: 'frozeman',
        identity: '0x54345345345..',
        selected: true
    }

@method getIdentity
@return {Object}
*/
Whisper.getIdentity = function(){
    var identities = User.findOne().identities;

    if(identities) {
        return identity = _.find(identities, function(item){
            return item.selected;
        });
    } else {
        return {};
    }
};


/**
Shows a modal, saying that the identity couldn't be retrieved.

@method showIdentityErrorModal
*/
Whisper.showIdentityErrorModal = function(){
    Meteor.startup(function(){
        // make sure the modal is rendered after all routes are executed
        Tracker.afterFlush(function(){
            Router.current().render('elements_modal', {to: 'modal'});
            Router.current().render('elements_modal_question', {
                to: 'modalContent',
                data: {
                    text: TAPi18n.__('whisper.chat.texts.identityError'),
                    ok: true
                }
            });
        });
    });
};