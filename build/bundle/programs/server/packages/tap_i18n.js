(function () {

/* Imports */
var _ = Package.underscore._;
var Meteor = Package.meteor.Meteor;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var HTTP = Package['cfs:http-methods'].HTTP;

/* Package-scope variables */
var TAPi18next, TAPi18n, globals, __coffeescriptShare;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tap:i18n/lib/globals.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// The globals object will be accessible to the build plugin, the server and                                           // 1
// the client                                                                                                          // 2
                                                                                                                       // 3
globals = {                                                                                                            // 4
  fallback_language: "en",                                                                                             // 5
  langauges_tags_regex: "([a-z]{2})(-[A-Z]{2})?",                                                                      // 6
  project_translations_domain: "project",                                                                              // 7
  browser_path: "/tap-i18n",                                                                                           // 8
  debug: false                                                                                                         // 9
};                                                                                                                     // 10
                                                                                                                       // 11
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tap:i18n/lib/tap_i18next/tap_i18next-1.7.3.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// tap_i18next is a copy of i18next that expose i18next to the global namespace                                        // 1
// under the name name TAPi18next instead of i18n to (1) avoid interfering with other                                  // 2
// Meteor packages that might use i18n with different configurations than we do                                        // 3
// or worse - (2) using a different version of i18next                                                                 // 4
//                                                                                                                     // 5
// setJqueryExt is disabled by default in TAPi18next                                                                   // 6
// sprintf is a default postProcess in TAPi18next                                                                      // 7
//                                                                                                                     // 8
// TAPi18next is set outside of the singleton builder to make it available in the                                      // 9
// package level                                                                                                       // 10
                                                                                                                       // 11
// i18next, v1.7.3                                                                                                     // 12
// Copyright (c)2014 Jan Mühlemann (jamuhl).                                                                           // 13
// Distributed under MIT license                                                                                       // 14
// http://i18next.com                                                                                                  // 15
                                                                                                                       // 16
// set TAPi18next outseid of the singleton builder to make it available in the package level                           // 17
TAPi18next = {};                                                                                                       // 18
(function() {                                                                                                          // 19
                                                                                                                       // 20
    // add indexOf to non ECMA-262 standard compliant browsers                                                         // 21
    if (!Array.prototype.indexOf) {                                                                                    // 22
        Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {                                         // 23
            "use strict";                                                                                              // 24
            if (this == null) {                                                                                        // 25
                throw new TypeError();                                                                                 // 26
            }                                                                                                          // 27
            var t = Object(this);                                                                                      // 28
            var len = t.length >>> 0;                                                                                  // 29
            if (len === 0) {                                                                                           // 30
                return -1;                                                                                             // 31
            }                                                                                                          // 32
            var n = 0;                                                                                                 // 33
            if (arguments.length > 0) {                                                                                // 34
                n = Number(arguments[1]);                                                                              // 35
                if (n != n) { // shortcut for verifying if it's NaN                                                    // 36
                    n = 0;                                                                                             // 37
                } else if (n != 0 && n != Infinity && n != -Infinity) {                                                // 38
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));                                                       // 39
                }                                                                                                      // 40
            }                                                                                                          // 41
            if (n >= len) {                                                                                            // 42
                return -1;                                                                                             // 43
            }                                                                                                          // 44
            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);                                                       // 45
            for (; k < len; k++) {                                                                                     // 46
                if (k in t && t[k] === searchElement) {                                                                // 47
                    return k;                                                                                          // 48
                }                                                                                                      // 49
            }                                                                                                          // 50
            return -1;                                                                                                 // 51
        }                                                                                                              // 52
    }                                                                                                                  // 53
                                                                                                                       // 54
    // add lastIndexOf to non ECMA-262 standard compliant browsers                                                     // 55
    if (!Array.prototype.lastIndexOf) {                                                                                // 56
        Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/) {                                        // 57
            "use strict";                                                                                              // 58
            if (this == null) {                                                                                        // 59
                throw new TypeError();                                                                                 // 60
            }                                                                                                          // 61
            var t = Object(this);                                                                                      // 62
            var len = t.length >>> 0;                                                                                  // 63
            if (len === 0) {                                                                                           // 64
                return -1;                                                                                             // 65
            }                                                                                                          // 66
            var n = len;                                                                                               // 67
            if (arguments.length > 1) {                                                                                // 68
                n = Number(arguments[1]);                                                                              // 69
                if (n != n) {                                                                                          // 70
                    n = 0;                                                                                             // 71
                } else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {                                                  // 72
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));                                                       // 73
                }                                                                                                      // 74
            }                                                                                                          // 75
            var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);                                                 // 76
            for (; k >= 0; k--) {                                                                                      // 77
                if (k in t && t[k] === searchElement) {                                                                // 78
                    return k;                                                                                          // 79
                }                                                                                                      // 80
            }                                                                                                          // 81
            return -1;                                                                                                 // 82
        };                                                                                                             // 83
    }                                                                                                                  // 84
                                                                                                                       // 85
    // Add string trim for IE8.                                                                                        // 86
    if (typeof String.prototype.trim !== 'function') {                                                                 // 87
        String.prototype.trim = function() {                                                                           // 88
            return this.replace(/^\s+|\s+$/g, '');                                                                     // 89
        }                                                                                                              // 90
    }                                                                                                                  // 91
                                                                                                                       // 92
    var root = this                                                                                                    // 93
      , $ = root.jQuery || root.Zepto                                                                                  // 94
      , resStore = {}                                                                                                  // 95
      , currentLng                                                                                                     // 96
      , replacementCounter = 0                                                                                         // 97
      , languages = []                                                                                                 // 98
      , initialized = false;                                                                                           // 99
                                                                                                                       // 100
                                                                                                                       // 101
    // Export the i18next object for **CommonJS**.                                                                     // 102
    // If we're not in CommonJS, add `i18n` to the                                                                     // 103
    // global object or to jquery.                                                                                     // 104
    if (typeof module !== 'undefined' && module.exports) {                                                             // 105
        module.exports = TAPi18next;                                                                                   // 106
    } else {                                                                                                           // 107
        if ($) {                                                                                                       // 108
            $.TAPi18next = $.TAPi18next || TAPi18next;                                                                 // 109
        }                                                                                                              // 110
                                                                                                                       // 111
        root.TAPi18next = root.TAPi18next || TAPi18next;                                                               // 112
    }                                                                                                                  // 113
    // defaults                                                                                                        // 114
    var o = {                                                                                                          // 115
        lng: undefined,                                                                                                // 116
        load: 'all',                                                                                                   // 117
        preload: [],                                                                                                   // 118
        lowerCaseLng: false,                                                                                           // 119
        returnObjectTrees: false,                                                                                      // 120
        fallbackLng: ['dev'],                                                                                          // 121
        fallbackNS: [],                                                                                                // 122
        detectLngQS: 'setLng',                                                                                         // 123
        ns: 'translation',                                                                                             // 124
        fallbackOnNull: true,                                                                                          // 125
        fallbackOnEmpty: false,                                                                                        // 126
        fallbackToDefaultNS: false,                                                                                    // 127
        nsseparator: ':',                                                                                              // 128
        keyseparator: '.',                                                                                             // 129
        selectorAttr: 'data-i18n',                                                                                     // 130
        debug: false,                                                                                                  // 131
                                                                                                                       // 132
        resGetPath: 'locales/__lng__/__ns__.json',                                                                     // 133
        resPostPath: 'locales/add/__lng__/__ns__',                                                                     // 134
                                                                                                                       // 135
        getAsync: true,                                                                                                // 136
        postAsync: true,                                                                                               // 137
                                                                                                                       // 138
        resStore: undefined,                                                                                           // 139
        useLocalStorage: false,                                                                                        // 140
        localStorageExpirationTime: 7*24*60*60*1000,                                                                   // 141
                                                                                                                       // 142
        dynamicLoad: false,                                                                                            // 143
        sendMissing: false,                                                                                            // 144
        sendMissingTo: 'fallback', // current | all                                                                    // 145
        sendType: 'POST',                                                                                              // 146
                                                                                                                       // 147
        interpolationPrefix: '__',                                                                                     // 148
        interpolationSuffix: '__',                                                                                     // 149
        reusePrefix: '$t(',                                                                                            // 150
        reuseSuffix: ')',                                                                                              // 151
        pluralSuffix: '_plural',                                                                                       // 152
        pluralNotFound: ['plural_not_found', Math.random()].join(''),                                                  // 153
        contextNotFound: ['context_not_found', Math.random()].join(''),                                                // 154
        escapeInterpolation: false,                                                                                    // 155
                                                                                                                       // 156
        setJqueryExt: false,                                                                                           // 157
        defaultValueFromContent: true,                                                                                 // 158
        useDataAttrOptions: false,                                                                                     // 159
        cookieExpirationTime: undefined,                                                                               // 160
        useCookie: true,                                                                                               // 161
        cookieName: 'TAPi18next',                                                                                      // 162
        cookieDomain: undefined,                                                                                       // 163
                                                                                                                       // 164
        objectTreeKeyHandler: undefined,                                                                               // 165
        postProcess: ["sprintf"],                                                                                      // 166
        parseMissingKey: undefined,                                                                                    // 167
                                                                                                                       // 168
        shortcutFunction: 'sprintf' // or: defaultValue                                                                // 169
    };                                                                                                                 // 170
    function _extend(target, source) {                                                                                 // 171
        if (!source || typeof source === 'function') {                                                                 // 172
            return target;                                                                                             // 173
        }                                                                                                              // 174
                                                                                                                       // 175
        for (var attr in source) { target[attr] = source[attr]; }                                                      // 176
        return target;                                                                                                 // 177
    }                                                                                                                  // 178
                                                                                                                       // 179
    function _each(object, callback, args) {                                                                           // 180
        var name, i = 0,                                                                                               // 181
            length = object.length,                                                                                    // 182
            isObj = length === undefined || Object.prototype.toString.apply(object) !== '[object Array]' || typeof object === "function";
                                                                                                                       // 184
        if (args) {                                                                                                    // 185
            if (isObj) {                                                                                               // 186
                for (name in object) {                                                                                 // 187
                    if (callback.apply(object[name], args) === false) {                                                // 188
                        break;                                                                                         // 189
                    }                                                                                                  // 190
                }                                                                                                      // 191
            } else {                                                                                                   // 192
                for ( ; i < length; ) {                                                                                // 193
                    if (callback.apply(object[i++], args) === false) {                                                 // 194
                        break;                                                                                         // 195
                    }                                                                                                  // 196
                }                                                                                                      // 197
            }                                                                                                          // 198
                                                                                                                       // 199
        // A special, fast, case for the most common use of each                                                       // 200
        } else {                                                                                                       // 201
            if (isObj) {                                                                                               // 202
                for (name in object) {                                                                                 // 203
                    if (callback.call(object[name], name, object[name]) === false) {                                   // 204
                        break;                                                                                         // 205
                    }                                                                                                  // 206
                }                                                                                                      // 207
            } else {                                                                                                   // 208
                for ( ; i < length; ) {                                                                                // 209
                    if (callback.call(object[i], i, object[i++]) === false) {                                          // 210
                        break;                                                                                         // 211
                    }                                                                                                  // 212
                }                                                                                                      // 213
            }                                                                                                          // 214
        }                                                                                                              // 215
                                                                                                                       // 216
        return object;                                                                                                 // 217
    }                                                                                                                  // 218
                                                                                                                       // 219
    var _entityMap = {                                                                                                 // 220
        "&": "&amp;",                                                                                                  // 221
        "<": "&lt;",                                                                                                   // 222
        ">": "&gt;",                                                                                                   // 223
        '"': '&quot;',                                                                                                 // 224
        "'": '&#39;',                                                                                                  // 225
        "/": '&#x2F;'                                                                                                  // 226
    };                                                                                                                 // 227
                                                                                                                       // 228
    function _escape(data) {                                                                                           // 229
        if (typeof data === 'string') {                                                                                // 230
            return data.replace(/[&<>"'\/]/g, function (s) {                                                           // 231
                return _entityMap[s];                                                                                  // 232
            });                                                                                                        // 233
        }else{                                                                                                         // 234
            return data;                                                                                               // 235
        }                                                                                                              // 236
    }                                                                                                                  // 237
                                                                                                                       // 238
    function _ajax(options) {                                                                                          // 239
                                                                                                                       // 240
        // v0.5.0 of https://github.com/goloroden/http.js                                                              // 241
        var getXhr = function (callback) {                                                                             // 242
            // Use the native XHR object if the browser supports it.                                                   // 243
            if (window.XMLHttpRequest) {                                                                               // 244
                return callback(null, new XMLHttpRequest());                                                           // 245
            } else if (window.ActiveXObject) {                                                                         // 246
                // In Internet Explorer check for ActiveX versions of the XHR object.                                  // 247
                try {                                                                                                  // 248
                    return callback(null, new ActiveXObject("Msxml2.XMLHTTP"));                                        // 249
                } catch (e) {                                                                                          // 250
                    return callback(null, new ActiveXObject("Microsoft.XMLHTTP"));                                     // 251
                }                                                                                                      // 252
            }                                                                                                          // 253
                                                                                                                       // 254
            // If no XHR support was found, throw an error.                                                            // 255
            return callback(new Error());                                                                              // 256
        };                                                                                                             // 257
                                                                                                                       // 258
        var encodeUsingUrlEncoding = function (data) {                                                                 // 259
            if(typeof data === 'string') {                                                                             // 260
                return data;                                                                                           // 261
            }                                                                                                          // 262
                                                                                                                       // 263
            var result = [];                                                                                           // 264
            for(var dataItem in data) {                                                                                // 265
                if(data.hasOwnProperty(dataItem)) {                                                                    // 266
                    result.push(encodeURIComponent(dataItem) + '=' + encodeURIComponent(data[dataItem]));              // 267
                }                                                                                                      // 268
            }                                                                                                          // 269
                                                                                                                       // 270
            return result.join('&');                                                                                   // 271
        };                                                                                                             // 272
                                                                                                                       // 273
        var utf8 = function (text) {                                                                                   // 274
            text = text.replace(/\r\n/g, '\n');                                                                        // 275
            var result = '';                                                                                           // 276
                                                                                                                       // 277
            for(var i = 0; i < text.length; i++) {                                                                     // 278
                var c = text.charCodeAt(i);                                                                            // 279
                                                                                                                       // 280
                if(c < 128) {                                                                                          // 281
                        result += String.fromCharCode(c);                                                              // 282
                } else if((c > 127) && (c < 2048)) {                                                                   // 283
                        result += String.fromCharCode((c >> 6) | 192);                                                 // 284
                        result += String.fromCharCode((c & 63) | 128);                                                 // 285
                } else {                                                                                               // 286
                        result += String.fromCharCode((c >> 12) | 224);                                                // 287
                        result += String.fromCharCode(((c >> 6) & 63) | 128);                                          // 288
                        result += String.fromCharCode((c & 63) | 128);                                                 // 289
                }                                                                                                      // 290
            }                                                                                                          // 291
                                                                                                                       // 292
            return result;                                                                                             // 293
        };                                                                                                             // 294
                                                                                                                       // 295
        var base64 = function (text) {                                                                                 // 296
            var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';                          // 297
                                                                                                                       // 298
            text = utf8(text);                                                                                         // 299
            var result = '',                                                                                           // 300
                    chr1, chr2, chr3,                                                                                  // 301
                    enc1, enc2, enc3, enc4,                                                                            // 302
                    i = 0;                                                                                             // 303
                                                                                                                       // 304
            do {                                                                                                       // 305
                chr1 = text.charCodeAt(i++);                                                                           // 306
                chr2 = text.charCodeAt(i++);                                                                           // 307
                chr3 = text.charCodeAt(i++);                                                                           // 308
                                                                                                                       // 309
                enc1 = chr1 >> 2;                                                                                      // 310
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);                                                                // 311
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);                                                               // 312
                enc4 = chr3 & 63;                                                                                      // 313
                                                                                                                       // 314
                if(isNaN(chr2)) {                                                                                      // 315
                    enc3 = enc4 = 64;                                                                                  // 316
                } else if(isNaN(chr3)) {                                                                               // 317
                    enc4 = 64;                                                                                         // 318
                }                                                                                                      // 319
                                                                                                                       // 320
                result +=                                                                                              // 321
                    keyStr.charAt(enc1) +                                                                              // 322
                    keyStr.charAt(enc2) +                                                                              // 323
                    keyStr.charAt(enc3) +                                                                              // 324
                    keyStr.charAt(enc4);                                                                               // 325
                chr1 = chr2 = chr3 = '';                                                                               // 326
                enc1 = enc2 = enc3 = enc4 = '';                                                                        // 327
            } while(i < text.length);                                                                                  // 328
                                                                                                                       // 329
            return result;                                                                                             // 330
        };                                                                                                             // 331
                                                                                                                       // 332
        var mergeHeaders = function () {                                                                               // 333
            // Use the first header object as base.                                                                    // 334
            var result = arguments[0];                                                                                 // 335
                                                                                                                       // 336
            // Iterate through the remaining header objects and add them.                                              // 337
            for(var i = 1; i < arguments.length; i++) {                                                                // 338
                var currentHeaders = arguments[i];                                                                     // 339
                for(var header in currentHeaders) {                                                                    // 340
                    if(currentHeaders.hasOwnProperty(header)) {                                                        // 341
                        result[header] = currentHeaders[header];                                                       // 342
                    }                                                                                                  // 343
                }                                                                                                      // 344
            }                                                                                                          // 345
                                                                                                                       // 346
            // Return the merged headers.                                                                              // 347
            return result;                                                                                             // 348
        };                                                                                                             // 349
                                                                                                                       // 350
        var ajax = function (method, url, options, callback) {                                                         // 351
            // Adjust parameters.                                                                                      // 352
            if(typeof options === 'function') {                                                                        // 353
                callback = options;                                                                                    // 354
                options = {};                                                                                          // 355
            }                                                                                                          // 356
                                                                                                                       // 357
            // Set default parameter values.                                                                           // 358
            options.cache = options.cache || false;                                                                    // 359
            options.data = options.data || {};                                                                         // 360
            options.headers = options.headers || {};                                                                   // 361
            options.jsonp = options.jsonp || false;                                                                    // 362
            options.async = options.async === undefined ? true : options.async;                                        // 363
                                                                                                                       // 364
            // Merge the various header objects.                                                                       // 365
            var headers = mergeHeaders({                                                                               // 366
                'accept': '*/*',                                                                                       // 367
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'                                      // 368
            }, ajax.headers, options.headers);                                                                         // 369
                                                                                                                       // 370
            // Encode the data according to the content-type.                                                          // 371
            var payload;                                                                                               // 372
            if (headers['content-type'] === 'application/json') {                                                      // 373
                payload = JSON.stringify(options.data);                                                                // 374
            } else {                                                                                                   // 375
                payload = encodeUsingUrlEncoding(options.data);                                                        // 376
            }                                                                                                          // 377
                                                                                                                       // 378
            // Specially prepare GET requests: Setup the query string, handle caching and make a JSONP call            // 379
            // if neccessary.                                                                                          // 380
            if(method === 'GET') {                                                                                     // 381
                // Setup the query string.                                                                             // 382
                var queryString = [];                                                                                  // 383
                if(payload) {                                                                                          // 384
                    queryString.push(payload);                                                                         // 385
                    payload = null;                                                                                    // 386
                }                                                                                                      // 387
                                                                                                                       // 388
                // Handle caching.                                                                                     // 389
                if(!options.cache) {                                                                                   // 390
                    queryString.push('_=' + (new Date()).getTime());                                                   // 391
                }                                                                                                      // 392
                                                                                                                       // 393
                // If neccessary prepare the query string for a JSONP call.                                            // 394
                if(options.jsonp) {                                                                                    // 395
                    queryString.push('callback=' + options.jsonp);                                                     // 396
                    queryString.push('jsonp=' + options.jsonp);                                                        // 397
                }                                                                                                      // 398
                                                                                                                       // 399
                // Merge the query string and attach it to the url.                                                    // 400
                queryString = queryString.join('&');                                                                   // 401
                if (queryString.length > 1) {                                                                          // 402
                    if (url.indexOf('?') > -1) {                                                                       // 403
                        url += '&' + queryString;                                                                      // 404
                    } else {                                                                                           // 405
                        url += '?' + queryString;                                                                      // 406
                    }                                                                                                  // 407
                }                                                                                                      // 408
                                                                                                                       // 409
                // Make a JSONP call if neccessary.                                                                    // 410
                if(options.jsonp) {                                                                                    // 411
                    var head = document.getElementsByTagName('head')[0];                                               // 412
                    var script = document.createElement('script');                                                     // 413
                    script.type = 'text/javascript';                                                                   // 414
                    script.src = url;                                                                                  // 415
                    head.appendChild(script);                                                                          // 416
                    return;                                                                                            // 417
                }                                                                                                      // 418
            }                                                                                                          // 419
                                                                                                                       // 420
            // Since we got here, it is no JSONP request, so make a normal XHR request.                                // 421
            getXhr(function (err, xhr) {                                                                               // 422
                if(err) return callback(err);                                                                          // 423
                                                                                                                       // 424
                // Open the request.                                                                                   // 425
                xhr.open(method, url, options.async);                                                                  // 426
                                                                                                                       // 427
                // Set the request headers.                                                                            // 428
                for(var header in headers) {                                                                           // 429
                    if(headers.hasOwnProperty(header)) {                                                               // 430
                        xhr.setRequestHeader(header, headers[header]);                                                 // 431
                    }                                                                                                  // 432
                }                                                                                                      // 433
                                                                                                                       // 434
                // Handle the request events.                                                                          // 435
                xhr.onreadystatechange = function () {                                                                 // 436
                    if(xhr.readyState === 4) {                                                                         // 437
                        var data = xhr.responseText || '';                                                             // 438
                                                                                                                       // 439
                        // If no callback is given, return.                                                            // 440
                        if(!callback) {                                                                                // 441
                            return;                                                                                    // 442
                        }                                                                                              // 443
                                                                                                                       // 444
                        // Return an object that provides access to the data as text and JSON.                         // 445
                        callback(xhr.status, {                                                                         // 446
                            text: function () {                                                                        // 447
                                return data;                                                                           // 448
                            },                                                                                         // 449
                                                                                                                       // 450
                            json: function () {                                                                        // 451
                                return JSON.parse(data);                                                               // 452
                            }                                                                                          // 453
                        });                                                                                            // 454
                    }                                                                                                  // 455
                };                                                                                                     // 456
                                                                                                                       // 457
                // Actually send the XHR request.                                                                      // 458
                xhr.send(payload);                                                                                     // 459
            });                                                                                                        // 460
        };                                                                                                             // 461
                                                                                                                       // 462
        // Define the external interface.                                                                              // 463
        var http = {                                                                                                   // 464
            authBasic: function (username, password) {                                                                 // 465
                ajax.headers['Authorization'] = 'Basic ' + base64(username + ':' + password);                          // 466
            },                                                                                                         // 467
                                                                                                                       // 468
            connect: function (url, options, callback) {                                                               // 469
                return ajax('CONNECT', url, options, callback);                                                        // 470
            },                                                                                                         // 471
                                                                                                                       // 472
            del: function (url, options, callback) {                                                                   // 473
                return ajax('DELETE', url, options, callback);                                                         // 474
            },                                                                                                         // 475
                                                                                                                       // 476
            get: function (url, options, callback) {                                                                   // 477
                return ajax('GET', url, options, callback);                                                            // 478
            },                                                                                                         // 479
                                                                                                                       // 480
            head: function (url, options, callback) {                                                                  // 481
                return ajax('HEAD', url, options, callback);                                                           // 482
            },                                                                                                         // 483
                                                                                                                       // 484
            headers: function (headers) {                                                                              // 485
                ajax.headers = headers || {};                                                                          // 486
            },                                                                                                         // 487
                                                                                                                       // 488
            isAllowed: function (url, verb, callback) {                                                                // 489
                this.options(url, function (status, data) {                                                            // 490
                    callback(data.text().indexOf(verb) !== -1);                                                        // 491
                });                                                                                                    // 492
            },                                                                                                         // 493
                                                                                                                       // 494
            options: function (url, options, callback) {                                                               // 495
                return ajax('OPTIONS', url, options, callback);                                                        // 496
            },                                                                                                         // 497
                                                                                                                       // 498
            patch: function (url, options, callback) {                                                                 // 499
                return ajax('PATCH', url, options, callback);                                                          // 500
            },                                                                                                         // 501
                                                                                                                       // 502
            post: function (url, options, callback) {                                                                  // 503
                return ajax('POST', url, options, callback);                                                           // 504
            },                                                                                                         // 505
                                                                                                                       // 506
            put: function (url, options, callback) {                                                                   // 507
                return ajax('PUT', url, options, callback);                                                            // 508
            },                                                                                                         // 509
                                                                                                                       // 510
            trace: function (url, options, callback) {                                                                 // 511
                return ajax('TRACE', url, options, callback);                                                          // 512
            }                                                                                                          // 513
        };                                                                                                             // 514
                                                                                                                       // 515
                                                                                                                       // 516
        var methode = options.type ? options.type.toLowerCase() : 'get';                                               // 517
                                                                                                                       // 518
        http[methode](options.url, options, function (status, data) {                                                  // 519
            if (status === 200) {                                                                                      // 520
                options.success(data.json(), status, null);                                                            // 521
            } else {                                                                                                   // 522
                options.error(data.text(), status, null);                                                              // 523
            }                                                                                                          // 524
        });                                                                                                            // 525
    }                                                                                                                  // 526
                                                                                                                       // 527
    var _cookie = {                                                                                                    // 528
        create: function(name,value,minutes,domain) {                                                                  // 529
            var expires;                                                                                               // 530
            if (minutes) {                                                                                             // 531
                var date = new Date();                                                                                 // 532
                date.setTime(date.getTime()+(minutes*60*1000));                                                        // 533
                expires = "; expires="+date.toGMTString();                                                             // 534
            }                                                                                                          // 535
            else expires = "";                                                                                         // 536
            domain = (domain)? "domain="+domain+";" : "";                                                              // 537
            document.cookie = name+"="+value+expires+";"+domain+"path=/";                                              // 538
        },                                                                                                             // 539
                                                                                                                       // 540
        read: function(name) {                                                                                         // 541
            var nameEQ = name + "=";                                                                                   // 542
            var ca = document.cookie.split(';');                                                                       // 543
            for(var i=0;i < ca.length;i++) {                                                                           // 544
                var c = ca[i];                                                                                         // 545
                while (c.charAt(0)==' ') c = c.substring(1,c.length);                                                  // 546
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);                               // 547
            }                                                                                                          // 548
            return null;                                                                                               // 549
        },                                                                                                             // 550
                                                                                                                       // 551
        remove: function(name) {                                                                                       // 552
            this.create(name,"",-1);                                                                                   // 553
        }                                                                                                              // 554
    };                                                                                                                 // 555
                                                                                                                       // 556
    var cookie_noop = {                                                                                                // 557
        create: function(name,value,minutes,domain) {},                                                                // 558
        read: function(name) { return null; },                                                                         // 559
        remove: function(name) {}                                                                                      // 560
    };                                                                                                                 // 561
                                                                                                                       // 562
                                                                                                                       // 563
                                                                                                                       // 564
    // move dependent functions to a container so that                                                                 // 565
    // they can be overriden easier in no jquery environment (node.js)                                                 // 566
    var f = {                                                                                                          // 567
        extend: $ ? $.extend : _extend,                                                                                // 568
        each: $ ? $.each : _each,                                                                                      // 569
        ajax: $ ? $.ajax : (typeof document !== 'undefined' ? _ajax : function() {}),                                  // 570
        cookie: typeof document !== 'undefined' ? _cookie : cookie_noop,                                               // 571
        detectLanguage: detectLanguage,                                                                                // 572
        escape: _escape,                                                                                               // 573
        log: function(str) {                                                                                           // 574
            if (o.debug && typeof console !== "undefined") console.log(str);                                           // 575
        },                                                                                                             // 576
        toLanguages: function(lng) {                                                                                   // 577
            var languages = [];                                                                                        // 578
            if (typeof lng === 'string' && lng.indexOf('-') > -1) {                                                    // 579
                var parts = lng.split('-');                                                                            // 580
                                                                                                                       // 581
                lng = o.lowerCaseLng ?                                                                                 // 582
                    parts[0].toLowerCase() +  '-' + parts[1].toLowerCase() :                                           // 583
                    parts[0].toLowerCase() +  '-' + parts[1].toUpperCase();                                            // 584
                                                                                                                       // 585
                if (o.load !== 'unspecific') languages.push(lng);                                                      // 586
                if (o.load !== 'current') languages.push(parts[0]);                                                    // 587
            } else {                                                                                                   // 588
                languages.push(lng);                                                                                   // 589
            }                                                                                                          // 590
                                                                                                                       // 591
            for (var i = 0; i < o.fallbackLng.length; i++) {                                                           // 592
                if (languages.indexOf(o.fallbackLng[i]) === -1 && o.fallbackLng[i]) languages.push(o.fallbackLng[i]);  // 593
            }                                                                                                          // 594
                                                                                                                       // 595
            return languages;                                                                                          // 596
        },                                                                                                             // 597
        regexEscape: function(str) {                                                                                   // 598
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");                                         // 599
        }                                                                                                              // 600
    };                                                                                                                 // 601
    function init(options, cb) {                                                                                       // 602
                                                                                                                       // 603
        if (typeof options === 'function') {                                                                           // 604
            cb = options;                                                                                              // 605
            options = {};                                                                                              // 606
        }                                                                                                              // 607
        options = options || {};                                                                                       // 608
                                                                                                                       // 609
        // override defaults with passed in options                                                                    // 610
        f.extend(o, options);                                                                                          // 611
        delete o.fixLng; /* passed in each time */                                                                     // 612
                                                                                                                       // 613
        // create namespace object if namespace is passed in as string                                                 // 614
        if (typeof o.ns == 'string') {                                                                                 // 615
            o.ns = { namespaces: [o.ns], defaultNs: o.ns};                                                             // 616
        }                                                                                                              // 617
                                                                                                                       // 618
        // fallback namespaces                                                                                         // 619
        if (typeof o.fallbackNS == 'string') {                                                                         // 620
            o.fallbackNS = [o.fallbackNS];                                                                             // 621
        }                                                                                                              // 622
                                                                                                                       // 623
        // fallback languages                                                                                          // 624
        if (typeof o.fallbackLng == 'string' || typeof o.fallbackLng == 'boolean') {                                   // 625
            o.fallbackLng = [o.fallbackLng];                                                                           // 626
        }                                                                                                              // 627
                                                                                                                       // 628
        // escape prefix/suffix                                                                                        // 629
        o.interpolationPrefixEscaped = f.regexEscape(o.interpolationPrefix);                                           // 630
        o.interpolationSuffixEscaped = f.regexEscape(o.interpolationSuffix);                                           // 631
                                                                                                                       // 632
        if (!o.lng) o.lng = f.detectLanguage();                                                                        // 633
        if (o.lng) {                                                                                                   // 634
            // set cookie with lng set (as detectLanguage will set cookie on need)                                     // 635
            if (o.useCookie) f.cookie.create(o.cookieName, o.lng, o.cookieExpirationTime, o.cookieDomain);             // 636
        } else {                                                                                                       // 637
            o.lng =  o.fallbackLng[0];                                                                                 // 638
            if (o.useCookie) f.cookie.remove(o.cookieName);                                                            // 639
        }                                                                                                              // 640
                                                                                                                       // 641
        languages = f.toLanguages(o.lng);                                                                              // 642
        currentLng = languages[0];                                                                                     // 643
        f.log('currentLng set to: ' + currentLng);                                                                     // 644
                                                                                                                       // 645
        var lngTranslate = translate;                                                                                  // 646
        if (options.fixLng) {                                                                                          // 647
            lngTranslate = function(key, options) {                                                                    // 648
                options = options || {};                                                                               // 649
                options.lng = options.lng || lngTranslate.lng;                                                         // 650
                return translate(key, options);                                                                        // 651
            };                                                                                                         // 652
            lngTranslate.lng = currentLng;                                                                             // 653
        }                                                                                                              // 654
                                                                                                                       // 655
        pluralExtensions.setCurrentLng(currentLng);                                                                    // 656
                                                                                                                       // 657
        // add JQuery extensions                                                                                       // 658
        if ($ && o.setJqueryExt) addJqueryFunct();                                                                     // 659
                                                                                                                       // 660
        // jQuery deferred                                                                                             // 661
        var deferred;                                                                                                  // 662
        if ($ && $.Deferred) {                                                                                         // 663
            deferred = $.Deferred();                                                                                   // 664
        }                                                                                                              // 665
                                                                                                                       // 666
        // return immidiatly if res are passed in                                                                      // 667
        if (o.resStore) {                                                                                              // 668
            resStore = o.resStore;                                                                                     // 669
            initialized = true;                                                                                        // 670
            if (cb) cb(lngTranslate);                                                                                  // 671
            if (deferred) deferred.resolve(lngTranslate);                                                              // 672
            if (deferred) return deferred.promise();                                                                   // 673
            return;                                                                                                    // 674
        }                                                                                                              // 675
                                                                                                                       // 676
        // languages to load                                                                                           // 677
        var lngsToLoad = f.toLanguages(o.lng);                                                                         // 678
        if (typeof o.preload === 'string') o.preload = [o.preload];                                                    // 679
        for (var i = 0, l = o.preload.length; i < l; i++) {                                                            // 680
            var pres = f.toLanguages(o.preload[i]);                                                                    // 681
            for (var y = 0, len = pres.length; y < len; y++) {                                                         // 682
                if (lngsToLoad.indexOf(pres[y]) < 0) {                                                                 // 683
                    lngsToLoad.push(pres[y]);                                                                          // 684
                }                                                                                                      // 685
            }                                                                                                          // 686
        }                                                                                                              // 687
                                                                                                                       // 688
        // else load them                                                                                              // 689
        TAPi18next.sync.load(lngsToLoad, o, function(err, store) {                                                     // 690
            resStore = store;                                                                                          // 691
            initialized = true;                                                                                        // 692
                                                                                                                       // 693
            if (cb) cb(lngTranslate);                                                                                  // 694
            if (deferred) deferred.resolve(lngTranslate);                                                              // 695
        });                                                                                                            // 696
                                                                                                                       // 697
        if (deferred) return deferred.promise();                                                                       // 698
    }                                                                                                                  // 699
    function preload(lngs, cb) {                                                                                       // 700
        if (typeof lngs === 'string') lngs = [lngs];                                                                   // 701
        for (var i = 0, l = lngs.length; i < l; i++) {                                                                 // 702
            if (o.preload.indexOf(lngs[i]) < 0) {                                                                      // 703
                o.preload.push(lngs[i]);                                                                               // 704
            }                                                                                                          // 705
        }                                                                                                              // 706
        return init(cb);                                                                                               // 707
    }                                                                                                                  // 708
                                                                                                                       // 709
    function addResourceBundle(lng, ns, resources) {                                                                   // 710
        if (typeof ns !== 'string') {                                                                                  // 711
            resources = ns;                                                                                            // 712
            ns = o.ns.defaultNs;                                                                                       // 713
        } else if (o.ns.namespaces.indexOf(ns) < 0) {                                                                  // 714
            o.ns.namespaces.push(ns);                                                                                  // 715
        }                                                                                                              // 716
                                                                                                                       // 717
        resStore[lng] = resStore[lng] || {};                                                                           // 718
        resStore[lng][ns] = resStore[lng][ns] || {};                                                                   // 719
                                                                                                                       // 720
        f.extend(resStore[lng][ns], resources);                                                                        // 721
    }                                                                                                                  // 722
                                                                                                                       // 723
    function removeResourceBundle(lng, ns) {                                                                           // 724
        if (typeof ns !== 'string') {                                                                                  // 725
            ns = o.ns.defaultNs;                                                                                       // 726
        }                                                                                                              // 727
                                                                                                                       // 728
        resStore[lng] = resStore[lng] || {};                                                                           // 729
        resStore[lng][ns] = {};                                                                                        // 730
    }                                                                                                                  // 731
                                                                                                                       // 732
    function setDefaultNamespace(ns) {                                                                                 // 733
        o.ns.defaultNs = ns;                                                                                           // 734
    }                                                                                                                  // 735
                                                                                                                       // 736
    function loadNamespace(namespace, cb) {                                                                            // 737
        loadNamespaces([namespace], cb);                                                                               // 738
    }                                                                                                                  // 739
                                                                                                                       // 740
    function loadNamespaces(namespaces, cb) {                                                                          // 741
        var opts = {                                                                                                   // 742
            dynamicLoad: o.dynamicLoad,                                                                                // 743
            resGetPath: o.resGetPath,                                                                                  // 744
            getAsync: o.getAsync,                                                                                      // 745
            customLoad: o.customLoad,                                                                                  // 746
            ns: { namespaces: namespaces, defaultNs: ''} /* new namespaces to load */                                  // 747
        };                                                                                                             // 748
                                                                                                                       // 749
        // languages to load                                                                                           // 750
        var lngsToLoad = f.toLanguages(o.lng);                                                                         // 751
        if (typeof o.preload === 'string') o.preload = [o.preload];                                                    // 752
        for (var i = 0, l = o.preload.length; i < l; i++) {                                                            // 753
            var pres = f.toLanguages(o.preload[i]);                                                                    // 754
            for (var y = 0, len = pres.length; y < len; y++) {                                                         // 755
                if (lngsToLoad.indexOf(pres[y]) < 0) {                                                                 // 756
                    lngsToLoad.push(pres[y]);                                                                          // 757
                }                                                                                                      // 758
            }                                                                                                          // 759
        }                                                                                                              // 760
                                                                                                                       // 761
        // check if we have to load                                                                                    // 762
        var lngNeedLoad = [];                                                                                          // 763
        for (var a = 0, lenA = lngsToLoad.length; a < lenA; a++) {                                                     // 764
            var needLoad = false;                                                                                      // 765
            var resSet = resStore[lngsToLoad[a]];                                                                      // 766
            if (resSet) {                                                                                              // 767
                for (var b = 0, lenB = namespaces.length; b < lenB; b++) {                                             // 768
                    if (!resSet[namespaces[b]]) needLoad = true;                                                       // 769
                }                                                                                                      // 770
            } else {                                                                                                   // 771
                needLoad = true;                                                                                       // 772
            }                                                                                                          // 773
                                                                                                                       // 774
            if (needLoad) lngNeedLoad.push(lngsToLoad[a]);                                                             // 775
        }                                                                                                              // 776
                                                                                                                       // 777
        if (lngNeedLoad.length) {                                                                                      // 778
            TAPi18next.sync._fetch(lngNeedLoad, opts, function(err, store) {                                           // 779
                var todo = namespaces.length * lngNeedLoad.length;                                                     // 780
                                                                                                                       // 781
                // load each file individual                                                                           // 782
                f.each(namespaces, function(nsIndex, nsValue) {                                                        // 783
                                                                                                                       // 784
                    // append namespace to namespace array                                                             // 785
                    if (o.ns.namespaces.indexOf(nsValue) < 0) {                                                        // 786
                        o.ns.namespaces.push(nsValue);                                                                 // 787
                    }                                                                                                  // 788
                                                                                                                       // 789
                    f.each(lngNeedLoad, function(lngIndex, lngValue) {                                                 // 790
                        resStore[lngValue] = resStore[lngValue] || {};                                                 // 791
                        resStore[lngValue][nsValue] = store[lngValue][nsValue];                                        // 792
                                                                                                                       // 793
                        todo--; // wait for all done befor callback                                                    // 794
                        if (todo === 0 && cb) {                                                                        // 795
                            if (o.useLocalStorage) TAPi18next.sync._storeLocal(resStore);                              // 796
                            cb();                                                                                      // 797
                        }                                                                                              // 798
                    });                                                                                                // 799
                });                                                                                                    // 800
            });                                                                                                        // 801
        } else {                                                                                                       // 802
            if (cb) cb();                                                                                              // 803
        }                                                                                                              // 804
    }                                                                                                                  // 805
                                                                                                                       // 806
    function setLng(lng, options, cb) {                                                                                // 807
        if (typeof options === 'function') {                                                                           // 808
            cb = options;                                                                                              // 809
            options = {};                                                                                              // 810
        } else if (!options) {                                                                                         // 811
            options = {};                                                                                              // 812
        }                                                                                                              // 813
                                                                                                                       // 814
        options.lng = lng;                                                                                             // 815
        return init(options, cb);                                                                                      // 816
    }                                                                                                                  // 817
                                                                                                                       // 818
    function lng() {                                                                                                   // 819
        return currentLng;                                                                                             // 820
    }                                                                                                                  // 821
    function addJqueryFunct() {                                                                                        // 822
        // $.t shortcut                                                                                                // 823
        $.t = $.t || translate;                                                                                        // 824
                                                                                                                       // 825
        function parse(ele, key, options) {                                                                            // 826
            if (key.length === 0) return;                                                                              // 827
                                                                                                                       // 828
            var attr = 'text';                                                                                         // 829
                                                                                                                       // 830
            if (key.indexOf('[') === 0) {                                                                              // 831
                var parts = key.split(']');                                                                            // 832
                key = parts[1];                                                                                        // 833
                attr = parts[0].substr(1, parts[0].length-1);                                                          // 834
            }                                                                                                          // 835
                                                                                                                       // 836
            if (key.indexOf(';') === key.length-1) {                                                                   // 837
                key = key.substr(0, key.length-2);                                                                     // 838
            }                                                                                                          // 839
                                                                                                                       // 840
            var optionsToUse;                                                                                          // 841
            if (attr === 'html') {                                                                                     // 842
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.html() }, options) : options;  // 843
                ele.html($.t(key, optionsToUse));                                                                      // 844
            } else if (attr === 'text') {                                                                              // 845
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.text() }, options) : options;  // 846
                ele.text($.t(key, optionsToUse));                                                                      // 847
            } else if (attr === 'prepend') {                                                                           // 848
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.html() }, options) : options;  // 849
                ele.prepend($.t(key, optionsToUse));                                                                   // 850
            } else if (attr === 'append') {                                                                            // 851
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.html() }, options) : options;  // 852
                ele.append($.t(key, optionsToUse));                                                                    // 853
            } else if (attr.indexOf("data-") === 0) {                                                                  // 854
                var dataAttr = attr.substr(("data-").length);                                                          // 855
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.data(dataAttr) }, options) : options;
                var translated = $.t(key, optionsToUse);                                                               // 857
                //we change into the data cache                                                                        // 858
                ele.data(dataAttr, translated);                                                                        // 859
                //we change into the dom                                                                               // 860
                ele.attr(attr, translated);                                                                            // 861
            } else {                                                                                                   // 862
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.attr(attr) }, options) : options;
                ele.attr(attr, $.t(key, optionsToUse));                                                                // 864
            }                                                                                                          // 865
        }                                                                                                              // 866
                                                                                                                       // 867
        function localize(ele, options) {                                                                              // 868
            var key = ele.attr(o.selectorAttr);                                                                        // 869
            if (!key && typeof key !== 'undefined' && key !== false) key = ele.text() || ele.val();                    // 870
            if (!key) return;                                                                                          // 871
                                                                                                                       // 872
            var target = ele                                                                                           // 873
              , targetSelector = ele.data("i18n-target");                                                              // 874
            if (targetSelector) {                                                                                      // 875
                target = ele.find(targetSelector) || ele;                                                              // 876
            }                                                                                                          // 877
                                                                                                                       // 878
            if (!options && o.useDataAttrOptions === true) {                                                           // 879
                options = ele.data("i18n-options");                                                                    // 880
            }                                                                                                          // 881
            options = options || {};                                                                                   // 882
                                                                                                                       // 883
            if (key.indexOf(';') >= 0) {                                                                               // 884
                var keys = key.split(';');                                                                             // 885
                                                                                                                       // 886
                $.each(keys, function(m, k) {                                                                          // 887
                    if (k !== '') parse(target, k, options);                                                           // 888
                });                                                                                                    // 889
                                                                                                                       // 890
            } else {                                                                                                   // 891
                parse(target, key, options);                                                                           // 892
            }                                                                                                          // 893
                                                                                                                       // 894
            if (o.useDataAttrOptions === true) ele.data("i18n-options", options);                                      // 895
        }                                                                                                              // 896
                                                                                                                       // 897
        // fn                                                                                                          // 898
        $.fn.TAPi18next = function (options) {                                                                         // 899
            return this.each(function() {                                                                              // 900
                // localize element itself                                                                             // 901
                localize($(this), options);                                                                            // 902
                                                                                                                       // 903
                // localize childs                                                                                     // 904
                var elements =  $(this).find('[' + o.selectorAttr + ']');                                              // 905
                elements.each(function() {                                                                             // 906
                    localize($(this), options);                                                                        // 907
                });                                                                                                    // 908
            });                                                                                                        // 909
        };                                                                                                             // 910
    }                                                                                                                  // 911
    function applyReplacement(str, replacementHash, nestedKey, options) {                                              // 912
        if (!str) return str;                                                                                          // 913
                                                                                                                       // 914
        options = options || replacementHash; // first call uses replacement hash combined with options                // 915
        if (str.indexOf(options.interpolationPrefix || o.interpolationPrefix) < 0) return str;                         // 916
                                                                                                                       // 917
        var prefix = options.interpolationPrefix ? f.regexEscape(options.interpolationPrefix) : o.interpolationPrefixEscaped
          , suffix = options.interpolationSuffix ? f.regexEscape(options.interpolationSuffix) : o.interpolationSuffixEscaped
          , unEscapingSuffix = 'HTML'+suffix;                                                                          // 920
                                                                                                                       // 921
        f.each(replacementHash, function(key, value) {                                                                 // 922
            var nextKey = nestedKey ? nestedKey + o.keyseparator + key : key;                                          // 923
            if (typeof value === 'object' && value !== null) {                                                         // 924
                str = applyReplacement(str, value, nextKey, options);                                                  // 925
            } else {                                                                                                   // 926
                if (options.escapeInterpolation || o.escapeInterpolation) {                                            // 927
                    str = str.replace(new RegExp([prefix, nextKey, unEscapingSuffix].join(''), 'g'), value);           // 928
                    str = str.replace(new RegExp([prefix, nextKey, suffix].join(''), 'g'), f.escape(value));           // 929
                } else {                                                                                               // 930
                    str = str.replace(new RegExp([prefix, nextKey, suffix].join(''), 'g'), value);                     // 931
                }                                                                                                      // 932
                // str = options.escapeInterpolation;                                                                  // 933
            }                                                                                                          // 934
        });                                                                                                            // 935
        return str;                                                                                                    // 936
    }                                                                                                                  // 937
                                                                                                                       // 938
    // append it to functions                                                                                          // 939
    f.applyReplacement = applyReplacement;                                                                             // 940
                                                                                                                       // 941
    function applyReuse(translated, options) {                                                                         // 942
        var comma = ',';                                                                                               // 943
        var options_open = '{';                                                                                        // 944
        var options_close = '}';                                                                                       // 945
                                                                                                                       // 946
        var opts = f.extend({}, options);                                                                              // 947
        delete opts.postProcess;                                                                                       // 948
                                                                                                                       // 949
        while (translated.indexOf(o.reusePrefix) != -1) {                                                              // 950
            replacementCounter++;                                                                                      // 951
            if (replacementCounter > o.maxRecursion) { break; } // safety net for too much recursion                   // 952
            var index_of_opening = translated.lastIndexOf(o.reusePrefix);                                              // 953
            var index_of_end_of_closing = translated.indexOf(o.reuseSuffix, index_of_opening) + o.reuseSuffix.length;  // 954
            var token = translated.substring(index_of_opening, index_of_end_of_closing);                               // 955
            var token_without_symbols = token.replace(o.reusePrefix, '').replace(o.reuseSuffix, '');                   // 956
                                                                                                                       // 957
                                                                                                                       // 958
            if (token_without_symbols.indexOf(comma) != -1) {                                                          // 959
                var index_of_token_end_of_closing = token_without_symbols.indexOf(comma);                              // 960
                if (token_without_symbols.indexOf(options_open, index_of_token_end_of_closing) != -1 && token_without_symbols.indexOf(options_close, index_of_token_end_of_closing) != -1) {
                    var index_of_opts_opening = token_without_symbols.indexOf(options_open, index_of_token_end_of_closing);
                    var index_of_opts_end_of_closing = token_without_symbols.indexOf(options_close, index_of_opts_opening) + options_close.length;
                    try {                                                                                              // 964
                        opts = f.extend(opts, JSON.parse(token_without_symbols.substring(index_of_opts_opening, index_of_opts_end_of_closing)));
                        token_without_symbols = token_without_symbols.substring(0, index_of_token_end_of_closing);     // 966
                    } catch (e) {                                                                                      // 967
                    }                                                                                                  // 968
                }                                                                                                      // 969
            }                                                                                                          // 970
                                                                                                                       // 971
            var translated_token = _translate(token_without_symbols, opts);                                            // 972
            translated = translated.replace(token, translated_token);                                                  // 973
        }                                                                                                              // 974
        return translated;                                                                                             // 975
    }                                                                                                                  // 976
                                                                                                                       // 977
    function hasContext(options) {                                                                                     // 978
        return (options.context && (typeof options.context == 'string' || typeof options.context == 'number'));        // 979
    }                                                                                                                  // 980
                                                                                                                       // 981
    function needsPlural(options) {                                                                                    // 982
        return (options.count !== undefined && typeof options.count != 'string' && options.count !== 1);               // 983
    }                                                                                                                  // 984
                                                                                                                       // 985
    function exists(key, options) {                                                                                    // 986
        options = options || {};                                                                                       // 987
                                                                                                                       // 988
        var notFound = _getDefaultValue(key, options)                                                                  // 989
            , found = _find(key, options);                                                                             // 990
                                                                                                                       // 991
        return found !== undefined || found === notFound;                                                              // 992
    }                                                                                                                  // 993
                                                                                                                       // 994
    function translate(key, options) {                                                                                 // 995
        options = options || {};                                                                                       // 996
                                                                                                                       // 997
        if (!initialized) {                                                                                            // 998
            f.log('i18next not finished initialization. you might have called t function before loading resources finished.')
            return options.defaultValue || '';                                                                         // 1000
        };                                                                                                             // 1001
        replacementCounter = 0;                                                                                        // 1002
        return _translate.apply(null, arguments);                                                                      // 1003
    }                                                                                                                  // 1004
                                                                                                                       // 1005
    function _getDefaultValue(key, options) {                                                                          // 1006
        return (options.defaultValue !== undefined) ? options.defaultValue : key;                                      // 1007
    }                                                                                                                  // 1008
                                                                                                                       // 1009
    function _injectSprintfProcessor() {                                                                               // 1010
                                                                                                                       // 1011
        var values = [];                                                                                               // 1012
                                                                                                                       // 1013
        // mh: build array from second argument onwards                                                                // 1014
        for (var i = 1; i < arguments.length; i++) {                                                                   // 1015
            values.push(arguments[i]);                                                                                 // 1016
        }                                                                                                              // 1017
                                                                                                                       // 1018
        return {                                                                                                       // 1019
            postProcess: 'sprintf',                                                                                    // 1020
            sprintf:     values                                                                                        // 1021
        };                                                                                                             // 1022
    }                                                                                                                  // 1023
                                                                                                                       // 1024
    function _translate(potentialKeys, options) {                                                                      // 1025
        if (options && typeof options !== 'object') {                                                                  // 1026
            if (o.shortcutFunction === 'sprintf') {                                                                    // 1027
                // mh: gettext like sprintf syntax found, automatically create sprintf processor                       // 1028
                options = _injectSprintfProcessor.apply(null, arguments);                                              // 1029
            } else if (o.shortcutFunction === 'defaultValue') {                                                        // 1030
                options = {                                                                                            // 1031
                    defaultValue: options                                                                              // 1032
                }                                                                                                      // 1033
            }                                                                                                          // 1034
        } else {                                                                                                       // 1035
            options = options || {};                                                                                   // 1036
        }                                                                                                              // 1037
                                                                                                                       // 1038
        if (potentialKeys === undefined || potentialKeys === null) return '';                                          // 1039
                                                                                                                       // 1040
        if (typeof potentialKeys == 'string') {                                                                        // 1041
            potentialKeys = [potentialKeys];                                                                           // 1042
        }                                                                                                              // 1043
                                                                                                                       // 1044
        var key = potentialKeys[0];                                                                                    // 1045
                                                                                                                       // 1046
        if (potentialKeys.length > 1) {                                                                                // 1047
            for (var i = 0; i < potentialKeys.length; i++) {                                                           // 1048
                key = potentialKeys[i];                                                                                // 1049
                if (exists(key, options)) {                                                                            // 1050
                    break;                                                                                             // 1051
                }                                                                                                      // 1052
            }                                                                                                          // 1053
        }                                                                                                              // 1054
                                                                                                                       // 1055
        var notFound = _getDefaultValue(key, options)                                                                  // 1056
            , found = _find(key, options)                                                                              // 1057
            , lngs = options.lng ? f.toLanguages(options.lng) : languages                                              // 1058
            , ns = options.ns || o.ns.defaultNs                                                                        // 1059
            , parts;                                                                                                   // 1060
                                                                                                                       // 1061
        // split ns and key                                                                                            // 1062
        if (key.indexOf(o.nsseparator) > -1) {                                                                         // 1063
            parts = key.split(o.nsseparator);                                                                          // 1064
            ns = parts[0];                                                                                             // 1065
            key = parts[1];                                                                                            // 1066
        }                                                                                                              // 1067
                                                                                                                       // 1068
        if (found === undefined && o.sendMissing) {                                                                    // 1069
            if (options.lng) {                                                                                         // 1070
                sync.postMissing(lngs[0], ns, key, notFound, lngs);                                                    // 1071
            } else {                                                                                                   // 1072
                sync.postMissing(o.lng, ns, key, notFound, lngs);                                                      // 1073
            }                                                                                                          // 1074
        }                                                                                                              // 1075
                                                                                                                       // 1076
        var postProcessor = options.postProcess || o.postProcess;                                                      // 1077
        if (found !== undefined && postProcessor) {                                                                    // 1078
            if (postProcessors[postProcessor]) {                                                                       // 1079
                found = postProcessors[postProcessor](found, key, options);                                            // 1080
            }                                                                                                          // 1081
        }                                                                                                              // 1082
                                                                                                                       // 1083
        // process notFound if function exists                                                                         // 1084
        var splitNotFound = notFound;                                                                                  // 1085
        if (notFound.indexOf(o.nsseparator) > -1) {                                                                    // 1086
            parts = notFound.split(o.nsseparator);                                                                     // 1087
            splitNotFound = parts[1];                                                                                  // 1088
        }                                                                                                              // 1089
        if (splitNotFound === key && o.parseMissingKey) {                                                              // 1090
            notFound = o.parseMissingKey(notFound);                                                                    // 1091
        }                                                                                                              // 1092
                                                                                                                       // 1093
        if (found === undefined) {                                                                                     // 1094
            notFound = applyReplacement(notFound, options);                                                            // 1095
            notFound = applyReuse(notFound, options);                                                                  // 1096
                                                                                                                       // 1097
            if (postProcessor && postProcessors[postProcessor]) {                                                      // 1098
                var val = _getDefaultValue(key, options);                                                              // 1099
                found = postProcessors[postProcessor](val, key, options);                                              // 1100
            }                                                                                                          // 1101
        }                                                                                                              // 1102
                                                                                                                       // 1103
        return (found !== undefined) ? found : notFound;                                                               // 1104
    }                                                                                                                  // 1105
                                                                                                                       // 1106
    function _find(key, options) {                                                                                     // 1107
        options = options || {};                                                                                       // 1108
                                                                                                                       // 1109
        var optionWithoutCount, translated                                                                             // 1110
            , notFound = _getDefaultValue(key, options)                                                                // 1111
            , lngs = languages;                                                                                        // 1112
                                                                                                                       // 1113
        if (!resStore) { return notFound; } // no resStore to translate from                                           // 1114
                                                                                                                       // 1115
        // CI mode                                                                                                     // 1116
        if (lngs[0].toLowerCase() === 'cimode') return notFound;                                                       // 1117
                                                                                                                       // 1118
        // passed in lng                                                                                               // 1119
        if (options.lng) {                                                                                             // 1120
            lngs = f.toLanguages(options.lng);                                                                         // 1121
                                                                                                                       // 1122
            if (!resStore[lngs[0]]) {                                                                                  // 1123
                var oldAsync = o.getAsync;                                                                             // 1124
                o.getAsync = false;                                                                                    // 1125
                                                                                                                       // 1126
                TAPi18next.sync.load(lngs, o, function(err, store) {                                                   // 1127
                    f.extend(resStore, store);                                                                         // 1128
                    o.getAsync = oldAsync;                                                                             // 1129
                });                                                                                                    // 1130
            }                                                                                                          // 1131
        }                                                                                                              // 1132
                                                                                                                       // 1133
        var ns = options.ns || o.ns.defaultNs;                                                                         // 1134
        if (key.indexOf(o.nsseparator) > -1) {                                                                         // 1135
            var parts = key.split(o.nsseparator);                                                                      // 1136
            ns = parts[0];                                                                                             // 1137
            key = parts[1];                                                                                            // 1138
        }                                                                                                              // 1139
                                                                                                                       // 1140
        if (hasContext(options)) {                                                                                     // 1141
            optionWithoutCount = f.extend({}, options);                                                                // 1142
            delete optionWithoutCount.context;                                                                         // 1143
            optionWithoutCount.defaultValue = o.contextNotFound;                                                       // 1144
                                                                                                                       // 1145
            var contextKey = ns + o.nsseparator + key + '_' + options.context;                                         // 1146
                                                                                                                       // 1147
            translated = translate(contextKey, optionWithoutCount);                                                    // 1148
            if (translated != o.contextNotFound) {                                                                     // 1149
                return applyReplacement(translated, { context: options.context }); // apply replacement for context only
            } // else continue translation with original/nonContext key                                                // 1151
        }                                                                                                              // 1152
                                                                                                                       // 1153
        if (needsPlural(options)) {                                                                                    // 1154
            optionWithoutCount = f.extend({}, options);                                                                // 1155
            delete optionWithoutCount.count;                                                                           // 1156
            optionWithoutCount.defaultValue = o.pluralNotFound;                                                        // 1157
                                                                                                                       // 1158
            var pluralKey = ns + o.nsseparator + key + o.pluralSuffix;                                                 // 1159
            var pluralExtension = pluralExtensions.get(lngs[0], options.count);                                        // 1160
            if (pluralExtension >= 0) {                                                                                // 1161
                pluralKey = pluralKey + '_' + pluralExtension;                                                         // 1162
            } else if (pluralExtension === 1) {                                                                        // 1163
                pluralKey = ns + o.nsseparator + key; // singular                                                      // 1164
            }                                                                                                          // 1165
                                                                                                                       // 1166
            translated = translate(pluralKey, optionWithoutCount);                                                     // 1167
            if (translated != o.pluralNotFound) {                                                                      // 1168
                return applyReplacement(translated, {                                                                  // 1169
                    count: options.count,                                                                              // 1170
                    interpolationPrefix: options.interpolationPrefix,                                                  // 1171
                    interpolationSuffix: options.interpolationSuffix                                                   // 1172
                }); // apply replacement for count only                                                                // 1173
            } // else continue translation with original/singular key                                                  // 1174
        }                                                                                                              // 1175
                                                                                                                       // 1176
        var found;                                                                                                     // 1177
        var keys = key.split(o.keyseparator);                                                                          // 1178
        for (var i = 0, len = lngs.length; i < len; i++ ) {                                                            // 1179
            if (found !== undefined) break;                                                                            // 1180
                                                                                                                       // 1181
            var l = lngs[i];                                                                                           // 1182
                                                                                                                       // 1183
            var x = 0;                                                                                                 // 1184
            var value = resStore[l] && resStore[l][ns];                                                                // 1185
            while (keys[x]) {                                                                                          // 1186
                value = value && value[keys[x]];                                                                       // 1187
                x++;                                                                                                   // 1188
            }                                                                                                          // 1189
            if (value !== undefined) {                                                                                 // 1190
                var valueType = Object.prototype.toString.apply(value);                                                // 1191
                if (typeof value === 'string') {                                                                       // 1192
                    value = applyReplacement(value, options);                                                          // 1193
                    value = applyReuse(value, options);                                                                // 1194
                } else if (valueType === '[object Array]' && !o.returnObjectTrees && !options.returnObjectTrees) {     // 1195
                    value = value.join('\n');                                                                          // 1196
                    value = applyReplacement(value, options);                                                          // 1197
                    value = applyReuse(value, options);                                                                // 1198
                } else if (value === null && o.fallbackOnNull === true) {                                              // 1199
                    value = undefined;                                                                                 // 1200
                } else if (value !== null) {                                                                           // 1201
                    if (!o.returnObjectTrees && !options.returnObjectTrees) {                                          // 1202
                        if (o.objectTreeKeyHandler && typeof o.objectTreeKeyHandler == 'function') {                   // 1203
                            value = o.objectTreeKeyHandler(key, value, l, ns, options);                                // 1204
                        } else {                                                                                       // 1205
                            value = 'key \'' + ns + ':' + key + ' (' + l + ')\' ' +                                    // 1206
                                'returned an object instead of string.';                                               // 1207
                            f.log(value);                                                                              // 1208
                        }                                                                                              // 1209
                    } else if (valueType !== '[object Number]' && valueType !== '[object Function]' && valueType !== '[object RegExp]') {
                        var copy = (valueType === '[object Array]') ? [] : {}; // apply child translation on a copy    // 1211
                        f.each(value, function(m) {                                                                    // 1212
                            copy[m] = _translate(ns + o.nsseparator + key + o.keyseparator + m, options);              // 1213
                        });                                                                                            // 1214
                        value = copy;                                                                                  // 1215
                    }                                                                                                  // 1216
                }                                                                                                      // 1217
                                                                                                                       // 1218
                if (typeof value === 'string' && value.trim() === '' && o.fallbackOnEmpty === true)                    // 1219
                    value = undefined;                                                                                 // 1220
                                                                                                                       // 1221
                found = value;                                                                                         // 1222
            }                                                                                                          // 1223
        }                                                                                                              // 1224
                                                                                                                       // 1225
        if (found === undefined && !options.isFallbackLookup && (o.fallbackToDefaultNS === true || (o.fallbackNS && o.fallbackNS.length > 0))) {
            // set flag for fallback lookup - avoid recursion                                                          // 1227
            options.isFallbackLookup = true;                                                                           // 1228
                                                                                                                       // 1229
            if (o.fallbackNS.length) {                                                                                 // 1230
                                                                                                                       // 1231
                for (var y = 0, lenY = o.fallbackNS.length; y < lenY; y++) {                                           // 1232
                    found = _find(o.fallbackNS[y] + o.nsseparator + key, options);                                     // 1233
                                                                                                                       // 1234
                    if (found) {                                                                                       // 1235
                        /* compare value without namespace */                                                          // 1236
                        var foundValue = found.indexOf(o.nsseparator) > -1 ? found.split(o.nsseparator)[1] : found     // 1237
                          , notFoundValue = notFound.indexOf(o.nsseparator) > -1 ? notFound.split(o.nsseparator)[1] : notFound;
                                                                                                                       // 1239
                        if (foundValue !== notFoundValue) break;                                                       // 1240
                    }                                                                                                  // 1241
                }                                                                                                      // 1242
            } else {                                                                                                   // 1243
                found = _find(key, options); // fallback to default NS                                                 // 1244
            }                                                                                                          // 1245
        }                                                                                                              // 1246
                                                                                                                       // 1247
        return found;                                                                                                  // 1248
    }                                                                                                                  // 1249
    function detectLanguage() {                                                                                        // 1250
        var detectedLng;                                                                                               // 1251
                                                                                                                       // 1252
        // get from qs                                                                                                 // 1253
        var qsParm = [];                                                                                               // 1254
        if (typeof window !== 'undefined') {                                                                           // 1255
            (function() {                                                                                              // 1256
                var query = window.location.search.substring(1);                                                       // 1257
                var parms = query.split('&');                                                                          // 1258
                for (var i=0; i<parms.length; i++) {                                                                   // 1259
                    var pos = parms[i].indexOf('=');                                                                   // 1260
                    if (pos > 0) {                                                                                     // 1261
                        var key = parms[i].substring(0,pos);                                                           // 1262
                        var val = parms[i].substring(pos+1);                                                           // 1263
                        qsParm[key] = val;                                                                             // 1264
                    }                                                                                                  // 1265
                }                                                                                                      // 1266
            })();                                                                                                      // 1267
            if (qsParm[o.detectLngQS]) {                                                                               // 1268
                detectedLng = qsParm[o.detectLngQS];                                                                   // 1269
            }                                                                                                          // 1270
        }                                                                                                              // 1271
                                                                                                                       // 1272
        // get from cookie                                                                                             // 1273
        if (!detectedLng && typeof document !== 'undefined' && o.useCookie ) {                                         // 1274
            var c = f.cookie.read(o.cookieName);                                                                       // 1275
            if (c) detectedLng = c;                                                                                    // 1276
        }                                                                                                              // 1277
                                                                                                                       // 1278
        // get from navigator                                                                                          // 1279
        if (!detectedLng && typeof navigator !== 'undefined') {                                                        // 1280
            detectedLng =  (navigator.language) ? navigator.language : navigator.userLanguage;                         // 1281
        }                                                                                                              // 1282
                                                                                                                       // 1283
        return detectedLng;                                                                                            // 1284
    }                                                                                                                  // 1285
    var sync = {                                                                                                       // 1286
                                                                                                                       // 1287
        load: function(lngs, options, cb) {                                                                            // 1288
            if (options.useLocalStorage) {                                                                             // 1289
                sync._loadLocal(lngs, options, function(err, store) {                                                  // 1290
                    var missingLngs = [];                                                                              // 1291
                    for (var i = 0, len = lngs.length; i < len; i++) {                                                 // 1292
                        if (!store[lngs[i]]) missingLngs.push(lngs[i]);                                                // 1293
                    }                                                                                                  // 1294
                                                                                                                       // 1295
                    if (missingLngs.length > 0) {                                                                      // 1296
                        sync._fetch(missingLngs, options, function(err, fetched) {                                     // 1297
                            f.extend(store, fetched);                                                                  // 1298
                            sync._storeLocal(fetched);                                                                 // 1299
                                                                                                                       // 1300
                            cb(null, store);                                                                           // 1301
                        });                                                                                            // 1302
                    } else {                                                                                           // 1303
                        cb(null, store);                                                                               // 1304
                    }                                                                                                  // 1305
                });                                                                                                    // 1306
            } else {                                                                                                   // 1307
                sync._fetch(lngs, options, function(err, store){                                                       // 1308
                    cb(null, store);                                                                                   // 1309
                });                                                                                                    // 1310
            }                                                                                                          // 1311
        },                                                                                                             // 1312
                                                                                                                       // 1313
        _loadLocal: function(lngs, options, cb) {                                                                      // 1314
            var store = {}                                                                                             // 1315
              , nowMS = new Date().getTime();                                                                          // 1316
                                                                                                                       // 1317
            if(window.localStorage) {                                                                                  // 1318
                                                                                                                       // 1319
                var todo = lngs.length;                                                                                // 1320
                                                                                                                       // 1321
                f.each(lngs, function(key, lng) {                                                                      // 1322
                    var local = window.localStorage.getItem('res_' + lng);                                             // 1323
                                                                                                                       // 1324
                    if (local) {                                                                                       // 1325
                        local = JSON.parse(local);                                                                     // 1326
                                                                                                                       // 1327
                        if (local.i18nStamp && local.i18nStamp + options.localStorageExpirationTime > nowMS) {         // 1328
                            store[lng] = local;                                                                        // 1329
                        }                                                                                              // 1330
                    }                                                                                                  // 1331
                                                                                                                       // 1332
                    todo--; // wait for all done befor callback                                                        // 1333
                    if (todo === 0) cb(null, store);                                                                   // 1334
                });                                                                                                    // 1335
            }                                                                                                          // 1336
        },                                                                                                             // 1337
                                                                                                                       // 1338
        _storeLocal: function(store) {                                                                                 // 1339
            if(window.localStorage) {                                                                                  // 1340
                for (var m in store) {                                                                                 // 1341
                    store[m].i18nStamp = new Date().getTime();                                                         // 1342
                    window.localStorage.setItem('res_' + m, JSON.stringify(store[m]));                                 // 1343
                }                                                                                                      // 1344
            }                                                                                                          // 1345
            return;                                                                                                    // 1346
        },                                                                                                             // 1347
                                                                                                                       // 1348
        _fetch: function(lngs, options, cb) {                                                                          // 1349
            var ns = options.ns                                                                                        // 1350
              , store = {};                                                                                            // 1351
                                                                                                                       // 1352
            if (!options.dynamicLoad) {                                                                                // 1353
                var todo = ns.namespaces.length * lngs.length                                                          // 1354
                  , errors;                                                                                            // 1355
                                                                                                                       // 1356
                // load each file individual                                                                           // 1357
                f.each(ns.namespaces, function(nsIndex, nsValue) {                                                     // 1358
                    f.each(lngs, function(lngIndex, lngValue) {                                                        // 1359
                                                                                                                       // 1360
                        // Call this once our translation has returned.                                                // 1361
                        var loadComplete = function(err, data) {                                                       // 1362
                            if (err) {                                                                                 // 1363
                                errors = errors || [];                                                                 // 1364
                                errors.push(err);                                                                      // 1365
                            }                                                                                          // 1366
                            store[lngValue] = store[lngValue] || {};                                                   // 1367
                            store[lngValue][nsValue] = data;                                                           // 1368
                                                                                                                       // 1369
                            todo--; // wait for all done befor callback                                                // 1370
                            if (todo === 0) cb(errors, store);                                                         // 1371
                        };                                                                                             // 1372
                                                                                                                       // 1373
                        if(typeof options.customLoad == 'function'){                                                   // 1374
                            // Use the specified custom callback.                                                      // 1375
                            options.customLoad(lngValue, nsValue, options, loadComplete);                              // 1376
                        } else {                                                                                       // 1377
                            //~ // Use our inbuilt sync.                                                               // 1378
                            sync._fetchOne(lngValue, nsValue, options, loadComplete);                                  // 1379
                        }                                                                                              // 1380
                    });                                                                                                // 1381
                });                                                                                                    // 1382
            } else {                                                                                                   // 1383
                // Call this once our translation has returned.                                                        // 1384
                var loadComplete = function(err, data) {                                                               // 1385
                    cb(null, data);                                                                                    // 1386
                };                                                                                                     // 1387
                                                                                                                       // 1388
                if(typeof options.customLoad == 'function'){                                                           // 1389
                    // Use the specified custom callback.                                                              // 1390
                    options.customLoad(lngs, ns.namespaces, options, loadComplete);                                    // 1391
                } else {                                                                                               // 1392
                    var url = applyReplacement(options.resGetPath, { lng: lngs.join('+'), ns: ns.namespaces.join('+') });
                    // load all needed stuff once                                                                      // 1394
                    f.ajax({                                                                                           // 1395
                        url: url,                                                                                      // 1396
                        success: function(data, status, xhr) {                                                         // 1397
                            f.log('loaded: ' + url);                                                                   // 1398
                            loadComplete(null, data);                                                                  // 1399
                        },                                                                                             // 1400
                        error : function(xhr, status, error) {                                                         // 1401
                            f.log('failed loading: ' + url);                                                           // 1402
                            loadComplete('failed loading resource.json error: ' + error);                              // 1403
                        },                                                                                             // 1404
                        dataType: "json",                                                                              // 1405
                        async : options.getAsync                                                                       // 1406
                    });                                                                                                // 1407
                }                                                                                                      // 1408
            }                                                                                                          // 1409
        },                                                                                                             // 1410
                                                                                                                       // 1411
        _fetchOne: function(lng, ns, options, done) {                                                                  // 1412
            var url = applyReplacement(options.resGetPath, { lng: lng, ns: ns });                                      // 1413
            f.ajax({                                                                                                   // 1414
                url: url,                                                                                              // 1415
                success: function(data, status, xhr) {                                                                 // 1416
                    f.log('loaded: ' + url);                                                                           // 1417
                    done(null, data);                                                                                  // 1418
                },                                                                                                     // 1419
                error : function(xhr, status, error) {                                                                 // 1420
                    if ((status && status == 200) || (xhr && xhr.status && xhr.status == 200)) {                       // 1421
                        // file loaded but invalid json, stop waste time !                                             // 1422
                        f.log('There is a typo in: ' + url);                                                           // 1423
                    } else if ((status && status == 404) || (xhr && xhr.status && xhr.status == 404)) {                // 1424
                        f.log('Does not exist: ' + url);                                                               // 1425
                    } else {                                                                                           // 1426
                        var theStatus = status ? status : ((xhr && xhr.status) ? xhr.status : null);                   // 1427
                        f.log(theStatus + ' when loading ' + url);                                                     // 1428
                    }                                                                                                  // 1429
                                                                                                                       // 1430
                    done(error, {});                                                                                   // 1431
                },                                                                                                     // 1432
                dataType: "json",                                                                                      // 1433
                async : options.getAsync                                                                               // 1434
            });                                                                                                        // 1435
        },                                                                                                             // 1436
                                                                                                                       // 1437
        postMissing: function(lng, ns, key, defaultValue, lngs) {                                                      // 1438
            var payload = {};                                                                                          // 1439
            payload[key] = defaultValue;                                                                               // 1440
                                                                                                                       // 1441
            var urls = [];                                                                                             // 1442
                                                                                                                       // 1443
            if (o.sendMissingTo === 'fallback' && o.fallbackLng[0] !== false) {                                        // 1444
                for (var i = 0; i < o.fallbackLng.length; i++) {                                                       // 1445
                    urls.push({lng: o.fallbackLng[i], url: applyReplacement(o.resPostPath, { lng: o.fallbackLng[i], ns: ns })});
                }                                                                                                      // 1447
            } else if (o.sendMissingTo === 'current' || (o.sendMissingTo === 'fallback' && o.fallbackLng[0] === false) ) {
                urls.push({lng: lng, url: applyReplacement(o.resPostPath, { lng: lng, ns: ns })});                     // 1449
            } else if (o.sendMissingTo === 'all') {                                                                    // 1450
                for (var i = 0, l = lngs.length; i < l; i++) {                                                         // 1451
                    urls.push({lng: lngs[i], url: applyReplacement(o.resPostPath, { lng: lngs[i], ns: ns })});         // 1452
                }                                                                                                      // 1453
            }                                                                                                          // 1454
                                                                                                                       // 1455
            for (var y = 0, len = urls.length; y < len; y++) {                                                         // 1456
                var item = urls[y];                                                                                    // 1457
                f.ajax({                                                                                               // 1458
                    url: item.url,                                                                                     // 1459
                    type: o.sendType,                                                                                  // 1460
                    data: payload,                                                                                     // 1461
                    success: function(data, status, xhr) {                                                             // 1462
                        f.log('posted missing key \'' + key + '\' to: ' + item.url);                                   // 1463
                                                                                                                       // 1464
                        // add key to resStore                                                                         // 1465
                        var keys = key.split('.');                                                                     // 1466
                        var x = 0;                                                                                     // 1467
                        var value = resStore[item.lng][ns];                                                            // 1468
                        while (keys[x]) {                                                                              // 1469
                            if (x === keys.length - 1) {                                                               // 1470
                                value = value[keys[x]] = defaultValue;                                                 // 1471
                            } else {                                                                                   // 1472
                                value = value[keys[x]] = value[keys[x]] || {};                                         // 1473
                            }                                                                                          // 1474
                            x++;                                                                                       // 1475
                        }                                                                                              // 1476
                    },                                                                                                 // 1477
                    error : function(xhr, status, error) {                                                             // 1478
                        f.log('failed posting missing key \'' + key + '\' to: ' + item.url);                           // 1479
                    },                                                                                                 // 1480
                    dataType: "json",                                                                                  // 1481
                    async : o.postAsync                                                                                // 1482
                });                                                                                                    // 1483
            }                                                                                                          // 1484
        }                                                                                                              // 1485
    };                                                                                                                 // 1486
    // definition http://translate.sourceforge.net/wiki/l10n/pluralforms                                               // 1487
    var pluralExtensions = {                                                                                           // 1488
                                                                                                                       // 1489
        rules: {                                                                                                       // 1490
            "ach": {                                                                                                   // 1491
                "name": "Acholi",                                                                                      // 1492
                "numbers": [                                                                                           // 1493
                    1,                                                                                                 // 1494
                    2                                                                                                  // 1495
                ],                                                                                                     // 1496
                "plurals": function(n) { return Number(n > 1); }                                                       // 1497
            },                                                                                                         // 1498
            "af": {                                                                                                    // 1499
                "name": "Afrikaans",                                                                                   // 1500
                "numbers": [                                                                                           // 1501
                    1,                                                                                                 // 1502
                    2                                                                                                  // 1503
                ],                                                                                                     // 1504
                "plurals": function(n) { return Number(n != 1); }                                                      // 1505
            },                                                                                                         // 1506
            "ak": {                                                                                                    // 1507
                "name": "Akan",                                                                                        // 1508
                "numbers": [                                                                                           // 1509
                    1,                                                                                                 // 1510
                    2                                                                                                  // 1511
                ],                                                                                                     // 1512
                "plurals": function(n) { return Number(n > 1); }                                                       // 1513
            },                                                                                                         // 1514
            "am": {                                                                                                    // 1515
                "name": "Amharic",                                                                                     // 1516
                "numbers": [                                                                                           // 1517
                    1,                                                                                                 // 1518
                    2                                                                                                  // 1519
                ],                                                                                                     // 1520
                "plurals": function(n) { return Number(n > 1); }                                                       // 1521
            },                                                                                                         // 1522
            "an": {                                                                                                    // 1523
                "name": "Aragonese",                                                                                   // 1524
                "numbers": [                                                                                           // 1525
                    1,                                                                                                 // 1526
                    2                                                                                                  // 1527
                ],                                                                                                     // 1528
                "plurals": function(n) { return Number(n != 1); }                                                      // 1529
            },                                                                                                         // 1530
            "ar": {                                                                                                    // 1531
                "name": "Arabic",                                                                                      // 1532
                "numbers": [                                                                                           // 1533
                    0,                                                                                                 // 1534
                    1,                                                                                                 // 1535
                    2,                                                                                                 // 1536
                    3,                                                                                                 // 1537
                    11,                                                                                                // 1538
                    100                                                                                                // 1539
                ],                                                                                                     // 1540
                "plurals": function(n) { return Number(n===0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5); }
            },                                                                                                         // 1542
            "arn": {                                                                                                   // 1543
                "name": "Mapudungun",                                                                                  // 1544
                "numbers": [                                                                                           // 1545
                    1,                                                                                                 // 1546
                    2                                                                                                  // 1547
                ],                                                                                                     // 1548
                "plurals": function(n) { return Number(n > 1); }                                                       // 1549
            },                                                                                                         // 1550
            "ast": {                                                                                                   // 1551
                "name": "Asturian",                                                                                    // 1552
                "numbers": [                                                                                           // 1553
                    1,                                                                                                 // 1554
                    2                                                                                                  // 1555
                ],                                                                                                     // 1556
                "plurals": function(n) { return Number(n != 1); }                                                      // 1557
            },                                                                                                         // 1558
            "ay": {                                                                                                    // 1559
                "name": "Aymar\u00e1",                                                                                 // 1560
                "numbers": [                                                                                           // 1561
                    1                                                                                                  // 1562
                ],                                                                                                     // 1563
                "plurals": function(n) { return 0; }                                                                   // 1564
            },                                                                                                         // 1565
            "az": {                                                                                                    // 1566
                "name": "Azerbaijani",                                                                                 // 1567
                "numbers": [                                                                                           // 1568
                    1,                                                                                                 // 1569
                    2                                                                                                  // 1570
                ],                                                                                                     // 1571
                "plurals": function(n) { return Number(n != 1); }                                                      // 1572
            },                                                                                                         // 1573
            "be": {                                                                                                    // 1574
                "name": "Belarusian",                                                                                  // 1575
                "numbers": [                                                                                           // 1576
                    1,                                                                                                 // 1577
                    2,                                                                                                 // 1578
                    5                                                                                                  // 1579
                ],                                                                                                     // 1580
                "plurals": function(n) { return Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }
            },                                                                                                         // 1582
            "bg": {                                                                                                    // 1583
                "name": "Bulgarian",                                                                                   // 1584
                "numbers": [                                                                                           // 1585
                    1,                                                                                                 // 1586
                    2                                                                                                  // 1587
                ],                                                                                                     // 1588
                "plurals": function(n) { return Number(n != 1); }                                                      // 1589
            },                                                                                                         // 1590
            "bn": {                                                                                                    // 1591
                "name": "Bengali",                                                                                     // 1592
                "numbers": [                                                                                           // 1593
                    1,                                                                                                 // 1594
                    2                                                                                                  // 1595
                ],                                                                                                     // 1596
                "plurals": function(n) { return Number(n != 1); }                                                      // 1597
            },                                                                                                         // 1598
            "bo": {                                                                                                    // 1599
                "name": "Tibetan",                                                                                     // 1600
                "numbers": [                                                                                           // 1601
                    1                                                                                                  // 1602
                ],                                                                                                     // 1603
                "plurals": function(n) { return 0; }                                                                   // 1604
            },                                                                                                         // 1605
            "br": {                                                                                                    // 1606
                "name": "Breton",                                                                                      // 1607
                "numbers": [                                                                                           // 1608
                    1,                                                                                                 // 1609
                    2                                                                                                  // 1610
                ],                                                                                                     // 1611
                "plurals": function(n) { return Number(n > 1); }                                                       // 1612
            },                                                                                                         // 1613
            "bs": {                                                                                                    // 1614
                "name": "Bosnian",                                                                                     // 1615
                "numbers": [                                                                                           // 1616
                    1,                                                                                                 // 1617
                    2,                                                                                                 // 1618
                    5                                                                                                  // 1619
                ],                                                                                                     // 1620
                "plurals": function(n) { return Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }
            },                                                                                                         // 1622
            "ca": {                                                                                                    // 1623
                "name": "Catalan",                                                                                     // 1624
                "numbers": [                                                                                           // 1625
                    1,                                                                                                 // 1626
                    2                                                                                                  // 1627
                ],                                                                                                     // 1628
                "plurals": function(n) { return Number(n != 1); }                                                      // 1629
            },                                                                                                         // 1630
            "cgg": {                                                                                                   // 1631
                "name": "Chiga",                                                                                       // 1632
                "numbers": [                                                                                           // 1633
                    1                                                                                                  // 1634
                ],                                                                                                     // 1635
                "plurals": function(n) { return 0; }                                                                   // 1636
            },                                                                                                         // 1637
            "cs": {                                                                                                    // 1638
                "name": "Czech",                                                                                       // 1639
                "numbers": [                                                                                           // 1640
                    1,                                                                                                 // 1641
                    2,                                                                                                 // 1642
                    5                                                                                                  // 1643
                ],                                                                                                     // 1644
                "plurals": function(n) { return Number((n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2); }                         // 1645
            },                                                                                                         // 1646
            "csb": {                                                                                                   // 1647
                "name": "Kashubian",                                                                                   // 1648
                "numbers": [                                                                                           // 1649
                    1,                                                                                                 // 1650
                    2,                                                                                                 // 1651
                    5                                                                                                  // 1652
                ],                                                                                                     // 1653
                "plurals": function(n) { return Number(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }
            },                                                                                                         // 1655
            "cy": {                                                                                                    // 1656
                "name": "Welsh",                                                                                       // 1657
                "numbers": [                                                                                           // 1658
                    1,                                                                                                 // 1659
                    2,                                                                                                 // 1660
                    3,                                                                                                 // 1661
                    8                                                                                                  // 1662
                ],                                                                                                     // 1663
                "plurals": function(n) { return Number((n==1) ? 0 : (n==2) ? 1 : (n != 8 && n != 11) ? 2 : 3); }       // 1664
            },                                                                                                         // 1665
            "da": {                                                                                                    // 1666
                "name": "Danish",                                                                                      // 1667
                "numbers": [                                                                                           // 1668
                    1,                                                                                                 // 1669
                    2                                                                                                  // 1670
                ],                                                                                                     // 1671
                "plurals": function(n) { return Number(n != 1); }                                                      // 1672
            },                                                                                                         // 1673
            "de": {                                                                                                    // 1674
                "name": "German",                                                                                      // 1675
                "numbers": [                                                                                           // 1676
                    1,                                                                                                 // 1677
                    2                                                                                                  // 1678
                ],                                                                                                     // 1679
                "plurals": function(n) { return Number(n != 1); }                                                      // 1680
            },                                                                                                         // 1681
            "dz": {                                                                                                    // 1682
                "name": "Dzongkha",                                                                                    // 1683
                "numbers": [                                                                                           // 1684
                    1                                                                                                  // 1685
                ],                                                                                                     // 1686
                "plurals": function(n) { return 0; }                                                                   // 1687
            },                                                                                                         // 1688
            "el": {                                                                                                    // 1689
                "name": "Greek",                                                                                       // 1690
                "numbers": [                                                                                           // 1691
                    1,                                                                                                 // 1692
                    2                                                                                                  // 1693
                ],                                                                                                     // 1694
                "plurals": function(n) { return Number(n != 1); }                                                      // 1695
            },                                                                                                         // 1696
            "en": {                                                                                                    // 1697
                "name": "English",                                                                                     // 1698
                "numbers": [                                                                                           // 1699
                    1,                                                                                                 // 1700
                    2                                                                                                  // 1701
                ],                                                                                                     // 1702
                "plurals": function(n) { return Number(n != 1); }                                                      // 1703
            },                                                                                                         // 1704
            "eo": {                                                                                                    // 1705
                "name": "Esperanto",                                                                                   // 1706
                "numbers": [                                                                                           // 1707
                    1,                                                                                                 // 1708
                    2                                                                                                  // 1709
                ],                                                                                                     // 1710
                "plurals": function(n) { return Number(n != 1); }                                                      // 1711
            },                                                                                                         // 1712
            "es": {                                                                                                    // 1713
                "name": "Spanish",                                                                                     // 1714
                "numbers": [                                                                                           // 1715
                    1,                                                                                                 // 1716
                    2                                                                                                  // 1717
                ],                                                                                                     // 1718
                "plurals": function(n) { return Number(n != 1); }                                                      // 1719
            },                                                                                                         // 1720
            "es_ar": {                                                                                                 // 1721
                "name": "Argentinean Spanish",                                                                         // 1722
                "numbers": [                                                                                           // 1723
                    1,                                                                                                 // 1724
                    2                                                                                                  // 1725
                ],                                                                                                     // 1726
                "plurals": function(n) { return Number(n != 1); }                                                      // 1727
            },                                                                                                         // 1728
            "et": {                                                                                                    // 1729
                "name": "Estonian",                                                                                    // 1730
                "numbers": [                                                                                           // 1731
                    1,                                                                                                 // 1732
                    2                                                                                                  // 1733
                ],                                                                                                     // 1734
                "plurals": function(n) { return Number(n != 1); }                                                      // 1735
            },                                                                                                         // 1736
            "eu": {                                                                                                    // 1737
                "name": "Basque",                                                                                      // 1738
                "numbers": [                                                                                           // 1739
                    1,                                                                                                 // 1740
                    2                                                                                                  // 1741
                ],                                                                                                     // 1742
                "plurals": function(n) { return Number(n != 1); }                                                      // 1743
            },                                                                                                         // 1744
            "fa": {                                                                                                    // 1745
                "name": "Persian",                                                                                     // 1746
                "numbers": [                                                                                           // 1747
                    1                                                                                                  // 1748
                ],                                                                                                     // 1749
                "plurals": function(n) { return 0; }                                                                   // 1750
            },                                                                                                         // 1751
            "fi": {                                                                                                    // 1752
                "name": "Finnish",                                                                                     // 1753
                "numbers": [                                                                                           // 1754
                    1,                                                                                                 // 1755
                    2                                                                                                  // 1756
                ],                                                                                                     // 1757
                "plurals": function(n) { return Number(n != 1); }                                                      // 1758
            },                                                                                                         // 1759
            "fil": {                                                                                                   // 1760
                "name": "Filipino",                                                                                    // 1761
                "numbers": [                                                                                           // 1762
                    1,                                                                                                 // 1763
                    2                                                                                                  // 1764
                ],                                                                                                     // 1765
                "plurals": function(n) { return Number(n > 1); }                                                       // 1766
            },                                                                                                         // 1767
            "fo": {                                                                                                    // 1768
                "name": "Faroese",                                                                                     // 1769
                "numbers": [                                                                                           // 1770
                    1,                                                                                                 // 1771
                    2                                                                                                  // 1772
                ],                                                                                                     // 1773
                "plurals": function(n) { return Number(n != 1); }                                                      // 1774
            },                                                                                                         // 1775
            "fr": {                                                                                                    // 1776
                "name": "French",                                                                                      // 1777
                "numbers": [                                                                                           // 1778
                    1,                                                                                                 // 1779
                    2                                                                                                  // 1780
                ],                                                                                                     // 1781
                "plurals": function(n) { return Number(n > 1); }                                                       // 1782
            },                                                                                                         // 1783
            "fur": {                                                                                                   // 1784
                "name": "Friulian",                                                                                    // 1785
                "numbers": [                                                                                           // 1786
                    1,                                                                                                 // 1787
                    2                                                                                                  // 1788
                ],                                                                                                     // 1789
                "plurals": function(n) { return Number(n != 1); }                                                      // 1790
            },                                                                                                         // 1791
            "fy": {                                                                                                    // 1792
                "name": "Frisian",                                                                                     // 1793
                "numbers": [                                                                                           // 1794
                    1,                                                                                                 // 1795
                    2                                                                                                  // 1796
                ],                                                                                                     // 1797
                "plurals": function(n) { return Number(n != 1); }                                                      // 1798
            },                                                                                                         // 1799
            "ga": {                                                                                                    // 1800
                "name": "Irish",                                                                                       // 1801
                "numbers": [                                                                                           // 1802
                    1,                                                                                                 // 1803
                    2,                                                                                                 // 1804
                    3,                                                                                                 // 1805
                    7,                                                                                                 // 1806
                    11                                                                                                 // 1807
                ],                                                                                                     // 1808
                "plurals": function(n) { return Number(n==1 ? 0 : n==2 ? 1 : n<7 ? 2 : n<11 ? 3 : 4) ;}                // 1809
            },                                                                                                         // 1810
            "gd": {                                                                                                    // 1811
                "name": "Scottish Gaelic",                                                                             // 1812
                "numbers": [                                                                                           // 1813
                    1,                                                                                                 // 1814
                    2,                                                                                                 // 1815
                    3,                                                                                                 // 1816
                    20                                                                                                 // 1817
                ],                                                                                                     // 1818
                "plurals": function(n) { return Number((n==1 || n==11) ? 0 : (n==2 || n==12) ? 1 : (n > 2 && n < 20) ? 2 : 3); }
            },                                                                                                         // 1820
            "gl": {                                                                                                    // 1821
                "name": "Galician",                                                                                    // 1822
                "numbers": [                                                                                           // 1823
                    1,                                                                                                 // 1824
                    2                                                                                                  // 1825
                ],                                                                                                     // 1826
                "plurals": function(n) { return Number(n != 1); }                                                      // 1827
            },                                                                                                         // 1828
            "gu": {                                                                                                    // 1829
                "name": "Gujarati",                                                                                    // 1830
                "numbers": [                                                                                           // 1831
                    1,                                                                                                 // 1832
                    2                                                                                                  // 1833
                ],                                                                                                     // 1834
                "plurals": function(n) { return Number(n != 1); }                                                      // 1835
            },                                                                                                         // 1836
            "gun": {                                                                                                   // 1837
                "name": "Gun",                                                                                         // 1838
                "numbers": [                                                                                           // 1839
                    1,                                                                                                 // 1840
                    2                                                                                                  // 1841
                ],                                                                                                     // 1842
                "plurals": function(n) { return Number(n > 1); }                                                       // 1843
            },                                                                                                         // 1844
            "ha": {                                                                                                    // 1845
                "name": "Hausa",                                                                                       // 1846
                "numbers": [                                                                                           // 1847
                    1,                                                                                                 // 1848
                    2                                                                                                  // 1849
                ],                                                                                                     // 1850
                "plurals": function(n) { return Number(n != 1); }                                                      // 1851
            },                                                                                                         // 1852
            "he": {                                                                                                    // 1853
                "name": "Hebrew",                                                                                      // 1854
                "numbers": [                                                                                           // 1855
                    1,                                                                                                 // 1856
                    2                                                                                                  // 1857
                ],                                                                                                     // 1858
                "plurals": function(n) { return Number(n != 1); }                                                      // 1859
            },                                                                                                         // 1860
            "hi": {                                                                                                    // 1861
                "name": "Hindi",                                                                                       // 1862
                "numbers": [                                                                                           // 1863
                    1,                                                                                                 // 1864
                    2                                                                                                  // 1865
                ],                                                                                                     // 1866
                "plurals": function(n) { return Number(n != 1); }                                                      // 1867
            },                                                                                                         // 1868
            "hr": {                                                                                                    // 1869
                "name": "Croatian",                                                                                    // 1870
                "numbers": [                                                                                           // 1871
                    1,                                                                                                 // 1872
                    2,                                                                                                 // 1873
                    5                                                                                                  // 1874
                ],                                                                                                     // 1875
                "plurals": function(n) { return Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }
            },                                                                                                         // 1877
            "hu": {                                                                                                    // 1878
                "name": "Hungarian",                                                                                   // 1879
                "numbers": [                                                                                           // 1880
                    1,                                                                                                 // 1881
                    2                                                                                                  // 1882
                ],                                                                                                     // 1883
                "plurals": function(n) { return Number(n != 1); }                                                      // 1884
            },                                                                                                         // 1885
            "hy": {                                                                                                    // 1886
                "name": "Armenian",                                                                                    // 1887
                "numbers": [                                                                                           // 1888
                    1,                                                                                                 // 1889
                    2                                                                                                  // 1890
                ],                                                                                                     // 1891
                "plurals": function(n) { return Number(n != 1); }                                                      // 1892
            },                                                                                                         // 1893
            "ia": {                                                                                                    // 1894
                "name": "Interlingua",                                                                                 // 1895
                "numbers": [                                                                                           // 1896
                    1,                                                                                                 // 1897
                    2                                                                                                  // 1898
                ],                                                                                                     // 1899
                "plurals": function(n) { return Number(n != 1); }                                                      // 1900
            },                                                                                                         // 1901
            "id": {                                                                                                    // 1902
                "name": "Indonesian",                                                                                  // 1903
                "numbers": [                                                                                           // 1904
                    1                                                                                                  // 1905
                ],                                                                                                     // 1906
                "plurals": function(n) { return 0; }                                                                   // 1907
            },                                                                                                         // 1908
            "is": {                                                                                                    // 1909
                "name": "Icelandic",                                                                                   // 1910
                "numbers": [                                                                                           // 1911
                    1,                                                                                                 // 1912
                    2                                                                                                  // 1913
                ],                                                                                                     // 1914
                "plurals": function(n) { return Number(n%10!=1 || n%100==11); }                                        // 1915
            },                                                                                                         // 1916
            "it": {                                                                                                    // 1917
                "name": "Italian",                                                                                     // 1918
                "numbers": [                                                                                           // 1919
                    1,                                                                                                 // 1920
                    2                                                                                                  // 1921
                ],                                                                                                     // 1922
                "plurals": function(n) { return Number(n != 1); }                                                      // 1923
            },                                                                                                         // 1924
            "ja": {                                                                                                    // 1925
                "name": "Japanese",                                                                                    // 1926
                "numbers": [                                                                                           // 1927
                    1                                                                                                  // 1928
                ],                                                                                                     // 1929
                "plurals": function(n) { return 0; }                                                                   // 1930
            },                                                                                                         // 1931
            "jbo": {                                                                                                   // 1932
                "name": "Lojban",                                                                                      // 1933
                "numbers": [                                                                                           // 1934
                    1                                                                                                  // 1935
                ],                                                                                                     // 1936
                "plurals": function(n) { return 0; }                                                                   // 1937
            },                                                                                                         // 1938
            "jv": {                                                                                                    // 1939
                "name": "Javanese",                                                                                    // 1940
                "numbers": [                                                                                           // 1941
                    0,                                                                                                 // 1942
                    1                                                                                                  // 1943
                ],                                                                                                     // 1944
                "plurals": function(n) { return Number(n !== 0); }                                                     // 1945
            },                                                                                                         // 1946
            "ka": {                                                                                                    // 1947
                "name": "Georgian",                                                                                    // 1948
                "numbers": [                                                                                           // 1949
                    1                                                                                                  // 1950
                ],                                                                                                     // 1951
                "plurals": function(n) { return 0; }                                                                   // 1952
            },                                                                                                         // 1953
            "kk": {                                                                                                    // 1954
                "name": "Kazakh",                                                                                      // 1955
                "numbers": [                                                                                           // 1956
                    1                                                                                                  // 1957
                ],                                                                                                     // 1958
                "plurals": function(n) { return 0; }                                                                   // 1959
            },                                                                                                         // 1960
            "km": {                                                                                                    // 1961
                "name": "Khmer",                                                                                       // 1962
                "numbers": [                                                                                           // 1963
                    1                                                                                                  // 1964
                ],                                                                                                     // 1965
                "plurals": function(n) { return 0; }                                                                   // 1966
            },                                                                                                         // 1967
            "kn": {                                                                                                    // 1968
                "name": "Kannada",                                                                                     // 1969
                "numbers": [                                                                                           // 1970
                    1,                                                                                                 // 1971
                    2                                                                                                  // 1972
                ],                                                                                                     // 1973
                "plurals": function(n) { return Number(n != 1); }                                                      // 1974
            },                                                                                                         // 1975
            "ko": {                                                                                                    // 1976
                "name": "Korean",                                                                                      // 1977
                "numbers": [                                                                                           // 1978
                    1                                                                                                  // 1979
                ],                                                                                                     // 1980
                "plurals": function(n) { return 0; }                                                                   // 1981
            },                                                                                                         // 1982
            "ku": {                                                                                                    // 1983
                "name": "Kurdish",                                                                                     // 1984
                "numbers": [                                                                                           // 1985
                    1,                                                                                                 // 1986
                    2                                                                                                  // 1987
                ],                                                                                                     // 1988
                "plurals": function(n) { return Number(n != 1); }                                                      // 1989
            },                                                                                                         // 1990
            "kw": {                                                                                                    // 1991
                "name": "Cornish",                                                                                     // 1992
                "numbers": [                                                                                           // 1993
                    1,                                                                                                 // 1994
                    2,                                                                                                 // 1995
                    3,                                                                                                 // 1996
                    4                                                                                                  // 1997
                ],                                                                                                     // 1998
                "plurals": function(n) { return Number((n==1) ? 0 : (n==2) ? 1 : (n == 3) ? 2 : 3); }                  // 1999
            },                                                                                                         // 2000
            "ky": {                                                                                                    // 2001
                "name": "Kyrgyz",                                                                                      // 2002
                "numbers": [                                                                                           // 2003
                    1                                                                                                  // 2004
                ],                                                                                                     // 2005
                "plurals": function(n) { return 0; }                                                                   // 2006
            },                                                                                                         // 2007
            "lb": {                                                                                                    // 2008
                "name": "Letzeburgesch",                                                                               // 2009
                "numbers": [                                                                                           // 2010
                    1,                                                                                                 // 2011
                    2                                                                                                  // 2012
                ],                                                                                                     // 2013
                "plurals": function(n) { return Number(n != 1); }                                                      // 2014
            },                                                                                                         // 2015
            "ln": {                                                                                                    // 2016
                "name": "Lingala",                                                                                     // 2017
                "numbers": [                                                                                           // 2018
                    1,                                                                                                 // 2019
                    2                                                                                                  // 2020
                ],                                                                                                     // 2021
                "plurals": function(n) { return Number(n > 1); }                                                       // 2022
            },                                                                                                         // 2023
            "lo": {                                                                                                    // 2024
                "name": "Lao",                                                                                         // 2025
                "numbers": [                                                                                           // 2026
                    1                                                                                                  // 2027
                ],                                                                                                     // 2028
                "plurals": function(n) { return 0; }                                                                   // 2029
            },                                                                                                         // 2030
            "lt": {                                                                                                    // 2031
                "name": "Lithuanian",                                                                                  // 2032
                "numbers": [                                                                                           // 2033
                    1,                                                                                                 // 2034
                    2,                                                                                                 // 2035
                    10                                                                                                 // 2036
                ],                                                                                                     // 2037
                "plurals": function(n) { return Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && (n%100<10 || n%100>=20) ? 1 : 2); }
            },                                                                                                         // 2039
            "lv": {                                                                                                    // 2040
                "name": "Latvian",                                                                                     // 2041
                "numbers": [                                                                                           // 2042
                    1,                                                                                                 // 2043
                    2,                                                                                                 // 2044
                    0                                                                                                  // 2045
                ],                                                                                                     // 2046
                "plurals": function(n) { return Number(n%10==1 && n%100!=11 ? 0 : n !== 0 ? 1 : 2); }                  // 2047
            },                                                                                                         // 2048
            "mai": {                                                                                                   // 2049
                "name": "Maithili",                                                                                    // 2050
                "numbers": [                                                                                           // 2051
                    1,                                                                                                 // 2052
                    2                                                                                                  // 2053
                ],                                                                                                     // 2054
                "plurals": function(n) { return Number(n != 1); }                                                      // 2055
            },                                                                                                         // 2056
            "mfe": {                                                                                                   // 2057
                "name": "Mauritian Creole",                                                                            // 2058
                "numbers": [                                                                                           // 2059
                    1,                                                                                                 // 2060
                    2                                                                                                  // 2061
                ],                                                                                                     // 2062
                "plurals": function(n) { return Number(n > 1); }                                                       // 2063
            },                                                                                                         // 2064
            "mg": {                                                                                                    // 2065
                "name": "Malagasy",                                                                                    // 2066
                "numbers": [                                                                                           // 2067
                    1,                                                                                                 // 2068
                    2                                                                                                  // 2069
                ],                                                                                                     // 2070
                "plurals": function(n) { return Number(n > 1); }                                                       // 2071
            },                                                                                                         // 2072
            "mi": {                                                                                                    // 2073
                "name": "Maori",                                                                                       // 2074
                "numbers": [                                                                                           // 2075
                    1,                                                                                                 // 2076
                    2                                                                                                  // 2077
                ],                                                                                                     // 2078
                "plurals": function(n) { return Number(n > 1); }                                                       // 2079
            },                                                                                                         // 2080
            "mk": {                                                                                                    // 2081
                "name": "Macedonian",                                                                                  // 2082
                "numbers": [                                                                                           // 2083
                    1,                                                                                                 // 2084
                    2                                                                                                  // 2085
                ],                                                                                                     // 2086
                "plurals": function(n) { return Number(n==1 || n%10==1 ? 0 : 1); }                                     // 2087
            },                                                                                                         // 2088
            "ml": {                                                                                                    // 2089
                "name": "Malayalam",                                                                                   // 2090
                "numbers": [                                                                                           // 2091
                    1,                                                                                                 // 2092
                    2                                                                                                  // 2093
                ],                                                                                                     // 2094
                "plurals": function(n) { return Number(n != 1); }                                                      // 2095
            },                                                                                                         // 2096
            "mn": {                                                                                                    // 2097
                "name": "Mongolian",                                                                                   // 2098
                "numbers": [                                                                                           // 2099
                    1,                                                                                                 // 2100
                    2                                                                                                  // 2101
                ],                                                                                                     // 2102
                "plurals": function(n) { return Number(n != 1); }                                                      // 2103
            },                                                                                                         // 2104
            "mnk": {                                                                                                   // 2105
                "name": "Mandinka",                                                                                    // 2106
                "numbers": [                                                                                           // 2107
                    0,                                                                                                 // 2108
                    1,                                                                                                 // 2109
                    2                                                                                                  // 2110
                ],                                                                                                     // 2111
                "plurals": function(n) { return Number(0 ? 0 : n==1 ? 1 : 2); }                                        // 2112
            },                                                                                                         // 2113
            "mr": {                                                                                                    // 2114
                "name": "Marathi",                                                                                     // 2115
                "numbers": [                                                                                           // 2116
                    1,                                                                                                 // 2117
                    2                                                                                                  // 2118
                ],                                                                                                     // 2119
                "plurals": function(n) { return Number(n != 1); }                                                      // 2120
            },                                                                                                         // 2121
            "ms": {                                                                                                    // 2122
                "name": "Malay",                                                                                       // 2123
                "numbers": [                                                                                           // 2124
                    1                                                                                                  // 2125
                ],                                                                                                     // 2126
                "plurals": function(n) { return 0; }                                                                   // 2127
            },                                                                                                         // 2128
            "mt": {                                                                                                    // 2129
                "name": "Maltese",                                                                                     // 2130
                "numbers": [                                                                                           // 2131
                    1,                                                                                                 // 2132
                    2,                                                                                                 // 2133
                    11,                                                                                                // 2134
                    20                                                                                                 // 2135
                ],                                                                                                     // 2136
                "plurals": function(n) { return Number(n==1 ? 0 : n===0 || ( n%100>1 && n%100<11) ? 1 : (n%100>10 && n%100<20 ) ? 2 : 3); }
            },                                                                                                         // 2138
            "nah": {                                                                                                   // 2139
                "name": "Nahuatl",                                                                                     // 2140
                "numbers": [                                                                                           // 2141
                    1,                                                                                                 // 2142
                    2                                                                                                  // 2143
                ],                                                                                                     // 2144
                "plurals": function(n) { return Number(n != 1); }                                                      // 2145
            },                                                                                                         // 2146
            "nap": {                                                                                                   // 2147
                "name": "Neapolitan",                                                                                  // 2148
                "numbers": [                                                                                           // 2149
                    1,                                                                                                 // 2150
                    2                                                                                                  // 2151
                ],                                                                                                     // 2152
                "plurals": function(n) { return Number(n != 1); }                                                      // 2153
            },                                                                                                         // 2154
            "nb": {                                                                                                    // 2155
                "name": "Norwegian Bokmal",                                                                            // 2156
                "numbers": [                                                                                           // 2157
                    1,                                                                                                 // 2158
                    2                                                                                                  // 2159
                ],                                                                                                     // 2160
                "plurals": function(n) { return Number(n != 1); }                                                      // 2161
            },                                                                                                         // 2162
            "ne": {                                                                                                    // 2163
                "name": "Nepali",                                                                                      // 2164
                "numbers": [                                                                                           // 2165
                    1,                                                                                                 // 2166
                    2                                                                                                  // 2167
                ],                                                                                                     // 2168
                "plurals": function(n) { return Number(n != 1); }                                                      // 2169
            },                                                                                                         // 2170
            "nl": {                                                                                                    // 2171
                "name": "Dutch",                                                                                       // 2172
                "numbers": [                                                                                           // 2173
                    1,                                                                                                 // 2174
                    2                                                                                                  // 2175
                ],                                                                                                     // 2176
                "plurals": function(n) { return Number(n != 1); }                                                      // 2177
            },                                                                                                         // 2178
            "nn": {                                                                                                    // 2179
                "name": "Norwegian Nynorsk",                                                                           // 2180
                "numbers": [                                                                                           // 2181
                    1,                                                                                                 // 2182
                    2                                                                                                  // 2183
                ],                                                                                                     // 2184
                "plurals": function(n) { return Number(n != 1); }                                                      // 2185
            },                                                                                                         // 2186
            "no": {                                                                                                    // 2187
                "name": "Norwegian",                                                                                   // 2188
                "numbers": [                                                                                           // 2189
                    1,                                                                                                 // 2190
                    2                                                                                                  // 2191
                ],                                                                                                     // 2192
                "plurals": function(n) { return Number(n != 1); }                                                      // 2193
            },                                                                                                         // 2194
            "nso": {                                                                                                   // 2195
                "name": "Northern Sotho",                                                                              // 2196
                "numbers": [                                                                                           // 2197
                    1,                                                                                                 // 2198
                    2                                                                                                  // 2199
                ],                                                                                                     // 2200
                "plurals": function(n) { return Number(n != 1); }                                                      // 2201
            },                                                                                                         // 2202
            "oc": {                                                                                                    // 2203
                "name": "Occitan",                                                                                     // 2204
                "numbers": [                                                                                           // 2205
                    1,                                                                                                 // 2206
                    2                                                                                                  // 2207
                ],                                                                                                     // 2208
                "plurals": function(n) { return Number(n > 1); }                                                       // 2209
            },                                                                                                         // 2210
            "or": {                                                                                                    // 2211
                "name": "Oriya",                                                                                       // 2212
                "numbers": [                                                                                           // 2213
                    2,                                                                                                 // 2214
                    1                                                                                                  // 2215
                ],                                                                                                     // 2216
                "plurals": function(n) { return Number(n != 1); }                                                      // 2217
            },                                                                                                         // 2218
            "pa": {                                                                                                    // 2219
                "name": "Punjabi",                                                                                     // 2220
                "numbers": [                                                                                           // 2221
                    1,                                                                                                 // 2222
                    2                                                                                                  // 2223
                ],                                                                                                     // 2224
                "plurals": function(n) { return Number(n != 1); }                                                      // 2225
            },                                                                                                         // 2226
            "pap": {                                                                                                   // 2227
                "name": "Papiamento",                                                                                  // 2228
                "numbers": [                                                                                           // 2229
                    1,                                                                                                 // 2230
                    2                                                                                                  // 2231
                ],                                                                                                     // 2232
                "plurals": function(n) { return Number(n != 1); }                                                      // 2233
            },                                                                                                         // 2234
            "pl": {                                                                                                    // 2235
                "name": "Polish",                                                                                      // 2236
                "numbers": [                                                                                           // 2237
                    1,                                                                                                 // 2238
                    2,                                                                                                 // 2239
                    5                                                                                                  // 2240
                ],                                                                                                     // 2241
                "plurals": function(n) { return Number(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }
            },                                                                                                         // 2243
            "pms": {                                                                                                   // 2244
                "name": "Piemontese",                                                                                  // 2245
                "numbers": [                                                                                           // 2246
                    1,                                                                                                 // 2247
                    2                                                                                                  // 2248
                ],                                                                                                     // 2249
                "plurals": function(n) { return Number(n != 1); }                                                      // 2250
            },                                                                                                         // 2251
            "ps": {                                                                                                    // 2252
                "name": "Pashto",                                                                                      // 2253
                "numbers": [                                                                                           // 2254
                    1,                                                                                                 // 2255
                    2                                                                                                  // 2256
                ],                                                                                                     // 2257
                "plurals": function(n) { return Number(n != 1); }                                                      // 2258
            },                                                                                                         // 2259
            "pt": {                                                                                                    // 2260
                "name": "Portuguese",                                                                                  // 2261
                "numbers": [                                                                                           // 2262
                    1,                                                                                                 // 2263
                    2                                                                                                  // 2264
                ],                                                                                                     // 2265
                "plurals": function(n) { return Number(n != 1); }                                                      // 2266
            },                                                                                                         // 2267
            "pt_br": {                                                                                                 // 2268
                "name": "Brazilian Portuguese",                                                                        // 2269
                "numbers": [                                                                                           // 2270
                    1,                                                                                                 // 2271
                    2                                                                                                  // 2272
                ],                                                                                                     // 2273
                "plurals": function(n) { return Number(n != 1); }                                                      // 2274
            },                                                                                                         // 2275
            "rm": {                                                                                                    // 2276
                "name": "Romansh",                                                                                     // 2277
                "numbers": [                                                                                           // 2278
                    1,                                                                                                 // 2279
                    2                                                                                                  // 2280
                ],                                                                                                     // 2281
                "plurals": function(n) { return Number(n != 1); }                                                      // 2282
            },                                                                                                         // 2283
            "ro": {                                                                                                    // 2284
                "name": "Romanian",                                                                                    // 2285
                "numbers": [                                                                                           // 2286
                    1,                                                                                                 // 2287
                    2,                                                                                                 // 2288
                    20                                                                                                 // 2289
                ],                                                                                                     // 2290
                "plurals": function(n) { return Number(n==1 ? 0 : (n===0 || (n%100 > 0 && n%100 < 20)) ? 1 : 2); }     // 2291
            },                                                                                                         // 2292
            "ru": {                                                                                                    // 2293
                "name": "Russian",                                                                                     // 2294
                "numbers": [                                                                                           // 2295
                    1,                                                                                                 // 2296
                    2,                                                                                                 // 2297
                    5                                                                                                  // 2298
                ],                                                                                                     // 2299
                "plurals": function(n) { return Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }
            },                                                                                                         // 2301
            "sah": {                                                                                                   // 2302
                "name": "Yakut",                                                                                       // 2303
                "numbers": [                                                                                           // 2304
                    1                                                                                                  // 2305
                ],                                                                                                     // 2306
                "plurals": function(n) { return 0; }                                                                   // 2307
            },                                                                                                         // 2308
            "sco": {                                                                                                   // 2309
                "name": "Scots",                                                                                       // 2310
                "numbers": [                                                                                           // 2311
                    1,                                                                                                 // 2312
                    2                                                                                                  // 2313
                ],                                                                                                     // 2314
                "plurals": function(n) { return Number(n != 1); }                                                      // 2315
            },                                                                                                         // 2316
            "se": {                                                                                                    // 2317
                "name": "Northern Sami",                                                                               // 2318
                "numbers": [                                                                                           // 2319
                    1,                                                                                                 // 2320
                    2                                                                                                  // 2321
                ],                                                                                                     // 2322
                "plurals": function(n) { return Number(n != 1); }                                                      // 2323
            },                                                                                                         // 2324
            "si": {                                                                                                    // 2325
                "name": "Sinhala",                                                                                     // 2326
                "numbers": [                                                                                           // 2327
                    1,                                                                                                 // 2328
                    2                                                                                                  // 2329
                ],                                                                                                     // 2330
                "plurals": function(n) { return Number(n != 1); }                                                      // 2331
            },                                                                                                         // 2332
            "sk": {                                                                                                    // 2333
                "name": "Slovak",                                                                                      // 2334
                "numbers": [                                                                                           // 2335
                    1,                                                                                                 // 2336
                    2,                                                                                                 // 2337
                    5                                                                                                  // 2338
                ],                                                                                                     // 2339
                "plurals": function(n) { return Number((n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2); }                         // 2340
            },                                                                                                         // 2341
            "sl": {                                                                                                    // 2342
                "name": "Slovenian",                                                                                   // 2343
                "numbers": [                                                                                           // 2344
                    5,                                                                                                 // 2345
                    1,                                                                                                 // 2346
                    2,                                                                                                 // 2347
                    3                                                                                                  // 2348
                ],                                                                                                     // 2349
                "plurals": function(n) { return Number(n%100==1 ? 1 : n%100==2 ? 2 : n%100==3 || n%100==4 ? 3 : 0); }  // 2350
            },                                                                                                         // 2351
            "so": {                                                                                                    // 2352
                "name": "Somali",                                                                                      // 2353
                "numbers": [                                                                                           // 2354
                    1,                                                                                                 // 2355
                    2                                                                                                  // 2356
                ],                                                                                                     // 2357
                "plurals": function(n) { return Number(n != 1); }                                                      // 2358
            },                                                                                                         // 2359
            "son": {                                                                                                   // 2360
                "name": "Songhay",                                                                                     // 2361
                "numbers": [                                                                                           // 2362
                    1,                                                                                                 // 2363
                    2                                                                                                  // 2364
                ],                                                                                                     // 2365
                "plurals": function(n) { return Number(n != 1); }                                                      // 2366
            },                                                                                                         // 2367
            "sq": {                                                                                                    // 2368
                "name": "Albanian",                                                                                    // 2369
                "numbers": [                                                                                           // 2370
                    1,                                                                                                 // 2371
                    2                                                                                                  // 2372
                ],                                                                                                     // 2373
                "plurals": function(n) { return Number(n != 1); }                                                      // 2374
            },                                                                                                         // 2375
            "sr": {                                                                                                    // 2376
                "name": "Serbian",                                                                                     // 2377
                "numbers": [                                                                                           // 2378
                    1,                                                                                                 // 2379
                    2,                                                                                                 // 2380
                    5                                                                                                  // 2381
                ],                                                                                                     // 2382
                "plurals": function(n) { return Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }
            },                                                                                                         // 2384
            "su": {                                                                                                    // 2385
                "name": "Sundanese",                                                                                   // 2386
                "numbers": [                                                                                           // 2387
                    1                                                                                                  // 2388
                ],                                                                                                     // 2389
                "plurals": function(n) { return 0; }                                                                   // 2390
            },                                                                                                         // 2391
            "sv": {                                                                                                    // 2392
                "name": "Swedish",                                                                                     // 2393
                "numbers": [                                                                                           // 2394
                    1,                                                                                                 // 2395
                    2                                                                                                  // 2396
                ],                                                                                                     // 2397
                "plurals": function(n) { return Number(n != 1); }                                                      // 2398
            },                                                                                                         // 2399
            "sw": {                                                                                                    // 2400
                "name": "Swahili",                                                                                     // 2401
                "numbers": [                                                                                           // 2402
                    1,                                                                                                 // 2403
                    2                                                                                                  // 2404
                ],                                                                                                     // 2405
                "plurals": function(n) { return Number(n != 1); }                                                      // 2406
            },                                                                                                         // 2407
            "ta": {                                                                                                    // 2408
                "name": "Tamil",                                                                                       // 2409
                "numbers": [                                                                                           // 2410
                    1,                                                                                                 // 2411
                    2                                                                                                  // 2412
                ],                                                                                                     // 2413
                "plurals": function(n) { return Number(n != 1); }                                                      // 2414
            },                                                                                                         // 2415
            "te": {                                                                                                    // 2416
                "name": "Telugu",                                                                                      // 2417
                "numbers": [                                                                                           // 2418
                    1,                                                                                                 // 2419
                    2                                                                                                  // 2420
                ],                                                                                                     // 2421
                "plurals": function(n) { return Number(n != 1); }                                                      // 2422
            },                                                                                                         // 2423
            "tg": {                                                                                                    // 2424
                "name": "Tajik",                                                                                       // 2425
                "numbers": [                                                                                           // 2426
                    1,                                                                                                 // 2427
                    2                                                                                                  // 2428
                ],                                                                                                     // 2429
                "plurals": function(n) { return Number(n > 1); }                                                       // 2430
            },                                                                                                         // 2431
            "th": {                                                                                                    // 2432
                "name": "Thai",                                                                                        // 2433
                "numbers": [                                                                                           // 2434
                    1                                                                                                  // 2435
                ],                                                                                                     // 2436
                "plurals": function(n) { return 0; }                                                                   // 2437
            },                                                                                                         // 2438
            "ti": {                                                                                                    // 2439
                "name": "Tigrinya",                                                                                    // 2440
                "numbers": [                                                                                           // 2441
                    1,                                                                                                 // 2442
                    2                                                                                                  // 2443
                ],                                                                                                     // 2444
                "plurals": function(n) { return Number(n > 1); }                                                       // 2445
            },                                                                                                         // 2446
            "tk": {                                                                                                    // 2447
                "name": "Turkmen",                                                                                     // 2448
                "numbers": [                                                                                           // 2449
                    1,                                                                                                 // 2450
                    2                                                                                                  // 2451
                ],                                                                                                     // 2452
                "plurals": function(n) { return Number(n != 1); }                                                      // 2453
            },                                                                                                         // 2454
            "tr": {                                                                                                    // 2455
                "name": "Turkish",                                                                                     // 2456
                "numbers": [                                                                                           // 2457
                    1,                                                                                                 // 2458
                    2                                                                                                  // 2459
                ],                                                                                                     // 2460
                "plurals": function(n) { return Number(n > 1); }                                                       // 2461
            },                                                                                                         // 2462
            "tt": {                                                                                                    // 2463
                "name": "Tatar",                                                                                       // 2464
                "numbers": [                                                                                           // 2465
                    1                                                                                                  // 2466
                ],                                                                                                     // 2467
                "plurals": function(n) { return 0; }                                                                   // 2468
            },                                                                                                         // 2469
            "ug": {                                                                                                    // 2470
                "name": "Uyghur",                                                                                      // 2471
                "numbers": [                                                                                           // 2472
                    1                                                                                                  // 2473
                ],                                                                                                     // 2474
                "plurals": function(n) { return 0; }                                                                   // 2475
            },                                                                                                         // 2476
            "uk": {                                                                                                    // 2477
                "name": "Ukrainian",                                                                                   // 2478
                "numbers": [                                                                                           // 2479
                    1,                                                                                                 // 2480
                    2,                                                                                                 // 2481
                    5                                                                                                  // 2482
                ],                                                                                                     // 2483
                "plurals": function(n) { return Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }
            },                                                                                                         // 2485
            "ur": {                                                                                                    // 2486
                "name": "Urdu",                                                                                        // 2487
                "numbers": [                                                                                           // 2488
                    1,                                                                                                 // 2489
                    2                                                                                                  // 2490
                ],                                                                                                     // 2491
                "plurals": function(n) { return Number(n != 1); }                                                      // 2492
            },                                                                                                         // 2493
            "uz": {                                                                                                    // 2494
                "name": "Uzbek",                                                                                       // 2495
                "numbers": [                                                                                           // 2496
                    1,                                                                                                 // 2497
                    2                                                                                                  // 2498
                ],                                                                                                     // 2499
                "plurals": function(n) { return Number(n > 1); }                                                       // 2500
            },                                                                                                         // 2501
            "vi": {                                                                                                    // 2502
                "name": "Vietnamese",                                                                                  // 2503
                "numbers": [                                                                                           // 2504
                    1                                                                                                  // 2505
                ],                                                                                                     // 2506
                "plurals": function(n) { return 0; }                                                                   // 2507
            },                                                                                                         // 2508
            "wa": {                                                                                                    // 2509
                "name": "Walloon",                                                                                     // 2510
                "numbers": [                                                                                           // 2511
                    1,                                                                                                 // 2512
                    2                                                                                                  // 2513
                ],                                                                                                     // 2514
                "plurals": function(n) { return Number(n > 1); }                                                       // 2515
            },                                                                                                         // 2516
            "wo": {                                                                                                    // 2517
                "name": "Wolof",                                                                                       // 2518
                "numbers": [                                                                                           // 2519
                    1                                                                                                  // 2520
                ],                                                                                                     // 2521
                "plurals": function(n) { return 0; }                                                                   // 2522
            },                                                                                                         // 2523
            "yo": {                                                                                                    // 2524
                "name": "Yoruba",                                                                                      // 2525
                "numbers": [                                                                                           // 2526
                    1,                                                                                                 // 2527
                    2                                                                                                  // 2528
                ],                                                                                                     // 2529
                "plurals": function(n) { return Number(n != 1); }                                                      // 2530
            },                                                                                                         // 2531
            "zh": {                                                                                                    // 2532
                "name": "Chinese",                                                                                     // 2533
                "numbers": [                                                                                           // 2534
                    1                                                                                                  // 2535
                ],                                                                                                     // 2536
                "plurals": function(n) { return 0; }                                                                   // 2537
            }                                                                                                          // 2538
        },                                                                                                             // 2539
                                                                                                                       // 2540
        // for demonstration only sl and ar is added but you can add your own pluralExtensions                         // 2541
        addRule: function(lng, obj) {                                                                                  // 2542
            pluralExtensions.rules[lng] = obj;                                                                         // 2543
        },                                                                                                             // 2544
                                                                                                                       // 2545
        setCurrentLng: function(lng) {                                                                                 // 2546
            if (!pluralExtensions.currentRule || pluralExtensions.currentRule.lng !== lng) {                           // 2547
                var parts = lng.split('-');                                                                            // 2548
                                                                                                                       // 2549
                pluralExtensions.currentRule = {                                                                       // 2550
                    lng: lng,                                                                                          // 2551
                    rule: pluralExtensions.rules[parts[0]]                                                             // 2552
                };                                                                                                     // 2553
            }                                                                                                          // 2554
        },                                                                                                             // 2555
                                                                                                                       // 2556
        get: function(lng, count) {                                                                                    // 2557
            var parts = lng.split('-');                                                                                // 2558
                                                                                                                       // 2559
            function getResult(l, c) {                                                                                 // 2560
                var ext;                                                                                               // 2561
                if (pluralExtensions.currentRule && pluralExtensions.currentRule.lng === lng) {                        // 2562
                    ext = pluralExtensions.currentRule.rule;                                                           // 2563
                } else {                                                                                               // 2564
                    ext = pluralExtensions.rules[l];                                                                   // 2565
                }                                                                                                      // 2566
                if (ext) {                                                                                             // 2567
                    var i = ext.plurals(c);                                                                            // 2568
                    var number = ext.numbers[i];                                                                       // 2569
                    if (ext.numbers.length === 2 && ext.numbers[0] === 1) {                                            // 2570
                        if (number === 2) {                                                                            // 2571
                            number = -1; // regular plural                                                             // 2572
                        } else if (number === 1) {                                                                     // 2573
                            number = 1; // singular                                                                    // 2574
                        }                                                                                              // 2575
                    }//console.log(count + '-' + number);                                                              // 2576
                    return number;                                                                                     // 2577
                } else {                                                                                               // 2578
                    return c === 1 ? '1' : '-1';                                                                       // 2579
                }                                                                                                      // 2580
            }                                                                                                          // 2581
                                                                                                                       // 2582
            return getResult(parts[0], count);                                                                         // 2583
        }                                                                                                              // 2584
                                                                                                                       // 2585
    };                                                                                                                 // 2586
    var postProcessors = {};                                                                                           // 2587
    var addPostProcessor = function(name, fc) {                                                                        // 2588
        postProcessors[name] = fc;                                                                                     // 2589
    };                                                                                                                 // 2590
    // sprintf support                                                                                                 // 2591
    var sprintf = (function() {                                                                                        // 2592
        function get_type(variable) {                                                                                  // 2593
            return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();                                // 2594
        }                                                                                                              // 2595
        function str_repeat(input, multiplier) {                                                                       // 2596
            for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}                     // 2597
            return output.join('');                                                                                    // 2598
        }                                                                                                              // 2599
                                                                                                                       // 2600
        var str_format = function() {                                                                                  // 2601
            if (!str_format.cache.hasOwnProperty(arguments[0])) {                                                      // 2602
                str_format.cache[arguments[0]] = str_format.parse(arguments[0]);                                       // 2603
            }                                                                                                          // 2604
            return str_format.format.call(null, str_format.cache[arguments[0]], arguments);                            // 2605
        };                                                                                                             // 2606
                                                                                                                       // 2607
        str_format.format = function(parse_tree, argv) {                                                               // 2608
            var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
            for (i = 0; i < tree_length; i++) {                                                                        // 2610
                node_type = get_type(parse_tree[i]);                                                                   // 2611
                if (node_type === 'string') {                                                                          // 2612
                    output.push(parse_tree[i]);                                                                        // 2613
                }                                                                                                      // 2614
                else if (node_type === 'array') {                                                                      // 2615
                    match = parse_tree[i]; // convenience purposes only                                                // 2616
                    if (match[2]) { // keyword argument                                                                // 2617
                        arg = argv[cursor];                                                                            // 2618
                        for (k = 0; k < match[2].length; k++) {                                                        // 2619
                            if (!arg.hasOwnProperty(match[2][k])) {                                                    // 2620
                                throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));                 // 2621
                            }                                                                                          // 2622
                            arg = arg[match[2][k]];                                                                    // 2623
                        }                                                                                              // 2624
                    }                                                                                                  // 2625
                    else if (match[1]) { // positional argument (explicit)                                             // 2626
                        arg = argv[match[1]];                                                                          // 2627
                    }                                                                                                  // 2628
                    else { // positional argument (implicit)                                                           // 2629
                        arg = argv[cursor++];                                                                          // 2630
                    }                                                                                                  // 2631
                                                                                                                       // 2632
                    if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {                                        // 2633
                        throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));                      // 2634
                    }                                                                                                  // 2635
                    switch (match[8]) {                                                                                // 2636
                        case 'b': arg = arg.toString(2); break;                                                        // 2637
                        case 'c': arg = String.fromCharCode(arg); break;                                               // 2638
                        case 'd': arg = parseInt(arg, 10); break;                                                      // 2639
                        case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;           // 2640
                        case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;         // 2641
                        case 'o': arg = arg.toString(8); break;                                                        // 2642
                        case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;   // 2643
                        case 'u': arg = Math.abs(arg); break;                                                          // 2644
                        case 'x': arg = arg.toString(16); break;                                                       // 2645
                        case 'X': arg = arg.toString(16).toUpperCase(); break;                                         // 2646
                    }                                                                                                  // 2647
                    arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);                           // 2648
                    pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';                       // 2649
                    pad_length = match[6] - String(arg).length;                                                        // 2650
                    pad = match[6] ? str_repeat(pad_character, pad_length) : '';                                       // 2651
                    output.push(match[5] ? arg + pad : pad + arg);                                                     // 2652
                }                                                                                                      // 2653
            }                                                                                                          // 2654
            return output.join('');                                                                                    // 2655
        };                                                                                                             // 2656
                                                                                                                       // 2657
        str_format.cache = {};                                                                                         // 2658
                                                                                                                       // 2659
        str_format.parse = function(fmt) {                                                                             // 2660
            var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;                                                // 2661
            while (_fmt) {                                                                                             // 2662
                if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {                                                       // 2663
                    parse_tree.push(match[0]);                                                                         // 2664
                }                                                                                                      // 2665
                else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {                                                   // 2666
                    parse_tree.push('%');                                                                              // 2667
                }                                                                                                      // 2668
                else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
                    if (match[2]) {                                                                                    // 2670
                        arg_names |= 1;                                                                                // 2671
                        var field_list = [], replacement_field = match[2], field_match = [];                           // 2672
                        if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {                  // 2673
                            field_list.push(field_match[1]);                                                           // 2674
                            while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {  // 2675
                                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {        // 2676
                                    field_list.push(field_match[1]);                                                   // 2677
                                }                                                                                      // 2678
                                else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {              // 2679
                                    field_list.push(field_match[1]);                                                   // 2680
                                }                                                                                      // 2681
                                else {                                                                                 // 2682
                                    throw('[sprintf] huh?');                                                           // 2683
                                }                                                                                      // 2684
                            }                                                                                          // 2685
                        }                                                                                              // 2686
                        else {                                                                                         // 2687
                            throw('[sprintf] huh?');                                                                   // 2688
                        }                                                                                              // 2689
                        match[2] = field_list;                                                                         // 2690
                    }                                                                                                  // 2691
                    else {                                                                                             // 2692
                        arg_names |= 2;                                                                                // 2693
                    }                                                                                                  // 2694
                    if (arg_names === 3) {                                                                             // 2695
                        throw('[sprintf] mixing positional and named placeholders is not (yet) supported');            // 2696
                    }                                                                                                  // 2697
                    parse_tree.push(match);                                                                            // 2698
                }                                                                                                      // 2699
                else {                                                                                                 // 2700
                    throw('[sprintf] huh?');                                                                           // 2701
                }                                                                                                      // 2702
                _fmt = _fmt.substring(match[0].length);                                                                // 2703
            }                                                                                                          // 2704
            return parse_tree;                                                                                         // 2705
        };                                                                                                             // 2706
                                                                                                                       // 2707
        return str_format;                                                                                             // 2708
    })();                                                                                                              // 2709
                                                                                                                       // 2710
    var vsprintf = function(fmt, argv) {                                                                               // 2711
        argv.unshift(fmt);                                                                                             // 2712
        return sprintf.apply(null, argv);                                                                              // 2713
    };                                                                                                                 // 2714
                                                                                                                       // 2715
    addPostProcessor("sprintf", function(val, key, opts) {                                                             // 2716
        if (!opts.sprintf) return val;                                                                                 // 2717
                                                                                                                       // 2718
        if (Object.prototype.toString.apply(opts.sprintf) === '[object Array]') {                                      // 2719
            return vsprintf(val, opts.sprintf);                                                                        // 2720
        } else if (typeof opts.sprintf === 'object') {                                                                 // 2721
            return sprintf(val, opts.sprintf);                                                                         // 2722
        }                                                                                                              // 2723
                                                                                                                       // 2724
        return val;                                                                                                    // 2725
    });                                                                                                                // 2726
    // public api interface                                                                                            // 2727
    TAPi18next.init = init;                                                                                            // 2728
    TAPi18next.setLng = setLng;                                                                                        // 2729
    TAPi18next.preload = preload;                                                                                      // 2730
    TAPi18next.addResourceBundle = addResourceBundle;                                                                  // 2731
    TAPi18next.removeResourceBundle = removeResourceBundle;                                                            // 2732
    TAPi18next.loadNamespace = loadNamespace;                                                                          // 2733
    TAPi18next.loadNamespaces = loadNamespaces;                                                                        // 2734
    TAPi18next.setDefaultNamespace = setDefaultNamespace;                                                              // 2735
    TAPi18next.t = translate;                                                                                          // 2736
    TAPi18next.translate = translate;                                                                                  // 2737
    TAPi18next.exists = exists;                                                                                        // 2738
    TAPi18next.detectLanguage = f.detectLanguage;                                                                      // 2739
    TAPi18next.pluralExtensions = pluralExtensions;                                                                    // 2740
    TAPi18next.sync = sync;                                                                                            // 2741
    TAPi18next.functions = f;                                                                                          // 2742
    TAPi18next.lng = lng;                                                                                              // 2743
    TAPi18next.addPostProcessor = addPostProcessor;                                                                    // 2744
    TAPi18next.options = o;                                                                                            // 2745
})();                                                                                                                  // 2746
                                                                                                                       // 2747
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tap:i18n/lib/tap_i18next/tap_i18next_init.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
TAPi18next.init({resStore: {}, fallbackLng: globals.fallback_language, useCookie: false});                             // 1
                                                                                                                       // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tap:i18n/lib/tap_i18n/tap_i18n-helpers.coffee.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
