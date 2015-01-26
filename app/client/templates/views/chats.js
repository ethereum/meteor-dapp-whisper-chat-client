/**
Template Controllers

@module Templates
*/

/**
The chats template

@class [template] views_chats
@constructor
*/


Template['views_chats'].helpers({
    /**
    Get the messages for this chat

    @method (messages)
    */
    'messages': function(){
        if(_.isArray(this.messages))
            return Messages.find({_id: {$in: this.messages}}, {sort: {timestamp: -1}});
    },
    /**
    Super duper format message helper.

    Strips HTML

    @method (message)
    */
    'message': function(){
        var text = this.message || '';

        // make sure not existing values are not Spacebars.kw
        // if(stripHtml instanceof Spacebars.kw)
        //     stripHtml = false;

        if(_.isString(text)) {

            text = _.stripTags(text);

            // parse hashtags and add a target="_blank" to links
            return text
                .replace(/\n+/g,'<br>')
                // this regex finds every link http://mylink.de, www.mylink.de and even mylink.de
                // Thanks to Android: http://grepcode.com/file/repository.grepcode.com/java/ext/com.google.android/android/2.0_r1/android/text/util/Regex.java#Regex.0WEB_URL_PATTERN
                .replace(/((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi, '<a href="http://$1" target="_blank">$1</a>')
                .replace("\n",'<br>')
                .replace(/http\:\/\/http\:\/\//g,'http://')
                .replace(/http\:\/\/https\:\/\//g, 'https://')
                .replace(/(\#[\w]+)/g, '<a href="http://twitter.com/$1">$1</a>')
                .replace(/^(\@[\w]+)/g, ' <a href="http://twitter.com/$1">$1</a>')
                .replace(/ (\@[\w]+)/g, ' <a href="http://twitter.com/$1">$1</a>')
                .replace(/<a href\=\"http\:\/\/twitter\.com/g,'<a target="_blank" href="http://twitter.com');

        } else if(_.isFinite(text)) {
            return text;
        } else {
            return null;
        }
    },
    /**
    Returns true, if the current message data context is from myself.
    Means has my `from.identity`.

    @method (isYou)
    @return {Boolean}
    */
    'isYou': function(){
        return this.from.identity === Whisper.getIdentity().identity;
    }
});



Template['views_chats'].events({
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
    Send a message to the chat on ENTER (but only when shift is not pressed).
    Clear the message on ESC and edit the last message on ARROW UP

    @event keyup textarea[name="write-message"]
    */
    'keyup textarea[name="write-message"]': function(e, template){
        var message = _.trim(e.currentTarget.value, "\n"),
            messageId = null;

        // IF KEYUP is pressed, EDIT the LAST MESSAGE
        if(e.keyCode === 38) {
            // get my last message
            var lastEntry = Messages.findOne({'from.identity': Whisper.getIdentity().identity}, {sort: {timestamp: -1}});

            template.find('input[name="topic"]').value = lastEntry.topic;
            e.currentTarget.value = lastEntry.message;

            TemplateVar.set('editMessage', lastEntry._id);
        }

        // IF ESC, clear the form, and cancel the edit message
        if(e.keyCode === 27) {

            // unset the edited message
            TemplateVar.set('editMessage', null);

            // clear text field
            e.currentTarget.value = '';
        }


        // IF ENTER, send new/edited message
        if(e.keyCode === 13 && !e.shiftKey && !_.isEmpty(message)) {
            e.preventDefault();

            // EDIT current message
            if(TemplateVar.get('editMessage')) {
                messageId = Messages.update(TemplateVar.get('editMessage'), {$set: {
                        type: 'edit',
                        topic: template.find('input[name="topic"]').value,
                        message: message,
                        edited: new Date()
                    }
                })

                // unset the edited message
                TemplateVar.set('editMessage', null);


            // INSERT new message
            } else {

                messageId = Messages.insert({
                    type: 'message',
                    chat: this._id,
                    timestamp: new Date(),
                    topic: template.find('input[name="topic"]').value,
                    // unread: true,
                    from: {
                        identity: Whisper.getIdentity().identity,
                        name: Whisper.getIdentity().name
                    },
                    message: message,
                });
                // add the entry to the chats entry list
                Chats.update(this._id, {
                    $addToSet: {messages: messageId},
                    $set: {lastActivity: new Date()}
                });
            }


            // clear text field
            if(messageId)
                e.currentTarget.value = '';
        }

    }
});