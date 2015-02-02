(function () {

/* Imports */
var _ = Package.underscore._;

/* Package-scope variables */
var _s, exports;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/wizonesolutions:underscore-string/pre.js                                                          //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
// Define an object named exports. This will cause underscore.js to put `_` as a                              // 1
// field on it, instead of in the global namespace. See also post.js.                                         // 2
exports = {};                                                                                                 // 3
                                                                                                              // 4
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/wizonesolutions:underscore-string/lib/underscore.string/lib/underscore.string.js                  //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
//  Underscore.string                                                                                         // 1
//  (c) 2010 Esa-Matti Suuronen <esa-matti aet suuronen dot org>                                              // 2
//  Underscore.string is freely distributable under the terms of the MIT license.                             // 3
//  Documentation: https://github.com/epeli/underscore.string                                                 // 4
//  Some code is borrowed from MooTools and Alexandru Marasteanu.                                             // 5
//  Version '2.3.3'                                                                                           // 6
                                                                                                              // 7
!function(root, String){                                                                                      // 8
  'use strict';                                                                                               // 9
                                                                                                              // 10
  // Defining helper functions.                                                                               // 11
                                                                                                              // 12
  var nativeTrim = String.prototype.trim;                                                                     // 13
  var nativeTrimRight = String.prototype.trimRight;                                                           // 14
  var nativeTrimLeft = String.prototype.trimLeft;                                                             // 15
                                                                                                              // 16
  var parseNumber = function(source) { return source * 1 || 0; };                                             // 17
                                                                                                              // 18
  var strRepeat = function(str, qty){                                                                         // 19
    if (qty < 1) return '';                                                                                   // 20
    var result = '';                                                                                          // 21
    while (qty > 0) {                                                                                         // 22
      if (qty & 1) result += str;                                                                             // 23
      qty >>= 1, str += str;                                                                                  // 24
    }                                                                                                         // 25
    return result;                                                                                            // 26
  };                                                                                                          // 27
                                                                                                              // 28
  var slice = [].slice;                                                                                       // 29
                                                                                                              // 30
  var defaultToWhiteSpace = function(characters) {                                                            // 31
    if (characters == null)                                                                                   // 32
      return '\\s';                                                                                           // 33
    else if (characters.source)                                                                               // 34
      return characters.source;                                                                               // 35
    else                                                                                                      // 36
      return '[' + _s.escapeRegExp(characters) + ']';                                                         // 37
  };                                                                                                          // 38
                                                                                                              // 39
  // Helper for toBoolean                                                                                     // 40
  function boolMatch(s, matchers) {                                                                           // 41
    var i, matcher, down = s.toLowerCase();                                                                   // 42
    matchers = [].concat(matchers);                                                                           // 43
    for (i = 0; i < matchers.length; i += 1) {                                                                // 44
      matcher = matchers[i];                                                                                  // 45
      if (!matcher) continue;                                                                                 // 46
      if (matcher.test && matcher.test(s)) return true;                                                       // 47
      if (matcher.toLowerCase() === down) return true;                                                        // 48
    }                                                                                                         // 49
  }                                                                                                           // 50
                                                                                                              // 51
  var escapeChars = {                                                                                         // 52
    lt: '<',                                                                                                  // 53
    gt: '>',                                                                                                  // 54
    quot: '"',                                                                                                // 55
    amp: '&',                                                                                                 // 56
    apos: "'"                                                                                                 // 57
  };                                                                                                          // 58
                                                                                                              // 59
  var reversedEscapeChars = {};                                                                               // 60
  for(var key in escapeChars) reversedEscapeChars[escapeChars[key]] = key;                                    // 61
  reversedEscapeChars["'"] = '#39';                                                                           // 62
                                                                                                              // 63
  // sprintf() for JavaScript 0.7-beta1                                                                       // 64
  // http://www.diveintojavascript.com/projects/javascript-sprintf                                            // 65
  //                                                                                                          // 66
  // Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>                                     // 67
  // All rights reserved.                                                                                     // 68
                                                                                                              // 69
  var sprintf = (function() {                                                                                 // 70
    function get_type(variable) {                                                                             // 71
      return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();                             // 72
    }                                                                                                         // 73
                                                                                                              // 74
    var str_repeat = strRepeat;                                                                               // 75
                                                                                                              // 76
    var str_format = function() {                                                                             // 77
      if (!str_format.cache.hasOwnProperty(arguments[0])) {                                                   // 78
        str_format.cache[arguments[0]] = str_format.parse(arguments[0]);                                      // 79
      }                                                                                                       // 80
      return str_format.format.call(null, str_format.cache[arguments[0]], arguments);                         // 81
    };                                                                                                        // 82
                                                                                                              // 83
    str_format.format = function(parse_tree, argv) {                                                          // 84
      var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
      for (i = 0; i < tree_length; i++) {                                                                     // 86
        node_type = get_type(parse_tree[i]);                                                                  // 87
        if (node_type === 'string') {                                                                         // 88
          output.push(parse_tree[i]);                                                                         // 89
        }                                                                                                     // 90
        else if (node_type === 'array') {                                                                     // 91
          match = parse_tree[i]; // convenience purposes only                                                 // 92
          if (match[2]) { // keyword argument                                                                 // 93
            arg = argv[cursor];                                                                               // 94
            for (k = 0; k < match[2].length; k++) {                                                           // 95
              if (!arg.hasOwnProperty(match[2][k])) {                                                         // 96
                throw new Error(sprintf('[_.sprintf] property "%s" does not exist', match[2][k]));            // 97
              }                                                                                               // 98
              arg = arg[match[2][k]];                                                                         // 99
            }                                                                                                 // 100
          } else if (match[1]) { // positional argument (explicit)                                            // 101
            arg = argv[match[1]];                                                                             // 102
          }                                                                                                   // 103
          else { // positional argument (implicit)                                                            // 104
            arg = argv[cursor++];                                                                             // 105
          }                                                                                                   // 106
                                                                                                              // 107
          if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {                                         // 108
            throw new Error(sprintf('[_.sprintf] expecting number but found %s', get_type(arg)));             // 109
          }                                                                                                   // 110
          switch (match[8]) {                                                                                 // 111
            case 'b': arg = arg.toString(2); break;                                                           // 112
            case 'c': arg = String.fromCharCode(arg); break;                                                  // 113
            case 'd': arg = parseInt(arg, 10); break;                                                         // 114
            case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;              // 115
            case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;            // 116
            case 'o': arg = arg.toString(8); break;                                                           // 117
            case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;      // 118
            case 'u': arg = Math.abs(arg); break;                                                             // 119
            case 'x': arg = arg.toString(16); break;                                                          // 120
            case 'X': arg = arg.toString(16).toUpperCase(); break;                                            // 121
          }                                                                                                   // 122
          arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);                            // 123
          pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';                        // 124
          pad_length = match[6] - String(arg).length;                                                         // 125
          pad = match[6] ? str_repeat(pad_character, pad_length) : '';                                        // 126
          output.push(match[5] ? arg + pad : pad + arg);                                                      // 127
        }                                                                                                     // 128
      }                                                                                                       // 129
      return output.join('');                                                                                 // 130
    };                                                                                                        // 131
                                                                                                              // 132
    str_format.cache = {};                                                                                    // 133
                                                                                                              // 134
    str_format.parse = function(fmt) {                                                                        // 135
      var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;                                             // 136
      while (_fmt) {                                                                                          // 137
        if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {                                                      // 138
          parse_tree.push(match[0]);                                                                          // 139
        }                                                                                                     // 140
        else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {                                                  // 141
          parse_tree.push('%');                                                                               // 142
        }                                                                                                     // 143
        else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
          if (match[2]) {                                                                                     // 145
            arg_names |= 1;                                                                                   // 146
            var field_list = [], replacement_field = match[2], field_match = [];                              // 147
            if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {                     // 148
              field_list.push(field_match[1]);                                                                // 149
              while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {       // 150
                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {               // 151
                  field_list.push(field_match[1]);                                                            // 152
                }                                                                                             // 153
                else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {                     // 154
                  field_list.push(field_match[1]);                                                            // 155
                }                                                                                             // 156
                else {                                                                                        // 157
                  throw new Error('[_.sprintf] huh?');                                                        // 158
                }                                                                                             // 159
              }                                                                                               // 160
            }                                                                                                 // 161
            else {                                                                                            // 162
              throw new Error('[_.sprintf] huh?');                                                            // 163
            }                                                                                                 // 164
            match[2] = field_list;                                                                            // 165
          }                                                                                                   // 166
          else {                                                                                              // 167
            arg_names |= 2;                                                                                   // 168
          }                                                                                                   // 169
          if (arg_names === 3) {                                                                              // 170
            throw new Error('[_.sprintf] mixing positional and named placeholders is not (yet) supported');   // 171
          }                                                                                                   // 172
          parse_tree.push(match);                                                                             // 173
        }                                                                                                     // 174
        else {                                                                                                // 175
          throw new Error('[_.sprintf] huh?');                                                                // 176
        }                                                                                                     // 177
        _fmt = _fmt.substring(match[0].length);                                                               // 178
      }                                                                                                       // 179
      return parse_tree;                                                                                      // 180
    };                                                                                                        // 181
                                                                                                              // 182
    return str_format;                                                                                        // 183
  })();                                                                                                       // 184
                                                                                                              // 185
                                                                                                              // 186
                                                                                                              // 187
  // Defining underscore.string                                                                               // 188
                                                                                                              // 189
  var _s = {                                                                                                  // 190
                                                                                                              // 191
    VERSION: '2.3.0',                                                                                         // 192
                                                                                                              // 193
    isBlank: function(str){                                                                                   // 194
      if (str == null) str = '';                                                                              // 195
      return (/^\s*$/).test(str);                                                                             // 196
    },                                                                                                        // 197
                                                                                                              // 198
    stripTags: function(str){                                                                                 // 199
      if (str == null) return '';                                                                             // 200
      return String(str).replace(/<\/?[^>]+>/g, '');                                                          // 201
    },                                                                                                        // 202
                                                                                                              // 203
    capitalize : function(str){                                                                               // 204
      str = str == null ? '' : String(str);                                                                   // 205
      return str.charAt(0).toUpperCase() + str.slice(1);                                                      // 206
    },                                                                                                        // 207
                                                                                                              // 208
    chop: function(str, step){                                                                                // 209
      if (str == null) return [];                                                                             // 210
      str = String(str);                                                                                      // 211
      step = ~~step;                                                                                          // 212
      return step > 0 ? str.match(new RegExp('.{1,' + step + '}', 'g')) : [str];                              // 213
    },                                                                                                        // 214
                                                                                                              // 215
    clean: function(str){                                                                                     // 216
      return _s.strip(str).replace(/\s+/g, ' ');                                                              // 217
    },                                                                                                        // 218
                                                                                                              // 219
    count: function(str, substr){                                                                             // 220
      if (str == null || substr == null) return 0;                                                            // 221
                                                                                                              // 222
      str = String(str);                                                                                      // 223
      substr = String(substr);                                                                                // 224
                                                                                                              // 225
      var count = 0,                                                                                          // 226
        pos = 0,                                                                                              // 227
        length = substr.length;                                                                               // 228
                                                                                                              // 229
      while (true) {                                                                                          // 230
        pos = str.indexOf(substr, pos);                                                                       // 231
        if (pos === -1) break;                                                                                // 232
        count++;                                                                                              // 233
        pos += length;                                                                                        // 234
      }                                                                                                       // 235
                                                                                                              // 236
      return count;                                                                                           // 237
    },                                                                                                        // 238
                                                                                                              // 239
    chars: function(str) {                                                                                    // 240
      if (str == null) return [];                                                                             // 241
      return String(str).split('');                                                                           // 242
    },                                                                                                        // 243
                                                                                                              // 244
    swapCase: function(str) {                                                                                 // 245
      if (str == null) return '';                                                                             // 246
      return String(str).replace(/\S/g, function(c){                                                          // 247
        return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();                                     // 248
      });                                                                                                     // 249
    },                                                                                                        // 250
                                                                                                              // 251
    escapeHTML: function(str) {                                                                               // 252
      if (str == null) return '';                                                                             // 253
      return String(str).replace(/[&<>"']/g, function(m){ return '&' + reversedEscapeChars[m] + ';'; });      // 254
    },                                                                                                        // 255
                                                                                                              // 256
    unescapeHTML: function(str) {                                                                             // 257
      if (str == null) return '';                                                                             // 258
      return String(str).replace(/\&([^;]+);/g, function(entity, entityCode){                                 // 259
        var match;                                                                                            // 260
                                                                                                              // 261
        if (entityCode in escapeChars) {                                                                      // 262
          return escapeChars[entityCode];                                                                     // 263
        } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {                                           // 264
          return String.fromCharCode(parseInt(match[1], 16));                                                 // 265
        } else if (match = entityCode.match(/^#(\d+)$/)) {                                                    // 266
          return String.fromCharCode(~~match[1]);                                                             // 267
        } else {                                                                                              // 268
          return entity;                                                                                      // 269
        }                                                                                                     // 270
      });                                                                                                     // 271
    },                                                                                                        // 272
                                                                                                              // 273
    escapeRegExp: function(str){                                                                              // 274
      if (str == null) return '';                                                                             // 275
      return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');                                       // 276
    },                                                                                                        // 277
                                                                                                              // 278
    splice: function(str, i, howmany, substr){                                                                // 279
      var arr = _s.chars(str);                                                                                // 280
      arr.splice(~~i, ~~howmany, substr);                                                                     // 281
      return arr.join('');                                                                                    // 282
    },                                                                                                        // 283
                                                                                                              // 284
    insert: function(str, i, substr){                                                                         // 285
      return _s.splice(str, i, 0, substr);                                                                    // 286
    },                                                                                                        // 287
                                                                                                              // 288
    include: function(str, needle){                                                                           // 289
      if (needle === '') return true;                                                                         // 290
      if (str == null) return false;                                                                          // 291
      return String(str).indexOf(needle) !== -1;                                                              // 292
    },                                                                                                        // 293
                                                                                                              // 294
    join: function() {                                                                                        // 295
      var args = slice.call(arguments),                                                                       // 296
        separator = args.shift();                                                                             // 297
                                                                                                              // 298
      if (separator == null) separator = '';                                                                  // 299
                                                                                                              // 300
      return args.join(separator);                                                                            // 301
    },                                                                                                        // 302
                                                                                                              // 303
    lines: function(str) {                                                                                    // 304
      if (str == null) return [];                                                                             // 305
      return String(str).split("\n");                                                                         // 306
    },                                                                                                        // 307
                                                                                                              // 308
    reverse: function(str){                                                                                   // 309
      return _s.chars(str).reverse().join('');                                                                // 310
    },                                                                                                        // 311
                                                                                                              // 312
    startsWith: function(str, starts){                                                                        // 313
      if (starts === '') return true;                                                                         // 314
      if (str == null || starts == null) return false;                                                        // 315
      str = String(str); starts = String(starts);                                                             // 316
      return str.length >= starts.length && str.slice(0, starts.length) === starts;                           // 317
    },                                                                                                        // 318
                                                                                                              // 319
    endsWith: function(str, ends){                                                                            // 320
      if (ends === '') return true;                                                                           // 321
      if (str == null || ends == null) return false;                                                          // 322
      str = String(str); ends = String(ends);                                                                 // 323
      return str.length >= ends.length && str.slice(str.length - ends.length) === ends;                       // 324
    },                                                                                                        // 325
                                                                                                              // 326
    succ: function(str){                                                                                      // 327
      if (str == null) return '';                                                                             // 328
      str = String(str);                                                                                      // 329
      return str.slice(0, -1) + String.fromCharCode(str.charCodeAt(str.length-1) + 1);                        // 330
    },                                                                                                        // 331
                                                                                                              // 332
    titleize: function(str){                                                                                  // 333
      if (str == null) return '';                                                                             // 334
      str  = String(str).toLowerCase();                                                                       // 335
      return str.replace(/(?:^|\s|-)\S/g, function(c){ return c.toUpperCase(); });                            // 336
    },                                                                                                        // 337
                                                                                                              // 338
    camelize: function(str){                                                                                  // 339
      return _s.trim(str).replace(/[-_\s]+(.)?/g, function(match, c){ return c ? c.toUpperCase() : ""; });    // 340
    },                                                                                                        // 341
                                                                                                              // 342
    underscored: function(str){                                                                               // 343
      return _s.trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();       // 344
    },                                                                                                        // 345
                                                                                                              // 346
    dasherize: function(str){                                                                                 // 347
      return _s.trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();                  // 348
    },                                                                                                        // 349
                                                                                                              // 350
    classify: function(str){                                                                                  // 351
      return _s.titleize(String(str).replace(/[\W_]/g, ' ')).replace(/\s/g, '');                              // 352
    },                                                                                                        // 353
                                                                                                              // 354
    humanize: function(str){                                                                                  // 355
      return _s.capitalize(_s.underscored(str).replace(/_id$/,'').replace(/_/g, ' '));                        // 356
    },                                                                                                        // 357
                                                                                                              // 358
    trim: function(str, characters){                                                                          // 359
      if (str == null) return '';                                                                             // 360
      if (!characters && nativeTrim) return nativeTrim.call(str);                                             // 361
      characters = defaultToWhiteSpace(characters);                                                           // 362
      return String(str).replace(new RegExp('^' + characters + '+|' + characters + '+$', 'g'), '');           // 363
    },                                                                                                        // 364
                                                                                                              // 365
    ltrim: function(str, characters){                                                                         // 366
      if (str == null) return '';                                                                             // 367
      if (!characters && nativeTrimLeft) return nativeTrimLeft.call(str);                                     // 368
      characters = defaultToWhiteSpace(characters);                                                           // 369
      return String(str).replace(new RegExp('^' + characters + '+'), '');                                     // 370
    },                                                                                                        // 371
                                                                                                              // 372
    rtrim: function(str, characters){                                                                         // 373
      if (str == null) return '';                                                                             // 374
      if (!characters && nativeTrimRight) return nativeTrimRight.call(str);                                   // 375
      characters = defaultToWhiteSpace(characters);                                                           // 376
      return String(str).replace(new RegExp(characters + '+$'), '');                                          // 377
    },                                                                                                        // 378
                                                                                                              // 379
    truncate: function(str, length, truncateStr){                                                             // 380
      if (str == null) return '';                                                                             // 381
      str = String(str); truncateStr = truncateStr || '...';                                                  // 382
      length = ~~length;                                                                                      // 383
      return str.length > length ? str.slice(0, length) + truncateStr : str;                                  // 384
    },                                                                                                        // 385
                                                                                                              // 386
    /**                                                                                                       // 387
     * _s.prune: a more elegant version of truncate                                                           // 388
     * prune extra chars, never leaving a half-chopped word.                                                  // 389
     * @author github.com/rwz                                                                                 // 390
     */                                                                                                       // 391
    prune: function(str, length, pruneStr){                                                                   // 392
      if (str == null) return '';                                                                             // 393
                                                                                                              // 394
      str = String(str); length = ~~length;                                                                   // 395
      pruneStr = pruneStr != null ? String(pruneStr) : '...';                                                 // 396
                                                                                                              // 397
      if (str.length <= length) return str;                                                                   // 398
                                                                                                              // 399
      var tmpl = function(c){ return c.toUpperCase() !== c.toLowerCase() ? 'A' : ' '; },                      // 400
        template = str.slice(0, length+1).replace(/.(?=\W*\w*$)/g, tmpl); // 'Hello, world' -> 'HellAA AAAAA' // 401
                                                                                                              // 402
      if (template.slice(template.length-2).match(/\w\w/))                                                    // 403
        template = template.replace(/\s*\S+$/, '');                                                           // 404
      else                                                                                                    // 405
        template = _s.rtrim(template.slice(0, template.length-1));                                            // 406
                                                                                                              // 407
      return (template+pruneStr).length > str.length ? str : str.slice(0, template.length)+pruneStr;          // 408
    },                                                                                                        // 409
                                                                                                              // 410
    words: function(str, delimiter) {                                                                         // 411
      if (_s.isBlank(str)) return [];                                                                         // 412
      return _s.trim(str, delimiter).split(delimiter || /\s+/);                                               // 413
    },                                                                                                        // 414
                                                                                                              // 415
    pad: function(str, length, padStr, type) {                                                                // 416
      str = str == null ? '' : String(str);                                                                   // 417
      length = ~~length;                                                                                      // 418
                                                                                                              // 419
      var padlen  = 0;                                                                                        // 420
                                                                                                              // 421
      if (!padStr)                                                                                            // 422
        padStr = ' ';                                                                                         // 423
      else if (padStr.length > 1)                                                                             // 424
        padStr = padStr.charAt(0);                                                                            // 425
                                                                                                              // 426
      switch(type) {                                                                                          // 427
        case 'right':                                                                                         // 428
          padlen = length - str.length;                                                                       // 429
          return str + strRepeat(padStr, padlen);                                                             // 430
        case 'both':                                                                                          // 431
          padlen = length - str.length;                                                                       // 432
          return strRepeat(padStr, Math.ceil(padlen/2)) + str                                                 // 433
                  + strRepeat(padStr, Math.floor(padlen/2));                                                  // 434
        default: // 'left'                                                                                    // 435
          padlen = length - str.length;                                                                       // 436
          return strRepeat(padStr, padlen) + str;                                                             // 437
        }                                                                                                     // 438
    },                                                                                                        // 439
                                                                                                              // 440
    lpad: function(str, length, padStr) {                                                                     // 441
      return _s.pad(str, length, padStr);                                                                     // 442
    },                                                                                                        // 443
                                                                                                              // 444
    rpad: function(str, length, padStr) {                                                                     // 445
      return _s.pad(str, length, padStr, 'right');                                                            // 446
    },                                                                                                        // 447
                                                                                                              // 448
    lrpad: function(str, length, padStr) {                                                                    // 449
      return _s.pad(str, length, padStr, 'both');                                                             // 450
    },                                                                                                        // 451
                                                                                                              // 452
    sprintf: sprintf,                                                                                         // 453
                                                                                                              // 454
    vsprintf: function(fmt, argv){                                                                            // 455
      argv.unshift(fmt);                                                                                      // 456
      return sprintf.apply(null, argv);                                                                       // 457
    },                                                                                                        // 458
                                                                                                              // 459
    toNumber: function(str, decimals) {                                                                       // 460
      if (!str) return 0;                                                                                     // 461
      str = _s.trim(str);                                                                                     // 462
      if (!str.match(/^-?\d+(?:\.\d+)?$/)) return NaN;                                                        // 463
      return parseNumber(parseNumber(str).toFixed(~~decimals));                                               // 464
    },                                                                                                        // 465
                                                                                                              // 466
    numberFormat : function(number, dec, dsep, tsep) {                                                        // 467
      if (isNaN(number) || number == null) return '';                                                         // 468
                                                                                                              // 469
      number = number.toFixed(~~dec);                                                                         // 470
      tsep = typeof tsep == 'string' ? tsep : ',';                                                            // 471
                                                                                                              // 472
      var parts = number.split('.'), fnums = parts[0],                                                        // 473
        decimals = parts[1] ? (dsep || '.') + parts[1] : '';                                                  // 474
                                                                                                              // 475
      return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;                                   // 476
    },                                                                                                        // 477
                                                                                                              // 478
    strRight: function(str, sep){                                                                             // 479
      if (str == null) return '';                                                                             // 480
      str = String(str); sep = sep != null ? String(sep) : sep;                                               // 481
      var pos = !sep ? -1 : str.indexOf(sep);                                                                 // 482
      return ~pos ? str.slice(pos+sep.length, str.length) : str;                                              // 483
    },                                                                                                        // 484
                                                                                                              // 485
    strRightBack: function(str, sep){                                                                         // 486
      if (str == null) return '';                                                                             // 487
      str = String(str); sep = sep != null ? String(sep) : sep;                                               // 488
      var pos = !sep ? -1 : str.lastIndexOf(sep);                                                             // 489
      return ~pos ? str.slice(pos+sep.length, str.length) : str;                                              // 490
    },                                                                                                        // 491
                                                                                                              // 492
    strLeft: function(str, sep){                                                                              // 493
      if (str == null) return '';                                                                             // 494
      str = String(str); sep = sep != null ? String(sep) : sep;                                               // 495
      var pos = !sep ? -1 : str.indexOf(sep);                                                                 // 496
      return ~pos ? str.slice(0, pos) : str;                                                                  // 497
    },                                                                                                        // 498
                                                                                                              // 499
    strLeftBack: function(str, sep){                                                                          // 500
      if (str == null) return '';                                                                             // 501
      str += ''; sep = sep != null ? ''+sep : sep;                                                            // 502
      var pos = str.lastIndexOf(sep);                                                                         // 503
      return ~pos ? str.slice(0, pos) : str;                                                                  // 504
    },                                                                                                        // 505
                                                                                                              // 506
    toSentence: function(array, separator, lastSeparator, serial) {                                           // 507
      separator = separator || ', ';                                                                          // 508
      lastSeparator = lastSeparator || ' and ';                                                               // 509
      var a = array.slice(), lastMember = a.pop();                                                            // 510
                                                                                                              // 511
      if (array.length > 2 && serial) lastSeparator = _s.rtrim(separator) + lastSeparator;                    // 512
                                                                                                              // 513
      return a.length ? a.join(separator) + lastSeparator + lastMember : lastMember;                          // 514
    },                                                                                                        // 515
                                                                                                              // 516
    toSentenceSerial: function() {                                                                            // 517
      var args = slice.call(arguments);                                                                       // 518
      args[3] = true;                                                                                         // 519
      return _s.toSentence.apply(_s, args);                                                                   // 520
    },                                                                                                        // 521
                                                                                                              // 522
    slugify: function(str) {                                                                                  // 523
      if (str == null) return '';                                                                             // 524
                                                                                                              // 525
      var from  = "ąàáäâãåæăćęèéëêìíïîłńòóöôõøśșțùúüûñçżź",                                                   // 526
          to    = "aaaaaaaaaceeeeeiiiilnoooooosstuuuunczz",                                                   // 527
          regex = new RegExp(defaultToWhiteSpace(from), 'g');                                                 // 528
                                                                                                              // 529
      str = String(str).toLowerCase().replace(regex, function(c){                                             // 530
        var index = from.indexOf(c);                                                                          // 531
        return to.charAt(index) || '-';                                                                       // 532
      });                                                                                                     // 533
                                                                                                              // 534
      return _s.dasherize(str.replace(/[^\w\s-]/g, ''));                                                      // 535
    },                                                                                                        // 536
                                                                                                              // 537
    surround: function(str, wrapper) {                                                                        // 538
      return [wrapper, str, wrapper].join('');                                                                // 539
    },                                                                                                        // 540
                                                                                                              // 541
    quote: function(str, quoteChar) {                                                                         // 542
      return _s.surround(str, quoteChar || '"');                                                              // 543
    },                                                                                                        // 544
                                                                                                              // 545
    unquote: function(str, quoteChar) {                                                                       // 546
      quoteChar = quoteChar || '"';                                                                           // 547
      if (str[0] === quoteChar && str[str.length-1] === quoteChar)                                            // 548
        return str.slice(1,str.length-1);                                                                     // 549
      else return str;                                                                                        // 550
    },                                                                                                        // 551
                                                                                                              // 552
    exports: function() {                                                                                     // 553
      var result = {};                                                                                        // 554
                                                                                                              // 555
      for (var prop in this) {                                                                                // 556
        if (!this.hasOwnProperty(prop) || prop.match(/^(?:include|contains|reverse)$/)) continue;             // 557
        result[prop] = this[prop];                                                                            // 558
      }                                                                                                       // 559
                                                                                                              // 560
      return result;                                                                                          // 561
    },                                                                                                        // 562
                                                                                                              // 563
    repeat: function(str, qty, separator){                                                                    // 564
      if (str == null) return '';                                                                             // 565
                                                                                                              // 566
      qty = ~~qty;                                                                                            // 567
                                                                                                              // 568
      // using faster implementation if separator is not needed;                                              // 569
      if (separator == null) return strRepeat(String(str), qty);                                              // 570
                                                                                                              // 571
      // this one is about 300x slower in Google Chrome                                                       // 572
      for (var repeat = []; qty > 0; repeat[--qty] = str) {}                                                  // 573
      return repeat.join(separator);                                                                          // 574
    },                                                                                                        // 575
                                                                                                              // 576
    naturalCmp: function(str1, str2){                                                                         // 577
      if (str1 == str2) return 0;                                                                             // 578
      if (!str1) return -1;                                                                                   // 579
      if (!str2) return 1;                                                                                    // 580
                                                                                                              // 581
      var cmpRegex = /(\.\d+)|(\d+)|(\D+)/g,                                                                  // 582
        tokens1 = String(str1).toLowerCase().match(cmpRegex),                                                 // 583
        tokens2 = String(str2).toLowerCase().match(cmpRegex),                                                 // 584
        count = Math.min(tokens1.length, tokens2.length);                                                     // 585
                                                                                                              // 586
      for(var i = 0; i < count; i++) {                                                                        // 587
        var a = tokens1[i], b = tokens2[i];                                                                   // 588
                                                                                                              // 589
        if (a !== b){                                                                                         // 590
          var num1 = parseInt(a, 10);                                                                         // 591
          if (!isNaN(num1)){                                                                                  // 592
            var num2 = parseInt(b, 10);                                                                       // 593
            if (!isNaN(num2) && num1 - num2)                                                                  // 594
              return num1 - num2;                                                                             // 595
          }                                                                                                   // 596
          return a < b ? -1 : 1;                                                                              // 597
        }                                                                                                     // 598
      }                                                                                                       // 599
                                                                                                              // 600
      if (tokens1.length === tokens2.length)                                                                  // 601
        return tokens1.length - tokens2.length;                                                               // 602
                                                                                                              // 603
      return str1 < str2 ? -1 : 1;                                                                            // 604
    },                                                                                                        // 605
                                                                                                              // 606
    levenshtein: function(str1, str2) {                                                                       // 607
      if (str1 == null && str2 == null) return 0;                                                             // 608
      if (str1 == null) return String(str2).length;                                                           // 609
      if (str2 == null) return String(str1).length;                                                           // 610
                                                                                                              // 611
      str1 = String(str1); str2 = String(str2);                                                               // 612
                                                                                                              // 613
      var current = [], prev, value;                                                                          // 614
                                                                                                              // 615
      for (var i = 0; i <= str2.length; i++)                                                                  // 616
        for (var j = 0; j <= str1.length; j++) {                                                              // 617
          if (i && j)                                                                                         // 618
            if (str1.charAt(j - 1) === str2.charAt(i - 1))                                                    // 619
              value = prev;                                                                                   // 620
            else                                                                                              // 621
              value = Math.min(current[j], current[j - 1], prev) + 1;                                         // 622
          else                                                                                                // 623
            value = i + j;                                                                                    // 624
                                                                                                              // 625
          prev = current[j];                                                                                  // 626
          current[j] = value;                                                                                 // 627
        }                                                                                                     // 628
                                                                                                              // 629
      return current.pop();                                                                                   // 630
    },                                                                                                        // 631
                                                                                                              // 632
    toBoolean: function(str, trueValues, falseValues) {                                                       // 633
      if (typeof str === "number") str = "" + str;                                                            // 634
      if (typeof str !== "string") return !!str;                                                              // 635
      str = _s.trim(str);                                                                                     // 636
      if (boolMatch(str, trueValues || ["true", "1"])) return true;                                           // 637
      if (boolMatch(str, falseValues || ["false", "0"])) return false;                                        // 638
    }                                                                                                         // 639
  };                                                                                                          // 640
                                                                                                              // 641
  // Aliases                                                                                                  // 642
                                                                                                              // 643
  _s.strip    = _s.trim;                                                                                      // 644
  _s.lstrip   = _s.ltrim;                                                                                     // 645
  _s.rstrip   = _s.rtrim;                                                                                     // 646
  _s.center   = _s.lrpad;                                                                                     // 647
  _s.rjust    = _s.lpad;                                                                                      // 648
  _s.ljust    = _s.rpad;                                                                                      // 649
  _s.contains = _s.include;                                                                                   // 650
  _s.q        = _s.quote;                                                                                     // 651
  _s.toBool   = _s.toBoolean;                                                                                 // 652
                                                                                                              // 653
  // Exporting                                                                                                // 654
                                                                                                              // 655
  // CommonJS module is defined                                                                               // 656
  if (typeof exports !== 'undefined') {                                                                       // 657
    if (typeof module !== 'undefined' && module.exports)                                                      // 658
      module.exports = _s;                                                                                    // 659
                                                                                                              // 660
    exports._s = _s;                                                                                          // 661
  }                                                                                                           // 662
                                                                                                              // 663
  // Register as a named module with AMD.                                                                     // 664
  if (typeof define === 'function' && define.amd)                                                             // 665
    define('underscore.string', [], function(){ return _s; });                                                // 666
                                                                                                              // 667
                                                                                                              // 668
  // Integrate with Underscore.js if defined                                                                  // 669
  // or create our own underscore object.                                                                     // 670
  root._ = root._ || {};                                                                                      // 671
  root._.string = root._.str = _s;                                                                            // 672
}(this, String);                                                                                              // 673
                                                                                                              // 674
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/wizonesolutions:underscore-string/post.js                                                         //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
// This exports object was created in pre.js. Now copy the `_` object from it                                 // 1
// into the package-scope variable `_`, which will get exported.                                              // 2
_s = exports._s;                                                                                              // 3
                                                                                                              // 4
// Mix in non-conflict functions to Underscore namespace if you want                                          // 5
_.str = _s;                                                                                                   // 6
                                                                                                              // 7
_.mixin(_.str.exports());                                                                                     // 8
                                                                                                              // 9
// All functions, including conflicting functions, will be available through the                              // 10
// _.str object                                                                                               // 11
_.str.include('Underscore.string', 'string'); // => true                                                      // 12
                                                                                                              // 13
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['wizonesolutions:underscore-string'] = {
  _s: _s
};

})();

//# sourceMappingURL=wizonesolutions_underscore-string.js.map
