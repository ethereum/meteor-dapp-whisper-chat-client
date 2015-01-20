/**
Template Controllers

@module Templates
*/

/**
The add user template

@class [template] view_modals_addUser
@constructor
*/


Template['view_modals_addUser'].events({
    /**
    Select the whole text of the input

    @event click input[type="text"]
    */
    'click input[type="text"]': function(e){
        $(e.currentTarget).focus().select();
    }
});