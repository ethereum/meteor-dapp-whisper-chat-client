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
};