(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

/* Package-scope variables */
var Helpers;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/raix:handlebar-helpers/common.js                                                                         //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// Helper scope                                                                                                      // 1
if (typeof Helpers === 'undefined') {                                                                                // 2
  Helpers = {};                                                                                                      // 3
}                                                                                                                    // 4
                                                                                                                     // 5
var languageText = {};                                                                                               // 6
                                                                                                                     // 7
// expects an array: languageText['say.hello.to.me']['en'] = 'Say hello to me:)';                                    // 8
// ex.:                                                                                                              // 9
// getText('Say.Hello.To.Me') == 'say hello to me:)'; // lowercase                                                   // 10
// getText('SAY.HELLO.TO.ME') == 'SAY HELLO TO ME:)'; // uppercase                                                   // 11
// getText('Say.hello.to.me') == 'Say hello to me:)'; // uppercase first letter, rest lowercase                      // 12
// getText('Say.Hello.To.Me') == 'Say Hello To Me:)'; // camelCase                                                   // 13
// getText('SAy.hello.to.me') == 'Say hello To me:)'; // ignore case sensitivity                                     // 14
                                                                                                                     // 15
var _languageDeps = (Meteor.isClient) ? new Deps.Dependency() : null;                                                // 16
var currentLanguage = 'en';                                                                                          // 17
                                                                                                                     // 18
// language = 'en'                                                                                                   // 19
Helpers.setLanguage = function (language) {                                                                          // 20
  if (language && language !== currentLanguage) {                                                                    // 21
    currentLanguage = language;                                                                                      // 22
    if (Meteor.isClient) _languageDeps.changed();                                                                    // 23
  }                                                                                                                  // 24
};                                                                                                                   // 25
                                                                                                                     // 26
Helpers.language = function () {                                                                                     // 27
  if (Meteor.isClient) _languageDeps.depend();                                                                       // 28
  return currentLanguage;                                                                                            // 29
};                                                                                                                   // 30
                                                                                                                     // 31
Helpers.setDictionary = function(dict) {                                                                             // 32
  languageText = dict;                                                                                               // 33
};                                                                                                                   // 34
                                                                                                                     // 35
Helpers.addDictionary = function(dict) {                                                                             // 36
  _.extend(languageText, dict);                                                                                      // 37
};                                                                                                                   // 38
                                                                                                                     // 39
// handleCase will mimic text Case making src same case as text                                                      // 40
var handleCase = function (text, src) {                                                                              // 41
  // Return lowercase                                                                                                // 42
  if (text == text.toLowerCase())                                                                                    // 43
    return src.toLowerCase();                                                                                        // 44
  // Return uppercase                                                                                                // 45
  if (text == text.toUpperCase())                                                                                    // 46
    return src.toUpperCase();                                                                                        // 47
  // Return uppercase first letter, rest lowercase                                                                   // 48
  if (text.substr(1) == text.substr(1).toLowerCase())                                                                // 49
    return src.substr(0, 1).toUpperCase() + src.substr(1).toLowerCase();                                             // 50
  // Return src withour changes                                                                                      // 51
  if (text.substr(0, 2) == text.substr(0, 2).toUpperCase())                                                          // 52
    return src;                                                                                                      // 53
  // Return CamelCase                                                                                                // 54
  return src.replace(/( [a-z])/g, function ($1) {                                                                    // 55
    return $1.toUpperCase();                                                                                         // 56
  });                                                                                                                // 57
};                                                                                                                   // 58
                                                                                                                     // 59
/**                                                                                                                  // 60
 *                                                                                                                   // 61
 * @param {string} text                                                                                              // 62
 * @param {string} [lang]                                                                                            // 63
 * @return {string}                                                                                                  // 64
 */                                                                                                                  // 65
Helpers.getText = function (text, lang) {                                                                            // 66
  var txt = text.toLowerCase();                                                                                      // 67
  var langText = languageText && languageText[txt];                                                                  // 68
  var langKey = (typeof lang === 'string') ? lang : Helpers.language();                                              // 69
  return handleCase(text, (langText) ? ( (langText[langKey]) ? langText[langKey] : langText.en) : '[' + text + ']'); // 70
};                                                                                                                   // 71
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['raix:handlebar-helpers'] = {
  Helpers: Helpers
};

})();

//# sourceMappingURL=raix_handlebar-helpers.js.map
