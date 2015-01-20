/**
Template Controllers

@module Templates
*/

/**
The modal wrapper template

@class [template] elements_modal
@constructor
*/


/**
Look the scrolling of the body

@method rendered
*/
Template['elements_modal'].created = function(){
    $('body').addClass('disable-scroll');
};


/**
Inititate the geo pattern.

@method rendered
*/
Template['elements_modal'].rendered = function(){


    // initiate the geo pattern
    var pattern = GeoPattern.generate(Math.random().toString());
    $('.dapp-modal-header.dapp-pattern').css('background-image', pattern.toDataUrl());
    $('.dapp-profile-image').each(function(){ $(this).css("background-image", "url(http://www.gravatar.com/avatar/" + chance.hash() + '?d=retro&s=128)')});

    if (typeof chance != 'undefined') { 
        var genchance = new Chance(pattern.hash.toString);
        $('.dapp-unauthenticated').text(chance.prefix() + " " +  chance.capitalize(chance.word())); 
    }
};

/**
Remove look of scrolling from the body

@method rendered
*/
Template['elements_modal'].destroyed = function(){
    $('body').removeClass('disable-scroll');
};



Template['elements_modal'].events({
    'click .dapp-modal-overlay': function(e){
        if($(e.target).hasClass('dapp-modal-overlay'))
            history.back();
    }
});