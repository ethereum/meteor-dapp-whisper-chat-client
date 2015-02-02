
/**
 * Module dependencies.
 */

var parse = require('css-parse')
  , stringify = require('..')
  , fs = require('fs')
  , read = fs.readFileSync
  , css = read('examples/document.css', 'utf8');

console.log(stringify(parse(css), { compress: false }));
