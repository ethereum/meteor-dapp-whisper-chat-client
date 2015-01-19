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
Inititate the geo pattern.

@method rendered
*/
Template['elements_modal'].rendered = function(){ 


    // initiate the geo pattern
    var pattern = GeoPattern.generate(Math.random().toString());
    $('.whisper-profile .p-nickname').css('background-image', pattern.toDataUrl());
    $('.u-photo').attr("src", "http://www.gravatar.com/avatar/" + pattern.hash + '?d=retro&s=128')

    if (typeof chance != 'undefined') { 
        var genchance = new Chance(pattern.hash.toString);
        $('.p-nickname').text(chance.prefix() + " " +  chance.capitalize(chance.word())); 
    }
};


Template['elements_modal'].events({
    'click .dapp-modal-overlay': function(){
        history.back();
    }
});