/**
Template Controllers

@module Templates
*/

/**
The modal wrapper template.
If you pass "closePath" in the data context, it will use this path, when the modal overlay is clicked.


@class [template] elements_modal
@constructor
*/


/**
Look the scrolling of the body

@method rendered
*/
Template['elements_modal'].created = function(){
    $('body').addClass('disable-scroll blur');
};


/**
Inititate the geo pattern.

@method rendered
*/
Template['elements_modal'].rendered = function(){

    // initiate the geo pattern
    var pattern = GeoPattern.generate(Math.random().toString());
    this.$('.dapp-modal-header.dapp-pattern').css('background-image', pattern.toDataUrl());
    this.$('.dapp-profile-image').each(function(){ $(this).css("background-image", "url(http://www.gravatar.com/avatar/" + chance.hash() + '?d=retro&s=128)')});

    if (typeof chance != 'undefined') { 
        var genchance = new Chance(pattern.hash.toString);
        this.$('.dapp-unauthenticated').text(chance.prefix() + " " +  chance.capitalize(chance.word())); 
    }
};

/**
Remove look of scrolling from the body

@method rendered
*/
Template['elements_modal'].destroyed = function(){
    $('body').removeClass('disable-scroll blur');
};



Template['elements_modal'].events({
    /**
    Hide the modal on click. If the data context has the property "closePath",
    it will route to this one instead of going back in the browser history.

    @event click .dapp-modal-overlay
    */
    'click .dapp-modal-overlay': function(e){
        // hide the modal
        if($(e.target).hasClass('dapp-modal-overlay')) {

            // hide modal
            Router.current().render(null, {to: 'modal'});

            if(this.closePath)
                Router.go(this.closePath);
            else
                history.back();
        }
    }
});