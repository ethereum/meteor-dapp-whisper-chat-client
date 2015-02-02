var EJSON = require("./ejson.js");
var _ = require("underscore");

var prepareTest = function (test) {
  test.isTrue = test.ok;
  test.isFalse = function (v, m) {
    return test.ok(!v, m);
  };
};

exports["test ejson - keyOrderSensitive"] = function (test) {
  prepareTest(test);
  test.isTrue(EJSON.equals({
    a: {b: 1, c: 2},
    d: {e: 3, f: 4}
  }, {
    d: {f: 4, e: 3},
    a: {c: 2, b: 1}
  }));

  test.isFalse(EJSON.equals({
    a: {b: 1, c: 2},
    d: {e: 3, f: 4}
  }, {
    d: {f: 4, e: 3},
    a: {c: 2, b: 1}
  }, {keyOrderSensitive: true}));

  test.isFalse(EJSON.equals({
    a: {b: 1, c: 2},
    d: {e: 3, f: 4}
  }, {
    a: {c: 2, b: 1},
    d: {f: 4, e: 3}
  }, {keyOrderSensitive: true}));
  test.isFalse(EJSON.equals({a: {}}, {a: {b:2}}, {keyOrderSensitive: true}));
  test.isFalse(EJSON.equals({a: {b:2}}, {a: {}}, {keyOrderSensitive: true}));
};

exports["test ejson - nesting and literal"] = function (test) {
  prepareTest(test);
  var d = new Date;
  var obj = {$date: d};
  var eObj = EJSON.toJSONValue(obj);
  var roundTrip = EJSON.fromJSONValue(eObj);
  test.ok(_.isEqual(obj, roundTrip));
};

exports["test ejson - some equality tests"] = function (test) {
  prepareTest(test);
  test.isTrue(EJSON.equals({a: 1, b: 2, c: 3}, {a: 1, c: 3, b: 2}));
  test.isFalse(EJSON.equals({a: 1, b: 2}, {a: 1, c: 3, b: 2}));
  test.isFalse(EJSON.equals({a: 1, b: 2, c: 3}, {a: 1, b: 2}));
  test.isFalse(EJSON.equals({a: 1, b: 2, c: 3}, {a: 1, c: 3, b: 4}));
  test.isFalse(EJSON.equals({a: {}}, {a: {b:2}}));
  test.isFalse(EJSON.equals({a: {b:2}}, {a: {}}));
};

exports["test ejson - equality and falsiness"] = function (test) {
  prepareTest(test);
  test.isTrue(EJSON.equals(null, null));
  test.isTrue(EJSON.equals(undefined, undefined));
  test.isFalse(EJSON.equals({foo: "foo"}, null));
  test.isFalse(EJSON.equals(null, {foo: "foo"}));
  test.isFalse(EJSON.equals(undefined, {foo: "foo"}));
  test.isFalse(EJSON.equals({foo: "foo"}, undefined));
};

exports["test ejson - clone"] = function (test) {
  prepareTest(test);
  var cloneTest = function (x, identical) {
    var y = EJSON.clone(x);
    test.isTrue(EJSON.equals(x, y));
    test.equal(x === y, !!identical);
  };
  cloneTest(null, true);
  cloneTest(undefined, true);
  cloneTest(42, true);
  cloneTest("asdf", true);
  cloneTest([1, 2, 3]);
  cloneTest([1, "fasdf", {foo: 42}]);
  cloneTest({x: 42, y: "asdf"});

  var testCloneArgs = function (/*arguments*/) {
    var clonedArgs = EJSON.clone(arguments);
    test.ok(_.isEqual(clonedArgs, [1, 2, "foo", [4]]));
  };
  testCloneArgs(1, 2, "foo", [4]);
};


var asciiToArray = function (str) {
  var arr = EJSON.newBinary(str.length);
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c > 0xFF) {
      throw new Error("Not ascii");
    }
    arr[i] = c;
  }
  return arr;
};

var arrayToAscii = function (arr) {
  var res = [];
  for (var i = 0; i < arr.length; i++) {
    res.push(String.fromCharCode(arr[i]));
  }
  return res.join("");
};

exports["test base64 - testing the test"] = function (test) {
  prepareTest(test);
  test.equal(arrayToAscii(asciiToArray("The quick brown fox jumps over the lazy dog")),
             "The quick brown fox jumps over the lazy dog");
};

exports["test base64 - empty"] = function (test) {
  prepareTest(test);
  test.ok(_.isEqual(EJSON._base64Encode(EJSON.newBinary(0)), ""));
  test.ok(_.isEqual(EJSON._base64Decode(""), EJSON.newBinary(0)));
};


exports["test base64 - wikipedia examples"] = function (test) {
  prepareTest(test);
  var tests = [
    {txt: "pleasure.", res: "cGxlYXN1cmUu"},
    {txt: "leasure.", res: "bGVhc3VyZS4="},
    {txt: "easure.", res: "ZWFzdXJlLg=="},
    {txt: "asure.", res: "YXN1cmUu"},
    {txt: "sure.", res: "c3VyZS4="}
  ];
  _.each(tests, function(t) {
    test.equal(EJSON._base64Encode(asciiToArray(t.txt)), t.res);
    test.equal(arrayToAscii(EJSON._base64Decode(t.res)), t.txt);
  });
};

if (module == require.main) require('test').run(exports);
