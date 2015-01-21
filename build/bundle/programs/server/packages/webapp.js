(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Log = Package.logging.Log;
var _ = Package.underscore._;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var Boilerplate = Package['boilerplate-generator'].Boilerplate;
var Spacebars = Package.spacebars.Spacebars;
var HTML = Package.htmljs.HTML;
var Blaze = Package.blaze.Blaze;
var UI = Package.blaze.UI;
var Handlebars = Package.blaze.Handlebars;
var WebAppHashing = Package['webapp-hashing'].WebAppHashing;

/* Package-scope variables */
var WebApp, main, WebAppInternals;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////
//                                                                                       //
// packages/webapp/webapp_server.js                                                      //
//                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////
                                                                                         //
////////// Requires //////////                                                           // 1
                                                                                         // 2
var fs = Npm.require("fs");                                                              // 3
var http = Npm.require("http");                                                          // 4
var os = Npm.require("os");                                                              // 5
var path = Npm.require("path");                                                          // 6
var url = Npm.require("url");                                                            // 7
var crypto = Npm.require("crypto");                                                      // 8
                                                                                         // 9
var connect = Npm.require('connect');                                                    // 10
var useragent = Npm.require('useragent');                                                // 11
var send = Npm.require('send');                                                          // 12
                                                                                         // 13
var Future = Npm.require('fibers/future');                                               // 14
var Fiber = Npm.require('fibers');                                                       // 15
                                                                                         // 16
var SHORT_SOCKET_TIMEOUT = 5*1000;                                                       // 17
var LONG_SOCKET_TIMEOUT = 120*1000;                                                      // 18
                                                                                         // 19
WebApp = {};                                                                             // 20
WebAppInternals = {};                                                                    // 21
                                                                                         // 22
WebApp.defaultArch = 'web.browser';                                                      // 23
                                                                                         // 24
// XXX maps archs to manifests                                                           // 25
WebApp.clientPrograms = {};                                                              // 26
                                                                                         // 27
// XXX maps archs to program path on filesystem                                          // 28
var archPath = {};                                                                       // 29
                                                                                         // 30
var bundledJsCssPrefix;                                                                  // 31
                                                                                         // 32
var sha1 = function (contents) {                                                         // 33
  var hash = crypto.createHash('sha1');                                                  // 34
  hash.update(contents);                                                                 // 35
  return hash.digest('hex');                                                             // 36
};                                                                                       // 37
                                                                                         // 38
var readUtf8FileSync = function (filename) {                                             // 39
  return Meteor.wrapAsync(fs.readFile)(filename, 'utf8');                                // 40
};                                                                                       // 41
                                                                                         // 42
// #BrowserIdentification                                                                // 43
//                                                                                       // 44
// We have multiple places that want to identify the browser: the                        // 45
// unsupported browser page, the appcache package, and, eventually                       // 46
// delivering browser polyfills only as needed.                                          // 47
//                                                                                       // 48
// To avoid detecting the browser in multiple places ad-hoc, we create a                 // 49
// Meteor "browser" object. It uses but does not expose the npm                          // 50
// useragent module (we could choose a different mechanism to identify                   // 51
// the browser in the future if we wanted to).  The browser object                       // 52
// contains                                                                              // 53
//                                                                                       // 54
// * `name`: the name of the browser in camel case                                       // 55
// * `major`, `minor`, `patch`: integers describing the browser version                  // 56
//                                                                                       // 57
// Also here is an early version of a Meteor `request` object, intended                  // 58
// to be a high-level description of the request without exposing                        // 59
// details of connect's low-level `req`.  Currently it contains:                         // 60
//                                                                                       // 61
// * `browser`: browser identification object described above                            // 62
// * `url`: parsed url, including parsed query params                                    // 63
//                                                                                       // 64
// As a temporary hack there is a `categorizeRequest` function on WebApp which           // 65
// converts a connect `req` to a Meteor `request`. This can go away once smart           // 66
// packages such as appcache are being passed a `request` object directly when           // 67
// they serve content.                                                                   // 68
//                                                                                       // 69
// This allows `request` to be used uniformly: it is passed to the html                  // 70
// attributes hook, and the appcache package can use it when deciding                    // 71
// whether to generate a 404 for the manifest.                                           // 72
//                                                                                       // 73
// Real routing / server side rendering will probably refactor this                      // 74
// heavily.                                                                              // 75
                                                                                         // 76
                                                                                         // 77
// e.g. "Mobile Safari" => "mobileSafari"                                                // 78
var camelCase = function (name) {                                                        // 79
  var parts = name.split(' ');                                                           // 80
  parts[0] = parts[0].toLowerCase();                                                     // 81
  for (var i = 1;  i < parts.length;  ++i) {                                             // 82
    parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].substr(1);                    // 83
  }                                                                                      // 84
  return parts.join('');                                                                 // 85
};                                                                                       // 86
                                                                                         // 87
var identifyBrowser = function (userAgentString) {                                       // 88
  var userAgent = useragent.lookup(userAgentString);                                     // 89
  return {                                                                               // 90
    name: camelCase(userAgent.family),                                                   // 91
    major: +userAgent.major,                                                             // 92
    minor: +userAgent.minor,                                                             // 93
    patch: +userAgent.patch                                                              // 94
  };                                                                                     // 95
};                                                                                       // 96
                                                                                         // 97
// XXX Refactor as part of implementing real routing.                                    // 98
WebAppInternals.identifyBrowser = identifyBrowser;                                       // 99
                                                                                         // 100
WebApp.categorizeRequest = function (req) {                                              // 101
  return {                                                                               // 102
    browser: identifyBrowser(req.headers['user-agent']),                                 // 103
    url: url.parse(req.url, true)                                                        // 104
  };                                                                                     // 105
};                                                                                       // 106
                                                                                         // 107
// HTML attribute hooks: functions to be called to determine any attributes to           // 108
// be added to the '<html>' tag. Each function is passed a 'request' object (see         // 109
// #BrowserIdentification) and should return null or object.                             // 110
var htmlAttributeHooks = [];                                                             // 111
var getHtmlAttributes = function (request) {                                             // 112
  var combinedAttributes  = {};                                                          // 113
  _.each(htmlAttributeHooks || [], function (hook) {                                     // 114
    var attributes = hook(request);                                                      // 115
    if (attributes === null)                                                             // 116
      return;                                                                            // 117
    if (typeof attributes !== 'object')                                                  // 118
      throw Error("HTML attribute hook must return null or object");                     // 119
    _.extend(combinedAttributes, attributes);                                            // 120
  });                                                                                    // 121
  return combinedAttributes;                                                             // 122
};                                                                                       // 123
WebApp.addHtmlAttributeHook = function (hook) {                                          // 124
  htmlAttributeHooks.push(hook);                                                         // 125
};                                                                                       // 126
                                                                                         // 127
// Serve app HTML for this URL?                                                          // 128
var appUrl = function (url) {                                                            // 129
  if (url === '/favicon.ico' || url === '/robots.txt')                                   // 130
    return false;                                                                        // 131
                                                                                         // 132
  // NOTE: app.manifest is not a web standard like favicon.ico and                       // 133
  // robots.txt. It is a file name we have chosen to use for HTML5                       // 134
  // appcache URLs. It is included here to prevent using an appcache                     // 135
  // then removing it from poisoning an app permanently. Eventually,                     // 136
  // once we have server side routing, this won't be needed as                           // 137
  // unknown URLs with return a 404 automatically.                                       // 138
  if (url === '/app.manifest')                                                           // 139
    return false;                                                                        // 140
                                                                                         // 141
  // Avoid serving app HTML for declared routes such as /sockjs/.                        // 142
  if (RoutePolicy.classify(url))                                                         // 143
    return false;                                                                        // 144
                                                                                         // 145
  // we currently return app HTML on all URLs by default                                 // 146
  return true;                                                                           // 147
};                                                                                       // 148
                                                                                         // 149
                                                                                         // 150
