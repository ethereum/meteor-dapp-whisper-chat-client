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
    var user = User.findOne();

    if(user && _.isArray(user.identities)) {
        return identity = _.find(user.identities, function(item){
            return item.selected;
        });
    } else {
        return {};
    }
};


/**
Inserts a message to the message colleciton and adds itself to the parent chat.

@method addMessage
@return {Boolean}
*/
Whisper.addMessage = function(chatId, doc) {

    // set the parent chat id if not given
    doc.chat = doc.chat || chatId;

    if(Chats.findOne(chatId)) {
        messageId = Messages.insert(doc);

        // add the entry to the chats entry list
        Chats.update(chatId, {
            $addToSet: {messages: messageId},
            $set: {lastActivity: moment().unix()}
        });
        
        return true;
    } else
        return false;
};


/**
Shows a modal, saying that the identity couldn't be retrieved.

@method showIdentityErrorModal
*/
Whisper.showIdentityErrorModal = function(){
    Meteor.startup(function(){
        // make sure the modal is rendered after all routes are executed
        Tracker.afterFlush(function(){
            Router.current().render('dapp_modal', {to: 'modal'});
            Router.current().render('dapp_modal_question', {
                to: 'modalContent',
                data: {
                    text: TAPi18n.__('whisper.chat.texts.identityError'),
                    ok: true
                }
            });
        });
    });
};