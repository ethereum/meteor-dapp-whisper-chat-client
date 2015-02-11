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
    },
    /**
    Checks if the its the current user and the message type is not 'notification'

    @method (canEdit)
    @return {Boolean}
    */
    'canEdit': function(from){
        return (from &&
                from.identity === Whisper.getIdentity().identity &&
                this.type !== 'notification' &&
                this.timestamp > moment().subtract(1, 'hour').unix());
    },
    /**
    Check whether the iterated user is in your following list.

    @method (inContacts)
    @return {Boolean}
    */
    'inContacts': function(){
        var user = User.findOne();
        return (user && _.contains(user.following, this.from.identity));
    },
    /**
    Return the right notification message

    @method (notificationType)
    @return {String}
    */
    'notificationType': function() {

        // INVIATIONs
        if(this.message === 'invitation') {

            return TAPi18n.__('whisper.chat.notifications.'+ this.message, {
                users: _.map(this.data, function(item) {
                    // add the invited users to your local user collection
                    Users.upsert(item.identity, {
                        _id: item.identity,
                        identity: item.identity,
                        name: item.name
                    });

                    // return the notification text
                    return '<a href="'+ Router.path('userProfile', {userId: item.identity}) +'">'+ _.stripTags(item.name) +'</a>';
                }).join(', ')
            });
        }

        // TOPIC CHANGED
        if(this.message === 'topicChanged') {

            if(!_.isEmpty(this.data)) {
                return TAPi18n.__('whisper.chat.notifications.'+ this.message, {
                    topic: '<button class="topic">'+ _.stripTags(this.data) + '</button>'
                });
            } else {
                return TAPi18n.__('whisper.chat.notifications.'+ this.message +'Empty');
            }
        }

        // CHAT NAME CHANGED 
        if(this.message === 'chatNameChanged') {
            if(!_.isEmpty(this.data)) {
                return TAPi18n.__('whisper.chat.notifications.'+ this.message, {
                    name: _.stripTags(this.data)
                });
            } else {
                return TAPi18n.__('whisper.chat.notifications.'+ this.message +'Empty');
            }
        }
    },
    /**
    Super duper format message helper.

    Strips HTML

    @method (message)
    */
    'message': function(){
        var text = this.message || '';


        // add prettyprint
        // var template = Template.instance();
        // if(template.view.isRendered) {
            
        //     Tracker.afterFlush(function(){
        //         console.log(template.$('code')[0]);
        //         template.$('code').wrap('<pre class="prettyprint">');
        //         prettyPrint();
        //     });
        // }

        // make sure not existing values are not Spacebars.kw
        // if(stripHtml instanceof Spacebars.kw)
        //     stripHtml = false;

        if(_.isString(text)) {

            text = _.stripTags(text); // stripTags or escapeHTML?

            // parse hashtags and add a target="_blank" to links
            return text
                // .replace(/\n+/g,'<br>')
                // this regex finds every link http://mylink.de, www.mylink.de and even mylink.de
                // Thanks to Android: http://grepcode.com/file/repository.grepcode.com/java/ext/com.google.android/android/2.0_r1/android/text/util/Regex.java#Regex.0WEB_URL_PATTERN
                // .replace(/((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi, '<a href="http://$1" target="_blank">$1</a>')
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
    }
});


Template['views_chats_item'].events({
    /**
    Set unread to FALSE for all messages in this group if the mouse was over it.

    @deprecated
    @event mouseenter .whisper-chat-item
    */
    // 'mouseenter .whisper-chat-item': function() {
    //     _.each(this.messages, function(item) {
    //         if(item.unread)
    //             Messages.update(item._id, {$set: {unread: false}});
    //     });
    // }
});
