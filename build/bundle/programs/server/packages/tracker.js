(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var Tracker, Deps;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/tracker/tracker.js                                                                                    //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
//////////////////////////////////////////////////                                                                // 1
// Package docs at http://docs.meteor.com/#tracker //                                                             // 2
//////////////////////////////////////////////////                                                                // 3
                                                                                                                  // 4
/**                                                                                                               // 5
 * @namespace Tracker                                                                                             // 6
 * @summary The namespace for Tracker-related methods.                                                            // 7
 */                                                                                                               // 8
Tracker = {};                                                                                                     // 9
                                                                                                                  // 10
// http://docs.meteor.com/#tracker_active                                                                         // 11
                                                                                                                  // 12
/**                                                                                                               // 13
 * @summary True if there is a current computation, meaning that dependencies on reactive data sources will be tracked and potentially cause the current computation to be rerun.
 * @locus Client                                                                                                  // 15
 * @type {Boolean}                                                                                                // 16
 */                                                                                                               // 17
Tracker.active = false;                                                                                           // 18
                                                                                                                  // 19
// http://docs.meteor.com/#tracker_currentcomputation                                                             // 20
                                                                                                                  // 21
/**                                                                                                               // 22
 * @summary The current computation, or `null` if there isn't one.  The current computation is the [`Tracker.Computation`](#tracker_computation) object created by the innermost active call to `Tracker.autorun`, and it's the computation that gains dependencies when reactive data sources are accessed.
 * @locus Client                                                                                                  // 24
 * @type {Tracker.Computation}                                                                                    // 25
 */                                                                                                               // 26
Tracker.currentComputation = null;                                                                                // 27
                                                                                                                  // 28
var setCurrentComputation = function (c) {                                                                        // 29
  Tracker.currentComputation = c;                                                                                 // 30
  Tracker.active = !! c;                                                                                          // 31
};                                                                                                                // 32
                                                                                                                  // 33
var _debugFunc = function () {                                                                                    // 34
  // We want this code to work without Meteor, and also without                                                   // 35
  // "console" (which is technically non-standard and may be missing                                              // 36
  // on some browser we come across, like it was on IE 7).                                                        // 37
  //                                                                                                              // 38
  // Lazy evaluation because `Meteor` does not exist right away.(??)                                              // 39
  return (typeof Meteor !== "undefined" ? Meteor._debug :                                                         // 40
          ((typeof console !== "undefined") && console.log ?                                                      // 41
           function () { console.log.apply(console, arguments); } :                                               // 42
           function () {}));                                                                                      // 43
};                                                                                                                // 44
                                                                                                                  // 45
var _throwOrLog = function (from, e) {                                                                            // 46
  if (throwFirstError) {                                                                                          // 47
    throw e;                                                                                                      // 48
  } else {                                                                                                        // 49
    var messageAndStack;                                                                                          // 50
    if (e.stack && e.message) {                                                                                   // 51
      var idx = e.stack.indexOf(e.message);                                                                       // 52
      if (idx >= 0 && idx <= 10) // allow for "Error: " (at least 7)                                              // 53
        messageAndStack = e.stack; // message is part of e.stack, as in Chrome                                    // 54
      else                                                                                                        // 55
        messageAndStack = e.message +                                                                             // 56
        (e.stack.charAt(0) === '\n' ? '' : '\n') + e.stack; // e.g. Safari                                        // 57
    } else {                                                                                                      // 58
      messageAndStack = e.stack || e.message;                                                                     // 59
    }                                                                                                             // 60
    _debugFunc()("Exception from Tracker " + from + " function:",                                                 // 61
                 messageAndStack);                                                                                // 62
  }                                                                                                               // 63
};                                                                                                                // 64
                                                                                                                  // 65
// Takes a function `f`, and wraps it in a `Meteor._noYieldsAllowed`                                              // 66
// block if we are running on the server. On the client, returns the                                              // 67
// original function (since `Meteor._noYieldsAllowed` is a                                                        // 68
// no-op). This has the benefit of not adding an unnecessary stack                                                // 69
// frame on the client.                                                                                           // 70
var withNoYieldsAllowed = function (f) {                                                                          // 71
  if ((typeof Meteor === 'undefined') || Meteor.isClient) {                                                       // 72
    return f;                                                                                                     // 73
  } else {                                                                                                        // 74
    return function () {                                                                                          // 75
      var args = arguments;                                                                                       // 76
      Meteor._noYieldsAllowed(function () {                                                                       // 77
        f.apply(null, args);                                                                                      // 78
      });                                                                                                         // 79
    };                                                                                                            // 80
  }                                                                                                               // 81
};                                                                                                                // 82
                                                                                                                  // 83
var nextId = 1;                                                                                                   // 84
// computations whose callbacks we should call at flush time                                                      // 85
var pendingComputations = [];                                                                                     // 86
// `true` if a Tracker.flush is scheduled, or if we are in Tracker.flush now                                      // 87
var willFlush = false;                                                                                            // 88
// `true` if we are in Tracker.flush now                                                                          // 89
var inFlush = false;                                                                                              // 90
// `true` if we are computing a computation now, either first time                                                // 91
// or recompute.  This matches Tracker.active unless we are inside                                                // 92
// Tracker.nonreactive, which nullfies currentComputation even though                                             // 93
// an enclosing computation may still be running.                                                                 // 94
var inCompute = false;                                                                                            // 95
// `true` if the `_throwFirstError` option was passed in to the call                                              // 96
// to Tracker.flush that we are in. When set, throw rather than log the                                           // 97
// first error encountered while flushing. Before throwing the error,                                             // 98
// finish flushing (from a finally block), logging any subsequent                                                 // 99
// errors.                                                                                                        // 100
var throwFirstError = false;                                                                                      // 101
                                                                                                                  // 102
var afterFlushCallbacks = [];                                                                                     // 103
                                                                                                                  // 104
var requireFlush = function () {                                                                                  // 105
  if (! willFlush) {                                                                                              // 106
    setTimeout(Tracker.flush, 0);                                                                                 // 107
    willFlush = true;                                                                                             // 108
  }                                                                                                               // 109
};                                                                                                                // 110
                                                                                                                  // 111
// Tracker.Computation constructor is visible but private                                                         // 112
// (throws an error if you try to call it)                                                                        // 113
var constructingComputation = false;                                                                              // 114
                                                                                                                  // 115
//                                                                                                                // 116
// http://docs.meteor.com/#tracker_computation                                                                    // 117
                                                                                                                  // 118
/**                                                                                                               // 119
 * @summary A Computation object represents code that is repeatedly rerun                                         // 120
 * in response to                                                                                                 // 121
 * reactive data changes. Computations don't have return values; they just                                        // 122
 * perform actions, such as rerendering a template on the screen. Computations                                    // 123
 * are created using Tracker.autorun. Use stop to prevent further rerunning of a                                  // 124
 * computation.                                                                                                   // 125
 * @instancename computation                                                                                      // 126
 */                                                                                                               // 127
Tracker.Computation = function (f, parent) {                                                                      // 128
  if (! constructingComputation)                                                                                  // 129
    throw new Error(                                                                                              // 130
      "Tracker.Computation constructor is private; use Tracker.autorun");                                         // 131
  constructingComputation = false;                                                                                // 132
                                                                                                                  // 133
  var self = this;                                                                                                // 134
                                                                                                                  // 135
  // http://docs.meteor.com/#computation_stopped                                                                  // 136
                                                                                                                  // 137
  /**                                                                                                             // 138
   * @summary True if this computation has been stopped.                                                          // 139
   * @locus Client                                                                                                // 140
   * @memberOf Tracker.Computation                                                                                // 141
   * @instance                                                                                                    // 142
   * @name  stopped                                                                                               // 143
   */                                                                                                             // 144
  self.stopped = false;                                                                                           // 145
                                                                                                                  // 146
  // http://docs.meteor.com/#computation_invalidated                                                              // 147
                                                                                                                  // 148
  /**                                                                                                             // 149
   * @summary True if this computation has been invalidated (and not yet rerun), or if it has been stopped.       // 150
   * @locus Client                                                                                                // 151
   * @memberOf Tracker.Computation                                                                                // 152
   * @instance                                                                                                    // 153
   * @name  invalidated                                                                                           // 154
   * @type {Boolean}                                                                                              // 155
   */                                                                                                             // 156
  self.invalidated = false;                                                                                       // 157
                                                                                                                  // 158
  // http://docs.meteor.com/#computation_firstrun                                                                 // 159
                                                                                                                  // 160
  /**                                                                                                             // 161
   * @summary True during the initial run of the computation at the time `Tracker.autorun` is called, and false on subsequent reruns and at other times.
   * @locus Client                                                                                                // 163
   * @memberOf Tracker.Computation                                                                                // 164
   * @instance                                                                                                    // 165
   * @name  firstRun                                                                                              // 166
   * @type {Boolean}                                                                                              // 167
   */                                                                                                             // 168
  self.firstRun = true;                                                                                           // 169
                                                                                                                  // 170
  self._id = nextId++;                                                                                            // 171
  self._onInvalidateCallbacks = [];                                                                               // 172
  // the plan is at some point to use the parent relation                                                         // 173
  // to constrain the order that computations are processed                                                       // 174
  self._parent = parent;                                                                                          // 175
  self._func = f;                                                                                                 // 176
  self._recomputing = false;                                                                                      // 177
                                                                                                                  // 178
  var errored = true;                                                                                             // 179
  try {                                                                                                           // 180
    self._compute();                                                                                              // 181
    errored = false;                                                                                              // 182
  } finally {                                                                                                     // 183
    self.firstRun = false;                                                                                        // 184
    if (errored)                                                                                                  // 185
      self.stop();                                                                                                // 186
  }                                                                                                               // 187
};                                                                                                                // 188
                                                                                                                  // 189
// http://docs.meteor.com/#computation_oninvalidate                                                               // 190
                                                                                                                  // 191
/**                                                                                                               // 192
 * @summary Registers `callback` to run when this computation is next invalidated, or runs it immediately if the computation is already invalidated.  The callback is run exactly once and not upon future invalidations unless `onInvalidate` is called again after the computation becomes valid again.
 * @locus Client                                                                                                  // 194
 * @param {Function} callback Function to be called on invalidation. Receives one argument, the computation that was invalidated.
 */                                                                                                               // 196
Tracker.Computation.prototype.onInvalidate = function (f) {                                                       // 197
  var self = this;                                                                                                // 198
                                                                                                                  // 199
  if (typeof f !== 'function')                                                                                    // 200
    throw new Error("onInvalidate requires a function");                                                          // 201
                                                                                                                  // 202
  if (self.invalidated) {                                                                                         // 203
    Tracker.nonreactive(function () {                                                                             // 204
      withNoYieldsAllowed(f)(self);                                                                               // 205
    });                                                                                                           // 206
  } else {                                                                                                        // 207
    self._onInvalidateCallbacks.push(f);                                                                          // 208
  }                                                                                                               // 209
};                                                                                                                // 210
                                                                                                                  // 211
// http://docs.meteor.com/#computation_invalidate                                                                 // 212
                                                                                                                  // 213
/**                                                                                                               // 214
 * @summary Invalidates this computation so that it will be rerun.                                                // 215
 * @locus Client                                                                                                  // 216
 */                                                                                                               // 217
Tracker.Computation.prototype.invalidate = function () {                                                          // 218
  var self = this;                                                                                                // 219
  if (! self.invalidated) {                                                                                       // 220
    // if we're currently in _recompute(), don't enqueue                                                          // 221
    // ourselves, since we'll rerun immediately anyway.                                                           // 222
    if (! self._recomputing && ! self.stopped) {                                                                  // 223
      requireFlush();                                                                                             // 224
      pendingComputations.push(this);                                                                             // 225
    }                                                                                                             // 226
                                                                                                                  // 227
    self.invalidated = true;                                                                                      // 228
                                                                                                                  // 229
    // callbacks can't add callbacks, because                                                                     // 230
    // self.invalidated === true.                                                                                 // 231
    for(var i = 0, f; f = self._onInvalidateCallbacks[i]; i++) {                                                  // 232
      Tracker.nonreactive(function () {                                                                           // 233
        withNoYieldsAllowed(f)(self);                                                                             // 234
      });                                                                                                         // 235
    }                                                                                                             // 236
    self._onInvalidateCallbacks = [];                                                                             // 237
  }                                                                                                               // 238
};                                                                                                                // 239
                                                                                                                  // 240
// http://docs.meteor.com/#computation_stop                                                                       // 241
                                                                                                                  // 242
/**                                                                                                               // 243
 * @summary Prevents this computation from rerunning.                                                             // 244
 * @locus Client                                                                                                  // 245
 */                                                                                                               // 246
Tracker.Computation.prototype.stop = function () {                                                                // 247
  if (! this.stopped) {                                                                                           // 248
    this.stopped = true;                                                                                          // 249
    this.invalidate();                                                                                            // 250
  }                                                                                                               // 251
};                                                                                                                // 252
                                                                                                                  // 253
Tracker.Computation.prototype._compute = function () {                                                            // 254
  var self = this;                                                                                                // 255
  self.invalidated = false;                                                                                       // 256
                                                                                                                  // 257
  var previous = Tracker.currentComputation;                                                                      // 258
  setCurrentComputation(self);                                                                                    // 259
  var previousInCompute = inCompute;                                                                              // 260
  inCompute = true;                                                                                               // 261
  try {                                                                                                           // 262
    withNoYieldsAllowed(self._func)(self);                                                                        // 263
  } finally {                                                                                                     // 264
    setCurrentComputation(previous);                                                                              // 265
    inCompute = previousInCompute;                                                                                // 266
  }                                                                                                               // 267
};                                                                                                                // 268
                                                                                                                  // 269
Tracker.Computation.prototype._recompute = function () {                                                          // 270
  var self = this;                                                                                                // 271
                                                                                                                  // 272
  self._recomputing = true;                                                                                       // 273
  try {                                                                                                           // 274
    while (self.invalidated && ! self.stopped) {                                                                  // 275
      try {                                                                                                       // 276
        self._compute();                                                                                          // 277
      } catch (e) {                                                                                               // 278
        _throwOrLog("recompute", e);                                                                              // 279
      }                                                                                                           // 280
      // If _compute() invalidated us, we run again immediately.                                                  // 281
      // A computation that invalidates itself indefinitely is an                                                 // 282
      // infinite loop, of course.                                                                                // 283
      //                                                                                                          // 284
      // We could put an iteration counter here and catch run-away                                                // 285
      // loops.                                                                                                   // 286
    }                                                                                                             // 287
  } finally {                                                                                                     // 288
    self._recomputing = false;                                                                                    // 289
  }                                                                                                               // 290
};                                                                                                                // 291
                                                                                                                  // 292
//                                                                                                                // 293
// http://docs.meteor.com/#tracker_dependency                                                                     // 294
                                                                                                                  // 295
/**                                                                                                               // 296
 * @summary A Dependency represents an atomic unit of reactive data that a                                        // 297
 * computation might depend on. Reactive data sources such as Session or                                          // 298
 * Minimongo internally create different Dependency objects for different                                         // 299
 * pieces of data, each of which may be depended on by multiple computations.                                     // 300
 * When the data changes, the computations are invalidated.                                                       // 301
 * @class                                                                                                         // 302
 * @instanceName dependency                                                                                       // 303
 */                                                                                                               // 304
Tracker.Dependency = function () {                                                                                // 305
  this._dependentsById = {};                                                                                      // 306
};                                                                                                                // 307
                                                                                                                  // 308
// http://docs.meteor.com/#dependency_depend                                                                      // 309
//                                                                                                                // 310
// Adds `computation` to this set if it is not already                                                            // 311
// present.  Returns true if `computation` is a new member of the set.                                            // 312
// If no argument, defaults to currentComputation, or does nothing                                                // 313
// if there is no currentComputation.                                                                             // 314
                                                                                                                  // 315
/**                                                                                                               // 316
 * @summary Declares that the current computation (or `fromComputation` if given) depends on `dependency`.  The computation will be invalidated the next time `dependency` changes.
                                                                                                                  // 318
If there is no current computation and `depend()` is called with no arguments, it does nothing and returns false. // 319
                                                                                                                  // 320
Returns true if the computation is a new dependent of `dependency` rather than an existing one.                   // 321
 * @locus Client                                                                                                  // 322
 * @param {Tracker.Computation} [fromComputation] An optional computation declared to depend on `dependency` instead of the current computation.
 * @returns {Boolean}                                                                                             // 324
 */                                                                                                               // 325
Tracker.Dependency.prototype.depend = function (computation) {                                                    // 326
  if (! computation) {                                                                                            // 327
    if (! Tracker.active)                                                                                         // 328
      return false;                                                                                               // 329
                                                                                                                  // 330
    computation = Tracker.currentComputation;                                                                     // 331
  }                                                                                                               // 332
  var self = this;                                                                                                // 333
  var id = computation._id;                                                                                       // 334
  if (! (id in self._dependentsById)) {                                                                           // 335
    self._dependentsById[id] = computation;                                                                       // 336
    computation.onInvalidate(function () {                                                                        // 337
      delete self._dependentsById[id];                                                                            // 338
    });                                                                                                           // 339
    return true;                                                                                                  // 340
  }                                                                                                               // 341
  return false;                                                                                                   // 342
};                                                                                                                // 343
                                                                                                                  // 344
// http://docs.meteor.com/#dependency_changed                                                                     // 345
                                                                                                                  // 346
/**                                                                                                               // 347
 * @summary Invalidate all dependent computations immediately and remove them as dependents.                      // 348
 * @locus Client                                                                                                  // 349
 */                                                                                                               // 350
Tracker.Dependency.prototype.changed = function () {                                                              // 351
  var self = this;                                                                                                // 352
  for (var id in self._dependentsById)                                                                            // 353
    self._dependentsById[id].invalidate();                                                                        // 354
};                                                                                                                // 355
                                                                                                                  // 356
// http://docs.meteor.com/#dependency_hasdependents                                                               // 357
                                                                                                                  // 358
/**                                                                                                               // 359
 * @summary True if this Dependency has one or more dependent Computations, which would be invalidated if this Dependency were to change.
 * @locus Client                                                                                                  // 361
 * @returns {Boolean}                                                                                             // 362
 */                                                                                                               // 363
Tracker.Dependency.prototype.hasDependents = function () {                                                        // 364
  var self = this;                                                                                                // 365
  for(var id in self._dependentsById)                                                                             // 366
    return true;                                                                                                  // 367
  return false;                                                                                                   // 368
};                                                                                                                // 369
                                                                                                                  // 370
// http://docs.meteor.com/#tracker_flush                                                                          // 371
                                                                                                                  // 372
/**                                                                                                               // 373
 * @summary Process all reactive updates immediately and ensure that all invalidated computations are rerun.      // 374
 * @locus Client                                                                                                  // 375
 */                                                                                                               // 376
Tracker.flush = function (_opts) {                                                                                // 377
  // XXX What part of the comment below is still true? (We no longer                                              // 378
  // have Spark)                                                                                                  // 379
  //                                                                                                              // 380
  // Nested flush could plausibly happen if, say, a flush causes                                                  // 381
  // DOM mutation, which causes a "blur" event, which runs an                                                     // 382
  // app event handler that calls Tracker.flush.  At the moment                                                   // 383
  // Spark blocks event handlers during DOM mutation anyway,                                                      // 384
  // because the LiveRange tree isn't valid.  And we don't have                                                   // 385
  // any useful notion of a nested flush.                                                                         // 386
  //                                                                                                              // 387
  // https://app.asana.com/0/159908330244/385138233856                                                            // 388
  if (inFlush)                                                                                                    // 389
    throw new Error("Can't call Tracker.flush while flushing");                                                   // 390
                                                                                                                  // 391
  if (inCompute)                                                                                                  // 392
    throw new Error("Can't flush inside Tracker.autorun");                                                        // 393
                                                                                                                  // 394
  inFlush = true;                                                                                                 // 395
  willFlush = true;                                                                                               // 396
  throwFirstError = !! (_opts && _opts._throwFirstError);                                                         // 397
                                                                                                                  // 398
  var finishedTry = false;                                                                                        // 399
  try {                                                                                                           // 400
    while (pendingComputations.length ||                                                                          // 401
           afterFlushCallbacks.length) {                                                                          // 402
                                                                                                                  // 403
      // recompute all pending computations                                                                       // 404
      while (pendingComputations.length) {                                                                        // 405
        var comp = pendingComputations.shift();                                                                   // 406
        comp._recompute();                                                                                        // 407
      }                                                                                                           // 408
                                                                                                                  // 409
      if (afterFlushCallbacks.length) {                                                                           // 410
        // call one afterFlush callback, which may                                                                // 411
        // invalidate more computations                                                                           // 412
        var func = afterFlushCallbacks.shift();                                                                   // 413
        try {                                                                                                     // 414
          func();                                                                                                 // 415
        } catch (e) {                                                                                             // 416
          _throwOrLog("afterFlush", e);                                                                           // 417
        }                                                                                                         // 418
      }                                                                                                           // 419
    }                                                                                                             // 420
    finishedTry = true;                                                                                           // 421
  } finally {                                                                                                     // 422
    if (! finishedTry) {                                                                                          // 423
      // we're erroring                                                                                           // 424
      inFlush = false; // needed before calling `Tracker.flush()` again                                           // 425
      Tracker.flush({_throwFirstError: false}); // finish flushing                                                // 426
    }                                                                                                             // 427
    willFlush = false;                                                                                            // 428
    inFlush = false;                                                                                              // 429
  }                                                                                                               // 430
};                                                                                                                // 431
                                                                                                                  // 432
// http://docs.meteor.com/#tracker_autorun                                                                        // 433
//                                                                                                                // 434
// Run f(). Record its dependencies. Rerun it whenever the                                                        // 435
// dependencies change.                                                                                           // 436
//                                                                                                                // 437
// Returns a new Computation, which is also passed to f.                                                          // 438
//                                                                                                                // 439
// Links the computation to the current computation                                                               // 440
// so that it is stopped if the current computation is invalidated.                                               // 441
                                                                                                                  // 442
/**                                                                                                               // 443
 * @summary Run a function now and rerun it later whenever its dependencies change. Returns a Computation object that can be used to stop or observe the rerunning.
 * @locus Client                                                                                                  // 445
 * @param {Function} runFunc The function to run. It receives one argument: the Computation object that will be returned.
 * @returns {Tracker.Computation}                                                                                 // 447
 */                                                                                                               // 448
Tracker.autorun = function (f) {                                                                                  // 449
  if (typeof f !== 'function')                                                                                    // 450
    throw new Error('Tracker.autorun requires a function argument');                                              // 451
                                                                                                                  // 452
  constructingComputation = true;                                                                                 // 453
  var c = new Tracker.Computation(f, Tracker.currentComputation);                                                 // 454
                                                                                                                  // 455
  if (Tracker.active)                                                                                             // 456
    Tracker.onInvalidate(function () {                                                                            // 457
      c.stop();                                                                                                   // 458
    });                                                                                                           // 459
                                                                                                                  // 460
  return c;                                                                                                       // 461
};                                                                                                                // 462
                                                                                                                  // 463
// http://docs.meteor.com/#tracker_nonreactive                                                                    // 464
//                                                                                                                // 465
// Run `f` with no current computation, returning the return value                                                // 466
// of `f`.  Used to turn off reactivity for the duration of `f`,                                                  // 467
// so that reactive data sources accessed by `f` will not result in any                                           // 468
// computations being invalidated.                                                                                // 469
                                                                                                                  // 470
/**                                                                                                               // 471
 * @summary Run a function without tracking dependencies.                                                         // 472
 * @locus Client                                                                                                  // 473
 * @param {Function} func A function to call immediately.                                                         // 474
 */                                                                                                               // 475
Tracker.nonreactive = function (f) {                                                                              // 476
  var previous = Tracker.currentComputation;                                                                      // 477
  setCurrentComputation(null);                                                                                    // 478
  try {                                                                                                           // 479
    return f();                                                                                                   // 480
  } finally {                                                                                                     // 481
    setCurrentComputation(previous);                                                                              // 482
  }                                                                                                               // 483
};                                                                                                                // 484
                                                                                                                  // 485
// http://docs.meteor.com/#tracker_oninvalidate                                                                   // 486
                                                                                                                  // 487
/**                                                                                                               // 488
 * @summary Registers a new [`onInvalidate`](#computation_oninvalidate) callback on the current computation (which must exist), to be called immediately when the current computation is invalidated or stopped.
 * @locus Client                                                                                                  // 490
 * @param {Function} callback A callback function that will be invoked as `func(c)`, where `c` is the computation on which the callback is registered.
 */                                                                                                               // 492
Tracker.onInvalidate = function (f) {                                                                             // 493
  if (! Tracker.active)                                                                                           // 494
    throw new Error("Tracker.onInvalidate requires a currentComputation");                                        // 495
                                                                                                                  // 496
  Tracker.currentComputation.onInvalidate(f);                                                                     // 497
};                                                                                                                // 498
                                                                                                                  // 499
// http://docs.meteor.com/#tracker_afterflush                                                                     // 500
                                                                                                                  // 501
/**                                                                                                               // 502
 * @summary Schedules a function to be called during the next flush, or later in the current flush if one is in progress, after all invalidated computations have been rerun.  The function will be run once and not on subsequent flushes unless `afterFlush` is called again.
 * @locus Client                                                                                                  // 504
 * @param {Function} callback A function to call at flush time.                                                   // 505
 */                                                                                                               // 506
Tracker.afterFlush = function (f) {                                                                               // 507
  afterFlushCallbacks.push(f);                                                                                    // 508
  requireFlush();                                                                                                 // 509
};                                                                                                                // 510
                                                                                                                  // 511
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/tracker/deprecated.js                                                                                 //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
// Deprecated functions.                                                                                          // 1
                                                                                                                  // 2
// These functions used to be on the Meteor object (and worked slightly                                           // 3
// differently).                                                                                                  // 4
// XXX COMPAT WITH 0.5.7                                                                                          // 5
Meteor.flush = Tracker.flush;                                                                                     // 6
Meteor.autorun = Tracker.autorun;                                                                                 // 7
                                                                                                                  // 8
// We used to require a special "autosubscribe" call to reactively subscribe to                                   // 9
// things. Now, it works with autorun.                                                                            // 10
// XXX COMPAT WITH 0.5.4                                                                                          // 11
Meteor.autosubscribe = Tracker.autorun;                                                                           // 12
                                                                                                                  // 13
// This Tracker API briefly existed in 0.5.8 and 0.5.9                                                            // 14
// XXX COMPAT WITH 0.5.9                                                                                          // 15
Tracker.depend = function (d) {                                                                                   // 16
  return d.depend();                                                                                              // 17
};                                                                                                                // 18
                                                                                                                  // 19
Deps = Tracker;                                                                                                   // 20
                                                                                                                  // 21
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.tracker = {
  Tracker: Tracker,
  Deps: Deps
};

})();

//# sourceMappingURL=tracker.js.map
