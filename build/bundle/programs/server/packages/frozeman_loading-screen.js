(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Inject = Package['meteorhacks:inject-initial'].Inject;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/frozeman:loading-screen/injection-code.js                                                               //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
                                                                                                                    // 1
// inject HEAD scripts                                                                                              // 2
Inject.rawHead('loadingScripts', '  <link class="inject-loading-container" rel="stylesheet" href="/loading.css">'); // 3
// inject BODY HTML                                                                                                 // 4
Inject.rawBody('loadingBody', '  <div class="inject-loading-container">'+ "\n" +                                    // 5
                                '    <h1>'+ "\n" +                                                                  // 6
                                '      Einen Moment noch...'+ "\n" +                                                // 7
                                '    </h1>'+ "\n" +                                                                 // 8
                                '  </div>');                                                                        // 9
                                                                                                                    // 10
/**                                                                                                                 // 11
Moves all javascripts to the end of the body, so we can inject the loading screen                                   // 12
                                                                                                                    // 13
*/                                                                                                                  // 14
Inject.rawModHtml('moveScriptsToBottom', function(html) {                                                           // 15
    // get all scripts                                                                                              // 16
    var scripts = html.match(/<script type="text\/javascript" src.*"><\/script>\n/g);                               // 17
                                                                                                                    // 18
    // if found                                                                                                     // 19
    if(!_.isEmpty(scripts)) {                                                                                       // 20
        // remove all scripts                                                                                       // 21
        html = html.replace(/<script type="text\/javascript" src.*"><\/script>\n/g, '');                            // 22
        // add scripts to the bottom                                                                                // 23
        html = html.replace(/<\/body>/, scripts.join('') + '\n</body>');                                            // 24
        return html.replace(/[\n]+/g,"\n").replace(/ +/g,' ');                                                      // 25
                                                                                                                    // 26
    // otherwise pass the raw html through                                                                          // 27
    } else {                                                                                                        // 28
        return html.replace(/[\n]+/g,"\n").replace(/ +/g,' ');                                                      // 29
    }                                                                                                               // 30
});                                                                                                                 // 31
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['frozeman:loading-screen'] = {};

})();

//# sourceMappingURL=frozeman_loading-screen.js.map
