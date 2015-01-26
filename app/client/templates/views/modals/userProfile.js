/**
Template Controllers

@module Templates
*/

/**
The user profile template

@class [template] view_modals_userProfile
@constructor
*/

/**
Inititate the geo pattern.

@method rendered
*/
Template['view_modals_userProfile'].rendered = function(){

    // initiate the geo pattern
    var pattern = GeoPattern.generate(this.data.identity);
    this.$('.dapp-modal-header.dapp-pattern').css('background-image', pattern.toDataUrl());
};


// Template['view_modals_userProfile'].helpers({
// });

Template['view_modals_userProfile'].events({
    /**
    Add the user to the follow list

    @event click button.follow
    */
    'click button.follow': function(e){
        
    }
});