// We need to calculate the client hash after all packages have loaded                   // 151
// to give them a chance to populate __meteor_runtime_config__.                          // 152
//                                                                                       // 153
// Calculating the hash during startup means that packages can only                      // 154
// populate __meteor_runtime_config__ during load, not during startup.                   // 155
//                                                                                       // 156
// Calculating instead it at the beginning of main after all startup                     // 157
// hooks had run would allow packages to also populate                                   // 158
// __meteor_runtime_config__ during startup, but that's too late for                     // 159
// autoupdate because it needs to have the client hash at startup to                     // 160
// insert the auto update version itself into                                            // 161
// __meteor_runtime_config__ to get it to the client.                                    // 162
//                                                                                       // 163
// An alternative would be to give autoupdate a "post-start,                             // 164
// pre-listen" hook to allow it to insert the auto update version at                     // 165
// the right moment.                                                                     // 166
                                                                                         // 167
Meteor.startup(function () {                                                             // 168
  var calculateClientHash = WebAppHashing.calculateClientHash;                           // 169
  WebApp.clientHash = function (archName) {                                              // 170
    archName = archName || WebApp.defaultArch;                                           // 171
    return calculateClientHash(WebApp.clientPrograms[archName].manifest);                // 172
  };                                                                                     // 173
                                                                                         // 174
  WebApp.calculateClientHashRefreshable = function (archName) {                          // 175
    archName = archName || WebApp.defaultArch;                                           // 176
    return calculateClientHash(WebApp.clientPrograms[archName].manifest,                 // 177
      function (name) {                                                                  // 178
        return name === "css";                                                           // 179
      });                                                                                // 180
  };                                                                                     // 181
  WebApp.calculateClientHashNonRefreshable = function (archName) {                       // 182
    archName = archName || WebApp.defaultArch;                                           // 183
    return calculateClientHash(WebApp.clientPrograms[archName].manifest,                 // 184
      function (name) {                                                                  // 185
        return name !== "css";                                                           // 186
      });                                                                                // 187
  };                                                                                     // 188
  WebApp.calculateClientHashCordova = function () {                                      // 189
    var archName = 'web.cordova';                                                        // 190
    if (! WebApp.clientPrograms[archName])                                               // 191
      return 'none';                                                                     // 192
                                                                                         // 193
    return calculateClientHash(                                                          // 194
      WebApp.clientPrograms[archName].manifest, null, _.pick(                            // 195
        __meteor_runtime_config__, 'PUBLIC_SETTINGS'));                                  // 196
  };                                                                                     // 197
});                                                                                      // 198
                                                                                         // 199
                                                                                         // 200
                                                                                         // 201
// When we have a request pending, we want the socket timeout to be long, to             // 202
// give ourselves a while to serve it, and to allow sockjs long polls to                 // 203
// complete.  On the other hand, we want to close idle sockets relatively                // 204
// quickly, so that we can shut down relatively promptly but cleanly, without            // 205
// cutting off anyone's response.                                                        // 206
WebApp._timeoutAdjustmentRequestCallback = function (req, res) {                         // 207
  // this is really just req.socket.setTimeout(LONG_SOCKET_TIMEOUT);                     // 208
  req.setTimeout(LONG_SOCKET_TIMEOUT);                                                   // 209
  // Insert our new finish listener to run BEFORE the existing one which removes         // 210
  // the response from the socket.                                                       // 211
  var finishListeners = res.listeners('finish');                                         // 212
  // XXX Apparently in Node 0.12 this event is now called 'prefinish'.                   // 213
  // https://github.com/joyent/node/commit/7c9b6070                                      // 214
  res.removeAllListeners('finish');                                                      // 215
  res.on('finish', function () {                                                         // 216
    res.setTimeout(SHORT_SOCKET_TIMEOUT);                                                // 217
  });                                                                                    // 218
  _.each(finishListeners, function (l) { res.on('finish', l); });                        // 219
};                                                                                       // 220
                                                                                         // 221
                                                                                         // 222
// Will be updated by main before we listen.                                             // 223
// Map from client arch to boilerplate object.                                           // 224
// Boilerplate object has:                                                               // 225
//   - func: XXX                                                                         // 226
//   - baseData: XXX                                                                     // 227
var boilerplateByArch = {};                                                              // 228
                                                                                         // 229
// Given a request (as returned from `categorizeRequest`), return the                    // 230
// boilerplate HTML to serve for that request. Memoizes on HTML                          // 231
// attributes (used by, eg, appcache) and whether inline scripts are                     // 232
// currently allowed.                                                                    // 233
// XXX so far this function is always called with arch === 'web.browser'                 // 234
var memoizedBoilerplate = {};                                                            // 235
var getBoilerplate = function (request, arch) {                                          // 236
                                                                                         // 237
  var htmlAttributes = getHtmlAttributes(request);                                       // 238
                                                                                         // 239
  // The only thing that changes from request to request (for now) are                   // 240
  // the HTML attributes (used by, eg, appcache) and whether inline                      // 241
  // scripts are allowed, so we can memoize based on that.                               // 242
  var memHash = JSON.stringify({                                                         // 243
    inlineScriptsAllowed: inlineScriptsAllowed,                                          // 244
    htmlAttributes: htmlAttributes,                                                      // 245
    arch: arch                                                                           // 246
  });                                                                                    // 247
                                                                                         // 248
  if (! memoizedBoilerplate[memHash]) {                                                  // 249
    memoizedBoilerplate[memHash] = boilerplateByArch[arch].toHTML({                      // 250
      htmlAttributes: htmlAttributes                                                     // 251
    });                                                                                  // 252
  }                                                                                      // 253
  return memoizedBoilerplate[memHash];                                                   // 254
};                                                                                       // 255
                                                                                         // 256
WebAppInternals.generateBoilerplateInstance = function (arch,                            // 257
                                                        manifest,                        // 258
                                                        additionalOptions) {             // 259
  additionalOptions = additionalOptions || {};                                           // 260
                                                                                         // 261
  var runtimeConfig = _.extend(                                                          // 262
    _.clone(__meteor_runtime_config__),                                                  // 263
    additionalOptions.runtimeConfigOverrides || {}                                       // 264
  );                                                                                     // 265
                                                                                         // 266
  var jsCssPrefix;                                                                       // 267
  if (arch === 'web.cordova') {                                                          // 268
    // in cordova we serve assets up directly from disk so it doesn't make               // 269
    // sense to use the prefix (ordinarily something like a CDN) and go out              // 270
    // to the internet for those files.                                                  // 271
    jsCssPrefix = '';                                                                    // 272
  } else {                                                                               // 273
    jsCssPrefix = bundledJsCssPrefix ||                                                  // 274
      __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '';                              // 275
  }                                                                                      // 276
                                                                                         // 277
  return new Boilerplate(arch, manifest,                                                 // 278
    _.extend({                                                                           // 279
      pathMapper: function (itemPath) {                                                  // 280
        return path.join(archPath[arch], itemPath); },                                   // 281
      baseDataExtension: {                                                               // 282
        additionalStaticJs: _.map(                                                       // 283
          additionalStaticJs || [],                                                      // 284
          function (contents, pathname) {                                                // 285
            return {                                                                     // 286
              pathname: pathname,                                                        // 287
              contents: contents                                                         // 288
            };                                                                           // 289
          }                                                                              // 290
        ),                                                                               // 291
        meteorRuntimeConfig: JSON.stringify(runtimeConfig),                              // 292
        rootUrlPathPrefix: __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '',         // 293
        bundledJsCssPrefix: jsCssPrefix,                                                 // 294
        inlineScriptsAllowed: WebAppInternals.inlineScriptsAllowed(),                    // 295
        inline: additionalOptions.inline                                                 // 296
      }                                                                                  // 297
    }, additionalOptions)                                                                // 298
  );                                                                                     // 299
};                                                                                       // 300
                                                                                         // 301
