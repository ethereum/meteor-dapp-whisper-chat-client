/**
Template Controllers

@module Templates
*/

/**
The chats template

@class [template] views_chats
@constructor
*/

/**
The default number of messages and by which the show more will increase the list of messages.

@property messageLimit
*/
var messageLimit = 30;



Template['views_chats'].created = function(){
    // set the start limit
    this.autorun(function() {
        
        // make reactive to the route, so the messageLimit gets reset
        Router.current();

        TemplateVar.set('limitMessages', messageLimit);
    });
};


Template['views_chats'].helpers({
    /**
    Returns all topics, available in this chat

    @method (topics)
    @return {Array}
    */
    'topics': function(messages){
        if(_.isArray(messages)) {
            var messages = Messages.find({_id: {$in: messages}}).fetch();
            return _.uniq(_.compact(_.pluck(messages, 'topic')));
        }
    },
    /**
    If no topic is filtered it will return TRUE.

    @method (showAllTopics)
    @return {Boolean}
    */
    'showAllTopics': function(filteredTopics){
        return _.isEmpty(filteredTopics);
    },
    /**
    Returns true if the current topic is filtered by.

    @method (isSelectedTopic)
    @return {Boolean}
    */
    'isSelectedTopic': function(filteredTopics){
        return _.contains(filteredTopics, String(this));
    },
    /**
    Get the messages for this chat, group them by user e.g.:

        {
            _id: 'as2342',
            from: {
                identity: '0x4234..',
                name: 'my name'
            },
            messages: [{
                _id: '432334',
                topic: 'my topic',
                message: 'Hi!',
                edited: 123456777 // unix timestamp
            },{
                _id: 'as2342',
                topic: null,
                message: 'Whats up?'
            }]
        }

    @method (groupedMessages)
    */
    'groupedMessages': function(){
        if(_.isArray(this.messages)) {
            var query = {_id: {$in: this.messages}};

            // filter by topic
            if(this.filteredTopics)
                query['$or'] = [{topic: {$in: this.filteredTopics}}, {type: 'notification'}];

            var messages = Messages.find(query, {limit: TemplateVar.get('limitMessages'), sort: {timestamp: -1}}).fetch();

            var messageBlocks = [],
                lastTopic = null;
            _.each(messages, function(item) {

                // if identity changes, create a new "block"
                if(!_.last(messageBlocks) ||
                   _.last(messageBlocks).from.identity !== item.from.identity) {

                    item.messages = [_.clone(item)];

                    delete item.message;
                    messageBlocks.push(item);


                // id the identity is the same, just a dd a new message to the messages array
                } else {

                    var messages = messageBlocks[messageBlocks.length-1].messages;
                    var message = _.clone(item);
                    message.topic = (item.topic !== lastTopic) ? item.topic : null;

                    messages.push(message);

                    delete messageBlocks[messageBlocks.length-1].message;
                    messageBlocks[messageBlocks.length-1]._id = item._id; // keep one item id, to prevent rearrangement
                    messageBlocks[messageBlocks.length-1].messages = messages;

                }

                lastTopic = item.topic;
            });

            return messageBlocks;
        }
    },
    /**
    Show "more messages" button, if there are more than the current visible ones;

    @method (showMoreButton)
    @return {Boolean}
    */
    'showMoreButton': function(){
        if(_.isArray(this.messages)) {
            var query = {_id: {$in: this.messages}};

            // filter by topic
            if(this.filteredTopics)
                query['$or'] = [{topic: {$in: this.filteredTopics}}, {type: 'notification'}];

            return Messages.find(query).count() >= TemplateVar.get('limitMessages');
        }
    }
});



