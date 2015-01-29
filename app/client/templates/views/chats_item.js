/**
Template Controllers

@module Templates
*/

/**
The chats item template

@class [template] views_chats_item
@constructor
*/


Template['views_chats_item'].rendered = function(){
    var template = this;

    // Fade in the chat item
    Tracker.afterFlush(function() {
        var $items = template.$('.animate');
        $items.width();
        $items.removeClass('animate');
    });
};


Template['views_chats_item'].helpers({
    /**
    Returns true, if the current message data context is from myself.
    Means has my `from.identity`.

    @method (isYou)
    @param (from)
    @return {Boolean}
    */
    'isYou': function(from){
        return from && from.identity === Whisper.getIdentity().identity;
    }
});
