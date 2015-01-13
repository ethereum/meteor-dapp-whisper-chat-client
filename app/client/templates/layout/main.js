/**
Template Controllers

@module Templates
*/

/**
The layout template

@class [template] layout_main
@constructor
*/


Template['layout_main'].helpers({
    /**
    Determines whether the sidebar is visible or not

    @method (sideBarVisible)
    */
    'sideBarVisible': function(){
        return TemplateVar.get('sideBarVisible');
    }
})


Template['layout_main'].events({
    /**
    Show hide the sidebar

    @event click button.hamburger, click .side-bar-overlay
    */
    'click button.hamburger, click .side-bar-overlay': function(){
        $('aside.main').toggleClass('visible');

        if($('aside.main').hasClass('visible')) 
            TemplateVar.set('sideBarVisible', true);
        else
            TemplateVar.set('sideBarVisible', false);
    },
    /**
    Force reconnect, when the user clicks the offline banner.

    @event click div.offline
    */
    'click div.offline': function(){
        Meteor.reconnect();
    }
});