// A mapping from url path to "info". Where "info" has the following fields:             // 302
// - type: the type of file to be served                                                 // 303
// - cacheable: optionally, whether the file should be cached or not                     // 304
// - sourceMapUrl: optionally, the url of the source map                                 // 305
//                                                                                       // 306
// Info also contains one of the following:                                              // 307
// - content: the stringified content that should be served at this path                 // 308
// - absolutePath: the absolute path on disk to the file                                 // 309
                                                                                         // 310
var staticFiles;                                                                         // 311
                                                                                         // 312
// Serve static files from the manifest or added with                                    // 313
// `addStaticJs`. Exported for tests.                                                    // 314
WebAppInternals.staticFilesMiddleware = function (staticFiles, req, res, next) {         // 315
  if ('GET' != req.method && 'HEAD' != req.method) {                                     // 316
    next();                                                                              // 317
    return;                                                                              // 318
  }                                                                                      // 319
  var pathname = connect.utils.parseUrl(req).pathname;                                   // 320
  try {                                                                                  // 321
    pathname = decodeURIComponent(pathname);                                             // 322
  } catch (e) {                                                                          // 323
    next();                                                                              // 324
    return;                                                                              // 325
  }                                                                                      // 326
                                                                                         // 327
  var serveStaticJs = function (s) {                                                     // 328
    res.writeHead(200, {                                                                 // 329
      'Content-type': 'application/javascript; charset=UTF-8'                            // 330
    });                                                                                  // 331
    res.write(s);                                                                        // 332
    res.end();                                                                           // 333
  };                                                                                     // 334
                                                                                         // 335
  if (pathname === "/meteor_runtime_config.js" &&                                        // 336
      ! WebAppInternals.inlineScriptsAllowed()) {                                        // 337
    serveStaticJs("__meteor_runtime_config__ = " +                                       // 338
                  JSON.stringify(__meteor_runtime_config__) + ";");                      // 339
    return;                                                                              // 340
  } else if (_.has(additionalStaticJs, pathname) &&                                      // 341
              ! WebAppInternals.inlineScriptsAllowed()) {                                // 342
    serveStaticJs(additionalStaticJs[pathname]);                                         // 343
    return;                                                                              // 344
  }                                                                                      // 345
                                                                                         // 346
  if (!_.has(staticFiles, pathname)) {                                                   // 347
    next();                                                                              // 348
    return;                                                                              // 349
  }                                                                                      // 350
                                                                                         // 351
  // We don't need to call pause because, unlike 'static', once we call into             // 352
  // 'send' and yield to the event loop, we never call another handler with              // 353
  // 'next'.                                                                             // 354
                                                                                         // 355
  var info = staticFiles[pathname];                                                      // 356
                                                                                         // 357
  // Cacheable files are files that should never change. Typically                       // 358
  // named by their hash (eg meteor bundled js and css files).                           // 359
  // We cache them ~forever (1yr).                                                       // 360
  //                                                                                     // 361
  // We cache non-cacheable files anyway. This isn't really correct, as users            // 362
  // can change the files and changes won't propagate immediately. However, if           // 363
  // we don't cache them, browsers will 'flicker' when rerendering                       // 364
  // images. Eventually we will probably want to rewrite URLs of static assets           // 365
  // to include a query parameter to bust caches. That way we can both get               // 366
  // good caching behavior and allow users to change assets without delay.               // 367
  // https://github.com/meteor/meteor/issues/773                                         // 368
  var maxAge = info.cacheable                                                            // 369
        ? 1000 * 60 * 60 * 24 * 365                                                      // 370
        : 1000 * 60 * 60 * 24;                                                           // 371
                                                                                         // 372
  // Set the X-SourceMap header, which current Chrome, FireFox, and Safari               // 373
  // understand.  (The SourceMap header is slightly more spec-correct but FF             // 374
  // doesn't understand it.)                                                             // 375
  //                                                                                     // 376
  // You may also need to enable source maps in Chrome: open dev tools, click            // 377
  // the gear in the bottom right corner, and select "enable source maps".               // 378
  if (info.sourceMapUrl) {                                                               // 379
    res.setHeader('X-SourceMap',                                                         // 380
                  __meteor_runtime_config__.ROOT_URL_PATH_PREFIX +                       // 381
                  info.sourceMapUrl);                                                    // 382
  }                                                                                      // 383
                                                                                         // 384
  if (info.type === "js") {                                                              // 385
    res.setHeader("Content-Type", "application/javascript; charset=UTF-8");              // 386
  } else if (info.type === "css") {                                                      // 387
    res.setHeader("Content-Type", "text/css; charset=UTF-8");                            // 388
  } else if (info.type === "json") {                                                     // 389
    res.setHeader("Content-Type", "application/json; charset=UTF-8");                    // 390
    // XXX if it is a manifest we are serving, set additional headers                    // 391
    if (/\/manifest.json$/.test(pathname)) {                                             // 392
      res.setHeader("Access-Control-Allow-Origin", "*");                                 // 393
    }                                                                                    // 394
  }                                                                                      // 395
                                                                                         // 396
  if (info.content) {                                                                    // 397
    res.write(info.content);                                                             // 398
    res.end();                                                                           // 399
  } else {                                                                               // 400
    send(req, info.absolutePath)                                                         // 401
      .maxage(maxAge)                                                                    // 402
      .hidden(true)  // if we specified a dotfile in the manifest, serve it              // 403
      .on('error', function (err) {                                                      // 404
        Log.error("Error serving static file " + err);                                   // 405
        res.writeHead(500);                                                              // 406
        res.end();                                                                       // 407
      })                                                                                 // 408
      .on('directory', function () {                                                     // 409
        Log.error("Unexpected directory " + info.absolutePath);                          // 410
        res.writeHead(500);                                                              // 411
        res.end();                                                                       // 412
      })                                                                                 // 413
      .pipe(res);                                                                        // 414
  }                                                                                      // 415
};                                                                                       // 416
                                                                                         // 417
var getUrlPrefixForArch = function (arch) {                                              // 418
  // XXX we rely on the fact that arch names don't contain slashes                       // 419
  // in that case we would need to uri escape it                                         // 420
                                                                                         // 421
  // We add '__' to the beginning of non-standard archs to "scope" the url               // 422
  // to Meteor internals.                                                                // 423
  return arch === WebApp.defaultArch ?                                                   // 424
    '' : '/' + '__' + arch.replace(/^web\./, '');                                        // 425
};                                                                                       // 426
                                                                                         // 427
