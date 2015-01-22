/**
Template Controllers

@module Templates
*/

/**
The chats
 template

@class [template] views_chats
@constructor
*/


Template['views_chats'].helpers({
    /**
    Get the entries for this chat

    @method (entries)
    */
    'entries': function(){
        return Entries.find({_id: {$in: this.entries}});
    }
});



Template['views_chats'].events({
    /**
    Send a message to the chat.

    @event keyup textarea.write-message
    */
    'keyup textarea.write-message': function(e){

        if(e.keyCode === 13) {
            var entryId = Entries.insert({
                timestamp: new Date(),
                topic: 'Courses',
                unread: false,
                from: User.findOne().identities[0].identity,
                message: e.currentTarget.value,
            });
            // add the entry to the chats entry list
            Chats.update(this._id, {
                $addToSet: {entries: entryId},
                $set: {lastActivity: new Date()}
            });

            // clear text field
            if(entryId)
                e.currentTarget.value = '';
        }

    }
});