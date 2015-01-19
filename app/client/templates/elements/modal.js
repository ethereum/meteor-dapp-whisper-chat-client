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

    // animate common elements
    // targetObject = $(".post-message .u-photo");
    // startingPosition = $(".whisper-profile .u-photo").offset();

    // diffX = startingPosition.left - targetObject.offset().left + 16;
    // diffY = startingPosition.top - targetObject.offset().top + 16;

    // targetObject.css({
    //         "-webkit-transform":"translate("+diffX+"px, "+diffY+"px) scale(2)"});


    // initiate the geo pattern
    var pattern = GeoPattern.generate(Math.random().toString());
    $('.whisper-profile .p-nickname').css('background-image', pattern.toDataUrl());
    $('.u-photo').attr("src", "http://www.gravatar.com/avatar/" + pattern.hash + '?d=retro&s=128')

    if (typeof chance != 'undefined') { 
        var genchance = new Chance(pattern.hash.toString);
        $('.p-nickname').text(chance.prefix() + " " +  chance.capitalize(chance.word())); 
    }
};