var runWebAppServer = function () {                                                      // 428
  var shuttingDown = false;                                                              // 429
  var syncQueue = new Meteor._SynchronousQueue();                                        // 430
                                                                                         // 431
  var getItemPathname = function (itemUrl) {                                             // 432
    return decodeURIComponent(url.parse(itemUrl).pathname);                              // 433
  };                                                                                     // 434
                                                                                         // 435
  WebAppInternals.reloadClientPrograms = function () {                                   // 436
    syncQueue.runTask(function() {                                                       // 437
      staticFiles = {};                                                                  // 438
      var generateClientProgram = function (clientPath, arch) {                          // 439
        // read the control for the client we'll be serving up                           // 440
        var clientJsonPath = path.join(__meteor_bootstrap__.serverDir,                   // 441
                                   clientPath);                                          // 442
        var clientDir = path.dirname(clientJsonPath);                                    // 443
        var clientJson = JSON.parse(readUtf8FileSync(clientJsonPath));                   // 444
        if (clientJson.format !== "web-program-pre1")                                    // 445
          throw new Error("Unsupported format for client assets: " +                     // 446
                          JSON.stringify(clientJson.format));                            // 447
                                                                                         // 448
        if (! clientJsonPath || ! clientDir || ! clientJson)                             // 449
          throw new Error("Client config file not parsed.");                             // 450
                                                                                         // 451
        var urlPrefix = getUrlPrefixForArch(arch);                                       // 452
                                                                                         // 453
        var manifest = clientJson.manifest;                                              // 454
        _.each(manifest, function (item) {                                               // 455
          if (item.url && item.where === "client") {                                     // 456
            staticFiles[urlPrefix + getItemPathname(item.url)] = {                       // 457
              absolutePath: path.join(clientDir, item.path),                             // 458
              cacheable: item.cacheable,                                                 // 459
              // Link from source to its map                                             // 460
              sourceMapUrl: item.sourceMapUrl,                                           // 461
              type: item.type                                                            // 462
            };                                                                           // 463
                                                                                         // 464
            if (item.sourceMap) {                                                        // 465
              // Serve the source map too, under the specified URL. We assume all        // 466
              // source maps are cacheable.                                              // 467
              staticFiles[urlPrefix + getItemPathname(item.sourceMapUrl)] = {            // 468
                absolutePath: path.join(clientDir, item.sourceMap),                      // 469
                cacheable: true                                                          // 470
              };                                                                         // 471
            }                                                                            // 472
          }                                                                              // 473
        });                                                                              // 474
                                                                                         // 475
        var program = {                                                                  // 476
          manifest: manifest,                                                            // 477
          version: WebAppHashing.calculateClientHash(manifest, null, _.pick(             // 478
            __meteor_runtime_config__, 'PUBLIC_SETTINGS')),                              // 479
          PUBLIC_SETTINGS: __meteor_runtime_config__.PUBLIC_SETTINGS                     // 480
        };                                                                               // 481
                                                                                         // 482
        WebApp.clientPrograms[arch] = program;                                           // 483
                                                                                         // 484
        // Serve the program as a string at /foo/<arch>/manifest.json                    // 485
        // XXX change manifest.json -> program.json                                      // 486
        staticFiles[path.join(urlPrefix, 'manifest.json')] = {                           // 487
          content: JSON.stringify(program),                                              // 488
          cacheable: true,                                                               // 489
          type: "json"                                                                   // 490
        };                                                                               // 491
      };                                                                                 // 492
                                                                                         // 493
      try {                                                                              // 494
        var clientPaths = __meteor_bootstrap__.configJson.clientPaths;                   // 495
        _.each(clientPaths, function (clientPath, arch) {                                // 496
          archPath[arch] = path.dirname(clientPath);                                     // 497
          generateClientProgram(clientPath, arch);                                       // 498
        });                                                                              // 499
                                                                                         // 500
        // Exported for tests.                                                           // 501
        WebAppInternals.staticFiles = staticFiles;                                       // 502
      } catch (e) {                                                                      // 503
        Log.error("Error reloading the client program: " + e.stack);                     // 504
        process.exit(1);                                                                 // 505
      }                                                                                  // 506
    });                                                                                  // 507
  };                                                                                     // 508
                                                                                         // 509
  WebAppInternals.generateBoilerplate = function () {                                    // 510
    // This boilerplate will be served to the mobile devices when used with              // 511
    // Meteor/Cordova for the Hot-Code Push and since the file will be served by         // 512
    // the device's server, it is important to set the DDP url to the actual             // 513
    // Meteor server accepting DDP connections and not the device's file server.         // 514
    var defaultOptionsForArch = {                                                        // 515
      'web.cordova': {                                                                   // 516
        runtimeConfigOverrides: {                                                        // 517
          // XXX We use absoluteUrl() here so that we serve https://                     // 518
          // URLs to cordova clients if force-ssl is in use. If we were                  // 519
          // to use __meteor_runtime_config__.ROOT_URL instead of                        // 520
          // absoluteUrl(), then Cordova clients would immediately get a                 // 521
          // HCP setting their DDP_DEFAULT_CONNECTION_URL to                             // 522
          // http://example.meteor.com. This breaks the app, because                     // 523
          // force-ssl doesn't serve CORS headers on 302                                 // 524
          // redirects. (Plus it's undesirable to have clients                           // 525
          // connecting to http://example.meteor.com when force-ssl is                   // 526
          // in use.)                                                                    // 527
          DDP_DEFAULT_CONNECTION_URL: process.env.MOBILE_DDP_URL ||                      // 528
            Meteor.absoluteUrl(),                                                        // 529
          ROOT_URL: process.env.MOBILE_ROOT_URL ||                                       // 530
            Meteor.absoluteUrl()                                                         // 531
        }                                                                                // 532
      }                                                                                  // 533
    };                                                                                   // 534
                                                                                         // 535
    syncQueue.runTask(function() {                                                       // 536
      _.each(WebApp.clientPrograms, function (program, archName) {                       // 537
        boilerplateByArch[archName] =                                                    // 538
          WebAppInternals.generateBoilerplateInstance(                                   // 539
            archName, program.manifest,                                                  // 540
            defaultOptionsForArch[archName]);                                            // 541
      });                                                                                // 542
                                                                                         // 543
      // Clear the memoized boilerplate cache.                                           // 544
      memoizedBoilerplate = {};                                                          // 545
                                                                                         // 546
      // Configure CSS injection for the default arch                                    // 547
      // XXX implement the CSS injection for all archs?                                  // 548
      WebAppInternals.refreshableAssets = {                                              // 549
        allCss: boilerplateByArch[WebApp.defaultArch].baseData.css                       // 550
      };                                                                                 // 551
    });                                                                                  // 552
  };                                                                                     // 553
                                                                                         // 554
  WebAppInternals.reloadClientPrograms();                                                // 555
                                                                                         // 556
  // webserver                                                                           // 557
  var app = connect();                                                                   // 558
                                                                                         // 559
  // Auto-compress any json, javascript, or text.                                        // 560
  app.use(connect.compress());                                                           // 561
                                                                                         // 562
  // Packages and apps can add handlers that run before any other Meteor                 // 563
  // handlers via WebApp.rawConnectHandlers.                                             // 564
  var rawConnectHandlers = connect();                                                    // 565
  app.use(rawConnectHandlers);                                                           // 566
                                                                                         // 567
  // We're not a proxy; reject (without crashing) attempts to treat us like              // 568
  // one. (See #1212.)                                                                   // 569
  app.use(function(req, res, next) {                                                     // 570
    if (RoutePolicy.isValidUrl(req.url)) {                                               // 571
      next();                                                                            // 572
      return;                                                                            // 573
    }                                                                                    // 574
    res.writeHead(400);                                                                  // 575
    res.write("Not a proxy");                                                            // 576
    res.end();                                                                           // 577
  });                                                                                    // 578
                                                                                         // 579
  // Strip off the path prefix, if it exists.                                            // 580
  app.use(function (request, response, next) {                                           // 581
    var pathPrefix = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX;                     // 582
    var url = Npm.require('url').parse(request.url);                                     // 583
    var pathname = url.pathname;                                                         // 584
    // check if the path in the url starts with the path prefix (and the part            // 585
    // after the path prefix must start with a / if it exists.)                          // 586
    if (pathPrefix && pathname.substring(0, pathPrefix.length) === pathPrefix &&         // 587
       (pathname.length == pathPrefix.length                                             // 588
        || pathname.substring(pathPrefix.length, pathPrefix.length + 1) === "/")) {      // 589
      request.url = request.url.substring(pathPrefix.length);                            // 590
      next();                                                                            // 591
    } else if (pathname === "/favicon.ico" || pathname === "/robots.txt") {              // 592
      next();                                                                            // 593
    } else if (pathPrefix) {                                                             // 594
      response.writeHead(404);                                                           // 595
      response.write("Unknown path");                                                    // 596
      response.end();                                                                    // 597
    } else {                                                                             // 598
      next();                                                                            // 599
    }                                                                                    // 600
  });                                                                                    // 601
                                                                                         // 602
  // Parse the query string into res.query. Used by oauth_server, but it's               // 603
  // generally pretty handy..                                                            // 604
  app.use(connect.query());                                                              // 605
                                                                                         // 606
  // Serve static files from the manifest.                                               // 607
  // This is inspired by the 'static' middleware.                                        // 608
  app.use(function (req, res, next) {                                                    // 609
    Fiber(function () {                                                                  // 610
     WebAppInternals.staticFilesMiddleware(staticFiles, req, res, next);                 // 611
    }).run();                                                                            // 612
  });                                                                                    // 613
                                                                                         // 614
  // Packages and apps can add handlers to this via WebApp.connectHandlers.              // 615
  // They are inserted before our default handler.                                       // 616
  var packageAndAppHandlers = connect();                                                 // 617
  app.use(packageAndAppHandlers);                                                        // 618
                                                                                         // 619
  var suppressConnectErrors = false;                                                     // 620
  // connect knows it is an error handler because it has 4 arguments instead of          // 621
  // 3. go figure.  (It is not smart enough to find such a thing if it's hidden          // 622
  // inside packageAndAppHandlers.)                                                      // 623
  app.use(function (err, req, res, next) {                                               // 624
    if (!err || !suppressConnectErrors || !req.headers['x-suppress-error']) {            // 625
      next(err);                                                                         // 626
      return;                                                                            // 627
    }                                                                                    // 628
    res.writeHead(err.status, { 'Content-Type': 'text/plain' });                         // 629
    res.end("An error message");                                                         // 630
  });                                                                                    // 631
                                                                                         // 632
  app.use(function (req, res, next) {                                                    // 633
    if (! appUrl(req.url))                                                               // 634
      return next();                                                                     // 635
                                                                                         // 636
    var headers = {                                                                      // 637
      'Content-Type':  'text/html; charset=utf-8'                                        // 638
    };                                                                                   // 639
    if (shuttingDown)                                                                    // 640
      headers['Connection'] = 'Close';                                                   // 641
                                                                                         // 642
    var request = WebApp.categorizeRequest(req);                                         // 643
                                                                                         // 644
    if (request.url.query && request.url.query['meteor_css_resource']) {                 // 645
      // In this case, we're requesting a CSS resource in the meteor-specific            // 646
      // way, but we don't have it.  Serve a static css file that indicates that         // 647
      // we didn't have it, so we can detect that and refresh.                           // 648
      headers['Content-Type'] = 'text/css; charset=utf-8';                               // 649
      res.writeHead(200, headers);                                                       // 650
      res.write(".meteor-css-not-found-error { width: 0px;}");                           // 651
      res.end();                                                                         // 652
      return undefined;                                                                  // 653
    }                                                                                    // 654
                                                                                         // 655
    // /packages/asdfsad ... /__cordova/dafsdf.js                                        // 656
    var pathname = connect.utils.parseUrl(req).pathname;                                 // 657
    var archKey = pathname.split('/')[1];                                                // 658
    var archKeyCleaned = 'web.' + archKey.replace(/^__/, '');                            // 659
                                                                                         // 660
    if (! /^__/.test(archKey) || ! _.has(archPath, archKeyCleaned)) {                    // 661
      archKey = WebApp.defaultArch;                                                      // 662
    } else {                                                                             // 663
      archKey = archKeyCleaned;                                                          // 664
    }                                                                                    // 665
                                                                                         // 666
    var boilerplate;                                                                     // 667
    try {                                                                                // 668
      boilerplate = getBoilerplate(request, archKey);                                    // 669
    } catch (e) {                                                                        // 670
      Log.error("Error running template: " + e);                                         // 671
      res.writeHead(500, headers);                                                       // 672
      res.end();                                                                         // 673
      return undefined;                                                                  // 674
    }                                                                                    // 675
                                                                                         // 676
    res.writeHead(200, headers);                                                         // 677
    res.write(boilerplate);                                                              // 678
    res.end();                                                                           // 679
    return undefined;                                                                    // 680
  });                                                                                    // 681
                                                                                         // 682
  // Return 404 by default, if no other handlers serve this URL.                         // 683
  app.use(function (req, res) {                                                          // 684
    res.writeHead(404);                                                                  // 685
    res.end();                                                                           // 686
  });                                                                                    // 687
                                                                                         // 688
                                                                                         // 689
  var httpServer = http.createServer(app);                                               // 690
  var onListeningCallbacks = [];                                                         // 691
                                                                                         // 692
  // After 5 seconds w/o data on a socket, kill it.  On the other hand, if               // 693
  // there's an outstanding request, give it a higher timeout instead (to avoid          // 694
  // killing long-polling requests)                                                      // 695
  httpServer.setTimeout(SHORT_SOCKET_TIMEOUT);                                           // 696
                                                                                         // 697
  // Do this here, and then also in livedata/stream_server.js, because                   // 698
  // stream_server.js kills all the current request handlers when installing its         // 699
  // own.                                                                                // 700
  httpServer.on('request', WebApp._timeoutAdjustmentRequestCallback);                    // 701
                                                                                         // 702
                                                                                         // 703
  // For now, handle SIGHUP here.  Later, this should be in some centralized             // 704
  // Meteor shutdown code.                                                               // 705
  process.on('SIGHUP', Meteor.bindEnvironment(function () {                              // 706
    shuttingDown = true;                                                                 // 707
    // tell others with websockets open that we plan to close this.                      // 708
    // XXX: Eventually, this should be done with a standard meteor shut-down             // 709
    // logic path.                                                                       // 710
    httpServer.emit('meteor-closing');                                                   // 711
                                                                                         // 712
    httpServer.close(Meteor.bindEnvironment(function () {                                // 713
      if (proxy) {                                                                       // 714
        try {                                                                            // 715
          proxy.call('removeBindingsForJob', process.env.GALAXY_JOB);                    // 716
        } catch (e) {                                                                    // 717
          Log.error("Error removing bindings: " + e.message);                            // 718
          process.exit(1);                                                               // 719
        }                                                                                // 720
      }                                                                                  // 721
      process.exit(0);                                                                   // 722
                                                                                         // 723
    }, "On http server close failed"));                                                  // 724
                                                                                         // 725
    // Ideally we will close before this hits.                                           // 726
    Meteor.setTimeout(function () {                                                      // 727
      Log.warn("Closed by SIGHUP but one or more HTTP requests may not have finished."); // 728
      process.exit(1);                                                                   // 729
    }, 5000);                                                                            // 730
                                                                                         // 731
  }, function (err) {                                                                    // 732
    console.log(err);                                                                    // 733
    process.exit(1);                                                                     // 734
  }));                                                                                   // 735
                                                                                         // 736
  // start up app                                                                        // 737
  _.extend(WebApp, {                                                                     // 738
    connectHandlers: packageAndAppHandlers,                                              // 739
    rawConnectHandlers: rawConnectHandlers,                                              // 740
    httpServer: httpServer,                                                              // 741
    // For testing.                                                                      // 742
    suppressConnectErrors: function () {                                                 // 743
      suppressConnectErrors = true;                                                      // 744
    },                                                                                   // 745
    onListening: function (f) {                                                          // 746
      if (onListeningCallbacks)                                                          // 747
        onListeningCallbacks.push(f);                                                    // 748
      else                                                                               // 749
        f();                                                                             // 750
    },                                                                                   // 751
    // Hack: allow http tests to call connect.basicAuth without making them              // 752
    // Npm.depends on another copy of connect. (That would be fine if we could           // 753
    // have test-only NPM dependencies but is overkill here.)                            // 754
    __basicAuth__: connect.basicAuth                                                     // 755
  });                                                                                    // 756
                                                                                         // 757
  // Let the rest of the packages (and Meteor.startup hooks) insert connect              // 758
  // middlewares and update __meteor_runtime_config__, then keep going to set up         // 759
  // actually serving HTML.                                                              // 760
  main = function (argv) {                                                               // 761
    // main happens post startup hooks, so we don't need a Meteor.startup() to           // 762
    // ensure this happens after the galaxy package is loaded.                           // 763
    var AppConfig = Package["application-configuration"].AppConfig;                      // 764
                                                                                         // 765
    WebAppInternals.generateBoilerplate();                                               // 766
                                                                                         // 767
    // only start listening after all the startup code has run.                          // 768
    var localPort = parseInt(process.env.PORT) || 0;                                     // 769
    var host = process.env.BIND_IP;                                                      // 770
    var localIp = host || '0.0.0.0';                                                     // 771
    httpServer.listen(localPort, localIp, Meteor.bindEnvironment(function() {            // 772
      if (process.env.METEOR_PRINT_ON_LISTEN)                                            // 773
        console.log("LISTENING"); // must match run-app.js                               // 774
      var proxyBinding;                                                                  // 775
                                                                                         // 776
      AppConfig.configurePackage('webapp', function (configuration) {                    // 777
        if (proxyBinding)                                                                // 778
          proxyBinding.stop();                                                           // 779
        if (configuration && configuration.proxy) {                                      // 780
          // TODO: We got rid of the place where this checks the app's                   // 781
          // configuration, because this wants to be configured for some things          // 782
          // on a per-job basis.  Discuss w/ teammates.                                  // 783
          proxyBinding = AppConfig.configureService(                                     // 784
            "proxy",                                                                     // 785
            "pre0",                                                                      // 786
            function (proxyService) {                                                    // 787
              if (proxyService && ! _.isEmpty(proxyService)) {                           // 788
                var proxyConf;                                                           // 789
                // XXX Figure out a per-job way to specify bind location                 // 790
                // (besides hardcoding the location for ADMIN_APP jobs).                 // 791
                if (process.env.ADMIN_APP) {                                             // 792
                  var bindPathPrefix = "";                                               // 793
                  if (process.env.GALAXY_APP !== "panel") {                              // 794
                    bindPathPrefix = "/" + bindPathPrefix +                              // 795
                      encodeURIComponent(                                                // 796
                        process.env.GALAXY_APP                                           // 797
                      ).replace(/\./g, '_');                                             // 798
                  }                                                                      // 799
                  proxyConf = {                                                          // 800
                    bindHost: process.env.GALAXY_NAME,                                   // 801
                    bindPathPrefix: bindPathPrefix,                                      // 802
                    requiresAuth: true                                                   // 803
                  };                                                                     // 804
                } else {                                                                 // 805
                  proxyConf = configuration.proxy;                                       // 806
                }                                                                        // 807
                Log("Attempting to bind to proxy at " +                                  // 808
                    proxyService);                                                       // 809
                WebAppInternals.bindToProxy(_.extend({                                   // 810
                  proxyEndpoint: proxyService                                            // 811
                }, proxyConf));                                                          // 812
              }                                                                          // 813
            }                                                                            // 814
          );                                                                             // 815
        }                                                                                // 816
      });                                                                                // 817
                                                                                         // 818
      var callbacks = onListeningCallbacks;                                              // 819
      onListeningCallbacks = null;                                                       // 820
      _.each(callbacks, function (x) { x(); });                                          // 821
                                                                                         // 822
    }, function (e) {                                                                    // 823
      console.error("Error listening:", e);                                              // 824
      console.error(e && e.stack);                                                       // 825
    }));                                                                                 // 826
                                                                                         // 827
    return 'DAEMON';                                                                     // 828
  };                                                                                     // 829
};                                                                                       // 830
                                                                                         // 831
                                                                                         // 832