Template['views_chats'].events({
    /**
    Clear the filter and show all topics.
    
    @event click button.show-all-topics
    */
    'click button.show-all-topics': function(e, template) {
        Chats.update(template.data._id, {$set: {
            filteredTopics: null
        }});
    },
    /**
    Add the clicked topic to the filter.
    
    @event click button.filter-by-topic
    */
    'click button.filter-by-topic': function(e, template) {
        var topics = template.data.filteredTopics,
            topic = String(this);

        if(!_.isArray(topics))
            topics = [];

        if(_.contains(template.data.filteredTopics, topic))
            topics = _.without(topics, topic);
        else
            topics.push(topic);

        Chats.update(template.data._id, {$set: {
            filteredTopics: topics
        }});
    },
    /**
    Show more messages
    
    @event click button.show-more
    */
    'click button.show-more': function() {
        TemplateVar.set('limitMessages', TemplateVar.get('limitMessages') + messageLimit);
    },
    /**
    Sets the clicked topic, as the current topic

    @event click button.topic
    */
    'click button.topic': function(e, template){
        var selectedTopic = $(e.currentTarget).text();
        template.find('input[name="topic"]').value = selectedTopic;

        // focus the textarea
        template.$('textarea[name="write-message"]').focus();

        // trigger blur to send notification and store in localstorage
        template.$('input[name="topic"]').trigger('blur');
    },
    /**
    Edit the current message

    @event click button.edit-message
    */
    'click button.edit-message': function(e, template){
        template.find('input[name="topic"]').value = this.topic;
        template.find('textarea[name="write-message"]').value = this.message;

        TemplateVar.set('editMessage', this._id);

        // focus the textarea
        template.$('textarea[name="write-message"]').focus();
    },
    /**
    Send the changed topic notification

    @event blur input[name="topic"]
    */
    'blur input[name="topic"]': function(e, template){
        if(e.currentTarget.value !== template.data.myTopic) {
            // SEND the INVITATION NOTIFICATION
            Whisper.addMessage(template.data._id,{
                sending: true,
                type: 'notification',
                message: 'topicChanged',
                chat: template.data._id,
                timestamp: moment().unix(),
                from: {
                    identity: Whisper.getIdentity().identity,
                    name: Whisper.getIdentity().name
                },
                // the new topic name
                data: e.currentTarget.value
            });

            // store the new topic
            Chats.update(template.data._id, {$set: {myTopic: e.currentTarget.value}});
        }

    },
    /**
    Move to the textarea on enter

    @event keyup input[name="topic"]
    */
    'keyup input[name="topic"]': function(e, template){
        if(e.keyCode === 13)
            template.$('textarea[name="write-message"]').focus();
    },
    /**
    Prevent ENTER in the text area, if no shift is pressed

    @event keydown textarea[name="write-message"]
    */
    'keydown textarea[name="write-message"]': function(e){
        // Enter was pressed without shift key
        if (e.keyCode == 13 && !e.shiftKey) {
            // prevent default behavior
            e.preventDefault();
        }

        // if empty, cancel the editing of a message and return
        if(_.isEmpty(_.trim(e.currentTarget.value, "\n"))) {
            TemplateVar.set('editMessage', null);
        }

    },
    /**
    Send a message to the chat on ENTER (but only when shift is not pressed).
    Clear the message on ESC and edit the last message on ARROW UP

    @event keyup textarea[name="write-message"]
    */
    'keyup textarea[name="write-message"]': function(e, template){
        // AUTOGROW THE TEXTAREA
        var newlines = e.currentTarget.value.match(/^/mg).length;
        if(newlines > 1)
            $(e.currentTarget).css('height', 60 + ((newlines - 2) * 20));


        var message = _.trim(e.currentTarget.value, "\n "),
            send = false,
            selectedTopic = template.find('input[name="topic"]').value;


        // IF KEYUP is pressed, EDIT the LAST MESSAGE
        if(e.keyCode === 38 && _.isEmpty(message)) {
            // get my last message
            var lastEntry = Messages.findOne({
                _id: {$in: template.data.messages},
                'from.identity': Whisper.getIdentity().identity,
                type: {$ne: 'notification'
            }}, {sort: {timestamp: -1}});

            // only allow if the last message is not older than 1 hour
            if(lastEntry.timestamp > moment().subtract(1, 'hour').unix()) {

                template.find('input[name="topic"]').value = lastEntry.topic;
                e.currentTarget.value = lastEntry.message;

                TemplateVar.set('editMessage', lastEntry._id);
            }

        }

        // IF ESC, clear the form, and cancel the edit message
        if(e.keyCode === 27) {

            // unset the edited message
            TemplateVar.set('editMessage', null);

            // clear text field
            e.currentTarget.value = '';
            $(e.currentTarget).css('height', '');
        }


        // IF ENTER, send new/edited message
        if(e.keyCode === 13 && !e.shiftKey && !_.isEmpty(message)) {
            e.preventDefault();

            // EDIT current message
            if(TemplateVar.get('editMessage')) {
                send = Messages.update(TemplateVar.get('editMessage'), {$set: {
                        type: 'edit',
                        chat: template.data._id,
                        topic: selectedTopic,
                        message: message,
                        edited: moment().unix()
                    }
                })

                // unset the edited message
                TemplateVar.set('editMessage', null);


            // INSERT new message
            } else {

                send = Whisper.addMessage(template.data._id, {
                    type: 'message',
                    sending: true, // needed to send them, will be removed after
                    timestamp: moment().unix(),
                    topic: selectedTopic,
                    // unread: true,
                    from: {
                        identity: Whisper.getIdentity().identity,
                        name: Whisper.getIdentity().name
                    },
                    message: message,
                    privateChat: template.data.privateChat
                });

                // ANIMATION
                if(send) {
                    template.$(".dapp-content-header").addClass("animate").width();
                    // Meteor.setTimeout(function(){
                        template.$(".dapp-content-header").removeClass("animate");
                    // }, 200);
                }

            }


            // clear text field
            if(send) {
                e.currentTarget.value = '';
                $(e.currentTarget).css('height', '');
            }
        }

    }
});