
// inject HEAD scripts
Inject.rawHead('loadingScripts', '  <link class="inject-loading-container" rel="stylesheet" href="/loading.css">');
// inject BODY HTML
Inject.rawBody('loadingBody', '  <div class="inject-loading-container">'+ "\n" +
                                '    <h1>'+ "\n" +
                                '      Loading...'+ "\n" +
                                '    </h1>'+ "\n" +
                                '  </div>');


/**
Moves all javascripts to the end of the body, so we can inject the loading screen

*/
Inject.rawModHtml('moveScriptsToBottom', function(html) {
    // get all scripts
    var scripts = html.match(/<script type="text\/javascript" src.*"><\/script>\n/g);

    // if found
    if(!_.isEmpty(scripts)) {
        // remove all scripts
        html = html.replace(/<script type="text\/javascript" src.*"><\/script>\n/g, '');
        // add scripts to the bottom
        html = html.replace(/<\/body>/, scripts.join('') + '\n</body>');
        return html.replace(/[\n]+/g,"\n").replace(/ +/g,' ');

    // otherwise pass the raw html through
    } else {
        return html.replace(/[\n]+/g,"\n").replace(/ +/g,' ');
    }
});