var proxy;                                                                               // 833
WebAppInternals.bindToProxy = function (proxyConfig) {                                   // 834
  var securePort = proxyConfig.securePort || 4433;                                       // 835
  var insecurePort = proxyConfig.insecurePort || 8080;                                   // 836
  var bindPathPrefix = proxyConfig.bindPathPrefix || "";                                 // 837
  // XXX also support galaxy-based lookup                                                // 838
  if (!proxyConfig.proxyEndpoint)                                                        // 839
    throw new Error("missing proxyEndpoint");                                            // 840
  if (!proxyConfig.bindHost)                                                             // 841
    throw new Error("missing bindHost");                                                 // 842
  if (!process.env.GALAXY_JOB)                                                           // 843
    throw new Error("missing $GALAXY_JOB");                                              // 844
  if (!process.env.GALAXY_APP)                                                           // 845
    throw new Error("missing $GALAXY_APP");                                              // 846
  if (!process.env.LAST_START)                                                           // 847
    throw new Error("missing $LAST_START");                                              // 848
                                                                                         // 849
  // XXX rename pid argument to bindTo.                                                  // 850
  // XXX factor out into a 'getPid' function in a 'galaxy' package?                      // 851
  var pid = {                                                                            // 852
    job: process.env.GALAXY_JOB,                                                         // 853
    lastStarted: +(process.env.LAST_START),                                              // 854
    app: process.env.GALAXY_APP                                                          // 855
  };                                                                                     // 856
  var myHost = os.hostname();                                                            // 857
                                                                                         // 858
  WebAppInternals.usingDdpProxy = true;                                                  // 859
                                                                                         // 860
  // This is run after packages are loaded (in main) so we can use                       // 861
  // Follower.connect.                                                                   // 862
  if (proxy) {                                                                           // 863
    // XXX the concept here is that our configuration has changed and                    // 864
    // we have connected to an entirely new follower set, which does                     // 865
    // not have the state that we set up on the follower set that we                     // 866
    // were previously connected to, and so we need to recreate all of                   // 867
    // our bindings -- analogous to getting a SIGHUP and rereading                       // 868
    // your configuration file. so probably this should actually tear                    // 869
    // down the connection and make a whole new one, rather than                         // 870
    // hot-reconnecting to a different URL.                                              // 871
    proxy.reconnect({                                                                    // 872
      url: proxyConfig.proxyEndpoint                                                     // 873
    });                                                                                  // 874
  } else {                                                                               // 875
    proxy = Package["follower-livedata"].Follower.connect(                               // 876
      proxyConfig.proxyEndpoint, {                                                       // 877
        group: "proxy"                                                                   // 878
      }                                                                                  // 879
    );                                                                                   // 880
  }                                                                                      // 881
                                                                                         // 882
  var route = process.env.ROUTE;                                                         // 883
  var ourHost = route.split(":")[0];                                                     // 884
  var ourPort = +route.split(":")[1];                                                    // 885
                                                                                         // 886
  var outstanding = 0;                                                                   // 887
  var startedAll = false;                                                                // 888
  var checkComplete = function () {                                                      // 889
    if (startedAll && ! outstanding)                                                     // 890
      Log("Bound to proxy.");                                                            // 891
  };                                                                                     // 892
  var makeCallback = function () {                                                       // 893
    outstanding++;                                                                       // 894
    return function (err) {                                                              // 895
      if (err)                                                                           // 896
        throw err;                                                                       // 897
      outstanding--;                                                                     // 898
      checkComplete();                                                                   // 899
    };                                                                                   // 900
  };                                                                                     // 901
                                                                                         // 902
  // for now, have our (temporary) requiresAuth flag apply to all                        // 903
  // routes created by this process.                                                     // 904
  var requiresDdpAuth = !! proxyConfig.requiresAuth;                                     // 905
  var requiresHttpAuth = (!! proxyConfig.requiresAuth) &&                                // 906
        (pid.app !== "panel" && pid.app !== "auth");                                     // 907
                                                                                         // 908
  // XXX a current limitation is that we treat securePort and                            // 909
  // insecurePort as a global configuration parameter -- we assume                       // 910
  // that if the proxy wants us to ask for 8080 to get port 80 traffic                   // 911
  // on our default hostname, that's the same port that we would use                     // 912
  // to get traffic on some other hostname that our proxy listens                        // 913
  // for. Likewise, we assume that if the proxy can receive secure                       // 914
  // traffic for our domain, it can assume secure traffic for any                        // 915
  // domain! Hopefully this will get cleaned up before too long by                       // 916
  // pushing that logic into the proxy service, so we can just ask for                   // 917
  // port 80.                                                                            // 918
                                                                                         // 919
  // XXX BUG: if our configuration changes, and bindPathPrefix                           // 920
  // changes, it appears that we will not remove the routes derived                      // 921
  // from the old bindPathPrefix from the proxy (until the process                       // 922
  // exits). It is not actually normal for bindPathPrefix to change,                     // 923
  // certainly not without a process restart for other reasons, but                      // 924
  // it'd be nice to fix.                                                                // 925
                                                                                         // 926
  _.each(routes, function (route) {                                                      // 927
    var parsedUrl = url.parse(route.url, /* parseQueryString */ false,                   // 928
                              /* slashesDenoteHost aka workRight */ true);               // 929
    if (parsedUrl.protocol || parsedUrl.port || parsedUrl.search)                        // 930
      throw new Error("Bad url");                                                        // 931
    parsedUrl.host = null;                                                               // 932
    parsedUrl.path = null;                                                               // 933
    if (! parsedUrl.hostname) {                                                          // 934
      parsedUrl.hostname = proxyConfig.bindHost;                                         // 935
      if (! parsedUrl.pathname)                                                          // 936
        parsedUrl.pathname = "";                                                         // 937
      if (! parsedUrl.pathname.indexOf("/") !== 0) {                                     // 938
        // Relative path                                                                 // 939
        parsedUrl.pathname = bindPathPrefix + parsedUrl.pathname;                        // 940
      }                                                                                  // 941
    }                                                                                    // 942
    var version = "";                                                                    // 943
                                                                                         // 944
    var AppConfig = Package["application-configuration"].AppConfig;                      // 945
    version = AppConfig.getStarForThisJob() || "";                                       // 946
                                                                                         // 947
                                                                                         // 948
    var parsedDdpUrl = _.clone(parsedUrl);                                               // 949
    parsedDdpUrl.protocol = "ddp";                                                       // 950
    // Node has a hardcoded list of protocols that get '://' instead                     // 951
    // of ':'. ddp needs to be added to that whitelist. Until then, we                   // 952
    // can set the undocumented attribute 'slashes' to get the right                     // 953
    // behavior. It's not clear whether than is by design or accident.                   // 954
    parsedDdpUrl.slashes = true;                                                         // 955
    parsedDdpUrl.port = '' + securePort;                                                 // 956
    var ddpUrl = url.format(parsedDdpUrl);                                               // 957
                                                                                         // 958
    var proxyToHost, proxyToPort, proxyToPathPrefix;                                     // 959
    if (! _.has(route, 'forwardTo')) {                                                   // 960
      proxyToHost = ourHost;                                                             // 961
      proxyToPort = ourPort;                                                             // 962
      proxyToPathPrefix = parsedUrl.pathname;                                            // 963
    } else {                                                                             // 964
      var parsedFwdUrl = url.parse(route.forwardTo, false, true);                        // 965
      if (! parsedFwdUrl.hostname || parsedFwdUrl.protocol)                              // 966
        throw new Error("Bad forward url");                                              // 967
      proxyToHost = parsedFwdUrl.hostname;                                               // 968
      proxyToPort = parseInt(parsedFwdUrl.port || "80");                                 // 969
      proxyToPathPrefix = parsedFwdUrl.pathname || "";                                   // 970
    }                                                                                    // 971
                                                                                         // 972
    if (route.ddp) {                                                                     // 973
      proxy.call('bindDdp', {                                                            // 974
        pid: pid,                                                                        // 975
        bindTo: {                                                                        // 976
          ddpUrl: ddpUrl,                                                                // 977
          insecurePort: insecurePort                                                     // 978
        },                                                                               // 979
        proxyTo: {                                                                       // 980
          tags: [version],                                                               // 981
          host: proxyToHost,                                                             // 982
          port: proxyToPort,                                                             // 983
          pathPrefix: proxyToPathPrefix + '/websocket'                                   // 984
        },                                                                               // 985
        requiresAuth: requiresDdpAuth                                                    // 986
      }, makeCallback());                                                                // 987
    }                                                                                    // 988
                                                                                         // 989
    if (route.http) {                                                                    // 990
      proxy.call('bindHttp', {                                                           // 991
        pid: pid,                                                                        // 992
        bindTo: {                                                                        // 993
          host: parsedUrl.hostname,                                                      // 994
          port: insecurePort,                                                            // 995
          pathPrefix: parsedUrl.pathname                                                 // 996
        },                                                                               // 997
        proxyTo: {                                                                       // 998
          tags: [version],                                                               // 999
          host: proxyToHost,                                                             // 1000
          port: proxyToPort,                                                             // 1001
          pathPrefix: proxyToPathPrefix                                                  // 1002
        },                                                                               // 1003
        requiresAuth: requiresHttpAuth                                                   // 1004
      }, makeCallback());                                                                // 1005
                                                                                         // 1006
      // Only make the secure binding if we've been told that the                        // 1007
      // proxy knows how terminate secure connections for us (has an                     // 1008
      // appropriate cert, can bind the necessary port..)                                // 1009
      if (proxyConfig.securePort !== null) {                                             // 1010
        proxy.call('bindHttp', {                                                         // 1011
          pid: pid,                                                                      // 1012
          bindTo: {                                                                      // 1013
            host: parsedUrl.hostname,                                                    // 1014
            port: securePort,                                                            // 1015
            pathPrefix: parsedUrl.pathname,                                              // 1016
            ssl: true                                                                    // 1017
          },                                                                             // 1018
          proxyTo: {                                                                     // 1019
            tags: [version],                                                             // 1020
            host: proxyToHost,                                                           // 1021
            port: proxyToPort,                                                           // 1022
            pathPrefix: proxyToPathPrefix                                                // 1023
          },                                                                             // 1024
          requiresAuth: requiresHttpAuth                                                 // 1025
        }, makeCallback());                                                              // 1026
      }                                                                                  // 1027
    }                                                                                    // 1028
  });                                                                                    // 1029
                                                                                         // 1030
  startedAll = true;                                                                     // 1031
  checkComplete();                                                                       // 1032
};                                                                                       // 1033
                                                                                         // 1034
