(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var EJSON = Package.ejson.EJSON;
var _ = Package.underscore._;

/* Package-scope variables */
var Inject, id;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/meteorhacks:inject-initial/lib/inject-server.js                                          //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
var escapeReplaceString = function(str) {                                                            // 1
  /*                                                                                                 // 2
   * When using string.replace(str, newSubStr), the dollar sign ("$") is                             // 3
   * considered a special character in newSubStr, and needs to be escaped                            // 4
   * as "$$".  We have to do this twice, for escaping the newSubStr in                               // 5
   * this function, and for the resulting string which is passed back.                               // 6
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace // 7
   */                                                                                                // 8
   return str.replace(/\$/g, '$$$$');                                                                // 9
}                                                                                                    // 10
                                                                                                     // 11
Inject = {                                                                                           // 12
  // stores in a script type=application/ejson tag, accessed with Injected.obj('id')                 // 13
  obj: function(id, data, res) {                                                                     // 14
    this._checkForObjOrFunction(data,                                                                // 15
      'Inject.obj(id, data [,res]) expects `data` to be an Object or Function');                     // 16
                                                                                                     // 17
    if (res) {                                                                                       // 18
      this._resAssign(res, 'objList', id, data);                                                     // 19
    } else {                                                                                         // 20
      this.objList[id] = data;                                                                       // 21
    }                                                                                                // 22
  },                                                                                                 // 23
  objList: {},                                                                                       // 24
                                                                                                     // 25
  // Inserts a META called `id`, whose `content` can be accessed with Injected.meta()                // 26
  meta: function(id, data, res) {                                                                    // 27
    this._checkForTextOrFunction(data,                                                               // 28
      'Inject.meta(id, data [,res]) expects `data` to be an String or Function');                    // 29
                                                                                                     // 30
    if (res) {                                                                                       // 31
      this._resAssign(res, 'metaList', id, data);                                                    // 32
    } else {                                                                                         // 33
      this.metaList[id] = data;                                                                      // 34
    }                                                                                                // 35
  },                                                                                                 // 36
  metaList: {},                                                                                      // 37
                                                                                                     // 38
  rawHead: function(id, textOrFunc, res) {                                                           // 39
    this._checkForTextOrFunction(textOrFunc,                                                         // 40
      'Inject.rawHead(id, content [,res]) expects `content` to be an String or Function');           // 41
                                                                                                     // 42
    if (res) {                                                                                       // 43
      this._resAssign(res, 'rawHeads', id, textOrFunc);                                              // 44
    } else {                                                                                         // 45
      this.rawHeads[id] = textOrFunc;                                                                // 46
    }                                                                                                // 47
  },                                                                                                 // 48
  rawHeads: {},                                                                                      // 49
                                                                                                     // 50
  rawBody: function(id, textOrFunc, res) {                                                           // 51
    this._checkForTextOrFunction(textOrFunc,                                                         // 52
      'Inject.rawBody(id, content [,res]) expects `content` to be an String or Function');           // 53
                                                                                                     // 54
    if (res) {                                                                                       // 55
      this._resAssign(res, 'rawBodies', id, textOrFunc);                                             // 56
    } else {                                                                                         // 57
      this.rawBodies[id] = textOrFunc;                                                               // 58
    }                                                                                                // 59
  },                                                                                                 // 60
  rawBodies: {},                                                                                     // 61
                                                                                                     // 62
  // The callback receives the entire HTML page and must return a modified version                   // 63
  rawModHtml: function(id, func) {                                                                   // 64
    if (!_.isFunction(func)) {                                                                       // 65
      var message = 'Inject func id "' + id + '" should be a function, not ' + typeof(func);         // 66
      throw new Error(message);                                                                      // 67
    }                                                                                                // 68
                                                                                                     // 69
    this.rawModHtmlFuncs[id] = func;                                                                 // 70
  },                                                                                                 // 71
  rawModHtmlFuncs: {},                                                                               // 72
                                                                                                     // 73
  _injectObjects: function(html, res) {                                                              // 74
    var objs = _.extend({}, Inject.objList, res.Inject && res.Inject.objList);                       // 75
    if (_.isEmpty(objs)) {                                                                           // 76
      return html;                                                                                   // 77
    }                                                                                                // 78
                                                                                                     // 79
    var obj, injectHtml = '';                                                                        // 80
    for (id in objs) {                                                                               // 81
      obj = _.isFunction(objs[id]) ? objs[id](res) : objs[id];                                       // 82
      injectHtml += "  <script id='" + id.replace("'", '&apos;')                                     // 83
        + "' type='application/ejson'>" + EJSON.stringify(obj)                                       // 84
        + "</script>\n";                                                                             // 85
    }                                                                                                // 86
                                                                                                     // 87
    return html.replace('<head>', '<head>\n' + escapeReplaceString(injectHtml));                     // 88
  },                                                                                                 // 89
                                                                                                     // 90
  _injectMeta: function(html, res) {                                                                 // 91
    var metas = _.extend({}, Inject.metaList, res.Inject && res.Inject.metaList);                    // 92
    if (_.isEmpty(metas))                                                                            // 93
      return html;                                                                                   // 94
                                                                                                     // 95
    var injectHtml = '';                                                                             // 96
    for (id in metas) {                                                                              // 97
      var meta = this._evalToText(metas[id], res, html);                                             // 98
      injectHtml += "  <meta id='" + id.replace("'", '&apos;')                                       // 99
        + "' content='" + meta.replace("'", '&apos;') + "'>\n", res;                                 // 100
    }                                                                                                // 101
                                                                                                     // 102
    return html.replace('<head>', '<head>\n' + escapeReplaceString(injectHtml));                     // 103
  },                                                                                                 // 104
                                                                                                     // 105
  _injectHeads: function(html, res) {                                                                // 106
    var heads = _.extend({}, Inject.rawHeads, res.Inject && res.Inject.rawHeads);                    // 107
    if (_.isEmpty(heads))                                                                            // 108
      return html;                                                                                   // 109
                                                                                                     // 110
    var injectHtml = '';                                                                             // 111
    for (id in heads) {                                                                              // 112
      var head = this._evalToText(heads[id], res, html);                                             // 113
      injectHtml += head + '\n';                                                                     // 114
    }                                                                                                // 115
                                                                                                     // 116
    return html.replace('<head>', '<head>\n' + escapeReplaceString(injectHtml));                     // 117
  },                                                                                                 // 118
                                                                                                     // 119
  _injectBodies: function(html, res) {                                                               // 120
    var bodies = _.extend({}, Inject.rawBodies, res.Inject && res.Inject.rawBodies);                 // 121
    if (_.isEmpty(bodies))                                                                           // 122
      return html;                                                                                   // 123
                                                                                                     // 124
    var injectHtml = '';                                                                             // 125
    for (id in bodies) {                                                                             // 126
      var body = this._evalToText(bodies[id], res, html);                                            // 127
      injectHtml += body + '\n';                                                                     // 128
    }                                                                                                // 129
                                                                                                     // 130
    return html.replace('<body>', '<body>\n' + escapeReplaceString(injectHtml));                     // 131
  },                                                                                                 // 132
                                                                                                     // 133
  // ensure object exists and store there                                                            // 134
  _resAssign: function(res, key, id, value) {                                                        // 135
    if (!res.Inject)                                                                                 // 136
      res.Inject = {};                                                                               // 137
    if (!res.Inject[key])                                                                            // 138
      res.Inject[key] = {};                                                                          // 139
    res.Inject[key][id] = value;                                                                     // 140
  },                                                                                                 // 141
                                                                                                     // 142
  _checkForTextOrFunction: function (arg, message) {                                                 // 143
    if(!(_.isString(arg) || _.isFunction(arg))) {                                                    // 144
      throw new Error(message);                                                                      // 145
    }                                                                                                // 146
  },                                                                                                 // 147
                                                                                                     // 148
  _checkForObjOrFunction: function (arg, message) {                                                  // 149
    if(!(_.isObject(arg) || _.isFunction(arg))) {                                                    // 150
      throw new Error(message);                                                                      // 151
    }                                                                                                // 152
  },                                                                                                 // 153
                                                                                                     // 154
  // we don't handle errors here. Let them to handle in a higher level                               // 155
  _evalToText: function(textOrFunc, res, html) {                                                     // 156
    if(_.isFunction(textOrFunc)) {                                                                   // 157
      return textOrFunc(res, html);                                                                  // 158
    } else {                                                                                         // 159
      return textOrFunc;                                                                             // 160
    }                                                                                                // 161
  }                                                                                                  // 162
};                                                                                                   // 163
                                                                                                     // 164
Inject.rawModHtml('injectHeads', Inject._injectHeads.bind(Inject));                                  // 165
Inject.rawModHtml('injectMeta', Inject._injectMeta.bind(Inject));                                    // 166
Inject.rawModHtml('injectBodies', Inject._injectBodies.bind(Inject));                                // 167
Inject.rawModHtml('injectObjects', Inject._injectObjects.bind(Inject));                              // 168
                                                                                                     // 169
///////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/meteorhacks:inject-initial/lib/inject-core.js                                            //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
// Hijack core node API and attach data to the response dynamically                                  // 1
// We are simply using this hack because, there is no way to alter                                   // 2
// Meteor's html content on the server side                                                          // 3
                                                                                                     // 4
var http = Npm.require('http');                                                                      // 5
                                                                                                     // 6
var originalWrite = http.OutgoingMessage.prototype.write;                                            // 7
http.OutgoingMessage.prototype.write = function(chunk, encoding) {                                   // 8
  //prevent hijacking other http requests                                                            // 9
  if(!this.iInjected &&                                                                              // 10
    encoding === undefined && /^<!DOCTYPE html>/.test(chunk)) {                                      // 11
    chunk = chunk.toString();                                                                        // 12
                                                                                                     // 13
    for (id in Inject.rawModHtmlFuncs) {                                                             // 14
      chunk = Inject.rawModHtmlFuncs[id](chunk, this);                                               // 15
      if (!_.isString(chunk)) {                                                                      // 16
        throw new Error('Inject func id "' + id + '" must return HTML, not '                         // 17
          + typeof(chunk) + '\n' + JSON.stringify(chunk, null, 2));                                  // 18
      }                                                                                              // 19
    }                                                                                                // 20
                                                                                                     // 21
    this.iInjected = true;                                                                           // 22
  }                                                                                                  // 23
                                                                                                     // 24
  originalWrite.call(this, chunk, encoding);                                                         // 25
};                                                                                                   // 26
                                                                                                     // 27
//meteor algorithm to check if this is a meteor serving http request or not                          // 28
Inject.appUrl = function(url) {                                                                      // 29
  if (url === '/favicon.ico' || url === '/robots.txt')                                               // 30
    return false;                                                                                    // 31
                                                                                                     // 32
  // NOTE: app.manifest is not a web standard like favicon.ico and                                   // 33
  // robots.txt. It is a file id we have chosen to use for HTML5                                     // 34
  // appcache URLs. It is included here to prevent using an appcache                                 // 35
  // then removing it from poisoning an app permanently. Eventually,                                 // 36
  // once we have server side routing, this won't be needed as                                       // 37
  // unknown URLs with return a 404 automatically.                                                   // 38
  if (url === '/app.manifest')                                                                       // 39
    return false;                                                                                    // 40
                                                                                                     // 41
  // Avoid serving app HTML for declared routes such as /sockjs/.                                    // 42
  if (typeof(RoutePolicy) != 'undefined' && RoutePolicy.classify(url))                               // 43
    return false;                                                                                    // 44
                                                                                                     // 45
  // we currently return app HTML on all URLs by default                                             // 46
  return true;                                                                                       // 47
};                                                                                                   // 48
                                                                                                     // 49
///////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['meteorhacks:inject-initial'] = {
  Inject: Inject
};

})();

//# sourceMappingURL=meteorhacks_inject-initial.js.map