share.helpers = {};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tap:i18n/lib/tap_i18n/tap_i18n-common.coffee.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var fallback_language;         

TAPi18n = {};

fallback_language = globals.fallback_language;

_.extend(TAPi18n, {
  _language_changed_tracker: new Tracker.Dependency,
  _loaded_languages: [fallback_language],
  _fallback_language: fallback_language,
  _loaded_lang_session_key: "TAPi18n::loaded_lang",
  conf: null,
  packages: {},
  languages_names: {},
  translations: {},
  _enable: function(conf) {
    this.conf = conf;
    return this._onceEnabled();
  },
  _onceEnabled: function() {},
  _enabled: function() {
    return this.conf != null;
  },
  _getPackageDomain: function(package_name) {
    return package_name.replace(/:/g, "-");
  },
  addResourceBundle: function(lang_tag, package_name, translations) {
    return TAPi18next.addResourceBundle(lang_tag, TAPi18n._getPackageDomain(package_name), translations);
  },
  _getProjectLanguages: function() {
    if (this._enabled()) {
      if (_.isArray(this.conf.supported_languages)) {
        return _.union([this._fallback_language], this.conf.supported_languages);
      } else {
        return _.keys(this.languages_names);
      }
    } else {
      return [this._fallback_language];
    }
  },
  getLanguages: function() {
    var lang_tag, languages, _i, _len, _ref;
    if (!this._enabled()) {
      return null;
    }
    languages = {};
    _ref = this._getProjectLanguages();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      lang_tag = _ref[_i];
      languages[lang_tag] = {
        name: this.languages_names[lang_tag][1],
        en: this.languages_names[lang_tag][0]
      };
    }
    return languages;
  },
  _loadLangFileObject: function(language_tag, data) {
    var package_keys, package_name, _ref, _results;
    _results = [];
    for (package_name in data) {
      package_keys = data[package_name];
      package_keys = _.extend({}, package_keys, ((_ref = this._loadTranslations_cache[language_tag]) != null ? _ref[package_name] : void 0) || {});
      _results.push(TAPi18n.addResourceBundle(language_tag, package_name, package_keys));
    }
    return _results;
  },
  _loadTranslations_cache: {},
  loadTranslations: function(translations, namespace) {
    var language_tag, project_languages, translation_keys, _results;
    project_languages = this._getProjectLanguages();
    _results = [];
    for (language_tag in translations) {
      translation_keys = translations[language_tag];
      if (this._loadTranslations_cache[language_tag] == null) {
        this._loadTranslations_cache[language_tag] = {};
      }
      if (this._loadTranslations_cache[language_tag][namespace] == null) {
        this._loadTranslations_cache[language_tag][namespace] = {};
      }
      _.extend(this._loadTranslations_cache[language_tag][namespace], translation_keys);
      TAPi18n.addResourceBundle(language_tag, namespace, translation_keys);
      if (Meteor.isClient && this.getLanguage() === language_tag) {
        _results.push(this._language_changed_tracker.changed());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tap:i18n/lib/tap_i18n/tap_i18n-server.coffee.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_.extend(TAPi18n, {
  server_translators: {},
  _registerServerTranslators: function() {
    var lang_tag, self, _i, _len, _ref, _results;
    self = this;
    if (self._enabled()) {
      _ref = self._getProjectLanguages();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lang_tag = _ref[_i];
        _results.push((function(lang_tag) {
          var package_name;
          for (package_name in self.translations[lang_tag]) {
            TAPi18n.addResourceBundle(lang_tag, package_name, self.translations[lang_tag][package_name]);
          }
          return TAPi18next.setLng(lang_tag, {
            fixLng: true
          }, function(lang_translator) {
            return self.server_translators[lang_tag] = lang_translator;
          });
        })(lang_tag));
      }
      return _results;
    } else {
      return TAPi18next.setLng(self._fallback_language, {
        fixLng: true
      }, function(lang_translator) {
        return self.server_translators[self._fallback_language] = lang_translator;
      });
    }
  },
  _getPackageI18nextProxy: function(package_name) {
    var self;
    self = this;
    return function(key, options, lang_tag) {
      if (lang_tag == null) {
        lang_tag = null;
      }
      if (lang_tag == null) {
        return self.server_translators[self._fallback_language]("" + (TAPi18n._getPackageDomain(package_name)) + ":" + key, options);
      } else if (!(lang_tag in self.server_translators)) {
        console.log("Warning: language " + lang_tag + " is not supported in this project, fallback language (" + self._fallback_language + ")");
        return self.server_translators[self._fallback_language]("" + (TAPi18n._getPackageDomain(package_name)) + ":" + key, options);
      } else {
        return self.server_translators[lang_tag]("" + (TAPi18n._getPackageDomain(package_name)) + ":" + key, options);
      }
    };
  },
  _registerHTTPMethod: function() {
    var methods, self;
    self = this;
    methods = {};
    if (!self._enabled()) {
      throw new Meteor.Error(500, "tap-i18n has to be enabled in order to register the HTTP method");
    }
    methods["" + (TAPi18n.conf.i18n_files_route.replace(/\/$/, "")) + "/:lang"] = {
      get: function() {
        var lang_tag, language_translations;
        if (!RegExp("^" + globals.langauges_tags_regex + ".json$").test(this.params.lang)) {
          return this.setStatusCode(401);
        }
        lang_tag = this.params.lang.replace(".json", "");
        if (__indexOf.call(self._getProjectLanguages(), lang_tag) < 0 || lang_tag === self._fallback_language) {
          return this.setStatusCode(404);
        }
        language_translations = self.translations[lang_tag];
        return JSON.stringify(language_translations != null ? language_translations : {});
      }
    };
    return HTTP.methods(methods);
  }
});

TAPi18n.__ = TAPi18n._getPackageI18nextProxy(globals.project_translations_domain);

Meteor.startup(function() {
  TAPi18n._registerServerTranslators();
  if (TAPi18n._enabled()) {
    return TAPi18n._registerHTTPMethod();
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['tap:i18n'] = {
  TAPi18next: TAPi18next,
  TAPi18n: TAPi18n
};

})();

//# sourceMappingURL=tap_i18n.js.map