// (Internal, unsupported interface -- subject to change)                                // 1035
//                                                                                       // 1036
// Listen for HTTP and/or DDP traffic and route it somewhere. Only                       // 1037
// takes effect when using a proxy service.                                              // 1038
//                                                                                       // 1039
// 'url' is the traffic that we want to route, interpreted relative to                   // 1040
// the default URL where this app has been told to serve itself. It                      // 1041
// may not have a scheme or port, but it may have a host and a path,                     // 1042
// and if no host is provided the path need not be absolute. The                         // 1043
// following cases are possible:                                                         // 1044
//                                                                                       // 1045
//   //somehost.com                                                                      // 1046
//     All incoming traffic for 'somehost.com'                                           // 1047
//   //somehost.com/foo/bar                                                              // 1048
//     All incoming traffic for 'somehost.com', but only when                            // 1049
//     the first two path components are 'foo' and 'bar'.                                // 1050
//   /foo/bar                                                                            // 1051
//     Incoming traffic on our default host, but only when the                           // 1052
//     first two path components are 'foo' and 'bar'.                                    // 1053
//   foo/bar                                                                             // 1054
//     Incoming traffic on our default host, but only when the path                      // 1055
//     starts with our default path prefix, followed by 'foo' and                        // 1056
//     'bar'.                                                                            // 1057
//                                                                                       // 1058
// (Yes, these scheme-less URLs that start with '//' are legal URLs.)                    // 1059
//                                                                                       // 1060
// You can select either DDP traffic, HTTP traffic, or both. Both                        // 1061
// secure and insecure traffic will be gathered (assuming the proxy                      // 1062
// service is capable, eg, has appropriate certs and port mappings).                     // 1063
//                                                                                       // 1064
// With no 'forwardTo' option, the traffic is received by this process                   // 1065
// for service by the hooks in this 'webapp' package. The original URL                   // 1066
// is preserved (that is, if you bind "/a", and a user visits "/a/b",                    // 1067
// the app receives a request with a path of "/a/b", not a path of                       // 1068
// "/b").                                                                                // 1069
//                                                                                       // 1070
// With 'forwardTo', the process is instead sent to some other remote                    // 1071
// host. The URL is adjusted by stripping the path components in 'url'                   // 1072
// and putting the path components in the 'forwardTo' URL in their                       // 1073
// place. For example, if you forward "//somehost/a" to                                  // 1074
// "//otherhost/x", and the user types "//somehost/a/b" into their                       // 1075
// browser, then otherhost will receive a request with a Host header                     // 1076
// of "somehost" and a path of "/x/b".                                                   // 1077
//                                                                                       // 1078
// The routing continues until this process exits. For now, all of the                   // 1079
// routes must be set up ahead of time, before the initial                               // 1080
// registration with the proxy. Calling addRoute from the top level of                   // 1081
// your JS should do the trick.                                                          // 1082
//                                                                                       // 1083
// When multiple routes are present that match a given request, the                      // 1084
// most specific route wins. When routes with equal specificity are                      // 1085
// present, the proxy service will distribute the traffic between                        // 1086
// them.                                                                                 // 1087
//                                                                                       // 1088
// options may be:                                                                       // 1089
// - ddp: if true, the default, include DDP traffic. This includes                       // 1090
//   both secure and insecure traffic, and both websocket and sockjs                     // 1091
//   transports.                                                                         // 1092
// - http: if true, the default, include HTTP/HTTPS traffic.                             // 1093
// - forwardTo: if provided, should be a URL with a host, optional                       // 1094
//   path and port, and no scheme (the scheme will be derived from the                   // 1095
//   traffic type; for now it will always be a http or ws connection,                    // 1096
//   never https or wss, but we could add a forwardSecure flag to                        // 1097
//   re-encrypt).                                                                        // 1098
var routes = [];                                                                         // 1099
WebAppInternals.addRoute = function (url, options) {                                     // 1100
  options = _.extend({                                                                   // 1101
    ddp: true,                                                                           // 1102
    http: true                                                                           // 1103
  }, options || {});                                                                     // 1104
                                                                                         // 1105
  if (proxy)                                                                             // 1106
    // In the future, lift this restriction                                              // 1107
    throw new Error("Too late to add routes");                                           // 1108
                                                                                         // 1109
  routes.push(_.extend({ url: url }, options));                                          // 1110
};                                                                                       // 1111
                                                                                         // 1112
