(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;

/* Package-scope variables */
var HTTP, _methodHTTP, Fiber, runServerMethod;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/cfs:http-methods/http.methods.server.api.js                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
/*                                                                                                                    // 1
                                                                                                                      // 2
GET /note                                                                                                             // 3
GET /note/:id                                                                                                         // 4
POST /note                                                                                                            // 5
PUT /note/:id                                                                                                         // 6
DELETE /note/:id                                                                                                      // 7
                                                                                                                      // 8
*/                                                                                                                    // 9
HTTP = Package.http && Package.http.HTTP || {};                                                                       // 10
                                                                                                                      // 11
var url = Npm.require('url');                                                                                         // 12
var stream = Npm.require('stream');                                                                                   // 13
                                                                                                                      // 14
// Primary local test scope                                                                                           // 15
_methodHTTP = {};                                                                                                     // 16
                                                                                                                      // 17
                                                                                                                      // 18
_methodHTTP.methodHandlers = {};                                                                                      // 19
_methodHTTP.methodTree = {};                                                                                          // 20
                                                                                                                      // 21
// This could be changed eg. could allow larger data chunks than 1.000.000                                            // 22
// 5mb = 5 * 1024 * 1024 = 5242880;                                                                                   // 23
HTTP.methodsMaxDataLength = 5242880; //1e6;                                                                           // 24
                                                                                                                      // 25
_methodHTTP.nameFollowsConventions = function(name) {                                                                 // 26
  // Check that name is string, not a falsy or empty                                                                  // 27
  return name && name === '' + name && name !== '';                                                                   // 28
};                                                                                                                    // 29
                                                                                                                      // 30
                                                                                                                      // 31
_methodHTTP.getNameList = function(name) {                                                                            // 32
  // Remove leading and trailing slashes and make command array                                                       // 33
  name = name && name.replace(/^\//g, '') || ''; // /^\/|\/$/g                                                        // 34
  // TODO: Get the format from the url - eg.: "/list/45.json" format should be                                        // 35
  // set in this function by splitting the last list item by . and have format                                        // 36
  // as the last item. How should we toggle:                                                                          // 37
  // "/list/45/item.name.json" and "/list/45/item.name"?                                                              // 38
  // We would either have to check all known formats or allways determin the "."                                      // 39
  // as an extension. Resolving in "json" and "name" as handed format - the user                                      // 40
  // Could simply just add the format as a parametre? or be explicit about                                            // 41
  // naming                                                                                                           // 42
  return name && name.split('/') || [];                                                                               // 43
};                                                                                                                    // 44
                                                                                                                      // 45
// Merge two arrays one containing keys and one values                                                                // 46
_methodHTTP.createObject = function(keys, values) {                                                                   // 47
  var result = {};                                                                                                    // 48
  if (keys && values) {                                                                                               // 49
    for (var i = 0; i < keys.length; i++) {                                                                           // 50
      result[keys[i]] = values[i] && decodeURIComponent(values[i]) || '';                                             // 51
    }                                                                                                                 // 52
  }                                                                                                                   // 53
  return result;                                                                                                      // 54
};                                                                                                                    // 55
                                                                                                                      // 56
_methodHTTP.addToMethodTree = function(methodName) {                                                                  // 57
  var list = _methodHTTP.getNameList(methodName);                                                                     // 58
  var name = '/';                                                                                                     // 59
  // Contains the list of params names                                                                                // 60
  var params = [];                                                                                                    // 61
  var currentMethodTree = _methodHTTP.methodTree;                                                                     // 62
                                                                                                                      // 63
  for (var i = 0; i < list.length; i++) {                                                                             // 64
    var lastListItem = (i === list.length - 1);                                                                       // 65
                                                                                                                      // 66
    // get the key name                                                                                               // 67
    var key = list[i];                                                                                                // 68
    // Check if it expects a value                                                                                    // 69
    if (key[0] === ':') {                                                                                             // 70
      // This is a value                                                                                              // 71
      params.push(key.slice(1));                                                                                      // 72
      key = ':value';                                                                                                 // 73
    }                                                                                                                 // 74
    name += key + '/';                                                                                                // 75
                                                                                                                      // 76
    // Set the key into the method tree                                                                               // 77
    if (typeof currentMethodTree[key] === 'undefined') {                                                              // 78
      currentMethodTree[key] = {};                                                                                    // 79
    }                                                                                                                 // 80
                                                                                                                      // 81
    // Dig deeper                                                                                                     // 82
    currentMethodTree = currentMethodTree[key];                                                                       // 83
                                                                                                                      // 84
  }                                                                                                                   // 85
                                                                                                                      // 86
  if (_.isEmpty(currentMethodTree[':ref'])) {                                                                         // 87
    currentMethodTree[':ref'] = {                                                                                     // 88
      name: name,                                                                                                     // 89
      params: params                                                                                                  // 90
    };                                                                                                                // 91
  }                                                                                                                   // 92
                                                                                                                      // 93
  return currentMethodTree[':ref'];                                                                                   // 94
};                                                                                                                    // 95
                                                                                                                      // 96
// This method should be optimized for speed since its called on allmost every                                        // 97
// http call to the server so we return null as soon as we know its not a method                                      // 98
_methodHTTP.getMethod = function(name) {                                                                              // 99
  // Check if the                                                                                                     // 100
  if (!_methodHTTP.nameFollowsConventions(name)) {                                                                    // 101
    return null;                                                                                                      // 102
  }                                                                                                                   // 103
  var list = _methodHTTP.getNameList(name);                                                                           // 104
  // Check if we got a correct list                                                                                   // 105
  if (!list || !list.length) {                                                                                        // 106
    return null;                                                                                                      // 107
  }                                                                                                                   // 108
  // Set current refernce in the _methodHTTP.methodTree                                                               // 109
  var currentMethodTree = _methodHTTP.methodTree;                                                                     // 110
  // Buffer for values to hand on later                                                                               // 111
  var values = [];                                                                                                    // 112
  // Iterate over the method name and check if its found in the method tree                                           // 113
  for (var i = 0; i < list.length; i++) {                                                                             // 114
    // get the key name                                                                                               // 115
    var key = list[i];                                                                                                // 116
    // We expect to find the key or :value if not we break                                                            // 117
    if (typeof currentMethodTree[key] !== 'undefined' ||                                                              // 118
            typeof currentMethodTree[':value'] !== 'undefined') {                                                     // 119
      // We got a result now check if its a value                                                                     // 120
      if (typeof currentMethodTree[key] === 'undefined') {                                                            // 121
        // Push the value                                                                                             // 122
        values.push(key);                                                                                             // 123
        // Set the key to :value to dig deeper                                                                        // 124
        key = ':value';                                                                                               // 125
      }                                                                                                               // 126
                                                                                                                      // 127
    } else {                                                                                                          // 128
      // Break - method call not found                                                                                // 129
      return null;                                                                                                    // 130
    }                                                                                                                 // 131
                                                                                                                      // 132
    // Dig deeper                                                                                                     // 133
    currentMethodTree = currentMethodTree[key];                                                                       // 134
  }                                                                                                                   // 135
                                                                                                                      // 136
  // Extract reference pointer                                                                                        // 137
  var reference = currentMethodTree && currentMethodTree[':ref'];                                                     // 138
  if (typeof reference !== 'undefined') {                                                                             // 139
    return {                                                                                                          // 140
      name: reference.name,                                                                                           // 141
      params: _methodHTTP.createObject(reference.params, values),                                                     // 142
      handle: _methodHTTP.methodHandlers[reference.name]                                                              // 143
    };                                                                                                                // 144
  } else {                                                                                                            // 145
    // Did not get any reference to the method                                                                        // 146
    return null;                                                                                                      // 147
  }                                                                                                                   // 148
};                                                                                                                    // 149
                                                                                                                      // 150
// This method retrieves the userId from the token and makes sure that the token                                      // 151
// is valid and not expired                                                                                           // 152
_methodHTTP.getUserId = function() {                                                                                  // 153
  var self = this;                                                                                                    // 154
                                                                                                                      // 155
  // // Get ip, x-forwarded-for can be comma seperated ips where the first is the                                     // 156
  // // client ip                                                                                                     // 157
  // var ip = self.req.headers['x-forwarded-for'] &&                                                                  // 158
  //         // Return the first item in ip list                                                                      // 159
  //         self.req.headers['x-forwarded-for'].split(',')[0] ||                                                     // 160
  //         // or return the remoteAddress                                                                           // 161
  //         self.req.connection.remoteAddress;                                                                       // 162
                                                                                                                      // 163
  // Check authentication                                                                                             // 164
  var userToken = self.query.token;                                                                                   // 165
                                                                                                                      // 166
  // Check if we are handed strings                                                                                   // 167
  try {                                                                                                               // 168
    userToken && check(userToken, String);                                                                            // 169
  } catch(err) {                                                                                                      // 170
    throw new Meteor.Error(404, 'Error user token and id not of type strings, Error: ' + (err.stack || err.message)); // 171
  }                                                                                                                   // 172
                                                                                                                      // 173
  // Set the this.userId                                                                                              // 174
  if (userToken) {                                                                                                    // 175
    // Look up user to check if user exists and is loggedin via token                                                 // 176
    var user = Meteor.users.findOne({                                                                                 // 177
        $or: [                                                                                                        // 178
          {'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(userToken)},                           // 179
          {'services.resume.loginTokens.token': userToken}                                                            // 180
        ]                                                                                                             // 181
      });                                                                                                             // 182
    // TODO: check 'services.resume.loginTokens.when' to have the token expire                                        // 183
                                                                                                                      // 184
    // Set the userId in the scope                                                                                    // 185
    return user && user._id;                                                                                          // 186
  }                                                                                                                   // 187
                                                                                                                      // 188
  return null;                                                                                                        // 189
};                                                                                                                    // 190
                                                                                                                      // 191
/*                                                                                                                    // 192
                                                                                                                      // 193
Add default support for options                                                                                       // 194
                                                                                                                      // 195
*/                                                                                                                    // 196
_methodHTTP.defaultOptionsHandler = function(methodObject) {                                                          // 197
  // List of supported methods                                                                                        // 198
  var allowMethods = [];                                                                                              // 199
  // The final result object                                                                                          // 200
  var result = {};                                                                                                    // 201
                                                                                                                      // 202
  // Iterate over the methods                                                                                         // 203
  // XXX: We should have a way to extend this - We should have some schema model                                      // 204
  // for our methods...                                                                                               // 205
  _.each(methodObject, function(f, methodName) {                                                                      // 206
    // Skip the stream and auth functions - they are not public / accessible                                          // 207
    if (methodName !== 'stream' && methodName !== 'auth') {                                                           // 208
                                                                                                                      // 209
      // Create an empty description                                                                                  // 210
      result[methodName] = { description: '', parameters: {} };                                                       // 211
      // Add method name to headers                                                                                   // 212
      allowMethods.push(methodName);                                                                                  // 213
                                                                                                                      // 214
    }                                                                                                                 // 215
  });                                                                                                                 // 216
                                                                                                                      // 217
  // Lets play nice                                                                                                   // 218
  this.setStatusCode(200);                                                                                            // 219
                                                                                                                      // 220
  // We have to set some allow headers here                                                                           // 221
  this.addHeader('Allow', allowMethods.join(','));                                                                    // 222
                                                                                                                      // 223
  // Return json result - Pretty print                                                                                // 224
  return JSON.stringify(result, null, '\t');                                                                          // 225
};                                                                                                                    // 226
                                                                                                                      // 227
// Public interface for adding server-side http methods - if setting a method to                                      // 228
// 'false' it would actually remove the method (can be used to unpublish a method)                                    // 229
HTTP.methods = function(newMethods) {                                                                                 // 230
  _.each(newMethods, function(func, name) {                                                                           // 231
    if (_methodHTTP.nameFollowsConventions(name)) {                                                                   // 232
      // Check if we got a function                                                                                   // 233
      //if (typeof func === 'function') {                                                                             // 234
        var method = _methodHTTP.addToMethodTree(name);                                                               // 235
        // The func is good                                                                                           // 236
        if (typeof _methodHTTP.methodHandlers[method.name] !== 'undefined') {                                         // 237
          if (func === false) {                                                                                       // 238
            // If the method is set to false then unpublish                                                           // 239
            delete _methodHTTP.methodHandlers[method.name];                                                           // 240
            // Delete the reference in the _methodHTTP.methodTree                                                     // 241
            delete method.name;                                                                                       // 242
            delete method.params;                                                                                     // 243
          } else {                                                                                                    // 244
            // We should not allow overwriting - following Meteor.methods                                             // 245
            throw new Error('HTTP method "' + name + '" is already registered');                                      // 246
          }                                                                                                           // 247
        } else {                                                                                                      // 248
          // We could have a function or a object                                                                     // 249
          // The object could have:                                                                                   // 250
          // '/test/': {                                                                                              // 251
          //   auth: function() ... returning the userId using over default                                           // 252
          //                                                                                                          // 253
          //   method: function() ...                                                                                 // 254
          //   or                                                                                                     // 255
          //   post: function() ...                                                                                   // 256
          //   put:                                                                                                   // 257
          //   get:                                                                                                   // 258
          //   delete:                                                                                                // 259
          //   head:                                                                                                  // 260
          // }                                                                                                        // 261
                                                                                                                      // 262
          /*                                                                                                          // 263
          We conform to the object format:                                                                            // 264
          {                                                                                                           // 265
            auth:                                                                                                     // 266
            post:                                                                                                     // 267
            put:                                                                                                      // 268
            get:                                                                                                      // 269
            delete:                                                                                                   // 270
            head:                                                                                                     // 271
          }                                                                                                           // 272
          This way we have a uniform reference                                                                        // 273
          */                                                                                                          // 274
                                                                                                                      // 275
          var uniObj = {};                                                                                            // 276
          if (typeof func === 'function') {                                                                           // 277
            uniObj = {                                                                                                // 278
              'auth': _methodHTTP.getUserId,                                                                          // 279
              'stream': false,                                                                                        // 280
              'POST': func,                                                                                           // 281
              'PUT': func,                                                                                            // 282
              'GET': func,                                                                                            // 283
              'DELETE': func,                                                                                         // 284
              'HEAD': func,                                                                                           // 285
              'OPTIONS': _methodHTTP.defaultOptionsHandler                                                            // 286
            };                                                                                                        // 287
          } else {                                                                                                    // 288
            uniObj = {                                                                                                // 289
              'stream': func.stream || false,                                                                         // 290
              'auth': func.auth || _methodHTTP.getUserId,                                                             // 291
              'POST': func.post || func.method,                                                                       // 292
              'PUT': func.put || func.method,                                                                         // 293
              'GET': func.get || func.method,                                                                         // 294
              'DELETE': func.delete || func.method,                                                                   // 295
              'HEAD': func.head || func.get || func.method,                                                           // 296
              'OPTIONS': func.options || _methodHTTP.defaultOptionsHandler                                            // 297
            };                                                                                                        // 298
          }                                                                                                           // 299
                                                                                                                      // 300
          // Registre the method                                                                                      // 301
          _methodHTTP.methodHandlers[method.name] = uniObj; // func;                                                  // 302
                                                                                                                      // 303
        }                                                                                                             // 304
      // } else {                                                                                                     // 305
      //   // We do require a function as a function to execute later                                                 // 306
      //   throw new Error('HTTP.methods failed: ' + name + ' is not a function');                                    // 307
      // }                                                                                                            // 308
    } else {                                                                                                          // 309
      // We have to follow the naming spec defined in nameFollowsConventions                                          // 310
      throw new Error('HTTP.method "' + name + '" invalid naming of method');                                         // 311
    }                                                                                                                 // 312
  });                                                                                                                 // 313
};                                                                                                                    // 314
                                                                                                                      // 315
var sendError = function(res, code, message) {                                                                        // 316
  if (code) {                                                                                                         // 317
    res.writeHead(code);                                                                                              // 318
  } else {                                                                                                            // 319
    res.writeHead(500);                                                                                               // 320
  }                                                                                                                   // 321
  res.end(message);                                                                                                   // 322
};                                                                                                                    // 323
                                                                                                                      // 324
// This handler collects the header data into either an object (if json) or the                                       // 325
// raw data. The data is passed to the callback                                                                       // 326
var requestHandler = function(req, res, callback) {                                                                   // 327
  if (typeof callback !== 'function') {                                                                               // 328
    return null;                                                                                                      // 329
  }                                                                                                                   // 330
                                                                                                                      // 331
  // Container for buffers and a sum of the length                                                                    // 332
  var bufferData = [], dataLen = 0;                                                                                   // 333
                                                                                                                      // 334
  // Extract the body                                                                                                 // 335
  req.on('data', function(data) {                                                                                     // 336
    bufferData.push(data);                                                                                            // 337
    dataLen += data.length;                                                                                           // 338
                                                                                                                      // 339
    // We have to check the data length in order to spare the server                                                  // 340
    if (dataLen > HTTP.methodsMaxDataLength) {                                                                        // 341
      dataLen = 0;                                                                                                    // 342
      bufferData = [];                                                                                                // 343
      // Flood attack or faulty client                                                                                // 344
      sendError(res, 413, 'Flood attack or faulty client');                                                           // 345
      req.connection.destroy();                                                                                       // 346
    }                                                                                                                 // 347
  });                                                                                                                 // 348
                                                                                                                      // 349
  // When message is ready to be passed on                                                                            // 350
  req.on('end', function() {                                                                                          // 351
    if (res.finished) {                                                                                               // 352
      return;                                                                                                         // 353
    }                                                                                                                 // 354
                                                                                                                      // 355
    // Allow the result to be undefined if so                                                                         // 356
    var result;                                                                                                       // 357
                                                                                                                      // 358
    // If data found the work it - either buffer or json                                                              // 359
    if (dataLen > 0) {                                                                                                // 360
      result = new Buffer(dataLen);                                                                                   // 361
      // Merge the chunks into one buffer                                                                             // 362
      for (var i = 0, ln = bufferData.length, pos = 0; i < ln; i++) {                                                 // 363
        bufferData[i].copy(result, pos);                                                                              // 364
        pos += bufferData[i].length;                                                                                  // 365
        delete bufferData[i];                                                                                         // 366
      }                                                                                                               // 367
      // Check if we could be dealing with json                                                                       // 368
      if (result[0] == 0x7b && result[1] === 0x22) {                                                                  // 369
        try {                                                                                                         // 370
          // Convert the body into json and extract the data object                                                   // 371
          result = EJSON.parse(result.toString());                                                                    // 372
        } catch(err) {                                                                                                // 373
          // Could not parse so we return the raw data                                                                // 374
        }                                                                                                             // 375
      }                                                                                                               // 376
    } else {                                                                                                          // 377
      // Result will be undefined                                                                                     // 378
    }                                                                                                                 // 379
                                                                                                                      // 380
    try {                                                                                                             // 381
      callback(result);                                                                                               // 382
    } catch(err) {                                                                                                    // 383
      sendError(res, 500, 'Error in requestHandler callback, Error: ' + (err.stack || err.message) );                 // 384
    }                                                                                                                 // 385
  });                                                                                                                 // 386
                                                                                                                      // 387
};                                                                                                                    // 388
                                                                                                                      // 389
// This is the simplest handler - it simply passes req stream as data to the                                          // 390
// method                                                                                                             // 391
var streamHandler = function(req, res, callback) {                                                                    // 392
  try {                                                                                                               // 393
    callback();                                                                                                       // 394
  } catch(err) {                                                                                                      // 395
    sendError(res, 500, 'Error in requestHandler callback, Error: ' + (err.stack || err.message) );                   // 396
  }                                                                                                                   // 397
};                                                                                                                    // 398
                                                                                                                      // 399
/*                                                                                                                    // 400
  Allow file uploads in cordova cfs                                                                                   // 401
*/                                                                                                                    // 402
var setCordovaHeaders = function(res) {                                                                               // 403
  res.setHeader("Access-Control-Allow-Origin", "http://meteor.local");                                                // 404
  res.setHeader("Access-Control-Allow-Methods", "PUT");                                                               // 405
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");                                                      // 406
};                                                                                                                    // 407
                                                                                                                      // 408
// Handle the actual connection                                                                                       // 409
WebApp.connectHandlers.use(function(req, res, next) {                                                                 // 410
                                                                                                                      // 411
  // Check to se if this is a http method call                                                                        // 412
  var method = _methodHTTP.getMethod(req._parsedUrl.pathname);                                                        // 413
                                                                                                                      // 414
  // If method is null then it wasn't and we pass the request along                                                   // 415
  if (method === null) {                                                                                              // 416
    return next();                                                                                                    // 417
  }                                                                                                                   // 418
                                                                                                                      // 419
  var dataHandle = (method.handle && method.handle.stream)?streamHandler:requestHandler;                              // 420
                                                                                                                      // 421
  dataHandle(req, res, function(data) {                                                                               // 422
    // If methodsHandler not found or somehow the methodshandler is not a                                             // 423
    // function then return a 404                                                                                     // 424
    if (typeof method.handle === 'undefined') {                                                                       // 425
      sendError(res, 404, 'Error HTTP method handler "' + method.name + '" is not found');                            // 426
      return;                                                                                                         // 427
    }                                                                                                                 // 428
                                                                                                                      // 429
    // Set CORS headers for Meteor Cordova clients                                                                    // 430
    setCordovaHeaders(res);                                                                                           // 431
                                                                                                                      // 432
    // Set fiber scope                                                                                                // 433
    var fiberScope = {                                                                                                // 434
      // Pointers to Request / Response                                                                               // 435
      req: req,                                                                                                       // 436
      res: res,                                                                                                       // 437
      // Request / Response helpers                                                                                   // 438
      statusCode: 200,                                                                                                // 439
      method: req.method,                                                                                             // 440
      // Headers for response                                                                                         // 441
      headers: {                                                                                                      // 442
        'Content-Type': 'text/html'  // Set default type                                                              // 443
      },                                                                                                              // 444
      // Arguments                                                                                                    // 445
      data: data,                                                                                                     // 446
      query: req.query,                                                                                               // 447
      params: method.params,                                                                                          // 448
      // Method reference                                                                                             // 449
      reference: method.name,                                                                                         // 450
      methodObject: method.handle,                                                                                    // 451
      // Streaming flags                                                                                              // 452
      isReadStreaming: false,                                                                                         // 453
      isWriteStreaming: false,                                                                                        // 454
    };                                                                                                                // 455
                                                                                                                      // 456
    // Helper functions this scope                                                                                    // 457
    Fiber = Npm.require('fibers');                                                                                    // 458
    runServerMethod = Fiber(function(self) {                                                                          // 459
      // We fetch methods data from methodsHandler, the handler uses the this.addItem()                               // 460
      // function to populate the methods, this way we have better check control and                                  // 461
      // better error handling + messages                                                                             // 462
                                                                                                                      // 463
      // The scope for the user methodObject callbacks                                                                // 464
      var thisScope = {                                                                                               // 465
        // The user whos id and token was used to run this method, if set/found                                       // 466
        userId: null,                                                                                                 // 467
        // The id of the data                                                                                         // 468
        _id: null,                                                                                                    // 469
        // Set the query params ?token=1&id=2 -> { token: 1, id: 2 }                                                  // 470
        query: self.query,                                                                                            // 471
        // Set params /foo/:name/test/:id -> { name: '', id: '' }                                                     // 472
        params: self.params,                                                                                          // 473
        // Method GET, PUT, POST, DELETE, HEAD                                                                        // 474
        method: self.method,                                                                                          // 475
        // User agent                                                                                                 // 476
        userAgent: req.headers['user-agent'],                                                                         // 477
        // All request headers                                                                                        // 478
        requestHeaders: req.headers,                                                                                  // 479
        // Add the request object it self                                                                             // 480
        request: req,                                                                                                 // 481
        // Set the userId                                                                                             // 482
        setUserId: function(id) {                                                                                     // 483
          this.userId = id;                                                                                           // 484
        },                                                                                                            // 485
        // We dont simulate / run this on the client at the moment                                                    // 486
        isSimulation: false,                                                                                          // 487
        // Run the next method in a new fiber - This is default at the moment                                         // 488
        unblock: function() {},                                                                                       // 489
        // Set the content type in header, defaults to text/html?                                                     // 490
        setContentType: function(type) {                                                                              // 491
          self.headers['Content-Type'] = type;                                                                        // 492
        },                                                                                                            // 493
        setStatusCode: function(code) {                                                                               // 494
          self.statusCode = code;                                                                                     // 495
        },                                                                                                            // 496
        addHeader: function(key, value) {                                                                             // 497
          self.headers[key] = value;                                                                                  // 498
        },                                                                                                            // 499
        createReadStream: function() {                                                                                // 500
          self.isReadStreaming = true;                                                                                // 501
          return req;                                                                                                 // 502
        },                                                                                                            // 503
        createWriteStream: function() {                                                                               // 504
          self.isWriteStreaming = true;                                                                               // 505
          return res;                                                                                                 // 506
        },                                                                                                            // 507
        Error: function(err) {                                                                                        // 508
                                                                                                                      // 509
          if (err instanceof Meteor.Error) {                                                                          // 510
            // Return controlled error                                                                                // 511
            sendError(res, err.error, err.message);                                                                   // 512
          } else if (err instanceof Error) {                                                                          // 513
            // Return error trace - this is not intented                                                              // 514
            sendError(res, 503, 'Error in method "' + self.reference + '", Error: ' + (err.stack || err.message) );   // 515
          } else {                                                                                                    // 516
            sendError(res, 503, 'Error in method "' + self.reference + '"' );                                         // 517
          }                                                                                                           // 518
                                                                                                                      // 519
        },                                                                                                            // 520
        // getData: function() {                                                                                      // 521
        //   // XXX: TODO if we could run the request handler stuff eg.                                               // 522
        //   // in here in a fiber sync it could be cool - and the user did                                           // 523
        //   // not have to specify the stream=true flag?                                                             // 524
        // }                                                                                                          // 525
      };                                                                                                              // 526
                                                                                                                      // 527
      var methodCall = self.methodObject[self.method];                                                                // 528
                                                                                                                      // 529
      // If the method call is set for the POST/PUT/GET or DELETE then run the                                        // 530
      // respective methodCall if its a function                                                                      // 531
      if (typeof methodCall === 'function') {                                                                         // 532
                                                                                                                      // 533
        // Get the userId - This is either set as a method specific handler and                                       // 534
        // will allways default back to the builtin getUserId handler                                                 // 535
        try {                                                                                                         // 536
          // Try to set the userId                                                                                    // 537
          thisScope.userId = self.methodObject.auth.apply(self);                                                      // 538
        } catch(err) {                                                                                                // 539
          sendError(res, err.error, (err.message || err.stack));                                                      // 540
          return;                                                                                                     // 541
        }                                                                                                             // 542
                                                                                                                      // 543
        // Get the result of the methodCall                                                                           // 544
        var result;                                                                                                   // 545
        // Get a result back to send to the client                                                                    // 546
        try {                                                                                                         // 547
          if (self.method == 'OPTIONS') {                                                                             // 548
            result = methodCall.apply(thisScope, [self.methodObject]) || '';                                          // 549
          } else {                                                                                                    // 550
            result = methodCall.apply(thisScope, [self.data]) || '';                                                  // 551
          }                                                                                                           // 552
        } catch(err) {                                                                                                // 553
          if (err instanceof Meteor.Error) {                                                                          // 554
            // Return controlled error                                                                                // 555
            sendError(res, err.error, err.message);                                                                   // 556
          } else {                                                                                                    // 557
            // Return error trace - this is not intented                                                              // 558
            sendError(res, 503, 'Error in method "' + self.reference + '", Error: ' + (err.stack || err.message) );   // 559
          }                                                                                                           // 560
          return;                                                                                                     // 561
        }                                                                                                             // 562
                                                                                                                      // 563
        // If OK / 200 then Return the result                                                                         // 564
        if (self.statusCode === 200) {                                                                                // 565
          // Set headers                                                                                              // 566
          _.each(self.headers, function(value, key) {                                                                 // 567
            // If value is defined then set the header, this allows for unsetting                                     // 568
            // the default content-type                                                                               // 569
            if (typeof value !== 'undefined')                                                                         // 570
              res.setHeader(key, value);                                                                              // 571
          });                                                                                                         // 572
                                                                                                                      // 573
          if (self.method === "HEAD") {                                                                               // 574
            res.end();                                                                                                // 575
            return;                                                                                                   // 576
          }                                                                                                           // 577
                                                                                                                      // 578
          // Return result                                                                                            // 579
          var resultBuffer = new Buffer(result);                                                                      // 580
                                                                                                                      // 581
          // Check if user wants to overwrite content length for some reason?                                         // 582
          if (typeof self.headers['Content-Length'] === 'undefined') {                                                // 583
            self.headers['Content-Length'] = resultBuffer.length;                                                     // 584
          }                                                                                                           // 585
                                                                                                                      // 586
          // Check if we allow and have a stream and the user is read streaming                                       // 587
          // Then                                                                                                     // 588
          var streamsWaiting = 1;                                                                                     // 589
                                                                                                                      // 590
          // We wait until the user has finished reading                                                              // 591
          if (self.isReadStreaming) {                                                                                 // 592
            // console.log('Read stream');                                                                            // 593
            req.on('end', function() {                                                                                // 594
              streamsWaiting--;                                                                                       // 595
              // If no streams are waiting                                                                            // 596
              if (streamsWaiting == 0 && !self.isWriteStreaming) {                                                    // 597
                res.end(resultBuffer);                                                                                // 598
              }                                                                                                       // 599
            });                                                                                                       // 600
                                                                                                                      // 601
          } else {                                                                                                    // 602
            streamsWaiting--;                                                                                         // 603
          }                                                                                                           // 604
                                                                                                                      // 605
          // We wait until the user has finished writing                                                              // 606
          if (self.isWriteStreaming) {                                                                                // 607
            // console.log('Write stream');                                                                           // 608
          } else {                                                                                                    // 609
            // If we are done reading the buffer - eg. not streaming                                                  // 610
            if (streamsWaiting == 0) res.end(resultBuffer);                                                           // 611
          }                                                                                                           // 612
                                                                                                                      // 613
                                                                                                                      // 614
        } else {                                                                                                      // 615
          // Set headers                                                                                              // 616
          _.each(self.headers, function(value, key) {                                                                 // 617
            // If value is defined then set the header, this allows for unsetting                                     // 618
            // the default content-type                                                                               // 619
            if (typeof value !== 'undefined')                                                                         // 620
              res.setHeader(key, value);                                                                              // 621
          });                                                                                                         // 622
          // Allow user to alter the status code and send a message                                                   // 623
          sendError(res, self.statusCode, result);                                                                    // 624
        }                                                                                                             // 625
                                                                                                                      // 626
      } else {                                                                                                        // 627
        sendError(res, 404, 'Service not found');                                                                     // 628
      }                                                                                                               // 629
                                                                                                                      // 630
                                                                                                                      // 631
    });                                                                                                               // 632
    // Run http methods handler                                                                                       // 633
    try {                                                                                                             // 634
      runServerMethod.run(fiberScope);                                                                                // 635
    } catch(err) {                                                                                                    // 636
      sendError(res, 500, 'Error running the server http method handler, Error: ' + (err.stack || err.message));      // 637
    }                                                                                                                 // 638
                                                                                                                      // 639
  }); // EO Request handler                                                                                           // 640
                                                                                                                      // 641
                                                                                                                      // 642
});                                                                                                                   // 643
                                                                                                                      // 644
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:http-methods'] = {
  HTTP: HTTP,
  _methodHTTP: _methodHTTP
};

})();

//# sourceMappingURL=cfs_http-methods.js.map
