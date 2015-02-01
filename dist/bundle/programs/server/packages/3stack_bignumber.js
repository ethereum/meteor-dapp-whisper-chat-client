(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var BigNumber;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/3stack:bignumber/bignumber.js                                                            //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
/*! bignumber.js v2.0.0 https://github.com/MikeMcl/bignumber.js/LICENCE */                           // 1
                                                                                                     // 2
BigNumber = (function () {                                                                           // 3
    'use strict';                                                                                    // 4
                                                                                                     // 5
    /*                                                                                               // 6
      bignumber.js v2.0.0                                                                            // 7
      A JavaScript library for arbitrary-precision arithmetic.                                       // 8
      https://github.com/MikeMcl/bignumber.js                                                        // 9
      Copyright (c) 2014 Michael Mclaughlin <M8ch88l@gmail.com>                                      // 10
      MIT Expat Licence                                                                              // 11
    */                                                                                               // 12
                                                                                                     // 13
    /*********************************** DEFAULTS ************************************/              // 14
                                                                                                     // 15
    /*                                                                                               // 16
     * The default values below must be integers within the inclusive ranges stated.                 // 17
     * Most of these values can be changed at run-time using the BigNumber.config method.            // 18
     */                                                                                              // 19
                                                                                                     // 20
    /*                                                                                               // 21
     * The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP,                    // 22
     * MAX_EXP, and the argument to toExponential, toFixed, toFormat, and toPrecision,               // 23
     * beyond which an exception is thrown (if ERRORS is true).                                      // 24
     */                                                                                              // 25
    var MAX = 1E9,                                   // 0 to 1e+9                                    // 26
                                                                                                     // 27
        // Limit of magnitude of exponent argument to toPower.                                       // 28
        MAX_POWER = 1E6,                             // 1 to 1e+6                                    // 29
                                                                                                     // 30
        // The maximum number of decimal places for operations involving division.                   // 31
        DECIMAL_PLACES = 20,                         // 0 to MAX                                     // 32
                                                                                                     // 33
        /*                                                                                           // 34
         * The rounding mode used when rounding to the above decimal places, and when using          // 35
         * toExponential, toFixed, toFormat and toPrecision, and round (default value).              // 36
         * UP         0 Away from zero.                                                              // 37
         * DOWN       1 Towards zero.                                                                // 38
         * CEIL       2 Towards +Infinity.                                                           // 39
         * FLOOR      3 Towards -Infinity.                                                           // 40
         * HALF_UP    4 Towards nearest neighbour. If equidistant, up.                               // 41
         * HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.                             // 42
         * HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.           // 43
         * HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.                // 44
         * HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.                // 45
         */                                                                                          // 46
        ROUNDING_MODE = 4,                           // 0 to 8                                       // 47
                                                                                                     // 48
        // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]                                                // 49
                                                                                                     // 50
        // The exponent value at and beneath which toString returns exponential notation.            // 51
        // Number type: -7                                                                           // 52
        TO_EXP_NEG = -7,                             // 0 to -MAX                                    // 53
                                                                                                     // 54
        // The exponent value at and above which toString returns exponential notation.              // 55
        // Number type: 21                                                                           // 56
        TO_EXP_POS = 21,                             // 0 to MAX                                     // 57
                                                                                                     // 58
        // RANGE : [MIN_EXP, MAX_EXP]                                                                // 59
                                                                                                     // 60
        // The minimum exponent value, beneath which underflow to zero occurs.                       // 61
        // Number type: -324  (5e-324)                                                               // 62
        MIN_EXP = -MAX,                              // -1 to -MAX                                   // 63
                                                                                                     // 64
        // The maximum exponent value, above which overflow to Infinity occurs.                      // 65
        // Number type:  308  (1.7976931348623157e+308)                                              // 66
        MAX_EXP = MAX,                               // 1 to MAX                                     // 67
                                                                                                     // 68
        // Whether BigNumber Errors are ever thrown.                                                 // 69
        // CHANGE parseInt to parseFloat if changing ERRORS to false.                                // 70
        ERRORS = true,                               // true or false                                // 71
        parse = parseInt,                            // parseInt or parseFloat                       // 72
                                                                                                     // 73
        // Format specification for the BigNumber.prototype.toFormat method.                         // 74
        FORMAT = {                                                                                   // 75
            decimalSeparator: '.',                                                                   // 76
            groupSeparator: ',',                                                                     // 77
            groupSize: 3,                                                                            // 78
            secondaryGroupSize: 0,                                                                   // 79
            fractionGroupSeparator: '\xA0',              // non-breaking space                       // 80
            fractionGroupSize: 0                                                                     // 81
        },                                                                                           // 82
                                                                                                     // 83
    /***********************************************************************************/            // 84
                                                                                                     // 85
        P = BigNumber.prototype,                                                                     // 86
        DIGITS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_',                 // 87
        outOfRange,                                                                                  // 88
        id = 0,                                                                                      // 89
        mathfloor = Math.floor,                                                                      // 90
        isValid = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,                                            // 91
        trim = String.prototype.trim || function () {return this.replace(/^\s+|\s+$/g, '')},         // 92
        BASE = 1e14,                                                                                 // 93
        LOG_BASE = 14,                                                                               // 94
        SQRT_BASE = 1e7,                                                                             // 95
        POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],          // 96
        ONE = new BigNumber(1);                                                                      // 97
                                                                                                     // 98
                                                                                                     // 99
    // CONSTRUCTOR                                                                                   // 100
                                                                                                     // 101
                                                                                                     // 102
    /*                                                                                               // 103
     * The exported function.                                                                        // 104
     * Create and return a new instance of a BigNumber object.                                       // 105
     *                                                                                               // 106
     * v {number|string|BigNumber} A numeric value.                                                  // 107
     * [b] {number} The base of v. Integer, 2 to 64 inclusive.                                       // 108
     */                                                                                              // 109
    function BigNumber( n, b ) {                                                                     // 110
        var d, e, i, isNum, str, valid,                                                              // 111
            x = this;                                                                                // 112
                                                                                                     // 113
        // Enable constructor usage without new.                                                     // 114
        if ( !( x instanceof BigNumber ) ) return new BigNumber( n, b );                             // 115
                                                                                                     // 116
        // Duplicate.                                                                                // 117
        if ( n instanceof BigNumber ) {                                                              // 118
                                                                                                     // 119
            if ( b == null ) {                                                                       // 120
                id = 0;                                                                              // 121
                x['s'] = n['s'];                                                                     // 122
                x['e'] = n['e'];                                                                     // 123
                x['c'] = ( n = n['c'] ) ? n.slice() : n;                                             // 124
                return;                                                                              // 125
            }                                                                                        // 126
            n += '';                                                                                 // 127
        } else if ( isNum = ( str = typeof n ) == 'number' ) {                                       // 128
                                                                                                     // 129
            // Fast path for integers.                                                               // 130
            if ( b == null && n === ~~n ) {                                                          // 131
                x['s'] = 1 / n < 0 ? ( n = -n, -1 ) : 1;                                             // 132
                for ( e = id = 0, i = n; i >= 10; i /= 10, e++ );                                    // 133
                x['e'] = e;                                                                          // 134
                x['c'] = [n];                                                                        // 135
                return;                                                                              // 136
            }                                                                                        // 137
                                                                                                     // 138
            // Minus zero?                                                                           // 139
            n = n === 0 && 1 / n < 0 ? '-0' : n + '';                                                // 140
        } else if ( str != 'string' ) {                                                              // 141
            n += '';                                                                                 // 142
        }                                                                                            // 143
        str = n;                                                                                     // 144
                                                                                                     // 145
        if ( b == null && isValid.test(str) ) {                                                      // 146
                                                                                                     // 147
            // Determine sign.                                                                       // 148
            x['s'] = str.charCodeAt(0) === 45 ? ( str = str.slice(1), -1 ) : 1;                      // 149
                                                                                                     // 150
        // Either str is not a valid BigNumber or a base has been specified.                         // 151
        } else {                                                                                     // 152
                                                                                                     // 153
            // Enable exponential notation to be used with base 10 argument.                         // 154
            // Ensure return value is rounded to DECIMAL_PLACES as with other bases.                 // 155
            if ( b == 10 ) {                                                                         // 156
                x = new BigNumber(str);                                                              // 157
                return rnd( x, DECIMAL_PLACES + x['e'] + 1, ROUNDING_MODE );                         // 158
            }                                                                                        // 159
            str = trim.call(str).replace( /^\+(?!-)/, '' );                                          // 160
            x['s'] = str.charCodeAt(0) === 45 ? ( str = str.replace( /^-(?!-)/, '' ), -1 ) : 1;      // 161
                                                                                                     // 162
            if ( b != null ) {                                                                       // 163
                                                                                                     // 164
                if ( ( b == ~~b || !ERRORS ) && !( outOfRange = !( b >= 2 && b < 65 ) ) ) {          // 165
                    d = '[' + DIGITS.slice( 0, b = b | 0 ) + ']+';                                   // 166
                                                                                                     // 167
                    // Before non-decimal number validity test and base conversion                   // 168
                    // remove the `.` from e.g. '1.', and replace e.g. '.1' with '0.1'.              // 169
                    str = str.replace( /\.$/, '' ).replace( /^\./, '0.' );                           // 170
                                                                                                     // 171
                    // Any number in exponential form will fail due to the e+/-.                     // 172
                    if ( valid = new RegExp( '^' + d + '(?:\\.' + d + ')?$',                         // 173
                      b < 37 ? 'i' : '' ).test(str) ) {                                              // 174
                                                                                                     // 175
                        if (isNum) {                                                                 // 176
                                                                                                     // 177
                            if ( str.replace( /^0\.0*|\./, '' ).length > 15 ) {                      // 178
                                                                                                     // 179
                        // 'new BigNumber() number type has more than 15 significant digits: {n}'    // 180
                                ifExceptionsThrow( n, 0 );                                           // 181
                            }                                                                        // 182
                                                                                                     // 183
                            // Prevent later check for length on converted number.                   // 184
                            isNum = !isNum;                                                          // 185
                        }                                                                            // 186
                        str = convertBase( str, 10, b, x['s'] );                                     // 187
                    } else if ( str != 'Infinity' && str != 'NaN' ) {                                // 188
                                                                                                     // 189
                        // 'new BigNumber() not a base {b} number: {str}'                            // 190
                        ifExceptionsThrow( n, 1, b );                                                // 191
                        n = 'NaN';                                                                   // 192
                    }                                                                                // 193
                } else {                                                                             // 194
                                                                                                     // 195
                    // 'new BigNumber() base not an integer: {b}'                                    // 196
                    // 'new BigNumber() base out of range: {b}'                                      // 197
                    ifExceptionsThrow( b, 2 );                                                       // 198
                                                                                                     // 199
                    // Ignore base.                                                                  // 200
                    valid = isValid.test(str);                                                       // 201
                }                                                                                    // 202
            } else {                                                                                 // 203
                valid = isValid.test(str);                                                           // 204
            }                                                                                        // 205
                                                                                                     // 206
            if ( !valid ) {                                                                          // 207
                                                                                                     // 208
                // Infinity/NaN                                                                      // 209
                x['c'] = x['e'] = null;                                                              // 210
                                                                                                     // 211
                // NaN                                                                               // 212
                if ( str != 'Infinity' ) {                                                           // 213
                                                                                                     // 214
                    // No exception on NaN.                                                          // 215
                    // 'new BigNumber() not a number: {n}'                                           // 216
                    if ( str != 'NaN' ) ifExceptionsThrow( n, 3 );                                   // 217
                    x['s'] = null;                                                                   // 218
                }                                                                                    // 219
                id = 0;                                                                              // 220
                                                                                                     // 221
                return;                                                                              // 222
            }                                                                                        // 223
        }                                                                                            // 224
                                                                                                     // 225
        // Decimal point?                                                                            // 226
        if ( ( e = str.indexOf('.') ) > -1 ) str = str.replace( '.', '' );                           // 227
                                                                                                     // 228
        // Exponential form?                                                                         // 229
        if ( ( i = str.search( /e/i ) ) > 0 ) {                                                      // 230
                                                                                                     // 231
            // Determine exponent.                                                                   // 232
            if ( e < 0 ) e = i;                                                                      // 233
            e += +str.slice( i + 1 );                                                                // 234
            str = str.substring( 0, i );                                                             // 235
        } else if ( e < 0 ) {                                                                        // 236
                                                                                                     // 237
            // Integer.                                                                              // 238
            e = str.length;                                                                          // 239
        }                                                                                            // 240
                                                                                                     // 241
        // Determine leading zeros.                                                                  // 242
        for ( i = 0; str.charCodeAt(i) === 48; i++ );                                                // 243
                                                                                                     // 244
        // Determine trailing zeros.                                                                 // 245
        for ( b = str.length; str.charCodeAt(--b) === 48; );                                         // 246
        str = str.slice( i, b + 1 );                                                                 // 247
                                                                                                     // 248
        if (str) {                                                                                   // 249
            b = str.length;                                                                          // 250
                                                                                                     // 251
            // Disallow numbers with over 15 significant digits if number type.                      // 252
            // 'new BigNumber() number type has more than 15 significant digits: {n}'                // 253
            if ( isNum && b > 15 ) ifExceptionsThrow( n, 0 );                                        // 254
            e = e - i - 1;                                                                           // 255
                                                                                                     // 256
             // Overflow?                                                                            // 257
            if ( e > MAX_EXP ) {                                                                     // 258
                                                                                                     // 259
                // Infinity.                                                                         // 260
                x['c'] = x['e'] = null;                                                              // 261
                                                                                                     // 262
            // Underflow?                                                                            // 263
            } else if ( e < MIN_EXP ) {                                                              // 264
                                                                                                     // 265
                // Zero.                                                                             // 266
                x['c'] = [ x['e'] = 0 ];                                                             // 267
            } else {                                                                                 // 268
                x['e'] = e;                                                                          // 269
                x['c'] = [];                                                                         // 270
                                                                                                     // 271
                // Transform base                                                                    // 272
                                                                                                     // 273
                // e is the base 10 exponent.                                                        // 274
                // i is where to slice str to get the first element of the coefficient array.        // 275
                i = ( e + 1 ) % LOG_BASE;                                                            // 276
                if ( e < 0 ) i += LOG_BASE;                                                          // 277
                                                                                                     // 278
                // b is str.length.                                                                  // 279
                if ( i < b ) {                                                                       // 280
                    if (i) x['c'].push( +str.slice( 0, i ) );                                        // 281
                    for ( b -= LOG_BASE; i < b; x['c'].push( +str.slice( i, i += LOG_BASE ) ) );     // 282
                    str = str.slice(i);                                                              // 283
                    i = LOG_BASE - str.length;                                                       // 284
                } else {                                                                             // 285
                    i -= b;                                                                          // 286
                }                                                                                    // 287
                                                                                                     // 288
                for ( ; i--; str += '0' );                                                           // 289
                x['c'].push( +str );                                                                 // 290
            }                                                                                        // 291
        } else {                                                                                     // 292
                                                                                                     // 293
            // Zero.                                                                                 // 294
            x['c'] = [ x['e'] = 0 ];                                                                 // 295
        }                                                                                            // 296
        id = 0;                                                                                      // 297
    }                                                                                                // 298
                                                                                                     // 299
                                                                                                     // 300
    // CONSTRUCTOR PROPERTIES/METHODS                                                                // 301
                                                                                                     // 302
                                                                                                     // 303
    BigNumber['ROUND_UP'] = 0;                                                                       // 304
    BigNumber['ROUND_DOWN'] = 1;                                                                     // 305
    BigNumber['ROUND_CEIL'] = 2;                                                                     // 306
    BigNumber['ROUND_FLOOR'] = 3;                                                                    // 307
    BigNumber['ROUND_HALF_UP'] = 4;                                                                  // 308
    BigNumber['ROUND_HALF_DOWN'] = 5;                                                                // 309
    BigNumber['ROUND_HALF_EVEN'] = 6;                                                                // 310
    BigNumber['ROUND_HALF_CEIL'] = 7;                                                                // 311
    BigNumber['ROUND_HALF_FLOOR'] = 8;                                                               // 312
                                                                                                     // 313
                                                                                                     // 314
    /*                                                                                               // 315
     * Configure infrequently-changing library-wide settings.                                        // 316
     *                                                                                               // 317
     * Accept an object or an argument list, with one or many of the following properties or         // 318
     * parameters respectively:                                                                      // 319
     * [ DECIMAL_PLACES [, ROUNDING_MODE [, EXPONENTIAL_AT [, RANGE [, ERRORS [, FORMAT ]]]]]]       // 320
     *                                                                                               // 321
     *   DECIMAL_PLACES  {number}  Integer, 0 to MAX inclusive.                                      // 322
     *   ROUNDING_MODE   {number}  Integer, 0 to 8 inclusive.                                        // 323
     *   EXPONENTIAL_AT  {number|number[]}  Integer, -MAX to MAX inclusive or                        // 324
     *                                      [ integer -MAX to 0 incl., 0 to MAX incl. ].             // 325
     *   RANGE           {number|number[]}  Non-zero integer, -MAX to MAX inclusive or               // 326
     *                                      [ integer -MAX to -1 incl., integer 1 to MAX incl. ].    // 327
     *   ERRORS          {boolean|number}   true, false, 1 or 0.                                     // 328
     *   FORMAT          {object}           See BigNumber.prototype.toFormat.                        // 329
     *      decimalSeparator       {string}                                                          // 330
     *      groupSeparator         {string}                                                          // 331
     *      groupSize              {number}                                                          // 332
     *      secondaryGroupSize     {number}                                                          // 333
     *      fractionGroupSeparator {string}                                                          // 334
     *      fractionGroupSize      {number}                                                          // 335
     *                                                                                               // 336
     * The validity of the values assigned to the above FORMAT object properties is not checked.     // 337
     *                                                                                               // 338
     * E.g.                                                                                          // 339
     * BigNumber.config(20, 4) is equivalent to                                                      // 340
     * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })                                  // 341
     *                                                                                               // 342
     * Ignore properties/parameters set to null or undefined.                                        // 343
     * Return an object with the properties current values.                                          // 344
     */                                                                                              // 345
    BigNumber['config'] = function () {                                                              // 346
        var v, p,                                                                                    // 347
            i = 0,                                                                                   // 348
            r = {},                                                                                  // 349
            a = arguments,                                                                           // 350
            o = a[0],                                                                                // 351
            c = 'config',                                                                            // 352
            inRange = function ( n, lo, hi ) {                                                       // 353
              return !( ( outOfRange = n < lo || n > hi ) || parse(n) != n && n !== 0 );             // 354
            },                                                                                       // 355
            has = o && typeof o == 'object'                                                          // 356
              ? function () {if ( o.hasOwnProperty(p) ) return ( v = o[p] ) != null}                 // 357
              : function () {if ( a.length > i ) return ( v = a[i++] ) != null};                     // 358
                                                                                                     // 359
        // [DECIMAL_PLACES] {number} Integer, 0 to MAX inclusive.                                    // 360
        if ( has( p = 'DECIMAL_PLACES' ) ) {                                                         // 361
                                                                                                     // 362
            if ( inRange( v, 0, MAX ) ) {                                                            // 363
                DECIMAL_PLACES = v | 0;                                                              // 364
            } else {                                                                                 // 365
                                                                                                     // 366
                // 'config() DECIMAL_PLACES not an integer: {v}'                                     // 367
                // 'config() DECIMAL_PLACES out of range: {v}'                                       // 368
                ifExceptionsThrow( v, p, c );                                                        // 369
            }                                                                                        // 370
        }                                                                                            // 371
        r[p] = DECIMAL_PLACES;                                                                       // 372
                                                                                                     // 373
        // [ROUNDING_MODE] {number} Integer, 0 to 8 inclusive.                                       // 374
        if ( has( p = 'ROUNDING_MODE' ) ) {                                                          // 375
                                                                                                     // 376
            if ( inRange( v, 0, 8 ) ) {                                                              // 377
                ROUNDING_MODE = v | 0;                                                               // 378
            } else {                                                                                 // 379
                                                                                                     // 380
                // 'config() ROUNDING_MODE not an integer: {v}'                                      // 381
                // 'config() ROUNDING_MODE out of range: {v}'                                        // 382
                ifExceptionsThrow( v, p, c );                                                        // 383
            }                                                                                        // 384
        }                                                                                            // 385
        r[p] = ROUNDING_MODE;                                                                        // 386
                                                                                                     // 387
        // [EXPONENTIAL_AT] {number|number[]}                                                        // 388
        // Integer, -MAX to MAX inclusive or [ integer -MAX to 0 inclusive, 0 to MAX inclusive ].    // 389
        if ( has( p = 'EXPONENTIAL_AT' ) ) {                                                         // 390
                                                                                                     // 391
            if ( inRange( v, -MAX, MAX ) ) {                                                         // 392
                TO_EXP_NEG = -( TO_EXP_POS = ~~( v < 0 ? -v : +v ) );                                // 393
            } else if ( !outOfRange && v && inRange( v[0], -MAX, 0 ) && inRange( v[1], 0, MAX ) ) {  // 394
                TO_EXP_NEG = ~~v[0];                                                                 // 395
                TO_EXP_POS = ~~v[1];                                                                 // 396
            } else {                                                                                 // 397
                                                                                                     // 398
                // 'config() EXPONENTIAL_AT not an integer or not [integer, integer]: {v}'           // 399
                // 'config() EXPONENTIAL_AT out of range or not [negative, positive: {v}'            // 400
                ifExceptionsThrow( v, p, c, 1 );                                                     // 401
            }                                                                                        // 402
        }                                                                                            // 403
        r[p] = [ TO_EXP_NEG, TO_EXP_POS ];                                                           // 404
                                                                                                     // 405
        // [RANGE][ {number|number[]} Non-zero integer, -MAX to MAX inclusive or                     // 406
        // [ integer -MAX to -1 inclusive, integer 1 to MAX inclusive ].                             // 407
        if ( has( p = 'RANGE' ) ) {                                                                  // 408
                                                                                                     // 409
            if ( inRange( v, -MAX, MAX ) && ~~v ) {                                                  // 410
                MIN_EXP = -( MAX_EXP = ~~( v < 0 ? -v : +v ) );                                      // 411
            } else if ( !outOfRange && v && inRange( v[0], -MAX, -1 ) && inRange( v[1], 1, MAX ) ) { // 412
                MIN_EXP = ~~v[0];                                                                    // 413
                MAX_EXP = ~~v[1];                                                                    // 414
            } else {                                                                                 // 415
                                                                                                     // 416
                // 'config() RANGE not a non-zero integer or not [integer, integer]: {v}'            // 417
                // 'config() RANGE out of range or not [negative, positive: {v}'                     // 418
                ifExceptionsThrow( v, p, c, 1, 1 );                                                  // 419
            }                                                                                        // 420
        }                                                                                            // 421
        r[p] = [ MIN_EXP, MAX_EXP ];                                                                 // 422
                                                                                                     // 423
        // [ERRORS] {boolean|number} true, false, 1 or 0.                                            // 424
        if ( has( p = 'ERRORS' ) ) {                                                                 // 425
                                                                                                     // 426
            if ( v === !!v || v === 1 || v === 0 ) {                                                 // 427
                outOfRange = id = 0;                                                                 // 428
                parse = ( ERRORS = !!v ) ? parseInt : parseFloat;                                    // 429
            } else {                                                                                 // 430
                                                                                                     // 431
                // 'config() ERRORS not a boolean or binary digit: {v}'                              // 432
                ifExceptionsThrow( v, p, c, 0, 0, 1 );                                               // 433
            }                                                                                        // 434
        }                                                                                            // 435
        r[p] = ERRORS;                                                                               // 436
                                                                                                     // 437
        // [FORMAT] {object}                                                                         // 438
        if ( has( p = 'FORMAT' ) ) {                                                                 // 439
                                                                                                     // 440
            if ( typeof v == 'object' ) {                                                            // 441
                FORMAT = v;                                                                          // 442
            } else if (ERRORS) {                                                                     // 443
                                                                                                     // 444
                // 'config() FORMAT not an object: {v}'                                              // 445
                r = new Error( c + '() ' + p + ' not an object: ' + v );                             // 446
                r['name'] = 'BigNumber Error';                                                       // 447
                throw r;                                                                             // 448
            }                                                                                        // 449
        }                                                                                            // 450
        r[p] = FORMAT;                                                                               // 451
                                                                                                     // 452
        return r;                                                                                    // 453
    };                                                                                               // 454
                                                                                                     // 455
                                                                                                     // 456
    // PRIVATE FUNCTIONS                                                                             // 457
                                                                                                     // 458
                                                                                                     // 459
    /*                                                                                               // 460
     * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.       // 461
     * Called by minus, plus and times.                                                              // 462
     */                                                                                              // 463
    function normalise( bn, c, e ) {                                                                 // 464
        var i = 1,                                                                                   // 465
            j = c.length;                                                                            // 466
                                                                                                     // 467
         // Remove trailing zeros.                                                                   // 468
        for ( ; !c[--j]; c.pop() );                                                                  // 469
                                                                                                     // 470
        // Calculate the base 10 exponent. First get the number of digits of c[0].                   // 471
        for ( j = c[0]; j >= 10; j /= 10, i++ );                                                     // 472
                                                                                                     // 473
        // Overflow?                                                                                 // 474
        if ( ( e = i + e * LOG_BASE - 1 ) > MAX_EXP ) {                                              // 475
                                                                                                     // 476
            // Infinity.                                                                             // 477
            bn['c'] = bn['e'] = null;                                                                // 478
                                                                                                     // 479
        // Underflow?                                                                                // 480
        } else if ( e < MIN_EXP ) {                                                                  // 481
                                                                                                     // 482
            // Zero.                                                                                 // 483
            bn['c'] = [ bn['e'] = 0 ];                                                               // 484
        } else {                                                                                     // 485
            bn['e'] = e;                                                                             // 486
            bn['c'] = c;                                                                             // 487
        }                                                                                            // 488
                                                                                                     // 489
        return bn;                                                                                   // 490
    }                                                                                                // 491
                                                                                                     // 492
                                                                                                     // 493
    /*                                                                                               // 494
     * Returns the coefficient array as a string of base 10 digits.                                  // 495
     */                                                                                              // 496
    function coefficientToString(a) {                                                                // 497
        var s, z,                                                                                    // 498
            i = 1,                                                                                   // 499
            j = a.length,                                                                            // 500
            r = a[0] + '';                                                                           // 501
                                                                                                     // 502
        for ( ; i < j; ) {                                                                           // 503
            s = a[i++] + '';                                                                         // 504
            z = LOG_BASE - s.length;                                                                 // 505
            for ( ; z--; s = '0' + s );                                                              // 506
            r += s;                                                                                  // 507
        }                                                                                            // 508
                                                                                                     // 509
        // '0'                                                                                       // 510
        for ( j = r.length; r.charCodeAt(--j) === 48; );                                             // 511
                                                                                                     // 512
        return r.slice( 0, j + 1 || 1 );                                                             // 513
    }                                                                                                // 514
                                                                                                     // 515
                                                                                                     // 516
    /*                                                                                               // 517
     * Convert string of baseIn to an array of numbers of baseOut.                                   // 518
     * Eg. convertBase('255', 10, 16) returns [15, 15].                                              // 519
     * Eg. convertBase('ff', 16, 10) returns [2, 5, 5].                                              // 520
     */                                                                                              // 521
    function toBaseOut( str, baseIn, baseOut ) {                                                     // 522
        var j,                                                                                       // 523
            arr = [0],                                                                               // 524
            arrL,                                                                                    // 525
            i = 0,                                                                                   // 526
            strL = str.length;                                                                       // 527
                                                                                                     // 528
        for ( ; i < strL; ) {                                                                        // 529
            for ( arrL = arr.length; arrL--; arr[arrL] *= baseIn );                                  // 530
            arr[ j = 0 ] += DIGITS.indexOf( str.charAt( i++ ) );                                     // 531
                                                                                                     // 532
            for ( ; j < arr.length; j++ ) {                                                          // 533
                                                                                                     // 534
                if ( arr[j] > baseOut - 1 ) {                                                        // 535
                    if ( arr[j + 1] == null ) arr[j + 1] = 0;                                        // 536
                    arr[j + 1] += arr[j] / baseOut | 0;                                              // 537
                    arr[j] %= baseOut;                                                               // 538
                }                                                                                    // 539
            }                                                                                        // 540
        }                                                                                            // 541
                                                                                                     // 542
        return arr.reverse();                                                                        // 543
    }                                                                                                // 544
                                                                                                     // 545
    /*                                                                                               // 546
     * Convert a numeric string of baseIn to a numeric string of baseOut.                            // 547
     */                                                                                              // 548
    function convertBase( str, baseOut, baseIn, sign ) {                                             // 549
        var d, e, j, r, x, xc, y,                                                                    // 550
            i = str.indexOf( '.' ),                                                                  // 551
            rm = ROUNDING_MODE;                                                                      // 552
                                                                                                     // 553
        if ( baseIn < 37 ) str = str.toLowerCase();                                                  // 554
                                                                                                     // 555
        // Non-integer.                                                                              // 556
        if ( i >= 0 ) {                                                                              // 557
            str = str.replace( '.', '' );                                                            // 558
            y = new BigNumber(baseIn);                                                               // 559
            x = y['pow']( str.length - i );                                                          // 560
                                                                                                     // 561
            // Convert str as if an integer, then restore the fraction part by dividing the result   // 562
            // by its base raised to a power. Use toFixed to avoid possible exponential notation.    // 563
            y['c'] = toBaseOut( x.toFixed(), 10, baseOut );                                          // 564
            y['e'] = y['c'].length;                                                                  // 565
        }                                                                                            // 566
                                                                                                     // 567
        // Convert the number as integer.                                                            // 568
        xc = toBaseOut( str, baseIn, baseOut );                                                      // 569
        e = j = xc.length;                                                                           // 570
                                                                                                     // 571
        // Remove trailing zeros.                                                                    // 572
        for ( ; xc[--j] == 0; xc.pop() );                                                            // 573
        if ( !xc[0] ) return '0';                                                                    // 574
                                                                                                     // 575
        if ( i < 0 ) {                                                                               // 576
            --e;                                                                                     // 577
        } else {                                                                                     // 578
            x['c'] = xc;                                                                             // 579
            x['e'] = e;                                                                              // 580
            // sign is needed for correct rounding.                                                  // 581
            x['s'] = sign;                                                                           // 582
            x = div( x, y, DECIMAL_PLACES, rm, baseOut );                                            // 583
            xc = x['c'];                                                                             // 584
            r = x['r'];                                                                              // 585
            e = x['e'];                                                                              // 586
        }                                                                                            // 587
        d = e + DECIMAL_PLACES + 1;                                                                  // 588
                                                                                                     // 589
        // The rounding digit, i.e. the digit after the digit that may be rounded up.                // 590
        i = xc[d];                                                                                   // 591
        j = baseOut / 2;                                                                             // 592
        r = r || d < 0 || xc[d + 1] != null;                                                         // 593
                                                                                                     // 594
        r = rm < 4                                                                                   // 595
          ? ( i != null || r ) && ( rm == 0 || rm == ( x['s'] < 0 ? 3 : 2 ) )                        // 596
          : i > j || i == j &&                                                                       // 597
            ( rm == 4 || r || rm == 6 && xc[d - 1] & 1 || rm == ( x['s'] < 0 ? 8 : 7 ) );            // 598
                                                                                                     // 599
        if ( d < 1 || !xc[0] ) {                                                                     // 600
            xc.length = 1;                                                                           // 601
            j = 0;                                                                                   // 602
                                                                                                     // 603
            if (r) {                                                                                 // 604
                                                                                                     // 605
                // 1, 0.1, 0.01, 0.001, 0.0001 etc.                                                  // 606
                xc[0] = 1;                                                                           // 607
                e = -DECIMAL_PLACES;                                                                 // 608
            } else {                                                                                 // 609
                                                                                                     // 610
                // Zero.                                                                             // 611
                e = xc[0] = 0;                                                                       // 612
            }                                                                                        // 613
        } else {                                                                                     // 614
            xc.length = d;                                                                           // 615
                                                                                                     // 616
            if (r) {                                                                                 // 617
                                                                                                     // 618
                // Rounding up may mean the previous digit has to be rounded up and so on.           // 619
                for ( --baseOut; ++xc[--d] > baseOut; ) {                                            // 620
                    xc[d] = 0;                                                                       // 621
                                                                                                     // 622
                    if ( !d ) {                                                                      // 623
                        ++e;                                                                         // 624
                        xc.unshift(1);                                                               // 625
                    }                                                                                // 626
                }                                                                                    // 627
            }                                                                                        // 628
                                                                                                     // 629
            // Determine trailing zeros.                                                             // 630
            for ( j = xc.length; !xc[--j]; );                                                        // 631
        }                                                                                            // 632
                                                                                                     // 633
        // E.g. [4, 11, 15] becomes 4bf.                                                             // 634
        for ( i = 0, str = ''; i <= j; str += DIGITS.charAt( xc[i++] ) );                            // 635
                                                                                                     // 636
        // Negative exponent?                                                                        // 637
        if ( e < 0 ) {                                                                               // 638
                                                                                                     // 639
            // Prepend zeros.                                                                        // 640
            for ( ; ++e; str = '0' + str );                                                          // 641
            str = '0.' + str;                                                                        // 642
                                                                                                     // 643
        // Positive exponent?                                                                        // 644
        } else {                                                                                     // 645
            i = str.length;                                                                          // 646
                                                                                                     // 647
            // Append zeros.                                                                         // 648
            if ( ++e > i ) {                                                                         // 649
                for ( e -= i; e-- ; str += '0' );                                                    // 650
            } else if ( e < i ) {                                                                    // 651
                str = str.slice( 0, e ) + '.' + str.slice(e);                                        // 652
            }                                                                                        // 653
        }                                                                                            // 654
                                                                                                     // 655
        // No negative numbers: the caller will add the sign.                                        // 656
        return str;                                                                                  // 657
    }                                                                                                // 658
                                                                                                     // 659
                                                                                                     // 660
    /*                                                                                               // 661
     * Perform division in the specified base. Called by div and convertBase.                        // 662
     */                                                                                              // 663
    var div = ( function () {                                                                        // 664
                                                                                                     // 665
        // Assumes non-zero x and k.                                                                 // 666
        function multiply( x, k, base ) {                                                            // 667
            var m, temp, xlo, xhi,                                                                   // 668
                carry = 0,                                                                           // 669
                i = x.length,                                                                        // 670
                klo = k % SQRT_BASE,                                                                 // 671
                khi = k / SQRT_BASE | 0;                                                             // 672
                                                                                                     // 673
            for ( x = x.slice(); i--; ) {                                                            // 674
                xlo = x[i] % SQRT_BASE;                                                              // 675
                xhi = x[i] / SQRT_BASE | 0;                                                          // 676
                m = khi * xlo + xhi * klo;                                                           // 677
                temp = klo * xlo + ( ( m % SQRT_BASE ) * SQRT_BASE ) + carry;                        // 678
                carry = ( temp / base | 0 ) + ( m / SQRT_BASE | 0 ) + khi * xhi;                     // 679
                x[i] = temp % base;                                                                  // 680
            }                                                                                        // 681
            if (carry) x.unshift(carry);                                                             // 682
                                                                                                     // 683
            return x;                                                                                // 684
        }                                                                                            // 685
                                                                                                     // 686
        function compare( a, b, aL, bL ) {                                                           // 687
            var i, cmp;                                                                              // 688
                                                                                                     // 689
            if ( aL != bL ) {                                                                        // 690
                cmp = aL > bL ? 1 : -1;                                                              // 691
            } else {                                                                                 // 692
                                                                                                     // 693
                for ( i = cmp = 0; i < aL; i++ ) {                                                   // 694
                                                                                                     // 695
                    if ( a[i] != b[i] ) {                                                            // 696
                        cmp = a[i] > b[i] ? 1 : -1;                                                  // 697
                        break;                                                                       // 698
                    }                                                                                // 699
                }                                                                                    // 700
            }                                                                                        // 701
            return cmp;                                                                              // 702
        }                                                                                            // 703
                                                                                                     // 704
        function subtract( a, b, aL, base ) {                                                        // 705
            var i = 0;                                                                               // 706
                                                                                                     // 707
            // Subtract b from a.                                                                    // 708
            for ( ; aL--; ) {                                                                        // 709
                a[aL] -= i;                                                                          // 710
                i = a[aL] < b[aL] ? 1 : 0;                                                           // 711
                a[aL] = i * base + a[aL] - b[aL];                                                    // 712
            }                                                                                        // 713
                                                                                                     // 714
            // Remove leading zeros.                                                                 // 715
            for ( ; !a[0] && a.length > 1; a.shift() );                                              // 716
        }                                                                                            // 717
                                                                                                     // 718
        // x: dividend, y: divisor.                                                                  // 719
        return function ( x, y, dp, rm, base ) {                                                     // 720
            var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,                // 721
                yL, yz,                                                                              // 722
                s = x['s'] == y['s'] ? 1 : -1,                                                       // 723
                xc = x['c'],                                                                         // 724
                yc = y['c'];                                                                         // 725
                                                                                                     // 726
            // Either NaN, Infinity or 0?                                                            // 727
            if ( !xc || !xc[0] || !yc || !yc[0] ) {                                                  // 728
                                                                                                     // 729
                return new BigNumber(                                                                // 730
                                                                                                     // 731
                  // Return NaN if either NaN, or both Infinity or 0.                                // 732
                  !x['s'] || !y['s'] || ( xc ? yc && xc[0] == yc[0] : !yc ) ? NaN :                  // 733
                                                                                                     // 734
                    // Return +-0 if x is 0 or y is +-Infinity, or return +-Infinity as y is 0.      // 735
                    xc && xc[0] == 0 || !yc ? s * 0 : s / 0                                          // 736
                );                                                                                   // 737
            }                                                                                        // 738
                                                                                                     // 739
            q = new BigNumber(s);                                                                    // 740
            qc = q['c'] = [];                                                                        // 741
            e = x['e'] - y['e'];                                                                     // 742
            s = dp + e + 1;                                                                          // 743
                                                                                                     // 744
            if ( !base ) {                                                                           // 745
                base = BASE;                                                                         // 746
                                                                                                     // 747
                //e = mathfloor( x['e'] / LOG_BASE ) - mathfloor( y['e'] / LOG_BASE );               // 748
                e = ( xL = x['e'] / LOG_BASE, i = xL | 0, xL > 0 || xL === i ? i : i - 1 ) -         // 749
                    ( yL = y['e'] / LOG_BASE, i = yL | 0, yL > 0 || yL === i ? i : i - 1 );          // 750
                                                                                                     // 751
                s = s / LOG_BASE | 0;                                                                // 752
            }                                                                                        // 753
                                                                                                     // 754
            // Result exponent may be one less then the current value of e.                          // 755
            // The coefficients of the BigNumbers from convertBase may have trailing zeros.          // 756
            for ( i = 0; yc[i] == ( xc[i] || 0 ); i++ );                                             // 757
            if ( yc[i] > ( xc[i] || 0 ) ) e--;                                                       // 758
                                                                                                     // 759
            if ( s < 0 ) {                                                                           // 760
                qc.push(1);                                                                          // 761
                more = true;                                                                         // 762
            } else {                                                                                 // 763
                xL = xc.length;                                                                      // 764
                yL = yc.length;                                                                      // 765
                i = 0;                                                                               // 766
                s += 2;                                                                              // 767
                                                                                                     // 768
                /*                                                                                   // 769
                // TODO: fast path division when divisor < base                                      // 770
                if ( yL == 1 ) {                                                                     // 771
                    n = 0;                                                                           // 772
                    yc = yc[0];                                                                      // 773
                    s++;                                                                             // 774
                    // n is the carry.                                                               // 775
                    for ( ; ( i < xL || n ) && s--; i++ ) {                                          // 776
                        // Can't use this, it will overflow 2^53.                                    // 777
                        var t = n * base + ( xc[i] || 0 );                                           // 778
                        qc[i] = mathfloor( t / yc );                                                 // 779
                        n = t % yc;                                                                  // 780
                    }                                                                                // 781
                    more = n || i < xL;                                                              // 782
                                                                                                     // 783
                // divisor >= base                                                                   // 784
                } else {                                                                             // 785
                */                                                                                   // 786
                    // Normalise xc and yc so highest order digit of yc is >= base/2                 // 787
                                                                                                     // 788
                    n = mathfloor( base / ( yc[0] + 1 ) );                                           // 789
                                                                                                     // 790
                    if ( n > 1 ) {                                                                   // 791
                        yc = multiply( yc, n, base );                                                // 792
                        xc = multiply( xc, n, base );                                                // 793
                        yL = yc.length;                                                              // 794
                        xL = xc.length;                                                              // 795
                    }                                                                                // 796
                                                                                                     // 797
                    xi = yL;                                                                         // 798
                    rem = xc.slice( 0, yL );                                                         // 799
                    remL = rem.length;                                                               // 800
                                                                                                     // 801
                    // Add zeros to make remainder as long as divisor.                               // 802
                    for ( ; remL < yL; rem[remL++] = 0 );                                            // 803
                    yz = yc.slice();                                                                 // 804
                    yz.unshift(0);                                                                   // 805
                    yc0 = yc[0];                                                                     // 806
                    if ( yc[1] >= base / 2 ) yc0++;                                                  // 807
                                                                                                     // 808
                    do {                                                                             // 809
                        n = 0;                                                                       // 810
                                                                                                     // 811
                        // Compare divisor and remainder.                                            // 812
                        cmp = compare( yc, rem, yL, remL );                                          // 813
                                                                                                     // 814
                        // If divisor < remainder.                                                   // 815
                        if ( cmp < 0 ) {                                                             // 816
                                                                                                     // 817
                            // Calculate trial digit, n.                                             // 818
                                                                                                     // 819
                            rem0 = rem[0];                                                           // 820
                            if ( yL != remL ) rem0 = rem0 * base + ( rem[1] || 0 );                  // 821
                                                                                                     // 822
                            // n is how many times the divisor goes into the current remainder.      // 823
                            n = mathfloor( rem0 / yc0 );                                             // 824
                                                                                                     // 825
                                                                                                     // 826
                            //  Algorithm:                                                           // 827
                            //  1. product = divisor * trial digit (n)                               // 828
                            //  2. if product > remainder: product -= divisor, n--                   // 829
                            //  3. remainder -= product                                              // 830
                            //  4. if product was < remainder at 2:                                  // 831
                            //    5. compare new remainder and divisor                               // 832
                            //    6. If remainder > divisor: remainder -= divisor, n++               // 833
                                                                                                     // 834
                            if ( n > 1 ) {                                                           // 835
                                if ( n >= base ) n = base - 1;                                       // 836
                                                                                                     // 837
                                // product = divisor * trial digit.                                  // 838
                                prod = multiply( yc, n, base );                                      // 839
                                prodL = prod.length;                                                 // 840
                                remL = rem.length;                                                   // 841
                                                                                                     // 842
                                // Compare product and remainder.                                    // 843
                                cmp = compare( prod, rem, prodL, remL );                             // 844
                                                                                                     // 845
                                // product > remainder.                                              // 846
                                if ( cmp == 1 ) {                                                    // 847
                                    n--;                                                             // 848
                                                                                                     // 849
                                    // Subtract divisor from product.                                // 850
                                    subtract( prod, yL < prodL ? yz : yc, prodL, base );             // 851
                                }                                                                    // 852
                            } else {                                                                 // 853
                                                                                                     // 854
                                // cmp is -1.                                                        // 855
                                // If n is 0, there is no need to compare yc and rem again below,    // 856
                                // so change cmp to 1 to avoid it.                                   // 857
                                // If n is 1, compare yc and rem again below.                        // 858
                                if ( n == 0 ) cmp = n = 1;                                           // 859
                                prod = yc.slice();                                                   // 860
                            }                                                                        // 861
                                                                                                     // 862
                            prodL = prod.length;                                                     // 863
                            if ( prodL < remL ) prod.unshift(0);                                     // 864
                                                                                                     // 865
                            // Subtract product from remainder.                                      // 866
                            subtract( rem, prod, remL, base );                                       // 867
                                                                                                     // 868
                            // If product was < previous remainder.                                  // 869
                            if ( cmp == -1 ) {                                                       // 870
                                remL = rem.length;                                                   // 871
                                                                                                     // 872
                                // Compare divisor and new remainder.                                // 873
                                cmp = compare( yc, rem, yL, remL );                                  // 874
                                                                                                     // 875
                                // If divisor < new remainder, subtract divisor from remainder.      // 876
                                if ( cmp < 1 ) {                                                     // 877
                                    n++;                                                             // 878
                                                                                                     // 879
                                    // Subtract divisor from remainder.                              // 880
                                    subtract( rem, yL < remL ? yz : yc, remL, base );                // 881
                                }                                                                    // 882
                            }                                                                        // 883
                            remL = rem.length;                                                       // 884
                        } else if ( cmp === 0 ) {                                                    // 885
                            n++;                                                                     // 886
                            rem = [0];                                                               // 887
                        }    // if cmp === 1, n will be 0                                            // 888
                                                                                                     // 889
                        // Add the next digit, n, to the result array.                               // 890
                        qc[i++] = n;                                                                 // 891
                                                                                                     // 892
                        // Update the remainder.                                                     // 893
                        if ( cmp && rem[0] ) {                                                       // 894
                            rem[remL++] = xc[xi] || 0;                                               // 895
                        } else {                                                                     // 896
                            rem = [ xc[xi] ];                                                        // 897
                            remL = 1;                                                                // 898
                        }                                                                            // 899
                    } while ( ( xi++ < xL || rem[0] != null ) && s-- );                              // 900
                                                                                                     // 901
                    more = rem[0] != null;                                                           // 902
                //}                                                                                  // 903
                                                                                                     // 904
                // Leading zero?                                                                     // 905
                if ( !qc[0] ) qc.shift();                                                            // 906
            }                                                                                        // 907
                                                                                                     // 908
            if ( base == BASE ) {                                                                    // 909
                                                                                                     // 910
                // To calculate q.e, first get the number of digits of qc[0].                        // 911
                for ( i = 1, s = qc[0]; s >= 10; s /= 10, i++ );                                     // 912
                rnd( q, dp + ( q['e'] = i + e * LOG_BASE - 1 ) + 1, rm, more );                      // 913
                                                                                                     // 914
            // div is being used for base conversion.                                                // 915
            } else {                                                                                 // 916
                q['e'] = e;                                                                          // 917
                q['r'] = +more;                                                                      // 918
            }                                                                                        // 919
            return q;                                                                                // 920
        };                                                                                           // 921
    })();                                                                                            // 922
                                                                                                     // 923
                                                                                                     // 924
    /*                                                                                               // 925
     * Return a string representing the value of BigNumber n in normal or exponential notation       // 926
     * rounded to the specified decimal places or significant digits.                                // 927
     *                                                                                               // 928
     * Called by toString (k: 1), toExponential (k: 1), toFixed (k: undefined), toPrecision (k: 2).  // 929
     * i is the index (with the value in normal notation) of the digit that may be rounded up.       // 930
     * d is the number of digits required including fraction-part trailing zeros.                    // 931
     * z is the number of zeros to be appended.                                                      // 932
     */                                                                                              // 933
    function format( n, i, k ) {                                                                     // 934
        var d, str, z,                                                                               // 935
            e = ( n = new BigNumber(n) )['e'];                                                       // 936
                                                                                                     // 937
        // i == null when toExponential(no arg), or toString() when x >= toExpPos etc.               // 938
        if ( i == null ) {                                                                           // 939
            d = 0;                                                                                   // 940
        } else {                                                                                     // 941
            rnd( n, ++i, ROUNDING_MODE );                                                            // 942
                                                                                                     // 943
            // n['e'] may have changed if the value was rounded up.                                  // 944
            d = k ? i : i + n['e'] - e;                                                              // 945
            e = n['e'];                                                                              // 946
        }                                                                                            // 947
        str = coefficientToString( n['c'] );                                                         // 948
                                                                                                     // 949
        // toPrecision returns exponential notation if the number of significant digits specified    // 950
        // is less than the number of digits necessary to represent the integer part of the value    // 951
        // in normal notation.                                                                       // 952
                                                                                                     // 953
        // Exponential notation.                                                                     // 954
        if ( k == 1 || k == 2 && ( i <= e || e <= TO_EXP_NEG ) ) {                                   // 955
                                                                                                     // 956
            // Append zeros?                                                                         // 957
            for ( ; str.length < d; str += '0' );                                                    // 958
            if ( str.length > 1 ) str = str.charAt(0) + '.' + str.slice(1);                          // 959
            str += ( e < 0 ? 'e' : 'e+' ) + e;                                                       // 960
                                                                                                     // 961
        // Fixed point notation.                                                                     // 962
        } else {                                                                                     // 963
            k = str.length;                                                                          // 964
                                                                                                     // 965
            // Negative exponent?                                                                    // 966
            if ( e < 0 ) {                                                                           // 967
                z = d - k;                                                                           // 968
                                                                                                     // 969
                // Prepend zeros.                                                                    // 970
                for ( ; ++e; str = '0' + str );                                                      // 971
                str = '0.' + str;                                                                    // 972
                                                                                                     // 973
            // Positive exponent?                                                                    // 974
            } else {                                                                                 // 975
                                                                                                     // 976
                if ( ++e > k ) {                                                                     // 977
                    z = d - e;                                                                       // 978
                                                                                                     // 979
                    // Append zeros.                                                                 // 980
                    for ( e -= k; e-- ; str += '0' );                                                // 981
                    if ( z > 0 ) str += '.';                                                         // 982
                } else {                                                                             // 983
                    z = d - k;                                                                       // 984
                                                                                                     // 985
                    if ( e < k ) {                                                                   // 986
                        str = str.slice( 0, e ) + '.' + str.slice(e);                                // 987
                    } else if ( z > 0 ) {                                                            // 988
                        str += '.';                                                                  // 989
                    }                                                                                // 990
                }                                                                                    // 991
            }                                                                                        // 992
                                                                                                     // 993
            // Append more zeros?                                                                    // 994
            if ( z > 0 ) for ( ; z--; str += '0' );                                                  // 995
        }                                                                                            // 996
        return n['s'] < 0 && n['c'][0] ? '-' + str : str;                                            // 997
    }                                                                                                // 998
                                                                                                     // 999
                                                                                                     // 1000
    // Assemble error messages. Throw BigNumber Errors.                                              // 1001
    function ifExceptionsThrow( arg, i, j, isArray, isRange, isErrors) {                             // 1002
                                                                                                     // 1003
        if (ERRORS) {                                                                                // 1004
            var error,                                                                               // 1005
                method = ['new BigNumber', 'cmp', 'div', 'eq', 'gt', 'gte', 'lt',                    // 1006
                     'lte', 'minus', 'mod', 'plus', 'times', 'toFraction', 'divToInt'                // 1007
                    ][ id ? id < 0 ? -id : id : 1 / id < 0 ? 1 : 0 ] + '()',                         // 1008
                message = outOfRange ? ' out of range' : ' not a' +                                  // 1009
                  ( isRange ? ' non-zero' : 'n' ) + ' integer';                                      // 1010
                                                                                                     // 1011
            message = ( [                                                                            // 1012
                method + ' number type has more than 15 significant digits',                         // 1013
                method + ' not a base ' + j + ' number',                                             // 1014
                method + ' base' + message,                                                          // 1015
                method + ' not a number' ][i] ||                                                     // 1016
                  j + '() ' + i + ( isErrors                                                         // 1017
                    ? ' not a boolean or binary digit'                                               // 1018
                    : message + ( isArray                                                            // 1019
                      ? ' or not [' + ( outOfRange                                                   // 1020
                        ? ' negative, positive'                                                      // 1021
                        : ' integer, integer' ) + ' ]'                                               // 1022
                      : '' ) ) ) + ': ' + arg;                                                       // 1023
                                                                                                     // 1024
            outOfRange = id = 0;                                                                     // 1025
            error = new Error(message);                                                              // 1026
            error['name'] = 'BigNumber Error';                                                       // 1027
            throw error;                                                                             // 1028
        }                                                                                            // 1029
    }                                                                                                // 1030
                                                                                                     // 1031
                                                                                                     // 1032
    /*                                                                                               // 1033
     * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.           // 1034
     */                                                                                              // 1035
    function rnd( x, sd, rm, r ) {                                                                   // 1036
        var d, i, j, k, n, ni, rd, xc,                                                               // 1037
            pows10 = POWS_TEN;                                                                       // 1038
                                                                                                     // 1039
        // if x is not Infinity or NaN...                                                            // 1040
        if ( xc = x['c'] ) {                                                                         // 1041
                                                                                                     // 1042
            // rd: the rounding digit, i.e. the digit after the digit that may be rounded up         // 1043
            // n: a base 1e14 number, the value of the element of array x.c containing rd            // 1044
            // ni: the index of n within x.c                                                         // 1045
            // d: the number of digits of n                                                          // 1046
            // i: what would be the index of rd within n if all the numbers were 14 digits long      // 1047
            // (i.e. they had leading zeros)                                                         // 1048
            // j: if > 0, the actual index of rd within n (if < 0, rd is a leading zero)             // 1049
            out: {                                                                                   // 1050
                                                                                                     // 1051
                // Get the number of digits of the first element of xc.                              // 1052
                for ( d = 1, k = xc[0]; k >= 10; k /= 10, d++ );                                     // 1053
                i = sd - d;                                                                          // 1054
                                                                                                     // 1055
                // If the rounding digit is in the first element of xc...                            // 1056
                if ( i < 0 ) {                                                                       // 1057
                    i += LOG_BASE;                                                                   // 1058
                    j = sd;                                                                          // 1059
                    n = xc[ ni = 0 ];                                                                // 1060
                                                                                                     // 1061
                    // Get the rounding digit at index j of n.                                       // 1062
                    rd = n / pows10[ d - j - 1 ] % 10 | 0;                                           // 1063
                } else {                                                                             // 1064
                    ni = Math.ceil( ( i + 1 ) / LOG_BASE );                                          // 1065
                                                                                                     // 1066
                    if ( ni >= xc.length ) {                                                         // 1067
                                                                                                     // 1068
                        if (r) {                                                                     // 1069
                                                                                                     // 1070
                            // Needed by sqrt.                                                       // 1071
                            for ( ; xc.length <= ni; xc.push(0) );                                   // 1072
                            n = rd = 0;                                                              // 1073
                            d = 1;                                                                   // 1074
                            i %= LOG_BASE;                                                           // 1075
                            j = i - LOG_BASE + 1;                                                    // 1076
                        } else {                                                                     // 1077
                            break out;                                                               // 1078
                        }                                                                            // 1079
                    } else {                                                                         // 1080
                        n = k = xc[ni];                                                              // 1081
                                                                                                     // 1082
                        // Get the number of digits of n.                                            // 1083
                        for ( d = 1; k >= 10; k /= 10, d++ );                                        // 1084
                                                                                                     // 1085
                        // Get the index of rd within n.                                             // 1086
                        i %= LOG_BASE;                                                               // 1087
                                                                                                     // 1088
                        // Get the index of rd within n, adjusted for leading zeros.                 // 1089
                        // The number of leading zeros of n is given by LOG_BASE - d.                // 1090
                        j = i - LOG_BASE + d;                                                        // 1091
                                                                                                     // 1092
                        // Get the rounding digit at index j of n.                                   // 1093
                        rd = j < 0 ? 0 : n / pows10[ d - j - 1 ] % 10 | 0;                           // 1094
                    }                                                                                // 1095
                }                                                                                    // 1096
                                                                                                     // 1097
                r = r || sd < 0 ||                                                                   // 1098
                                                                                                     // 1099
                // Are there any non-zero digits after the rounding digit?                           // 1100
                // The expression  n % pows10[ d - j - 1 ]  returns all the digits of n to the right // 1101
                // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.      // 1102
                  xc[ni + 1] != null || ( j < 0 ? n : n % pows10[ d - j - 1 ] );                     // 1103
                                                                                                     // 1104
                r = rm < 4                                                                           // 1105
                  ? ( rd || r ) && ( rm == 0 || rm == ( x['s'] < 0 ? 3 : 2 ) )                       // 1106
                  : rd > 5 || rd == 5 && ( rm == 4 || r || rm == 6 &&                                // 1107
                                                                                                     // 1108
                    // Check whether the digit to the left of the rounding digit is odd.             // 1109
                    ( ( i > 0 ? j > 0 ? n / pows10[ d - j ] : 0 : xc[ni - 1] ) % 10 ) & 1 ||         // 1110
                      rm == ( x['s'] < 0 ? 8 : 7 ) );                                                // 1111
                                                                                                     // 1112
                if ( sd < 1 || !xc[0] ) {                                                            // 1113
                    xc.length = 0;                                                                   // 1114
                                                                                                     // 1115
                    if (r) {                                                                         // 1116
                                                                                                     // 1117
                        // Convert sd to decimal places.                                             // 1118
                        sd -= x['e'] + 1;                                                            // 1119
                                                                                                     // 1120
                        // 1, 0.1, 0.01, 0.001, 0.0001 etc.                                          // 1121
                        xc[0] = pows10[ sd % LOG_BASE ];                                             // 1122
                        x['e'] = -sd || 0;                                                           // 1123
                    } else {                                                                         // 1124
                                                                                                     // 1125
                        // Zero.                                                                     // 1126
                        xc[0] = x['e'] = 0;                                                          // 1127
                    }                                                                                // 1128
                                                                                                     // 1129
                    return x;                                                                        // 1130
                }                                                                                    // 1131
                                                                                                     // 1132
                // Remove excess digits.                                                             // 1133
                if ( i == 0 ) {                                                                      // 1134
                    xc.length = ni;                                                                  // 1135
                    k = 1;                                                                           // 1136
                    ni--;                                                                            // 1137
                } else {                                                                             // 1138
                    xc.length = ni + 1;                                                              // 1139
                    k = pows10[ LOG_BASE - i ];                                                      // 1140
                                                                                                     // 1141
                    // E.g. 56700 becomes 56000 if 7 is the rounding digit.                          // 1142
                    // j > 0 means i > number of leading zeros of n.                                 // 1143
                    xc[ni] = j > 0 ? mathfloor( n / pows10[ d - j ] % pows10[j] ) * k : 0;           // 1144
                }                                                                                    // 1145
                                                                                                     // 1146
                // Round up?                                                                         // 1147
                if (r) {                                                                             // 1148
                                                                                                     // 1149
                    for ( ; ; ) {                                                                    // 1150
                                                                                                     // 1151
                        // If the digit to be rounded up is in the first element of xc...            // 1152
                        if ( ni == 0 ) {                                                             // 1153
                                                                                                     // 1154
                            // i will be the length of xc[0] before k is added.                      // 1155
                            for ( i = 1, j = xc[0]; j >= 10; j /= 10, i++ );                         // 1156
                            j = xc[0] += k;                                                          // 1157
                            for ( k = 1; j >= 10; j /= 10, k++ );                                    // 1158
                                                                                                     // 1159
                            // if i != k the length has increased.                                   // 1160
                            if ( i != k ) {                                                          // 1161
                                x['e']++;                                                            // 1162
                                if ( xc[0] == BASE ) xc[0] = 1;                                      // 1163
                            }                                                                        // 1164
                            break;                                                                   // 1165
                        } else {                                                                     // 1166
                            xc[ni] += k;                                                             // 1167
                            if ( xc[ni] != BASE ) break;                                             // 1168
                            xc[ni--] = 0;                                                            // 1169
                            k = 1;                                                                   // 1170
                        }                                                                            // 1171
                    }                                                                                // 1172
                }                                                                                    // 1173
                                                                                                     // 1174
                // Remove trailing zeros.                                                            // 1175
                for ( i = xc.length; xc[--i] === 0; xc.pop() );                                      // 1176
            }                                                                                        // 1177
                                                                                                     // 1178
            // Overflow? Infinity.                                                                   // 1179
            if ( x['e'] > MAX_EXP ) {                                                                // 1180
                x['c'] = x['e'] = null;                                                              // 1181
                                                                                                     // 1182
            // Underflow? Zero.                                                                      // 1183
            } else if ( x['e'] < MIN_EXP ) {                                                         // 1184
                x['c'] = [ x['e'] = 0 ];                                                             // 1185
            }                                                                                        // 1186
        }                                                                                            // 1187
                                                                                                     // 1188
        return x;                                                                                    // 1189
    }                                                                                                // 1190
                                                                                                     // 1191
                                                                                                     // 1192
    // PROTOTYPE/INSTANCE METHODS                                                                    // 1193
                                                                                                     // 1194
                                                                                                     // 1195
    /*                                                                                               // 1196
     * Return a new BigNumber whose value is the absolute value of this BigNumber.                   // 1197
     */                                                                                              // 1198
    P['absoluteValue'] = P['abs'] = function () {                                                    // 1199
        var x = new BigNumber(this);                                                                 // 1200
        if ( x['s'] < 0 ) x['s'] = 1;                                                                // 1201
        return x;                                                                                    // 1202
    };                                                                                               // 1203
                                                                                                     // 1204
                                                                                                     // 1205
    /*                                                                                               // 1206
     * Return a new BigNumber whose value is the value of this BigNumber rounded to a whole number   // 1207
     * in the direction of Infinity.                                                                 // 1208
     */                                                                                              // 1209
    P['ceil'] = function () {                                                                        // 1210
        return rnd( new BigNumber(this), this['e'] + 1, 2 );                                         // 1211
    };                                                                                               // 1212
                                                                                                     // 1213
                                                                                                     // 1214
    /*                                                                                               // 1215
     * Return                                                                                        // 1216
     * 1 if the value of this BigNumber is greater than the value of BigNumber(y, b),                // 1217
     * -1 if the value of this BigNumber is less than the value of BigNumber(y, b),                  // 1218
     * 0 if they have the same value,                                                                // 1219
     * or null if the value of either is NaN.                                                        // 1220
     */                                                                                              // 1221
    P['comparedTo'] = P['cmp'] = function ( y, b ) {                                                 // 1222
        var a,                                                                                       // 1223
            x = this,                                                                                // 1224
            xc = x['c'],                                                                             // 1225
            yc = ( id = -id, y = new BigNumber( y, b ) )['c'],                                       // 1226
            i = x['s'],                                                                              // 1227
            j = y['s'],                                                                              // 1228
            k = x['e'],                                                                              // 1229
            l = y['e'];                                                                              // 1230
                                                                                                     // 1231
        // Either NaN?                                                                               // 1232
        if ( !i || !j ) return null;                                                                 // 1233
                                                                                                     // 1234
        a = xc && !xc[0];                                                                            // 1235
        b = yc && !yc[0];                                                                            // 1236
                                                                                                     // 1237
        // Either zero?                                                                              // 1238
        if ( a || b ) return a ? b ? 0 : -j : i;                                                     // 1239
                                                                                                     // 1240
        // Signs differ?                                                                             // 1241
        if ( i != j ) return i;                                                                      // 1242
                                                                                                     // 1243
        a = i < 0;                                                                                   // 1244
        b = k == l;                                                                                  // 1245
                                                                                                     // 1246
        // Either Infinity?                                                                          // 1247
        if ( !xc || !yc ) return b ? 0 : !xc ^ a ? 1 : -1;                                           // 1248
                                                                                                     // 1249
        // Compare exponents.                                                                        // 1250
        if ( !b ) return k > l ^ a ? 1 : -1;                                                         // 1251
        i = -1;                                                                                      // 1252
        j = ( k = xc.length ) < ( l = yc.length ) ? k : l;                                           // 1253
                                                                                                     // 1254
        // Compare digit by digit.                                                                   // 1255
        for ( ; ++i < j; ) if ( xc[i] != yc[i] ) return xc[i] > yc[i] ^ a ? 1 : -1;                  // 1256
                                                                                                     // 1257
        // Compare lengths.                                                                          // 1258
        return k == l ? 0 : k > l ^ a ? 1 : -1;                                                      // 1259
    };                                                                                               // 1260
                                                                                                     // 1261
                                                                                                     // 1262
    /*                                                                                               // 1263
     * Return the number of decimal places of the value of this BigNumber, or null if the value of   // 1264
     * this BigNumber is +-Infinity or NaN.                                                          // 1265
     */                                                                                              // 1266
    P['decimalPlaces'] = P['dp'] = function () {                                                     // 1267
        var n, v,                                                                                    // 1268
            c = this['c'];                                                                           // 1269
                                                                                                     // 1270
        if ( !c ) return null;                                                                       // 1271
        n = ( ( v = c.length - 1 ) - mathfloor( this['e'] / LOG_BASE ) ) * LOG_BASE;                 // 1272
                                                                                                     // 1273
        // Subtract the number of trailing zeros of the last number.                                 // 1274
        if ( v = c[v] ) for ( ; v % 10 == 0; v /= 10, n-- );                                         // 1275
        if ( n < 0 ) n = 0;                                                                          // 1276
                                                                                                     // 1277
        return n;                                                                                    // 1278
    };                                                                                               // 1279
                                                                                                     // 1280
                                                                                                     // 1281
    /*                                                                                               // 1282
     *  n / 0 = I                                                                                    // 1283
     *  n / N = N                                                                                    // 1284
     *  n / I = 0                                                                                    // 1285
     *  0 / n = 0                                                                                    // 1286
     *  0 / 0 = N                                                                                    // 1287
     *  0 / N = N                                                                                    // 1288
     *  0 / I = 0                                                                                    // 1289
     *  N / n = N                                                                                    // 1290
     *  N / 0 = N                                                                                    // 1291
     *  N / N = N                                                                                    // 1292
     *  N / I = N                                                                                    // 1293
     *  I / n = I                                                                                    // 1294
     *  I / 0 = I                                                                                    // 1295
     *  I / N = N                                                                                    // 1296
     *  I / I = N                                                                                    // 1297
     *                                                                                               // 1298
     * Return a new BigNumber whose value is the value of this BigNumber divided by the value of     // 1299
     * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.                       // 1300
     */                                                                                              // 1301
    P['dividedBy'] = P['div'] = function ( y, b ) {                                                  // 1302
        id = 2;                                                                                      // 1303
        return div( this, new BigNumber( y, b ), DECIMAL_PLACES, ROUNDING_MODE );                    // 1304
    };                                                                                               // 1305
                                                                                                     // 1306
                                                                                                     // 1307
    /*                                                                                               // 1308
     * Return a new BigNumber whose value is the integer part of dividing the value of this          // 1309
     * BigNumber by the value of BigNumber(y, b).                                                    // 1310
     */                                                                                              // 1311
    P['dividedToIntegerBy'] = P['divToInt'] = function ( y, b ) {                                    // 1312
        id = 13;                                                                                     // 1313
        return div( this, new BigNumber( y, b ), 0, 1 );                                             // 1314
    };                                                                                               // 1315
                                                                                                     // 1316
                                                                                                     // 1317
    /*                                                                                               // 1318
     * Return true if the value of this BigNumber is equal to the value of BigNumber(n, b),          // 1319
     * otherwise returns false.                                                                      // 1320
     */                                                                                              // 1321
    P['equals'] = P['eq'] = function ( n, b ) {                                                      // 1322
        id = 3;                                                                                      // 1323
        return this['cmp']( n, b ) === 0;                                                            // 1324
    };                                                                                               // 1325
                                                                                                     // 1326
                                                                                                     // 1327
    /*                                                                                               // 1328
     * Return a new BigNumber whose value is the value of this BigNumber rounded to a whole number   // 1329
     * in the direction of -Infinity.                                                                // 1330
     */                                                                                              // 1331
    P['floor'] = function () {                                                                       // 1332
        return rnd( new BigNumber(this), this['e'] + 1, 3 );                                         // 1333
    };                                                                                               // 1334
                                                                                                     // 1335
                                                                                                     // 1336
    /*                                                                                               // 1337
     * Return true if the value of this BigNumber is greater than the value of BigNumber(n, b),      // 1338
     * otherwise returns false.                                                                      // 1339
     */                                                                                              // 1340
    P['greaterThan'] = P['gt'] = function ( n, b ) {                                                 // 1341
        id = 4;                                                                                      // 1342
        return this['cmp']( n, b ) > 0;                                                              // 1343
    };                                                                                               // 1344
                                                                                                     // 1345
                                                                                                     // 1346
    /*                                                                                               // 1347
     * Return true if the value of this BigNumber is greater than or equal to the value of           // 1348
     * BigNumber(n, b), otherwise returns false.                                                     // 1349
     */                                                                                              // 1350
    P['greaterThanOrEqualTo'] = P['gte'] = function ( n, b ) {                                       // 1351
        id = 5;                                                                                      // 1352
        return ( b = this['cmp']( n, b ) ) == 1 || b === 0;                                          // 1353
    };                                                                                               // 1354
                                                                                                     // 1355
                                                                                                     // 1356
    /*                                                                                               // 1357
     * Return true if the value of this BigNumber is a finite number, otherwise returns false.       // 1358
     */                                                                                              // 1359
    P['isFinite'] = function () {                                                                    // 1360
        return !!this['c'];                                                                          // 1361
    };                                                                                               // 1362
                                                                                                     // 1363
                                                                                                     // 1364
    /*                                                                                               // 1365
     * Return true if the value of this BigNumber is an integer, otherwise return false.             // 1366
     */                                                                                              // 1367
    P['isInteger'] = P['isInt'] = function () {                                                      // 1368
        return !!this['c'] && mathfloor( this['e'] / LOG_BASE ) > this['c'].length - 2;              // 1369
    };                                                                                               // 1370
                                                                                                     // 1371
                                                                                                     // 1372
    /*                                                                                               // 1373
     * Return true if the value of this BigNumber is NaN, otherwise returns false.                   // 1374
     */                                                                                              // 1375
    P['isNaN'] = function () {                                                                       // 1376
        return !this['s'];                                                                           // 1377
    };                                                                                               // 1378
                                                                                                     // 1379
                                                                                                     // 1380
    /*                                                                                               // 1381
     * Return true if the value of this BigNumber is negative, otherwise returns false.              // 1382
     */                                                                                              // 1383
    P['isNegative'] = P['isNeg'] = function () {                                                     // 1384
        return this['s'] < 0;                                                                        // 1385
    };                                                                                               // 1386
                                                                                                     // 1387
                                                                                                     // 1388
    /*                                                                                               // 1389
     * Return true if the value of this BigNumber is 0 or -0, otherwise returns false.               // 1390
     */                                                                                              // 1391
    P['isZero'] = function () {                                                                      // 1392
        return !!this['c'] && this['c'][0] == 0;                                                     // 1393
    };                                                                                               // 1394
                                                                                                     // 1395
                                                                                                     // 1396
    /*                                                                                               // 1397
     * Return true if the value of this BigNumber is less than the value of BigNumber(n, b),         // 1398
     * otherwise returns false.                                                                      // 1399
     */                                                                                              // 1400
    P['lessThan'] = P['lt'] = function ( n, b ) {                                                    // 1401
        id = 6;                                                                                      // 1402
        return this['cmp']( n, b ) < 0;                                                              // 1403
    };                                                                                               // 1404
                                                                                                     // 1405
                                                                                                     // 1406
    /*                                                                                               // 1407
     * Return true if the value of this BigNumber is less than or equal to the value of              // 1408
     * BigNumber(n, b), otherwise returns false.                                                     // 1409
     */                                                                                              // 1410
    P['lessThanOrEqualTo'] = P['lte'] = function ( n, b ) {                                          // 1411
        id = 7;                                                                                      // 1412
        return ( b = this['cmp']( n, b ) ) == -1 || b === 0;                                         // 1413
    };                                                                                               // 1414
                                                                                                     // 1415
                                                                                                     // 1416
    /*                                                                                               // 1417
     *  n - 0 = n                                                                                    // 1418
     *  n - N = N                                                                                    // 1419
     *  n - I = -I                                                                                   // 1420
     *  0 - n = -n                                                                                   // 1421
     *  0 - 0 = 0                                                                                    // 1422
     *  0 - N = N                                                                                    // 1423
     *  0 - I = -I                                                                                   // 1424
     *  N - n = N                                                                                    // 1425
     *  N - 0 = N                                                                                    // 1426
     *  N - N = N                                                                                    // 1427
     *  N - I = N                                                                                    // 1428
     *  I - n = I                                                                                    // 1429
     *  I - 0 = I                                                                                    // 1430
     *  I - N = N                                                                                    // 1431
     *  I - I = N                                                                                    // 1432
     *                                                                                               // 1433
     * Return a new BigNumber whose value is the value of this BigNumber minus the value of          // 1434
     * BigNumber(y, b).                                                                              // 1435
     */                                                                                              // 1436
    P['minus'] = function ( y, b ) {                                                                 // 1437
        var i, j, t, xLTy,                                                                           // 1438
            x = this,                                                                                // 1439
            a = x['s'];                                                                              // 1440
                                                                                                     // 1441
        id = 8;                                                                                      // 1442
        y = new BigNumber( y, b );                                                                   // 1443
        b = y['s'];                                                                                  // 1444
                                                                                                     // 1445
        // Either NaN?                                                                               // 1446
        if ( !a || !b ) return new BigNumber(NaN);                                                   // 1447
                                                                                                     // 1448
        // Signs differ?                                                                             // 1449
        if ( a != b ) {                                                                              // 1450
            y['s'] = -b;                                                                             // 1451
            return x['plus'](y);                                                                     // 1452
        }                                                                                            // 1453
                                                                                                     // 1454
        var xe = x['e'] / LOG_BASE,                                                                  // 1455
            ye = y['e'] / LOG_BASE,                                                                  // 1456
            xc = x['c'],                                                                             // 1457
            yc = y['c'];                                                                             // 1458
                                                                                                     // 1459
        if ( !xe || !ye ) {                                                                          // 1460
                                                                                                     // 1461
            // Either Infinity?                                                                      // 1462
            if ( !xc || !yc ) return xc ? ( y['s'] = -b, y ) : new BigNumber( yc ? x : NaN );        // 1463
                                                                                                     // 1464
            // Either zero?                                                                          // 1465
            if ( !xc[0] || !yc[0] ) {                                                                // 1466
                                                                                                     // 1467
                // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.          // 1468
                return yc[0] ? ( y['s'] = -b, y ) : new BigNumber( xc[0] ? x :                       // 1469
                                                                                                     // 1470
                  // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity                      // 1471
                  ROUNDING_MODE == 3 ? -0 : 0 );                                                     // 1472
            }                                                                                        // 1473
        }                                                                                            // 1474
                                                                                                     // 1475
        // Floor xe and ye                                                                           // 1476
        i = xe | 0;                                                                                  // 1477
        xe = xe > 0 || xe === i ? i : i - 1;                                                         // 1478
        i = ye | 0;                                                                                  // 1479
        ye = ye > 0 || ye === i ? i : i - 1;                                                         // 1480
        xc = xc.slice();                                                                             // 1481
                                                                                                     // 1482
        // Determine which is the bigger number.                                                     // 1483
        if ( a = xe - ye ) {                                                                         // 1484
                                                                                                     // 1485
            if ( xLTy = a < 0 ) {                                                                    // 1486
                a = -a, t = xc;                                                                      // 1487
            } else {                                                                                 // 1488
                ye = xe, t = yc;                                                                     // 1489
            }                                                                                        // 1490
                                                                                                     // 1491
            // Prepend zeros to equalise exponents.                                                  // 1492
            for ( t.reverse(), b = a; b--; t.push(0) );                                              // 1493
            t.reverse();                                                                             // 1494
        } else {                                                                                     // 1495
                                                                                                     // 1496
            // Exponents equal. Check digit by digit.                                                // 1497
            j = ( xLTy = ( a = xc.length ) < ( b = yc.length ) ) ? a : b;                            // 1498
                                                                                                     // 1499
            for ( a = b = 0; b < j; b++ ) {                                                          // 1500
                                                                                                     // 1501
                if ( xc[b] != yc[b] ) {                                                              // 1502
                    xLTy = xc[b] < yc[b];                                                            // 1503
                    break;                                                                           // 1504
                }                                                                                    // 1505
            }                                                                                        // 1506
        }                                                                                            // 1507
                                                                                                     // 1508
        // x < y? Point xc to the array of the bigger number.                                        // 1509
        if (xLTy) t = xc, xc = yc, yc = t, y['s'] = -y['s'];                                         // 1510
                                                                                                     // 1511
        b = ( j = yc.length ) - ( i = xc.length );                                                   // 1512
                                                                                                     // 1513
        // Append zeros to xc if shorter.                                                            // 1514
        // No need to add zeros to yc if shorter as subtraction only needs to start at yc.length.    // 1515
        if ( b > 0 ) for ( ; b--; xc[i++] = 0 );                                                     // 1516
        b = BASE - 1;                                                                                // 1517
                                                                                                     // 1518
        // Subtract yc from xc.                                                                      // 1519
        for ( ; j > a; ) {                                                                           // 1520
                                                                                                     // 1521
            if ( xc[--j] < yc[j] ) {                                                                 // 1522
                for ( i = j; i && !xc[--i]; xc[i] = b );                                             // 1523
                --xc[i];                                                                             // 1524
                xc[j] += BASE;                                                                       // 1525
            }                                                                                        // 1526
            xc[j] -= yc[j];                                                                          // 1527
        }                                                                                            // 1528
                                                                                                     // 1529
        // Remove leading zeros and adjust exponent accordingly.                                     // 1530
        for ( ; xc[0] == 0; xc.shift(), --ye );                                                      // 1531
                                                                                                     // 1532
        // Zero?                                                                                     // 1533
        if ( !xc[0] ) {                                                                              // 1534
                                                                                                     // 1535
            // Following IEEE 754 (2008) 6.3,                                                        // 1536
            // n - n = +0  but  n - n = -0  when rounding towards -Infinity.                         // 1537
            y['s'] = ROUNDING_MODE == 3 ? -1 : 1;                                                    // 1538
            y['c'] = [ y['e'] = 0 ];                                                                 // 1539
            return y;                                                                                // 1540
        }                                                                                            // 1541
                                                                                                     // 1542
        // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity when neither  // 1543
        // x or y are Infinity.                                                                      // 1544
        return normalise( y, xc, ye );                                                               // 1545
    };                                                                                               // 1546
                                                                                                     // 1547
                                                                                                     // 1548
    /*                                                                                               // 1549
     *   n % 0 =  N                                                                                  // 1550
     *   n % N =  N                                                                                  // 1551
     *   0 % n =  0                                                                                  // 1552
     *  -0 % n = -0                                                                                  // 1553
     *   0 % 0 =  N                                                                                  // 1554
     *   0 % N =  N                                                                                  // 1555
     *   N % n =  N                                                                                  // 1556
     *   N % 0 =  N                                                                                  // 1557
     *   N % N =  N                                                                                  // 1558
     *                                                                                               // 1559
     * Return a new BigNumber whose value is the value of this BigNumber modulo the value of         // 1560
     * BigNumber(y, b).                                                                              // 1561
     */                                                                                              // 1562
    P['modulo'] = P['mod'] = function ( y, b ) {                                                     // 1563
        id = 9;                                                                                      // 1564
        var x = this,                                                                                // 1565
            xc = x['c'],                                                                             // 1566
            yc = ( y = new BigNumber( y, b ) )['c'],                                                 // 1567
            xs = x['s'],                                                                             // 1568
            ys = y['s'];                                                                             // 1569
                                                                                                     // 1570
        // x or y NaN? y zero? x zero?                                                               // 1571
        b = !xs || !ys || yc && !yc[0];                                                              // 1572
        if ( b || xc && !xc[0] ) return new BigNumber( b ? NaN : x );                                // 1573
                                                                                                     // 1574
        x['s'] = y['s'] = 1;                                                                         // 1575
        b = y['cmp'](x) == 1;                                                                        // 1576
        x['s'] = xs;                                                                                 // 1577
        y['s'] = ys;                                                                                 // 1578
                                                                                                     // 1579
        return b ? new BigNumber(x) : x['minus']( div( x, y, 0, 1 )['times'](y) );                   // 1580
    };                                                                                               // 1581
                                                                                                     // 1582
                                                                                                     // 1583
    /*                                                                                               // 1584
     * Return a new BigNumber whose value is the value of this BigNumber negated, i.e. multiplied    // 1585
     * by -1.                                                                                        // 1586
     */                                                                                              // 1587
    P['negated'] = P['neg'] = function () {                                                          // 1588
        var x = new BigNumber(this);                                                                 // 1589
        x['s'] = -x['s'] || null;                                                                    // 1590
        return x;                                                                                    // 1591
    };                                                                                               // 1592
                                                                                                     // 1593
                                                                                                     // 1594
    /*                                                                                               // 1595
     *  n + 0 = n                                                                                    // 1596
     *  n + N = N                                                                                    // 1597
     *  n + I = I                                                                                    // 1598
     *  0 + n = n                                                                                    // 1599
     *  0 + 0 = 0                                                                                    // 1600
     *  0 + N = N                                                                                    // 1601
     *  0 + I = I                                                                                    // 1602
     *  N + n = N                                                                                    // 1603
     *  N + 0 = N                                                                                    // 1604
     *  N + N = N                                                                                    // 1605
     *  N + I = N                                                                                    // 1606
     *  I + n = I                                                                                    // 1607
     *  I + 0 = I                                                                                    // 1608
     *  I + N = N                                                                                    // 1609
     *  I + I = I                                                                                    // 1610
     *                                                                                               // 1611
     * Return a new BigNumber whose value is the value of this BigNumber plus the value of           // 1612
     * BigNumber(y, b).                                                                              // 1613
     */                                                                                              // 1614
    P['plus'] = function ( y, b ) {                                                                  // 1615
        var t,                                                                                       // 1616
            x = this,                                                                                // 1617
            a = x['s'];                                                                              // 1618
                                                                                                     // 1619
        id = 10;                                                                                     // 1620
        y = new BigNumber( y, b );                                                                   // 1621
        b = y['s'];                                                                                  // 1622
                                                                                                     // 1623
        // Either NaN?                                                                               // 1624
        if ( !a || !b ) return new BigNumber(NaN);                                                   // 1625
                                                                                                     // 1626
        // Signs differ?                                                                             // 1627
         if ( a != b ) {                                                                             // 1628
            y['s'] = -b;                                                                             // 1629
            return x['minus'](y);                                                                    // 1630
        }                                                                                            // 1631
                                                                                                     // 1632
        var xe = x['e'] / LOG_BASE,                                                                  // 1633
            ye = y['e'] / LOG_BASE,                                                                  // 1634
            xc = x['c'],                                                                             // 1635
            yc = y['c'];                                                                             // 1636
                                                                                                     // 1637
        if ( !xe || !ye ) {                                                                          // 1638
                                                                                                     // 1639
            // Return +-Infinity if either Infinity.                                                 // 1640
            if ( !xc || !yc ) return new BigNumber( a / 0 );                                         // 1641
                                                                                                     // 1642
            // Either zero? Return y if y is non-zero, x if x is non-zero, or zero if both are zero. // 1643
            if ( !xc[0] || !yc[0] ) return yc[0] ? y : new BigNumber( xc[0] ? x : a * 0 );           // 1644
        }                                                                                            // 1645
                                                                                                     // 1646
         // Floor xe and ye                                                                          // 1647
        a = xe | 0;                                                                                  // 1648
        xe = xe > 0 || xe === a ? a : a - 1;                                                         // 1649
        a = ye | 0;                                                                                  // 1650
        ye = ye > 0 || ye === a ? a : a - 1;                                                         // 1651
        xc = xc.slice();                                                                             // 1652
                                                                                                     // 1653
        // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.              // 1654
        if ( a = xe - ye ) {                                                                         // 1655
            if ( a > 0 ) {                                                                           // 1656
                ye = xe, t = yc;                                                                     // 1657
            } else {                                                                                 // 1658
                a = -a, t = xc;                                                                      // 1659
            }                                                                                        // 1660
                                                                                                     // 1661
            for ( t.reverse(); a--; t.push(0) );                                                     // 1662
            t.reverse();                                                                             // 1663
        }                                                                                            // 1664
        a = xc.length;                                                                               // 1665
        b = yc.length;                                                                               // 1666
                                                                                                     // 1667
        // Point xc to the longer array, and b to the shorter length.                                // 1668
        if ( a - b < 0 ) t = yc, yc = xc, xc = t, b = a;                                             // 1669
                                                                                                     // 1670
        // Only start adding at yc.length - 1 as the further digits of xc can be left as they are.   // 1671
        for ( a = 0; b; ) {                                                                          // 1672
            a = ( xc[--b] = xc[b] + yc[b] + a ) / BASE | 0;                                          // 1673
            xc[b] %= BASE;                                                                           // 1674
        }                                                                                            // 1675
                                                                                                     // 1676
                                                                                                     // 1677
        if (a) {                                                                                     // 1678
            xc.unshift(a);                                                                           // 1679
            ++ye;                                                                                    // 1680
        }                                                                                            // 1681
                                                                                                     // 1682
        // No need to check for zero, as +x + +y != 0 && -x + -y != 0                                // 1683
        // ye = MAX_EXP + 1 possible                                                                 // 1684
        return normalise( y, xc, ye );                                                               // 1685
    };                                                                                               // 1686
                                                                                                     // 1687
                                                                                                     // 1688
    /*                                                                                               // 1689
     * Return a new BigNumber whose value is the value of this BigNumber rounded to a maximum of dp  // 1690
     * decimal places using rounding mode rm, or to 0 and ROUNDING_MODE respectively if omitted.     // 1691
     *                                                                                               // 1692
     * [dp] {number} Integer, 0 to MAX inclusive.                                                    // 1693
     * [rm] {number} Integer, 0 to 8 inclusive.                                                      // 1694
     */                                                                                              // 1695
    P['round'] = function ( dp, rm ) {                                                               // 1696
                                                                                                     // 1697
        dp = dp == null || ( ( ( outOfRange = dp < 0 || dp > MAX ) || parse(dp) != dp ) &&           // 1698
                                                                                                     // 1699
          // 'round() decimal places out of range: {dp}'                                             // 1700
          // 'round() decimal places not an integer: {dp}'                                           // 1701
          !ifExceptionsThrow( dp, 'decimal places', 'round' ) ) ? 0 : dp | 0;                        // 1702
                                                                                                     // 1703
        // Include '&& rm !== 0' because with Opera -0 == parseFloat(-0) is false.                   // 1704
        rm = rm == null || ( ( ( outOfRange = rm < 0 || rm > 8 ) || parse(rm) != rm && rm !== 0 ) && // 1705
                                                                                                     // 1706
          // 'round() mode not an integer: {rm}'                                                     // 1707
          // 'round() mode out of range: {rm}'                                                       // 1708
          !ifExceptionsThrow( rm, 'mode', 'round' ) ) ? ROUNDING_MODE : rm | 0;                      // 1709
                                                                                                     // 1710
        return rnd( new BigNumber(this), dp + this['e'] + 1, rm );                                   // 1711
    };                                                                                               // 1712
                                                                                                     // 1713
                                                                                                     // 1714
    /*                                                                                               // 1715
     *  sqrt(-n) =  N                                                                                // 1716
     *  sqrt( N) =  N                                                                                // 1717
     *  sqrt(-I) =  N                                                                                // 1718
     *  sqrt( I) =  I                                                                                // 1719
     *  sqrt( 0) =  0                                                                                // 1720
     *  sqrt(-0) = -0                                                                                // 1721
     *                                                                                               // 1722
     * Return a new BigNumber whose value is the square root of the value of this BigNumber,         // 1723
     * rounded according to DECIMAL_PLACES and ROUNDING_MODE.                                        // 1724
     */                                                                                              // 1725
    P['squareRoot'] = P['sqrt'] = function () {                                                      // 1726
        var m, n, r, rep, t,                                                                         // 1727
            x = this,                                                                                // 1728
            c = x['c'],                                                                              // 1729
            s = x['s'],                                                                              // 1730
            e = x['e'],                                                                              // 1731
            dp = DECIMAL_PLACES + 4,                                                                 // 1732
            half = new BigNumber('0.5');                                                             // 1733
                                                                                                     // 1734
        // Negative/NaN/Infinity/zero?                                                               // 1735
        if ( s !== 1 || !c || !c[0] ) {                                                              // 1736
            return new BigNumber( !s || s < 0 && ( !c || c[0] ) ? NaN : c ? x : 1 / 0 );             // 1737
        }                                                                                            // 1738
                                                                                                     // 1739
        // Initial estimate.                                                                         // 1740
        s = Math.sqrt( +x );                                                                         // 1741
                                                                                                     // 1742
        // Math.sqrt underflow/overflow?                                                             // 1743
        // Pass x to Math.sqrt as integer, then adjust the exponent of the result.                   // 1744
        if ( s == 0 || s == 1 / 0 ) {                                                                // 1745
            n = coefficientToString(c);                                                              // 1746
            if ( ( n.length + e ) % 2 == 0 ) n += '0';                                               // 1747
            s = Math.sqrt(n);                                                                        // 1748
            e = mathfloor( ( e + 1 ) / 2 ) - ( e < 0 || e % 2 );                                     // 1749
                                                                                                     // 1750
            if ( s == 1 / 0 ) {                                                                      // 1751
                n = '1e' + e;                                                                        // 1752
            } else {                                                                                 // 1753
                n = s.toExponential();                                                               // 1754
                n = n.slice( 0, n.indexOf('e') + 1 ) + e;                                            // 1755
            }                                                                                        // 1756
            r = new BigNumber(n);                                                                    // 1757
        } else {                                                                                     // 1758
            r = new BigNumber( s.toString() );                                                       // 1759
        }                                                                                            // 1760
                                                                                                     // 1761
        // Check for zero. r could be zero if MIN_EXP is changed after the this value was created.   // 1762
        // This would cause a division by zero (x/t) and hence Infinity below, which would cause     // 1763
        // coefficientToString to throw.                                                             // 1764
        if ( r['c'][0] ) {                                                                           // 1765
            e = r['e'];                                                                              // 1766
            s = e + dp;                                                                              // 1767
            if ( s < 3 ) s = 0;                                                                      // 1768
                                                                                                     // 1769
            // Newton-Raphson iteration.                                                             // 1770
            for ( ; ; ) {                                                                            // 1771
                t = r;                                                                               // 1772
                r = half['times']( t['plus']( div( x, t, dp, 1 ) ) );                                // 1773
                                                                                                     // 1774
                if ( coefficientToString( t['c']   ).slice( 0, s ) === ( n =                         // 1775
                     coefficientToString( r['c'] ) ).slice( 0, s ) ) {                               // 1776
                                                                                                     // 1777
                    // The exponent of r may here be one less than the final result exponent,        // 1778
                    // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits are   // 1779
                    // indexed correctly.                                                            // 1780
                    if ( r['e'] < e ) --s;                                                           // 1781
                    n = n.slice( s - 3, s + 1 );                                                     // 1782
                                                                                                     // 1783
                    // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are  // 1784
                    // 9999 or 4999 (i.e. approaching a rounding boundary) continue the iteration.   // 1785
                    if ( n == '9999' || !rep && n == '4999' ) {                                      // 1786
                                                                                                     // 1787
                        // On the first iteration only, check to see if rounding up gives the exact  // 1788
                        // result as the nines may infinitely repeat.                                // 1789
                        if ( !rep ) {                                                                // 1790
                            rnd( t, t['e'] + DECIMAL_PLACES + 2, 0 );                                // 1791
                                                                                                     // 1792
                            if ( t['times'](t)['eq'](x) ) {                                          // 1793
                                r = t;                                                               // 1794
                                break;                                                               // 1795
                            }                                                                        // 1796
                        }                                                                            // 1797
                        dp += 4;                                                                     // 1798
                        s += 4;                                                                      // 1799
                        rep = 1;                                                                     // 1800
                    } else {                                                                         // 1801
                                                                                                     // 1802
                        // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact result.   // 1803
                        // If not, then there are further digits and m will be truthy.               // 1804
                        if ( !+n || !+n.slice(1) && n.charAt(0) == '5' ) {                           // 1805
                                                                                                     // 1806
                            // Truncate to the first rounding digit.                                 // 1807
                            rnd( r, r['e'] + DECIMAL_PLACES + 2, 1 );                                // 1808
                            m = !r['times'](r)['eq'](x);                                             // 1809
                        }                                                                            // 1810
                        break;                                                                       // 1811
                    }                                                                                // 1812
                }                                                                                    // 1813
            }                                                                                        // 1814
        }                                                                                            // 1815
                                                                                                     // 1816
        return rnd( r, r['e'] + DECIMAL_PLACES + 1, ROUNDING_MODE, m );                              // 1817
    };                                                                                               // 1818
                                                                                                     // 1819
                                                                                                     // 1820
    /*                                                                                               // 1821
     *  n * 0 = 0                                                                                    // 1822
     *  n * N = N                                                                                    // 1823
     *  n * I = I                                                                                    // 1824
     *  0 * n = 0                                                                                    // 1825
     *  0 * 0 = 0                                                                                    // 1826
     *  0 * N = N                                                                                    // 1827
     *  0 * I = N                                                                                    // 1828
     *  N * n = N                                                                                    // 1829
     *  N * 0 = N                                                                                    // 1830
     *  N * N = N                                                                                    // 1831
     *  N * I = N                                                                                    // 1832
     *  I * n = I                                                                                    // 1833
     *  I * 0 = N                                                                                    // 1834
     *  I * N = N                                                                                    // 1835
     *  I * I = I                                                                                    // 1836
     *                                                                                               // 1837
     * Return a new BigNumber whose value is the value of this BigNumber times the value of          // 1838
     * BigNumber(y, b).                                                                              // 1839
     */                                                                                              // 1840
    P['times'] = function ( y, b ) {                                                                 // 1841
        var c, e, k, m, r, xlo, xhi, ylo, yhi,                                                       // 1842
            x = this,                                                                                // 1843
            xc = x['c'],                                                                             // 1844
            yc = ( id = 11, y = new BigNumber( y, b ) )['c'],                                        // 1845
            i = x['e'] / LOG_BASE,                                                                   // 1846
            j = y['e'] / LOG_BASE,                                                                   // 1847
            a = x['s'];                                                                              // 1848
                                                                                                     // 1849
        y['s'] = a == ( b = y['s'] ) ? 1 : -1;                                                       // 1850
                                                                                                     // 1851
        // Either NaN/Infinity/0?                                                                    // 1852
        if ( !i && ( !xc || !xc[0] ) || !j && ( !yc || !yc[0] ) ) {                                  // 1853
                                                                                                     // 1854
            // Return NaN if either NaN, or x is 0 and y is Infinity, or y is 0 and x is Infinity.   // 1855
            return new BigNumber( !a || !b || xc && !xc[0] && !yc || yc && !yc[0] && !xc ? NaN       // 1856
                                                                                                     // 1857
              // Return +-Infinity if either is Infinity. Return +-0 if x or y is 0.                 // 1858
              : !xc || !yc ? y['s'] / 0 : y['s'] * 0 );                                              // 1859
        }                                                                                            // 1860
                                                                                                     // 1861
        // e = mathfloor(i) + mathfloor(j);                                                          // 1862
        e = ( e = i | 0, i > 0 || i === e ? e : e - 1) +                                             // 1863
            ( e = j | 0, j > 0 || j === e ? e : e - 1);                                              // 1864
                                                                                                     // 1865
        a = xc.length;                                                                               // 1866
        b = yc.length;                                                                               // 1867
                                                                                                     // 1868
        // Ensure xc points to longer array and b to longer length.                                  // 1869
        if ( a < b ) r = xc, xc = yc, yc = r, j = a, a = b, b = j;                                   // 1870
                                                                                                     // 1871
        // Initialise the result array with zeros.                                                   // 1872
        for ( j = a + b, r = []; j--; r.push(0) );                                                   // 1873
                                                                                                     // 1874
        // Multiply!                                                                                 // 1875
        for ( i = b; --i >= 0; ) {                                                                   // 1876
            c = 0;                                                                                   // 1877
            j = a + i;                                                                               // 1878
            k = a;                                                                                   // 1879
            ylo = yc[i] % SQRT_BASE;                                                                 // 1880
            yhi = yc[i] / SQRT_BASE | 0;                                                             // 1881
                                                                                                     // 1882
            for ( ; j > i; ) {                                                                       // 1883
                xlo = xc[--k] % SQRT_BASE;                                                           // 1884
                xhi = xc[k] / SQRT_BASE | 0;                                                         // 1885
                m = yhi * xlo + xhi * ylo;                                                           // 1886
                xlo = ylo * xlo + ( ( m % SQRT_BASE ) * SQRT_BASE ) + r[j] + c;                      // 1887
                c = ( xlo / BASE | 0 ) + ( m / SQRT_BASE | 0 ) + yhi * xhi;                          // 1888
                r[j--] = xlo % BASE;                                                                 // 1889
            }                                                                                        // 1890
            r[j] = c;                                                                                // 1891
        }                                                                                            // 1892
                                                                                                     // 1893
        if (c) {                                                                                     // 1894
            ++e;                                                                                     // 1895
        } else {                                                                                     // 1896
            r.shift();                                                                               // 1897
        }                                                                                            // 1898
                                                                                                     // 1899
        return normalise( y, r, e );                                                                 // 1900
    };                                                                                               // 1901
                                                                                                     // 1902
                                                                                                     // 1903
    /*                                                                                               // 1904
     * Return a string representing the value of this BigNumber in exponential notation to dp fixed  // 1905
     * decimal places and rounded using ROUNDING_MODE if necessary.                                  // 1906
     *                                                                                               // 1907
     * [dp] {number} Integer, 0 to MAX inclusive.                                                    // 1908
     */                                                                                              // 1909
    P['toExponential'] = function (dp) {                                                             // 1910
        var x = this;                                                                                // 1911
                                                                                                     // 1912
        return x['c'] ? format( x, dp == null || ( ( outOfRange = dp < 0 || dp > MAX ) ||            // 1913
                                                                                                     // 1914
          // Include '&& dp !== 0' because with Opera -0 == parseFloat(-0) is false,                 // 1915
          // despite -0 == parseFloat('-0') && 0 == -0 being true.                                   // 1916
          parse(dp) != dp && dp !== 0 ) &&                                                           // 1917
                                                                                                     // 1918
            // 'toExponential() decimal places not an integer: {dp}'                                 // 1919
            // 'toExponential() decimal places out of range: {dp}'                                   // 1920
            !ifExceptionsThrow( dp, 'decimal places', 'toExponential' )                              // 1921
              ? null : dp | 0, 1 ) : x.toString();                                                   // 1922
    };                                                                                               // 1923
                                                                                                     // 1924
                                                                                                     // 1925
    /*                                                                                               // 1926
     * Return a string representing the value of this BigNumber in normal notation to dp fixed       // 1927
     * decimal places and rounded using ROUNDING_MODE if necessary.                                  // 1928
     *                                                                                               // 1929
     * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',                               // 1930
     * but e.g. (-0.00001).toFixed(0) is '-0'.                                                       // 1931
     *                                                                                               // 1932
     * [dp] {number} Integer, 0 to MAX inclusive.                                                    // 1933
     */                                                                                              // 1934
    P['toFixed'] = function (dp) {                                                                   // 1935
        var str,                                                                                     // 1936
            x = this,                                                                                // 1937
            neg = TO_EXP_NEG,                                                                        // 1938
            pos = TO_EXP_POS;                                                                        // 1939
                                                                                                     // 1940
        dp = dp == null || ( ( outOfRange = dp < 0 || dp > MAX ) ||                                  // 1941
                                                                                                     // 1942
          // 'toFixed() decimal places not an integer: {dp}'                                         // 1943
          // 'toFixed() decimal places out of range: {dp}'                                           // 1944
          parse(dp) != dp && dp !== 0 ) && !ifExceptionsThrow( dp, 'decimal places', 'toFixed' )     // 1945
            ? null : x['e'] + ( dp | 0 );                                                            // 1946
                                                                                                     // 1947
        TO_EXP_NEG = -( TO_EXP_POS = 1 / 0 );                                                        // 1948
                                                                                                     // 1949
        if ( dp == null || !x['c'] ) {                                                               // 1950
            str = x.toString();                                                                      // 1951
        } else {                                                                                     // 1952
            str = format( x, dp );                                                                   // 1953
                                                                                                     // 1954
            // (-0).toFixed() is '0', but (-0.1).toFixed() is '-0'.                                  // 1955
            // (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.                           // 1956
            if ( x['s'] < 0 && x['c'] ) {                                                            // 1957
                                                                                                     // 1958
                // As e.g. (-0).toFixed(3), will wrongly be returned as -0.000 from toString.        // 1959
                if ( !x['c'][0] ) {                                                                  // 1960
                    str = str.replace( '-', '' );                                                    // 1961
                                                                                                     // 1962
                // As e.g. -0.5 if rounded to -0 will cause toString to omit the minus sign.         // 1963
                } else if ( str.indexOf('-') < 0 ) {                                                 // 1964
                    str = '-' + str;                                                                 // 1965
                }                                                                                    // 1966
            }                                                                                        // 1967
        }                                                                                            // 1968
                                                                                                     // 1969
        TO_EXP_NEG = neg;                                                                            // 1970
        TO_EXP_POS = pos;                                                                            // 1971
                                                                                                     // 1972
        return str;                                                                                  // 1973
    };                                                                                               // 1974
                                                                                                     // 1975
                                                                                                     // 1976
    /*                                                                                               // 1977
     * Return a string representing the value of this BigNumber in fixed-point notation rounded      // 1978
     * using ROUNDING_MODE to dp decimal places, and formatted according to the properties of the    // 1979
     * FORMAT object (see BigNumber.config).                                                         // 1980
     *                                                                                               // 1981
     * FORMAT = {                                                                                    // 1982
     *      decimalSeparator : '.',                                                                  // 1983
     *      groupSeparator : ',',                                                                    // 1984
     *      groupSize : 3,                                                                           // 1985
     *      secondaryGroupSize : 0,                                                                  // 1986
     *      fractionGroupSeparator : '\xA0',    // non-breaking space                                // 1987
     *      fractionGroupSize : 0                                                                    // 1988
     * };                                                                                            // 1989
     *                                                                                               // 1990
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.                                    // 1991
     * (TODO: If dp is invalid the error message will give toFixed as the offending method.)         // 1992
     */                                                                                              // 1993
    P['toFormat'] = function (dp) {                                                                  // 1994
        var x = this;                                                                                // 1995
                                                                                                     // 1996
        if ( !x['c'] ) return x.toString();                                                          // 1997
                                                                                                     // 1998
        var i,                                                                                       // 1999
            isNeg = x['s'] < 0,                                                                      // 2000
            groupSeparator = FORMAT['groupSeparator'],                                               // 2001
            g1 = +FORMAT['groupSize'],                                                               // 2002
            g2 = +FORMAT['secondaryGroupSize'],                                                      // 2003
            arr = x.toFixed(dp).split('.'),                                                          // 2004
            intPart = arr[0],                                                                        // 2005
            fractionPart = arr[1],                                                                   // 2006
            intDigits = isNeg ? intPart.slice(1) : intPart,                                          // 2007
            len = intDigits.length;                                                                  // 2008
                                                                                                     // 2009
        if (g2) i = g1, g1 = g2, g2 = i, len -= i;                                                   // 2010
                                                                                                     // 2011
        if ( g1 > 0 && len > 0 ) {                                                                   // 2012
            i = len % g1 || g1;                                                                      // 2013
            intPart = intDigits.substr( 0, i );                                                      // 2014
            for ( ; i < len; i += g1 ) intPart += groupSeparator + intDigits.substr( i, g1 );        // 2015
            if ( g2 > 0 ) intPart += groupSeparator + intDigits.slice(i);                            // 2016
            if (isNeg) intPart = '-' + intPart;                                                      // 2017
        }                                                                                            // 2018
                                                                                                     // 2019
        return fractionPart                                                                          // 2020
          ? intPart + FORMAT['decimalSeparator'] + ( ( g2 = +FORMAT['fractionGroupSize'] )           // 2021
            ? fractionPart.replace( new RegExp( '\\d{' + g2 + '}\\B', 'g' ),                         // 2022
              '$&' + FORMAT['fractionGroupSeparator'] )                                              // 2023
            : fractionPart )                                                                         // 2024
          : intPart;                                                                                 // 2025
    };                                                                                               // 2026
                                                                                                     // 2027
                                                                                                     // 2028
    /*                                                                                               // 2029
     * Return a string array representing the value of this BigNumber as a simple fraction with an   // 2030
     * integer numerator and an integer denominator. The denominator will be a positive non-zero     // 2031
     * value less than or equal to the specified maximum denominator. If a maximum denominator is    // 2032
     * not specified, the denominator will be the lowest value necessary to represent the number     // 2033
     * exactly.                                                                                      // 2034
     *                                                                                               // 2035
     * [maxD] {number|string|BigNumber} Integer >= 1 and < Infinity.                                 // 2036
     */                                                                                              // 2037
    P['toFraction'] = function (maxD) {                                                              // 2038
        var arr, d0, d2, e, exp, n, n0, q, s,                                                        // 2039
            n1 = d0 = new BigNumber(ONE),                                                            // 2040
            d1 = n0 = new BigNumber(ONE),                                                            // 2041
            x = this,                                                                                // 2042
            xc = x['c'],                                                                             // 2043
            d = new BigNumber(ONE);                                                                  // 2044
                                                                                                     // 2045
        // NaN, Infinity.                                                                            // 2046
        if ( !xc ) return x.toString();                                                              // 2047
        s = coefficientToString(xc);                                                                 // 2048
                                                                                                     // 2049
        // Initial denominator.                                                                      // 2050
        e = d['e'] = s.length - x['e'] - 1;                                                          // 2051
        d['c'][0] = POWS_TEN[ ( exp = e % LOG_BASE ) < 0 ? LOG_BASE + exp : exp ];                   // 2052
                                                                                                     // 2053
        // If max denominator is undefined or null, or NaN...                                        // 2054
        if ( maxD == null || ( !( id = 12, n = new BigNumber(maxD) )['s'] ||                         // 2055
                                                                                                     // 2056
               // or less than 1, or Infinity...                                                     // 2057
               ( outOfRange = n['cmp'](n1) < 0 || !n['c'] ) ||                                       // 2058
                                                                                                     // 2059
                 // or not an integer...                                                             // 2060
                 ( ERRORS && mathfloor( n['e'] / LOG_BASE ) < n['c'].length - 1 ) ) &&               // 2061
                                                                                                     // 2062
                   // 'toFraction() max denominator not an integer: {maxD}'                          // 2063
                   // 'toFraction() max denominator out of range: {maxD}'                            // 2064
                   !ifExceptionsThrow( maxD, 'max denominator', 'toFraction' ) ||                    // 2065
                                                                                                     // 2066
                     // or greater than the max denominator needed to specify the value exactly...   // 2067
                     ( maxD = n )['cmp'](d) > 0 ) {                                                  // 2068
                                                                                                     // 2069
            // d is e.g. 10, 100, 1000, 10000... , n1 is 1.                                          // 2070
            maxD = e > 0 ? d : n1;                                                                   // 2071
        }                                                                                            // 2072
                                                                                                     // 2073
        exp = MAX_EXP;                                                                               // 2074
        MAX_EXP = 1 / 0;                                                                             // 2075
        n = new BigNumber(s);                                                                        // 2076
                                                                                                     // 2077
        // n0 = d1 = 0                                                                               // 2078
        n0['c'][0] = 0;                                                                              // 2079
                                                                                                     // 2080
        for ( ; ; )  {                                                                               // 2081
            q = div( n, d, 0, 1 );                                                                   // 2082
            d2 = d0['plus']( q['times'](d1) );                                                       // 2083
            if ( d2['cmp'](maxD) == 1 ) break;                                                       // 2084
            d0 = d1;                                                                                 // 2085
            d1 = d2;                                                                                 // 2086
            n1 = n0['plus']( q['times']( d2 = n1 ) );                                                // 2087
            n0 = d2;                                                                                 // 2088
            d = n['minus']( q['times']( d2 = d ) );                                                  // 2089
            n = d2;                                                                                  // 2090
        }                                                                                            // 2091
                                                                                                     // 2092
        d2 = div( maxD['minus'](d0), d1, 0, 1 );                                                     // 2093
        n0 = n0['plus']( d2['times'](n1) );                                                          // 2094
        d0 = d0['plus']( d2['times'](d1) );                                                          // 2095
        n0['s'] = n1['s'] = x['s'];                                                                  // 2096
        e *= 2;                                                                                      // 2097
                                                                                                     // 2098
        // Determine which fraction is closer to x, n0/d0 or n1/d1                                   // 2099
        arr = div( n1, d1, e, ROUNDING_MODE )['minus'](x)['abs']()['cmp'](                           // 2100
              div( n0, d0, e, ROUNDING_MODE )['minus'](x)['abs']() ) < 1                             // 2101
                ? [ n1.toString(), d1.toString() ]                                                   // 2102
                : [ n0.toString(), d0.toString() ];                                                  // 2103
                                                                                                     // 2104
        MAX_EXP = exp;                                                                               // 2105
                                                                                                     // 2106
        return arr;                                                                                  // 2107
    };                                                                                               // 2108
                                                                                                     // 2109
                                                                                                     // 2110
    /*                                                                                               // 2111
     * Return the value of this BigNumber converted to a number primitive.                           // 2112
     */                                                                                              // 2113
    P['toNumber'] = function () {                                                                    // 2114
        var x = this;                                                                                // 2115
                                                                                                     // 2116
        // Ensure zero has correct sign.                                                             // 2117
        return +x || ( x['s'] ? 0 * x['s'] : NaN );                                                  // 2118
    };                                                                                               // 2119
                                                                                                     // 2120
                                                                                                     // 2121
    /*                                                                                               // 2122
     * Return a BigNumber whose value is the value of this BigNumber raised to the power e.          // 2123
     * If e is negative round according to DECIMAL_PLACES and ROUNDING_MODE.                         // 2124
     *                                                                                               // 2125
     * e {number} Integer, -MAX_POWER to MAX_POWER inclusive.                                        // 2126
     */                                                                                              // 2127
    P['toPower'] = P['pow'] = function (e) {                                                         // 2128
                                                                                                     // 2129
        // e to integer, avoiding NaN or Infinity becoming 0.                                        // 2130
        var i = e * 0 == 0 ? ~~e : e,                                                                // 2131
            x = new BigNumber(this),                                                                 // 2132
            y = new BigNumber(ONE);                                                                  // 2133
                                                                                                     // 2134
        // Pass +-Infinity for out of range exponents.                                               // 2135
        if ( ( ( ( outOfRange = e < -MAX_POWER || e > MAX_POWER ) && (i = e * 1 / 0) ) ||            // 2136
                                                                                                     // 2137
            // Any exponent that fails the parse becomes NaN.                                        // 2138
            // Include 'e !== 0' because on Opera  -0 == parseFloat(-0)  is false, despite           // 2139
            // -0 === parseFloat(-0) && -0 == parseFloat('-0')  evaluating true.                     // 2140
            parse(e) != e && e !== 0 && !(i = NaN) ) &&                                              // 2141
                                                                                                     // 2142
              // 'pow() exponent not an integer: {e}'                                                // 2143
              // 'pow() exponent out of range: {e}'                                                  // 2144
              // Pass zero to Math.pow, as any value to the power zero is 1.                         // 2145
              !ifExceptionsThrow( e, 'exponent', 'pow' ) || !i ) {                                   // 2146
                                                                                                     // 2147
            // i is +-Infinity, NaN or 0.                                                            // 2148
            return new BigNumber( Math.pow( +x, i ) );                                               // 2149
        }                                                                                            // 2150
        i = i < 0 ? -i : i;                                                                          // 2151
                                                                                                     // 2152
        for ( ; ; ) {                                                                                // 2153
            if ( i & 1 ) y = y['times'](x);                                                          // 2154
            i >>= 1;                                                                                 // 2155
            if ( !i ) break;                                                                         // 2156
            x = x['times'](x);                                                                       // 2157
        }                                                                                            // 2158
                                                                                                     // 2159
        return e < 0 ? ONE['div'](y) : y;                                                            // 2160
    };                                                                                               // 2161
                                                                                                     // 2162
                                                                                                     // 2163
    /*                                                                                               // 2164
     * Return a string representing the value of this BigNumber to sd significant digits and rounded // 2165
     * using ROUNDING_MODE if necessary. If sd is less than the number of digits necessary to        // 2166
     * represent the integer part of the value in normal notation, then use exponential notation.    // 2167
     *                                                                                               // 2168
     * sd {number} Integer, 1 to MAX inclusive.                                                      // 2169
     */                                                                                              // 2170
    P['toPrecision'] = function (sd) {                                                               // 2171
        var x = this;                                                                                // 2172
                                                                                                     // 2173
         // ERRORS true: Throw if sd not undefined, null or an integer in range.                     // 2174
         // ERRORS false: Ignore sd if not a number or not in range.                                 // 2175
         // Truncate non-integers.                                                                   // 2176
        return sd == null || ( ( ( outOfRange = sd < 1 || sd > MAX ) || parse(sd) != sd ) &&         // 2177
                                                                                                     // 2178
          // 'toPrecision() precision not an integer: {sd}'                                          // 2179
          // 'toPrecision() precision out of range: {sd}'                                            // 2180
          !ifExceptionsThrow( sd, 'precision', 'toPrecision' ) ) || !x['c']                          // 2181
            ? x.toString() : format( x, --sd | 0, 2 );                                               // 2182
    };                                                                                               // 2183
                                                                                                     // 2184
                                                                                                     // 2185
    /*                                                                                               // 2186
     * Return a string representing the value of this BigNumber in base b, or base 10 if b is        // 2187
     * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and     // 2188
     * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent that is // 2189
     * equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than TO_EXP_NEG, // 2190
     * return exponential notation.                                                                  // 2191
     *                                                                                               // 2192
     * [b] {number} Integer, 2 to 64 inclusive.                                                      // 2193
     */                                                                                              // 2194
    P['toString'] = function (b) {                                                                   // 2195
        var u, str, strL,                                                                            // 2196
            x = this,                                                                                // 2197
            xe = x['e'];                                                                             // 2198
                                                                                                     // 2199
        // Infinity or NaN?                                                                          // 2200
        if ( xe === null ) {                                                                         // 2201
            str = x['s'] ? 'Infinity' : 'NaN';                                                       // 2202
                                                                                                     // 2203
        // Exponential format?                                                                       // 2204
        } else if ( b == u && ( xe <= TO_EXP_NEG || xe >= TO_EXP_POS ) ) {                           // 2205
            return format( x, u, 1 );                                                                // 2206
        } else {                                                                                     // 2207
            str = coefficientToString( x['c'] );                                                     // 2208
                                                                                                     // 2209
            // Negative exponent?                                                                    // 2210
            if ( xe < 0 ) {                                                                          // 2211
                                                                                                     // 2212
                // Prepend zeros.                                                                    // 2213
                for ( ; ++xe; str = '0' + str );                                                     // 2214
                str = '0.' + str;                                                                    // 2215
                                                                                                     // 2216
            // Positive exponent?                                                                    // 2217
            } else if ( strL = str.length, xe > 0 ) {                                                // 2218
                                                                                                     // 2219
                // Append zeros.                                                                     // 2220
                if ( ++xe > strL ) {                                                                 // 2221
                    for ( xe -= strL; xe-- ; str += '0' );                                           // 2222
                } else if ( xe < strL ) {                                                            // 2223
                    str = str.slice( 0, xe ) + '.' + str.slice(xe);                                  // 2224
                }                                                                                    // 2225
                                                                                                     // 2226
            // Exponent zero.                                                                        // 2227
            } else {                                                                                 // 2228
                u = str.charAt(0);                                                                   // 2229
                                                                                                     // 2230
                if ( strL > 1 ) {                                                                    // 2231
                    str = u + '.' + str.slice(1);                                                    // 2232
                                                                                                     // 2233
                // Avoid '-0'                                                                        // 2234
                } else if ( u == '0' ) {                                                             // 2235
                    return u;                                                                        // 2236
                }                                                                                    // 2237
            }                                                                                        // 2238
                                                                                                     // 2239
            if ( b != null ) {                                                                       // 2240
                                                                                                     // 2241
                if ( !( outOfRange = !( b >= 2 && b < 65 ) ) && ( b == ~~b || !ERRORS ) ) {          // 2242
                    str = convertBase( str, b | 0, 10, x['s'] );                                     // 2243
                                                                                                     // 2244
                    // Avoid '-0'                                                                    // 2245
                    if ( str == '0' ) return str;                                                    // 2246
                } else {                                                                             // 2247
                                                                                                     // 2248
                    // 'toString() base not an integer: {b}'                                         // 2249
                    // 'toString() base out of range: {b}'                                           // 2250
                    ifExceptionsThrow( b, 'base', 'toS' );                                           // 2251
                }                                                                                    // 2252
            }                                                                                        // 2253
                                                                                                     // 2254
        }                                                                                            // 2255
                                                                                                     // 2256
        return x['s'] < 0 ? '-' + str : str;                                                         // 2257
    };                                                                                               // 2258
                                                                                                     // 2259
                                                                                                     // 2260
    /*                                                                                               // 2261
     * Return as toString, but do not accept a base argument.                                        // 2262
     */                                                                                              // 2263
    P['valueOf'] = P['toJSON'] = function () {                                                       // 2264
        return this.toString();                                                                      // 2265
    };                                                                                               // 2266
                                                                                                     // 2267
                                                                                                     // 2268
    // Add aliases for BigDecimal methods.                                                           // 2269
    //P['add'] = P['plus'];                                                                          // 2270
    //P['subtract'] = P['minus'];                                                                    // 2271
    //P['multiply'] = P['times'];                                                                    // 2272
    //P['divide'] = P['div'];                                                                        // 2273
    //P['remainder'] = P['mod'];                                                                     // 2274
    //P['compareTo'] = P['cmp'];                                                                     // 2275
    //P['negate'] = P['neg'];                                                                        // 2276
                                                                                                     // 2277
                                                                                                     // 2278
    // EXPORT                                                                                        // 2279
                                                                                                     // 2280
                                                                                                     // 2281
    // Node and other CommonJS-like environments that support module.exports.                        // 2282
    return BigNumber;                                                                                // 2283
})();                                                                                                // 2284
                                                                                                     // 2285
///////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['3stack:bignumber'] = {
  BigNumber: BigNumber
};

})();

//# sourceMappingURL=3stack_bignumber.js.map