// Receive traffic on our default URL.                                                   // 1113
WebAppInternals.addRoute("");                                                            // 1114
                                                                                         // 1115
runWebAppServer();                                                                       // 1116
                                                                                         // 1117
                                                                                         // 1118
var inlineScriptsAllowed = true;                                                         // 1119
                                                                                         // 1120
WebAppInternals.inlineScriptsAllowed = function () {                                     // 1121
  return inlineScriptsAllowed;                                                           // 1122
};                                                                                       // 1123
                                                                                         // 1124
WebAppInternals.setInlineScriptsAllowed = function (value) {                             // 1125
  inlineScriptsAllowed = value;                                                          // 1126
  WebAppInternals.generateBoilerplate();                                                 // 1127
};                                                                                       // 1128
                                                                                         // 1129
WebAppInternals.setBundledJsCssPrefix = function (prefix) {                              // 1130
  bundledJsCssPrefix = prefix;                                                           // 1131
  WebAppInternals.generateBoilerplate();                                                 // 1132
};                                                                                       // 1133
                                                                                         // 1134
// Packages can call `WebAppInternals.addStaticJs` to specify static                     // 1135
// JavaScript to be included in the app. This static JS will be inlined,                 // 1136
// unless inline scripts have been disabled, in which case it will be                    // 1137
// served under `/<sha1 of contents>`.                                                   // 1138
var additionalStaticJs = {};                                                             // 1139
WebAppInternals.addStaticJs = function (contents) {                                      // 1140
  additionalStaticJs["/" + sha1(contents) + ".js"] = contents;                           // 1141
};                                                                                       // 1142
                                                                                         // 1143
// Exported for tests                                                                    // 1144
WebAppInternals.getBoilerplate = getBoilerplate;                                         // 1145
WebAppInternals.additionalStaticJs = additionalStaticJs;                                 // 1146
                                                                                         // 1147
///////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.webapp = {
  WebApp: WebApp,
  main: main,
  WebAppInternals: WebAppInternals
};

})();

//# sourceMappingURL=webapp.js.map
