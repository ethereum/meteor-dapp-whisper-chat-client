/**
Template Controllers

@module Templates
*/

/**
The chats action bar template

@class [template] views_chats_actionbar
@constructor
*/


Template['views_chats_actionbar'].events({
    /**
    Show a modal and leave the chat

    @event click button.leave-chat
    */
    'click button.leave-chat': function(e, template){

        Router.current().render('elements_modal', {to: 'modal'});
        Router.current().render('elements_modal_question', {
            to: 'modalContent',
            data: {
                text: TAPi18n.__('whisper.chat.texts.leaveChat'),
                
                // DELETE the chat on OK
                ok: function(){
                    // delete all messages
                    _.each(Messages.find({_id: {$in: template.data.messages}}).fetch(), function(item){
                        Messages.remove(item._id);
                    });


                    Router.go('/chat/public');
                    
                    // delete the chat itself, after redirect
                    // (so the chat route, doesn't try to re-create the chat)
                    Tracker.afterFlush(function(){
                        Chats.remove(template.data._id);
                    });
                },
                cancel: true
            }
        });
    }
});