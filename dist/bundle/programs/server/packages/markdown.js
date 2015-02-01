(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var Showdown;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/markdown/showdown.js                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
//                                                                                                                     // 1
// showdown.js -- A javascript port of Markdown.                                                                       // 2
//                                                                                                                     // 3
// Copyright (c) 2007 John Fraser.                                                                                     // 4
//                                                                                                                     // 5
// Original Markdown Copyright (c) 2004-2005 John Gruber                                                               // 6
//   <http://daringfireball.net/projects/markdown/>                                                                    // 7
//                                                                                                                     // 8
// Redistributable under a BSD-style open source license.                                                              // 9
// See license.txt for more information.                                                                               // 10
//                                                                                                                     // 11
// The full source distribution is at:                                                                                 // 12
//                                                                                                                     // 13
//				A A L                                                                                                            // 14
//				T C A                                                                                                            // 15
//				T K B                                                                                                            // 16
//                                                                                                                     // 17
//   <http://www.attacklab.net/>                                                                                       // 18
//                                                                                                                     // 19
                                                                                                                       // 20
//                                                                                                                     // 21
// Wherever possible, Showdown is a straight, line-by-line port                                                        // 22
// of the Perl version of Markdown.                                                                                    // 23
//                                                                                                                     // 24
// This is not a normal parser design; it's basically just a                                                           // 25
// series of string substitutions.  It's hard to read and                                                              // 26
// maintain this way,  but keeping Showdown close to the original                                                      // 27
// design makes it easier to port new features.                                                                        // 28
//                                                                                                                     // 29
// More importantly, Showdown behaves like markdown.pl in most                                                         // 30
// edge cases.  So web applications can do client-side preview                                                         // 31
// in Javascript, and then build identical HTML on the server.                                                         // 32
//                                                                                                                     // 33
// This port needs the new RegExp functionality of ECMA 262,                                                           // 34
// 3rd Edition (i.e. Javascript 1.5).  Most modern web browsers                                                        // 35
// should do fine.  Even with the new regular expression features,                                                     // 36
// We do a lot of work to emulate Perl's regex functionality.                                                          // 37
// The tricky changes in this file mostly have the "attacklab:"                                                        // 38
// label.  Major or self-explanatory changes don't.                                                                    // 39
//                                                                                                                     // 40
// Smart diff tools like Araxis Merge will be able to match up                                                         // 41
// this file with markdown.pl in a useful way.  A little tweaking                                                      // 42
// helps: in a copy of markdown.pl, replace "#" with "//" and                                                          // 43
// replace "$text" with "text".  Be sure to ignore whitespace                                                          // 44
// and line endings.                                                                                                   // 45
//                                                                                                                     // 46
                                                                                                                       // 47
                                                                                                                       // 48
//                                                                                                                     // 49
// Showdown usage:                                                                                                     // 50
//                                                                                                                     // 51
//   var text = "Markdown *rocks*.";                                                                                   // 52
//                                                                                                                     // 53
//   var converter = new Showdown.converter();                                                                         // 54
//   var html = converter.makeHtml(text);                                                                              // 55
//                                                                                                                     // 56
//   alert(html);                                                                                                      // 57
//                                                                                                                     // 58
// Note: move the sample code to the bottom of this                                                                    // 59
// file before uncommenting it.                                                                                        // 60
//                                                                                                                     // 61
                                                                                                                       // 62
                                                                                                                       // 63
//                                                                                                                     // 64
// Showdown namespace                                                                                                  // 65
//                                                                                                                     // 66
// METEOR CHANGE: remove "var" so that this isn't file-local.                                                          // 67
Showdown = { extensions: {} };                                                                                         // 68
                                                                                                                       // 69
//                                                                                                                     // 70
// forEach                                                                                                             // 71
//                                                                                                                     // 72
var forEach = Showdown.forEach = function(obj, callback) {                                                             // 73
	if (typeof obj.forEach === 'function') {                                                                              // 74
		obj.forEach(callback);                                                                                               // 75
	} else {                                                                                                              // 76
		var i, len = obj.length;                                                                                             // 77
		for (i = 0; i < len; i++) {                                                                                          // 78
			callback(obj[i], i, obj);                                                                                           // 79
		}                                                                                                                    // 80
	}                                                                                                                     // 81
};                                                                                                                     // 82
                                                                                                                       // 83
//                                                                                                                     // 84
// Standard extension naming                                                                                           // 85
//                                                                                                                     // 86
var stdExtName = function(s) {                                                                                         // 87
	return s.replace(/[_-]||\s/g, '').toLowerCase();                                                                      // 88
};                                                                                                                     // 89
                                                                                                                       // 90
//                                                                                                                     // 91
// converter                                                                                                           // 92
//                                                                                                                     // 93
// Wraps all "globals" so that the only thing                                                                          // 94
// exposed is makeHtml().                                                                                              // 95
//                                                                                                                     // 96
Showdown.converter = function(converter_options) {                                                                     // 97
                                                                                                                       // 98
//                                                                                                                     // 99
// Globals:                                                                                                            // 100
//                                                                                                                     // 101
                                                                                                                       // 102
// Global hashes, used by various utility routines                                                                     // 103
var g_urls;                                                                                                            // 104
var g_titles;                                                                                                          // 105
var g_html_blocks;                                                                                                     // 106
                                                                                                                       // 107
// Used to track when we're inside an ordered or unordered list                                                        // 108
// (see _ProcessListItems() for details):                                                                              // 109
var g_list_level = 0;                                                                                                  // 110
                                                                                                                       // 111
// Global extensions                                                                                                   // 112
var g_lang_extensions = [];                                                                                            // 113
var g_output_modifiers = [];                                                                                           // 114
                                                                                                                       // 115
                                                                                                                       // 116
//                                                                                                                     // 117
// Automatic Extension Loading (node only):                                                                            // 118
//                                                                                                                     // 119
                                                                                                                       // 120
if (typeof module !== 'undefind' && typeof exports !== 'undefined' && typeof require !== 'undefind') {                 // 121
	var fs = require('fs');                                                                                               // 122
                                                                                                                       // 123
	if (fs) {                                                                                                             // 124
		// Search extensions folder                                                                                          // 125
		var extensions = fs.readdirSync((__dirname || '.')+'/extensions').filter(function(file){                             // 126
			return ~file.indexOf('.js');                                                                                        // 127
		}).map(function(file){                                                                                               // 128
			return file.replace(/\.js$/, '');                                                                                   // 129
		});                                                                                                                  // 130
		// Load extensions into Showdown namespace                                                                           // 131
		Showdown.forEach(extensions, function(ext){                                                                          // 132
			var name = stdExtName(ext);                                                                                         // 133
			Showdown.extensions[name] = require('./extensions/' + ext);                                                         // 134
		});                                                                                                                  // 135
	}                                                                                                                     // 136
}                                                                                                                      // 137
                                                                                                                       // 138
this.makeHtml = function(text) {                                                                                       // 139
//                                                                                                                     // 140
// Main function. The order in which other subs are called here is                                                     // 141
// essential. Link and image substitutions need to happen before                                                       // 142
// _EscapeSpecialCharsWithinTagAttributes(), so that any *'s or _'s in the <a>                                         // 143
// and <img> tags get encoded.                                                                                         // 144
//                                                                                                                     // 145
                                                                                                                       // 146
	// Clear the global hashes. If we don't clear these, you get conflicts                                                // 147
	// from other articles when generating a page which contains more than                                                // 148
	// one article (e.g. an index page that shows the N most recent                                                       // 149
	// articles):                                                                                                         // 150
	g_urls = {};                                                                                                          // 151
	g_titles = {};                                                                                                        // 152
	g_html_blocks = [];                                                                                                   // 153
                                                                                                                       // 154
	// attacklab: Replace ~ with ~T                                                                                       // 155
	// This lets us use tilde as an escape char to avoid md5 hashes                                                       // 156
	// The choice of character is arbitray; anything that isn't                                                           // 157
	// magic in Markdown will work.                                                                                       // 158
	text = text.replace(/~/g,"~T");                                                                                       // 159
                                                                                                                       // 160
	// attacklab: Replace $ with ~D                                                                                       // 161
	// RegExp interprets $ as a special character                                                                         // 162
	// when it's in a replacement string                                                                                  // 163
	text = text.replace(/\$/g,"~D");                                                                                      // 164
                                                                                                                       // 165
	// Standardize line endings                                                                                           // 166
	text = text.replace(/\r\n/g,"\n"); // DOS to Unix                                                                     // 167
	text = text.replace(/\r/g,"\n"); // Mac to Unix                                                                       // 168
                                                                                                                       // 169
	// Make sure text begins and ends with a couple of newlines:                                                          // 170
	text = "\n\n" + text + "\n\n";                                                                                        // 171
                                                                                                                       // 172
	// Convert all tabs to spaces.                                                                                        // 173
	text = _Detab(text);                                                                                                  // 174
                                                                                                                       // 175
	// Strip any lines consisting only of spaces and tabs.                                                                // 176
	// This makes subsequent regexen easier to write, because we can                                                      // 177
	// match consecutive blank lines with /\n+/ instead of something                                                      // 178
	// contorted like /[ \t]*\n+/ .                                                                                       // 179
	text = text.replace(/^[ \t]+$/mg,"");                                                                                 // 180
                                                                                                                       // 181
	// Run language extensions                                                                                            // 182
	Showdown.forEach(g_lang_extensions, function(x){                                                                      // 183
		text = _ExecuteExtension(x, text);                                                                                   // 184
	});                                                                                                                   // 185
                                                                                                                       // 186
	// Handle github codeblocks prior to running HashHTML so that                                                         // 187
	// HTML contained within the codeblock gets escaped propertly                                                         // 188
	text = _DoGithubCodeBlocks(text);                                                                                     // 189
                                                                                                                       // 190
	// Turn block-level HTML blocks into hash entries                                                                     // 191
	text = _HashHTMLBlocks(text);                                                                                         // 192
                                                                                                                       // 193
	// Strip link definitions, store in hashes.                                                                           // 194
	text = _StripLinkDefinitions(text);                                                                                   // 195
                                                                                                                       // 196
	text = _RunBlockGamut(text);                                                                                          // 197
                                                                                                                       // 198
	text = _UnescapeSpecialChars(text);                                                                                   // 199
                                                                                                                       // 200
	// attacklab: Restore dollar signs                                                                                    // 201
	text = text.replace(/~D/g,"$$");                                                                                      // 202
                                                                                                                       // 203
	// attacklab: Restore tildes                                                                                          // 204
	text = text.replace(/~T/g,"~");                                                                                       // 205
                                                                                                                       // 206
	// Run output modifiers                                                                                               // 207
	Showdown.forEach(g_output_modifiers, function(x){                                                                     // 208
		text = _ExecuteExtension(x, text);                                                                                   // 209
	});                                                                                                                   // 210
                                                                                                                       // 211
	return text;                                                                                                          // 212
};                                                                                                                     // 213
//                                                                                                                     // 214
// Options:                                                                                                            // 215
//                                                                                                                     // 216
                                                                                                                       // 217
// Parse extensions options into separate arrays                                                                       // 218
if (converter_options && converter_options.extensions) {                                                               // 219
                                                                                                                       // 220
  var self = this;                                                                                                     // 221
                                                                                                                       // 222
	// Iterate over each plugin                                                                                           // 223
	Showdown.forEach(converter_options.extensions, function(plugin){                                                      // 224
                                                                                                                       // 225
		// Assume it's a bundled plugin if a string is given                                                                 // 226
		if (typeof plugin === 'string') {                                                                                    // 227
			plugin = Showdown.extensions[stdExtName(plugin)];                                                                   // 228
		}                                                                                                                    // 229
                                                                                                                       // 230
		if (typeof plugin === 'function') {                                                                                  // 231
			// Iterate over each extension within that plugin                                                                   // 232
			Showdown.forEach(plugin(self), function(ext){                                                                       // 233
				// Sort extensions by type                                                                                         // 234
				if (ext.type) {                                                                                                    // 235
					if (ext.type === 'language' || ext.type === 'lang') {                                                             // 236
						g_lang_extensions.push(ext);                                                                                     // 237
					} else if (ext.type === 'output' || ext.type === 'html') {                                                        // 238
						g_output_modifiers.push(ext);                                                                                    // 239
					}                                                                                                                 // 240
				} else {                                                                                                           // 241
					// Assume language extension                                                                                      // 242
					g_output_modifiers.push(ext);                                                                                     // 243
				}                                                                                                                  // 244
			});                                                                                                                 // 245
		} else {                                                                                                             // 246
			throw "Extension '" + plugin + "' could not be loaded.  It was either not found or is not a valid extension.";      // 247
		}                                                                                                                    // 248
	});                                                                                                                   // 249
}                                                                                                                      // 250
                                                                                                                       // 251
                                                                                                                       // 252
var _ExecuteExtension = function(ext, text) {                                                                          // 253
	if (ext.regex) {                                                                                                      // 254
		var re = new RegExp(ext.regex, 'g');                                                                                 // 255
		return text.replace(re, ext.replace);                                                                                // 256
	} else if (ext.filter) {                                                                                              // 257
		return ext.filter(text);                                                                                             // 258
	}                                                                                                                     // 259
};                                                                                                                     // 260
                                                                                                                       // 261
var _StripLinkDefinitions = function(text) {                                                                           // 262
//                                                                                                                     // 263
// Strips link definitions from text, stores the URLs and titles in                                                    // 264
// hash references.                                                                                                    // 265
//                                                                                                                     // 266
                                                                                                                       // 267
	// Link defs are in the form: ^[id]: url "optional title"                                                             // 268
                                                                                                                       // 269
	/*                                                                                                                    // 270
		var text = text.replace(/                                                                                            // 271
				^[ ]{0,3}\[(.+)\]:  // id = $1  attacklab: g_tab_width - 1                                                         // 272
				  [ \t]*                                                                                                           // 273
				  \n?				// maybe *one* newline                                                                                    // 274
				  [ \t]*                                                                                                           // 275
				<?(\S+?)>?			// url = $2                                                                                           // 276
				  [ \t]*                                                                                                           // 277
				  \n?				// maybe one newline                                                                                      // 278
				  [ \t]*                                                                                                           // 279
				(?:                                                                                                                // 280
				  (\n*)				// any lines skipped = $3 attacklab: lookbehind removed                                                 // 281
				  ["(]                                                                                                             // 282
				  (.+?)				// title = $4                                                                                           // 283
				  [")]                                                                                                             // 284
				  [ \t]*                                                                                                           // 285
				)?					// title is optional                                                                                        // 286
				(?:\n+|$)                                                                                                          // 287
			  /gm,                                                                                                              // 288
			  function(){...});                                                                                                 // 289
	*/                                                                                                                    // 290
                                                                                                                       // 291
	// attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug                                            // 292
	text += "~0";                                                                                                         // 293
                                                                                                                       // 294
	text = text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|(?=~0))/gm,
		function (wholeMatch,m1,m2,m3,m4) {                                                                                  // 296
			m1 = m1.toLowerCase();                                                                                              // 297
			g_urls[m1] = _EncodeAmpsAndAngles(m2);  // Link IDs are case-insensitive                                            // 298
			if (m3) {                                                                                                           // 299
				// Oops, found blank lines, so it's not a title.                                                                   // 300
				// Put back the parenthetical statement we stole.                                                                  // 301
				return m3+m4;                                                                                                      // 302
			} else if (m4) {                                                                                                    // 303
				g_titles[m1] = m4.replace(/"/g,"&quot;");                                                                          // 304
			}                                                                                                                   // 305
                                                                                                                       // 306
			// Completely remove the definition from the text                                                                   // 307
			return "";                                                                                                          // 308
		}                                                                                                                    // 309
	);                                                                                                                    // 310
                                                                                                                       // 311
	// attacklab: strip sentinel                                                                                          // 312
	text = text.replace(/~0/,"");                                                                                         // 313
                                                                                                                       // 314
	return text;                                                                                                          // 315
}                                                                                                                      // 316
                                                                                                                       // 317
                                                                                                                       // 318
var _HashHTMLBlocks = function(text) {                                                                                 // 319
	// attacklab: Double up blank lines to reduce lookaround                                                              // 320
	text = text.replace(/\n/g,"\n\n");                                                                                    // 321
                                                                                                                       // 322
	// Hashify HTML blocks:                                                                                               // 323
	// We only want to do this for block-level HTML tags, such as headers,                                                // 324
	// lists, and tables. That's because we still want to wrap <p>s around                                                // 325
	// "paragraphs" that are wrapped in non-block-level tags, such as anchors,                                            // 326
	// phrase emphasis, and spans. The list of tags we're looking for is                                                  // 327
	// hard-coded:                                                                                                        // 328
	var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del|style|section|header|footer|nav|article|aside";
	var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside";
                                                                                                                       // 331
	// First, look for nested blocks, e.g.:                                                                               // 332
	//   <div>                                                                                                            // 333
	//     <div>                                                                                                          // 334
	//     tags for inner block must be indented.                                                                         // 335
	//     </div>                                                                                                         // 336
	//   </div>                                                                                                           // 337
	//                                                                                                                    // 338
	// The outermost tags must start at the left margin for this to match, and                                            // 339
	// the inner nested divs must be indented.                                                                            // 340
	// We need to do this before the next, more liberal match, because the next                                           // 341
	// match will start at the first `<div>` and stop at the first `</div>`.                                              // 342
                                                                                                                       // 343
	// attacklab: This regex can be expensive when it fails.                                                              // 344
	/*                                                                                                                    // 345
		var text = text.replace(/                                                                                            // 346
		(						// save in $1                                                                                                 // 347
			^					// start of line  (with /m)                                                                                   // 348
			<($block_tags_a)	// start tag = $2                                                                                  // 349
			\b					// word break                                                                                                // 350
								// attacklab: hack around khtml/pcre bug...                                                                    // 351
			[^\r]*?\n			// any number of lines, minimally matching                                                              // 352
			</\2>				// the matching end tag                                                                                    // 353
			[ \t]*				// trailing spaces/tabs                                                                                   // 354
			(?=\n+)				// followed by a newline                                                                                 // 355
		)						// attacklab: there are sentinel newlines at end of document                                                  // 356
		/gm,function(){...}};                                                                                                // 357
	*/                                                                                                                    // 358
	text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,hashElement);
                                                                                                                       // 360
	//                                                                                                                    // 361
	// Now match more liberally, simply from `\n<tag>` to `</tag>\n`                                                      // 362
	//                                                                                                                    // 363
                                                                                                                       // 364
	/*                                                                                                                    // 365
		var text = text.replace(/                                                                                            // 366
		(						// save in $1                                                                                                 // 367
			^					// start of line  (with /m)                                                                                   // 368
			<($block_tags_b)	// start tag = $2                                                                                  // 369
			\b					// word break                                                                                                // 370
								// attacklab: hack around khtml/pcre bug...                                                                    // 371
			[^\r]*?				// any number of lines, minimally matching                                                               // 372
			</\2>				// the matching end tag                                                                                    // 373
			[ \t]*				// trailing spaces/tabs                                                                                   // 374
			(?=\n+)				// followed by a newline                                                                                 // 375
		)						// attacklab: there are sentinel newlines at end of document                                                  // 376
		/gm,function(){...}};                                                                                                // 377
	*/                                                                                                                    // 378
	text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside)\b[^\r]*?<\/\2>[ \t]*(?=\n+)\n)/gm,hashElement);
                                                                                                                       // 380
	// Special case just for <hr />. It was easier to make a special case than                                            // 381
	// to make the other regex more complicated.                                                                          // 382
                                                                                                                       // 383
	/*                                                                                                                    // 384
		text = text.replace(/                                                                                                // 385
		(						// save in $1                                                                                                 // 386
			\n\n				// Starting after a blank line                                                                              // 387
			[ ]{0,3}                                                                                                            // 388
			(<(hr)				// start tag = $2                                                                                         // 389
			\b					// word break                                                                                                // 390
			([^<>])*?			//                                                                                                      // 391
			\/?>)				// the matching end tag                                                                                    // 392
			[ \t]*                                                                                                              // 393
			(?=\n{2,})			// followed by a blank line                                                                            // 394
		)                                                                                                                    // 395
		/g,hashElement);                                                                                                     // 396
	*/                                                                                                                    // 397
	text = text.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,hashElement);                               // 398
                                                                                                                       // 399
	// Special case for standalone HTML comments:                                                                         // 400
                                                                                                                       // 401
	/*                                                                                                                    // 402
		text = text.replace(/                                                                                                // 403
		(						// save in $1                                                                                                 // 404
			\n\n				// Starting after a blank line                                                                              // 405
			[ ]{0,3}			// attacklab: g_tab_width - 1                                                                            // 406
			<!                                                                                                                  // 407
			(--[^\r]*?--\s*)+                                                                                                   // 408
			>                                                                                                                   // 409
			[ \t]*                                                                                                              // 410
			(?=\n{2,})			// followed by a blank line                                                                            // 411
		)                                                                                                                    // 412
		/g,hashElement);                                                                                                     // 413
	*/                                                                                                                    // 414
	text = text.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,hashElement);                               // 415
                                                                                                                       // 416
	// PHP and ASP-style processor instructions (<?...?> and <%...%>)                                                     // 417
                                                                                                                       // 418
	/*                                                                                                                    // 419
		text = text.replace(/                                                                                                // 420
		(?:                                                                                                                  // 421
			\n\n				// Starting after a blank line                                                                              // 422
		)                                                                                                                    // 423
		(						// save in $1                                                                                                 // 424
			[ ]{0,3}			// attacklab: g_tab_width - 1                                                                            // 425
			(?:                                                                                                                 // 426
				<([?%])			// $2                                                                                                    // 427
				[^\r]*?                                                                                                            // 428
				\2>                                                                                                                // 429
			)                                                                                                                   // 430
			[ \t]*                                                                                                              // 431
			(?=\n{2,})			// followed by a blank line                                                                            // 432
		)                                                                                                                    // 433
		/g,hashElement);                                                                                                     // 434
	*/                                                                                                                    // 435
	text = text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,hashElement);                          // 436
                                                                                                                       // 437
	// attacklab: Undo double lines (see comment at top of this function)                                                 // 438
	text = text.replace(/\n\n/g,"\n");                                                                                    // 439
	return text;                                                                                                          // 440
}                                                                                                                      // 441
                                                                                                                       // 442
var hashElement = function(wholeMatch,m1) {                                                                            // 443
	var blockText = m1;                                                                                                   // 444
                                                                                                                       // 445
	// Undo double lines                                                                                                  // 446
	blockText = blockText.replace(/\n\n/g,"\n");                                                                          // 447
	blockText = blockText.replace(/^\n/,"");                                                                              // 448
                                                                                                                       // 449
	// strip trailing blank lines                                                                                         // 450
	blockText = blockText.replace(/\n+$/g,"");                                                                            // 451
                                                                                                                       // 452
	// Replace the element text with a marker ("~KxK" where x is its key)                                                 // 453
	blockText = "\n\n~K" + (g_html_blocks.push(blockText)-1) + "K\n\n";                                                   // 454
                                                                                                                       // 455
	return blockText;                                                                                                     // 456
};                                                                                                                     // 457
                                                                                                                       // 458
var _RunBlockGamut = function(text) {                                                                                  // 459
//                                                                                                                     // 460
// These are all the transformations that form block-level                                                             // 461
// tags like paragraphs, headers, and list items.                                                                      // 462
//                                                                                                                     // 463
	text = _DoHeaders(text);                                                                                              // 464
                                                                                                                       // 465
	// Do Horizontal Rules:                                                                                               // 466
	var key = hashBlock("<hr />");                                                                                        // 467
	text = text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,key);                                                        // 468
	text = text.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm,key);                                                        // 469
	text = text.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm,key);                                                        // 470
                                                                                                                       // 471
	text = _DoLists(text);                                                                                                // 472
	text = _DoCodeBlocks(text);                                                                                           // 473
	text = _DoBlockQuotes(text);                                                                                          // 474
                                                                                                                       // 475
	// We already ran _HashHTMLBlocks() before, in Markdown(), but that                                                   // 476
	// was to escape raw HTML in the original Markdown source. This time,                                                 // 477
	// we're escaping the markup we've just created, so that we don't wrap                                                // 478
	// <p> tags around block-level tags.                                                                                  // 479
	text = _HashHTMLBlocks(text);                                                                                         // 480
	text = _FormParagraphs(text);                                                                                         // 481
                                                                                                                       // 482
	return text;                                                                                                          // 483
};                                                                                                                     // 484
                                                                                                                       // 485
                                                                                                                       // 486
var _RunSpanGamut = function(text) {                                                                                   // 487
//                                                                                                                     // 488
// These are all the transformations that occur *within* block-level                                                   // 489
// tags like paragraphs, headers, and list items.                                                                      // 490
//                                                                                                                     // 491
                                                                                                                       // 492
	text = _DoCodeSpans(text);                                                                                            // 493
	text = _EscapeSpecialCharsWithinTagAttributes(text);                                                                  // 494
	text = _EncodeBackslashEscapes(text);                                                                                 // 495
                                                                                                                       // 496
	// Process anchor and image tags. Images must come first,                                                             // 497
	// because ![foo][f] looks like an anchor.                                                                            // 498
	text = _DoImages(text);                                                                                               // 499
	text = _DoAnchors(text);                                                                                              // 500
                                                                                                                       // 501
	// Make links out of things like `<http://example.com/>`                                                              // 502
	// Must come after _DoAnchors(), because you can use < and >                                                          // 503
	// delimiters in inline links like [this](<url>).                                                                     // 504
	text = _DoAutoLinks(text);                                                                                            // 505
	text = _EncodeAmpsAndAngles(text);                                                                                    // 506
	text = _DoItalicsAndBold(text);                                                                                       // 507
                                                                                                                       // 508
	// Do hard breaks:                                                                                                    // 509
	text = text.replace(/  +\n/g," <br />\n");                                                                            // 510
                                                                                                                       // 511
	return text;                                                                                                          // 512
}                                                                                                                      // 513
                                                                                                                       // 514
var _EscapeSpecialCharsWithinTagAttributes = function(text) {                                                          // 515
//                                                                                                                     // 516
// Within tags -- meaning between < and > -- encode [\ ` * _] so they                                                  // 517
// don't conflict with their use in Markdown for code, italics and strong.                                             // 518
//                                                                                                                     // 519
                                                                                                                       // 520
	// Build a regex to find HTML tags and comments.  See Friedl's                                                        // 521
	// "Mastering Regular Expressions", 2nd Ed., pp. 200-201.                                                             // 522
	var regex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;                                              // 523
                                                                                                                       // 524
	text = text.replace(regex, function(wholeMatch) {                                                                     // 525
		var tag = wholeMatch.replace(/(.)<\/?code>(?=.)/g,"$1`");                                                            // 526
		tag = escapeCharacters(tag,"\\`*_");                                                                                 // 527
		return tag;                                                                                                          // 528
	});                                                                                                                   // 529
                                                                                                                       // 530
	return text;                                                                                                          // 531
}                                                                                                                      // 532
                                                                                                                       // 533
var _DoAnchors = function(text) {                                                                                      // 534
//                                                                                                                     // 535
// Turn Markdown link shortcuts into XHTML <a> tags.                                                                   // 536
//                                                                                                                     // 537
	//                                                                                                                    // 538
	// First, handle reference-style links: [link text] [id]                                                              // 539
	//                                                                                                                    // 540
                                                                                                                       // 541
	/*                                                                                                                    // 542
		text = text.replace(/                                                                                                // 543
		(							// wrap whole match in $1                                                                                    // 544
			\[                                                                                                                  // 545
			(                                                                                                                   // 546
				(?:                                                                                                                // 547
					\[[^\]]*\]		// allow brackets nested one level                                                                    // 548
					|                                                                                                                 // 549
					[^\[]			// or anything else                                                                                       // 550
				)*                                                                                                                 // 551
			)                                                                                                                   // 552
			\]                                                                                                                  // 553
                                                                                                                       // 554
			[ ]?					// one optional space                                                                                      // 555
			(?:\n[ ]*)?				// one optional newline followed by spaces                                                           // 556
                                                                                                                       // 557
			\[                                                                                                                  // 558
			(.*?)					// id = $3                                                                                                // 559
			\]                                                                                                                  // 560
		)()()()()					// pad remaining backreferences                                                                        // 561
		/g,_DoAnchors_callback);                                                                                             // 562
	*/                                                                                                                    // 563
	text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeAnchorTag);               // 564
                                                                                                                       // 565
	//                                                                                                                    // 566
	// Next, inline-style links: [link text](url "optional title")                                                        // 567
	//                                                                                                                    // 568
                                                                                                                       // 569
	/*                                                                                                                    // 570
		text = text.replace(/                                                                                                // 571
			(						// wrap whole match in $1                                                                                    // 572
				\[                                                                                                                 // 573
				(                                                                                                                  // 574
					(?:                                                                                                               // 575
						\[[^\]]*\]	// allow brackets nested one level                                                                    // 576
					|                                                                                                                 // 577
					[^\[\]]			// or anything else                                                                                     // 578
				)                                                                                                                  // 579
			)                                                                                                                   // 580
			\]                                                                                                                  // 581
			\(						// literal paren                                                                                            // 582
			[ \t]*                                                                                                              // 583
			()						// no id, so leave $3 empty                                                                                 // 584
			<?(.*?)>?				// href = $4                                                                                           // 585
			[ \t]*                                                                                                              // 586
			(						// $5                                                                                                        // 587
				(['"])				// quote char = $6                                                                                       // 588
				(.*?)				// Title = $7                                                                                             // 589
				\6					// matching quote                                                                                           // 590
				[ \t]*				// ignore any spaces/tabs between closing quote and )                                                    // 591
			)?						// title is optional                                                                                        // 592
			\)                                                                                                                  // 593
		)                                                                                                                    // 594
		/g,writeAnchorTag);                                                                                                  // 595
	*/                                                                                                                    // 596
	text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?(?:\(.*?\).*?)?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeAnchorTag);
                                                                                                                       // 598
	//                                                                                                                    // 599
	// Last, handle reference-style shortcuts: [link text]                                                                // 600
	// These must come last in case you've also got [link test][1]                                                        // 601
	// or [link test](/foo)                                                                                               // 602
	//                                                                                                                    // 603
                                                                                                                       // 604
	/*                                                                                                                    // 605
		text = text.replace(/                                                                                                // 606
		(		 					// wrap whole match in $1                                                                                   // 607
			\[                                                                                                                  // 608
			([^\[\]]+)				// link text = $2; can't contain '[' or ']'                                                           // 609
			\]                                                                                                                  // 610
		)()()()()()					// pad rest of backreferences                                                                        // 611
		/g, writeAnchorTag);                                                                                                 // 612
	*/                                                                                                                    // 613
	text = text.replace(/(\[([^\[\]]+)\])()()()()()/g, writeAnchorTag);                                                   // 614
                                                                                                                       // 615
	return text;                                                                                                          // 616
}                                                                                                                      // 617
                                                                                                                       // 618
var writeAnchorTag = function(wholeMatch,m1,m2,m3,m4,m5,m6,m7) {                                                       // 619
	if (m7 == undefined) m7 = "";                                                                                         // 620
	var whole_match = m1;                                                                                                 // 621
	var link_text   = m2;                                                                                                 // 622
	var link_id	 = m3.toLowerCase();                                                                                      // 623
	var url		= m4;                                                                                                        // 624
	var title	= m7;                                                                                                       // 625
                                                                                                                       // 626
	if (url == "") {                                                                                                      // 627
		if (link_id == "") {                                                                                                 // 628
			// lower-case and turn embedded newlines into spaces                                                                // 629
			link_id = link_text.toLowerCase().replace(/ ?\n/g," ");                                                             // 630
		}                                                                                                                    // 631
		url = "#"+link_id;                                                                                                   // 632
                                                                                                                       // 633
		if (g_urls[link_id] != undefined) {                                                                                  // 634
			url = g_urls[link_id];                                                                                              // 635
			if (g_titles[link_id] != undefined) {                                                                               // 636
				title = g_titles[link_id];                                                                                         // 637
			}                                                                                                                   // 638
		}                                                                                                                    // 639
		else {                                                                                                               // 640
			if (whole_match.search(/\(\s*\)$/m)>-1) {                                                                           // 641
				// Special case for explicit empty url                                                                             // 642
				url = "";                                                                                                          // 643
			} else {                                                                                                            // 644
				return whole_match;                                                                                                // 645
			}                                                                                                                   // 646
		}                                                                                                                    // 647
	}                                                                                                                     // 648
                                                                                                                       // 649
	url = escapeCharacters(url,"*_");                                                                                     // 650
	var result = "<a href=\"" + url + "\"";                                                                               // 651
                                                                                                                       // 652
	if (title != "") {                                                                                                    // 653
		title = title.replace(/"/g,"&quot;");                                                                                // 654
		title = escapeCharacters(title,"*_");                                                                                // 655
		result +=  " title=\"" + title + "\"";                                                                               // 656
	}                                                                                                                     // 657
                                                                                                                       // 658
	result += ">" + link_text + "</a>";                                                                                   // 659
                                                                                                                       // 660
	return result;                                                                                                        // 661
}                                                                                                                      // 662
                                                                                                                       // 663
                                                                                                                       // 664
var _DoImages = function(text) {                                                                                       // 665
//                                                                                                                     // 666
// Turn Markdown image shortcuts into <img> tags.                                                                      // 667
//                                                                                                                     // 668
                                                                                                                       // 669
	//                                                                                                                    // 670
	// First, handle reference-style labeled images: ![alt text][id]                                                      // 671
	//                                                                                                                    // 672
                                                                                                                       // 673
	/*                                                                                                                    // 674
		text = text.replace(/                                                                                                // 675
		(						// wrap whole match in $1                                                                                     // 676
			!\[                                                                                                                 // 677
			(.*?)				// alt text = $2                                                                                           // 678
			\]                                                                                                                  // 679
                                                                                                                       // 680
			[ ]?				// one optional space                                                                                       // 681
			(?:\n[ ]*)?			// one optional newline followed by spaces                                                            // 682
                                                                                                                       // 683
			\[                                                                                                                  // 684
			(.*?)				// id = $3                                                                                                 // 685
			\]                                                                                                                  // 686
		)()()()()				// pad rest of backreferences                                                                           // 687
		/g,writeImageTag);                                                                                                   // 688
	*/                                                                                                                    // 689
	text = text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeImageTag);                                   // 690
                                                                                                                       // 691
	//                                                                                                                    // 692
	// Next, handle inline images:  ![alt text](url "optional title")                                                     // 693
	// Don't forget: encode * and _                                                                                       // 694
                                                                                                                       // 695
	/*                                                                                                                    // 696
		text = text.replace(/                                                                                                // 697
		(						// wrap whole match in $1                                                                                     // 698
			!\[                                                                                                                 // 699
			(.*?)				// alt text = $2                                                                                           // 700
			\]                                                                                                                  // 701
			\s?					// One optional whitespace character                                                                        // 702
			\(					// literal paren                                                                                             // 703
			[ \t]*                                                                                                              // 704
			()					// no id, so leave $3 empty                                                                                  // 705
			<?(\S+?)>?			// src url = $4                                                                                        // 706
			[ \t]*                                                                                                              // 707
			(					// $5                                                                                                         // 708
				(['"])			// quote char = $6                                                                                        // 709
				(.*?)			// title = $7                                                                                              // 710
				\6				// matching quote                                                                                            // 711
				[ \t]*                                                                                                             // 712
			)?					// title is optional                                                                                         // 713
		\)                                                                                                                   // 714
		)                                                                                                                    // 715
		/g,writeImageTag);                                                                                                   // 716
	*/                                                                                                                    // 717
	text = text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeImageTag);              // 718
                                                                                                                       // 719
	return text;                                                                                                          // 720
}                                                                                                                      // 721
                                                                                                                       // 722
var writeImageTag = function(wholeMatch,m1,m2,m3,m4,m5,m6,m7) {                                                        // 723
	var whole_match = m1;                                                                                                 // 724
	var alt_text   = m2;                                                                                                  // 725
	var link_id	 = m3.toLowerCase();                                                                                      // 726
	var url		= m4;                                                                                                        // 727
	var title	= m7;                                                                                                       // 728
                                                                                                                       // 729
	if (!title) title = "";                                                                                               // 730
                                                                                                                       // 731
	if (url == "") {                                                                                                      // 732
		if (link_id == "") {                                                                                                 // 733
			// lower-case and turn embedded newlines into spaces                                                                // 734
			link_id = alt_text.toLowerCase().replace(/ ?\n/g," ");                                                              // 735
		}                                                                                                                    // 736
		url = "#"+link_id;                                                                                                   // 737
                                                                                                                       // 738
		if (g_urls[link_id] != undefined) {                                                                                  // 739
			url = g_urls[link_id];                                                                                              // 740
			if (g_titles[link_id] != undefined) {                                                                               // 741
				title = g_titles[link_id];                                                                                         // 742
			}                                                                                                                   // 743
		}                                                                                                                    // 744
		else {                                                                                                               // 745
			return whole_match;                                                                                                 // 746
		}                                                                                                                    // 747
	}                                                                                                                     // 748
                                                                                                                       // 749
	alt_text = alt_text.replace(/"/g,"&quot;");                                                                           // 750
	url = escapeCharacters(url,"*_");                                                                                     // 751
	var result = "<img src=\"" + url + "\" alt=\"" + alt_text + "\"";                                                     // 752
                                                                                                                       // 753
	// attacklab: Markdown.pl adds empty title attributes to images.                                                      // 754
	// Replicate this bug.                                                                                                // 755
                                                                                                                       // 756
	//if (title != "") {                                                                                                  // 757
		title = title.replace(/"/g,"&quot;");                                                                                // 758
		title = escapeCharacters(title,"*_");                                                                                // 759
		result +=  " title=\"" + title + "\"";                                                                               // 760
	//}                                                                                                                   // 761
                                                                                                                       // 762
	result += " />";                                                                                                      // 763
                                                                                                                       // 764
	return result;                                                                                                        // 765
}                                                                                                                      // 766
                                                                                                                       // 767
                                                                                                                       // 768
var _DoHeaders = function(text) {                                                                                      // 769
                                                                                                                       // 770
	// Setext-style headers:                                                                                              // 771
	//	Header 1                                                                                                           // 772
	//	========                                                                                                           // 773
	//                                                                                                                    // 774
	//	Header 2                                                                                                           // 775
	//	--------                                                                                                           // 776
	//                                                                                                                    // 777
	text = text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,                                                                     // 778
		function(wholeMatch,m1){return hashBlock('<h1 id="' + headerId(m1) + '">' + _RunSpanGamut(m1) + "</h1>");});         // 779
                                                                                                                       // 780
	text = text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,                                                                     // 781
		function(matchFound,m1){return hashBlock('<h2 id="' + headerId(m1) + '">' + _RunSpanGamut(m1) + "</h2>");});         // 782
                                                                                                                       // 783
	// atx-style headers:                                                                                                 // 784
	//  # Header 1                                                                                                        // 785
	//  ## Header 2                                                                                                       // 786
	//  ## Header 2 with closing hashes ##                                                                                // 787
	//  ...                                                                                                               // 788
	//  ###### Header 6                                                                                                   // 789
	//                                                                                                                    // 790
                                                                                                                       // 791
	/*                                                                                                                    // 792
		text = text.replace(/                                                                                                // 793
			^(\#{1,6})				// $1 = string of #'s                                                                                 // 794
			[ \t]*                                                                                                              // 795
			(.+?)					// $2 = Header text                                                                                       // 796
			[ \t]*                                                                                                              // 797
			\#*						// optional closing #'s (not counted)                                                                      // 798
			\n+                                                                                                                 // 799
		/gm, function() {...});                                                                                              // 800
	*/                                                                                                                    // 801
                                                                                                                       // 802
	text = text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,                                                            // 803
		function(wholeMatch,m1,m2) {                                                                                         // 804
			var h_level = m1.length;                                                                                            // 805
			return hashBlock("<h" + h_level + ' id="' + headerId(m2) + '">' + _RunSpanGamut(m2) + "</h" + h_level + ">");       // 806
		});                                                                                                                  // 807
                                                                                                                       // 808
	function headerId(m) {                                                                                                // 809
		return m.replace(/[^\w]/g, '').toLowerCase();                                                                        // 810
	}                                                                                                                     // 811
	return text;                                                                                                          // 812
}                                                                                                                      // 813
                                                                                                                       // 814
// This declaration keeps Dojo compressor from outputting garbage:                                                     // 815
var _ProcessListItems;                                                                                                 // 816
                                                                                                                       // 817
var _DoLists = function(text) {                                                                                        // 818
//                                                                                                                     // 819
// Form HTML ordered (numbered) and unordered (bulleted) lists.                                                        // 820
//                                                                                                                     // 821
                                                                                                                       // 822
	// attacklab: add sentinel to hack around khtml/safari bug:                                                           // 823
	// http://bugs.webkit.org/show_bug.cgi?id=11231                                                                       // 824
	text += "~0";                                                                                                         // 825
                                                                                                                       // 826
	// Re-usable pattern to match any entirel ul or ol list:                                                              // 827
                                                                                                                       // 828
	/*                                                                                                                    // 829
		var whole_list = /                                                                                                   // 830
		(									// $1 = whole list                                                                                         // 831
			(								// $2                                                                                                      // 832
				[ ]{0,3}					// attacklab: g_tab_width - 1                                                                         // 833
				([*+-]|\d+[.])				// $3 = first list item marker                                                                   // 834
				[ \t]+                                                                                                             // 835
			)                                                                                                                   // 836
			[^\r]+?                                                                                                             // 837
			(								// $4                                                                                                      // 838
				~0							// sentinel for workaround; should be $                                                                   // 839
			|                                                                                                                   // 840
				\n{2,}                                                                                                             // 841
				(?=\S)                                                                                                             // 842
				(?!							// Negative lookahead for another list item marker                                                       // 843
					[ \t]*                                                                                                            // 844
					(?:[*+-]|\d+[.])[ \t]+                                                                                            // 845
				)                                                                                                                  // 846
			)                                                                                                                   // 847
		)/g                                                                                                                  // 848
	*/                                                                                                                    // 849
	var whole_list = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;       // 850
                                                                                                                       // 851
	if (g_list_level) {                                                                                                   // 852
		text = text.replace(whole_list,function(wholeMatch,m1,m2) {                                                          // 853
			var list = m1;                                                                                                      // 854
			var list_type = (m2.search(/[*+-]/g)>-1) ? "ul" : "ol";                                                             // 855
                                                                                                                       // 856
			// Turn double returns into triple returns, so that we can make a                                                   // 857
			// paragraph for the last item in a list, if necessary:                                                             // 858
			list = list.replace(/\n{2,}/g,"\n\n\n");;                                                                           // 859
			var result = _ProcessListItems(list);                                                                               // 860
                                                                                                                       // 861
			// Trim any trailing whitespace, to put the closing `</$list_type>`                                                 // 862
			// up on the preceding line, to get it past the current stupid                                                      // 863
			// HTML block parser. This is a hack to work around the terrible                                                    // 864
			// hack that is the HTML block parser.                                                                              // 865
			result = result.replace(/\s+$/,"");                                                                                 // 866
			result = "<"+list_type+">" + result + "</"+list_type+">\n";                                                         // 867
			return result;                                                                                                      // 868
		});                                                                                                                  // 869
	} else {                                                                                                              // 870
		whole_list = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g; // 871
		text = text.replace(whole_list,function(wholeMatch,m1,m2,m3) {                                                       // 872
			var runup = m1;                                                                                                     // 873
			var list = m2;                                                                                                      // 874
                                                                                                                       // 875
			var list_type = (m3.search(/[*+-]/g)>-1) ? "ul" : "ol";                                                             // 876
			// Turn double returns into triple returns, so that we can make a                                                   // 877
			// paragraph for the last item in a list, if necessary:                                                             // 878
			var list = list.replace(/\n{2,}/g,"\n\n\n");;                                                                       // 879
			var result = _ProcessListItems(list);                                                                               // 880
			result = runup + "<"+list_type+">\n" + result + "</"+list_type+">\n";                                               // 881
			return result;                                                                                                      // 882
		});                                                                                                                  // 883
	}                                                                                                                     // 884
                                                                                                                       // 885
	// attacklab: strip sentinel                                                                                          // 886
	text = text.replace(/~0/,"");                                                                                         // 887
                                                                                                                       // 888
	return text;                                                                                                          // 889
}                                                                                                                      // 890
                                                                                                                       // 891
_ProcessListItems = function(list_str) {                                                                               // 892
//                                                                                                                     // 893
//  Process the contents of a single ordered or unordered list, splitting it                                           // 894
//  into individual list items.                                                                                        // 895
//                                                                                                                     // 896
	// The $g_list_level global keeps track of when we're inside a list.                                                  // 897
	// Each time we enter a list, we increment it; when we leave a list,                                                  // 898
	// we decrement. If it's zero, we're not in a list anymore.                                                           // 899
	//                                                                                                                    // 900
	// We do this because when we're not inside a list, we want to treat                                                  // 901
	// something like this:                                                                                               // 902
	//                                                                                                                    // 903
	//    I recommend upgrading to version                                                                                // 904
	//    8. Oops, now this line is treated                                                                               // 905
	//    as a sub-list.                                                                                                  // 906
	//                                                                                                                    // 907
	// As a single paragraph, despite the fact that the second line starts                                                // 908
	// with a digit-period-space sequence.                                                                                // 909
	//                                                                                                                    // 910
	// Whereas when we're inside a list (or sub-list), that line will be                                                  // 911
	// treated as the start of a sub-list. What a kludge, huh? This is                                                    // 912
	// an aspect of Markdown's syntax that's hard to parse perfectly                                                      // 913
	// without resorting to mind-reading. Perhaps the solution is to                                                      // 914
	// change the syntax rules such that sub-lists must start with a                                                      // 915
	// starting cardinal number; e.g. "1." or "a.".                                                                       // 916
                                                                                                                       // 917
	g_list_level++;                                                                                                       // 918
                                                                                                                       // 919
	// trim trailing blank lines:                                                                                         // 920
	list_str = list_str.replace(/\n{2,}$/,"\n");                                                                          // 921
                                                                                                                       // 922
	// attacklab: add sentinel to emulate \z                                                                              // 923
	list_str += "~0";                                                                                                     // 924
                                                                                                                       // 925
	/*                                                                                                                    // 926
		list_str = list_str.replace(/                                                                                        // 927
			(\n)?							// leading line = $1                                                                                    // 928
			(^[ \t]*)						// leading whitespace = $2                                                                           // 929
			([*+-]|\d+[.]) [ \t]+			// list marker = $3                                                                         // 930
			([^\r]+?						// list item text   = $4                                                                              // 931
			(\n{1,2}))                                                                                                          // 932
			(?= \n* (~0 | \2 ([*+-]|\d+[.]) [ \t]+))                                                                            // 933
		/gm, function(){...});                                                                                               // 934
	*/                                                                                                                    // 935
	list_str = list_str.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,
		function(wholeMatch,m1,m2,m3,m4){                                                                                    // 937
			var item = m4;                                                                                                      // 938
			var leading_line = m1;                                                                                              // 939
			var leading_space = m2;                                                                                             // 940
                                                                                                                       // 941
			if (leading_line || (item.search(/\n{2,}/)>-1)) {                                                                   // 942
				item = _RunBlockGamut(_Outdent(item));                                                                             // 943
			}                                                                                                                   // 944
			else {                                                                                                              // 945
				// Recursion for sub-lists:                                                                                        // 946
				item = _DoLists(_Outdent(item));                                                                                   // 947
				item = item.replace(/\n$/,""); // chomp(item)                                                                      // 948
				item = _RunSpanGamut(item);                                                                                        // 949
			}                                                                                                                   // 950
                                                                                                                       // 951
			return  "<li>" + item + "</li>\n";                                                                                  // 952
		}                                                                                                                    // 953
	);                                                                                                                    // 954
                                                                                                                       // 955
	// attacklab: strip sentinel                                                                                          // 956
	list_str = list_str.replace(/~0/g,"");                                                                                // 957
                                                                                                                       // 958
	g_list_level--;                                                                                                       // 959
	return list_str;                                                                                                      // 960
}                                                                                                                      // 961
                                                                                                                       // 962
                                                                                                                       // 963
var _DoCodeBlocks = function(text) {                                                                                   // 964
//                                                                                                                     // 965
//  Process Markdown `<pre><code>` blocks.                                                                             // 966
//                                                                                                                     // 967
                                                                                                                       // 968
	/*                                                                                                                    // 969
		text = text.replace(text,                                                                                            // 970
			/(?:\n\n|^)                                                                                                         // 971
			(								// $1 = the code block -- one or more lines, starting with a space/tab                                     // 972
				(?:                                                                                                                // 973
					(?:[ ]{4}|\t)			// Lines must start with a tab or a tab-width of spaces - attacklab: g_tab_width                  // 974
					.*\n+                                                                                                             // 975
				)+                                                                                                                 // 976
			)                                                                                                                   // 977
			(\n*[ ]{0,3}[^ \t\n]|(?=~0))	// attacklab: g_tab_width                                                              // 978
		/g,function(){...});                                                                                                 // 979
	*/                                                                                                                    // 980
                                                                                                                       // 981
	// attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug                                            // 982
	text += "~0";                                                                                                         // 983
                                                                                                                       // 984
	text = text.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,                               // 985
		function(wholeMatch,m1,m2) {                                                                                         // 986
			var codeblock = m1;                                                                                                 // 987
			var nextChar = m2;                                                                                                  // 988
                                                                                                                       // 989
			codeblock = _EncodeCode( _Outdent(codeblock));                                                                      // 990
			codeblock = _Detab(codeblock);                                                                                      // 991
			codeblock = codeblock.replace(/^\n+/g,""); // trim leading newlines                                                 // 992
			codeblock = codeblock.replace(/\n+$/g,""); // trim trailing whitespace                                              // 993
                                                                                                                       // 994
			codeblock = "<pre><code>" + codeblock + "\n</code></pre>";                                                          // 995
                                                                                                                       // 996
			return hashBlock(codeblock) + nextChar;                                                                             // 997
		}                                                                                                                    // 998
	);                                                                                                                    // 999
                                                                                                                       // 1000
	// attacklab: strip sentinel                                                                                          // 1001
	text = text.replace(/~0/,"");                                                                                         // 1002
                                                                                                                       // 1003
	return text;                                                                                                          // 1004
};                                                                                                                     // 1005
                                                                                                                       // 1006
var _DoGithubCodeBlocks = function(text) {                                                                             // 1007
//                                                                                                                     // 1008
//  Process Github-style code blocks                                                                                   // 1009
//  Example:                                                                                                           // 1010
//  ```ruby                                                                                                            // 1011
//  def hello_world(x)                                                                                                 // 1012
//    puts "Hello, #{x}"                                                                                               // 1013
//  end                                                                                                                // 1014
//  ```                                                                                                                // 1015
//                                                                                                                     // 1016
                                                                                                                       // 1017
                                                                                                                       // 1018
	// attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug                                            // 1019
	text += "~0";                                                                                                         // 1020
                                                                                                                       // 1021
	text = text.replace(/(?:^|\n)```(.*)\n([\s\S]*?)\n```/g,                                                              // 1022
		function(wholeMatch,m1,m2) {                                                                                         // 1023
			var language = m1;                                                                                                  // 1024
			var codeblock = m2;                                                                                                 // 1025
                                                                                                                       // 1026
			codeblock = _EncodeCode(codeblock);                                                                                 // 1027
			codeblock = _Detab(codeblock);                                                                                      // 1028
			codeblock = codeblock.replace(/^\n+/g,""); // trim leading newlines                                                 // 1029
			codeblock = codeblock.replace(/\n+$/g,""); // trim trailing whitespace                                              // 1030
                                                                                                                       // 1031
			codeblock = "<pre><code" + (language ? " class=\"" + language + '"' : "") + ">" + codeblock + "\n</code></pre>";    // 1032
                                                                                                                       // 1033
			return hashBlock(codeblock);                                                                                        // 1034
		}                                                                                                                    // 1035
	);                                                                                                                    // 1036
                                                                                                                       // 1037
	// attacklab: strip sentinel                                                                                          // 1038
	text = text.replace(/~0/,"");                                                                                         // 1039
                                                                                                                       // 1040
	return text;                                                                                                          // 1041
}                                                                                                                      // 1042
                                                                                                                       // 1043
var hashBlock = function(text) {                                                                                       // 1044
	text = text.replace(/(^\n+|\n+$)/g,"");                                                                               // 1045
	return "\n\n~K" + (g_html_blocks.push(text)-1) + "K\n\n";                                                             // 1046
}                                                                                                                      // 1047
                                                                                                                       // 1048
var _DoCodeSpans = function(text) {                                                                                    // 1049
//                                                                                                                     // 1050
//   *  Backtick quotes are used for <code></code> spans.                                                              // 1051
//                                                                                                                     // 1052
//   *  You can use multiple backticks as the delimiters if you want to                                                // 1053
//	 include literal backticks in the code span. So, this input:                                                        // 1054
//                                                                                                                     // 1055
//		 Just type ``foo `bar` baz`` at the prompt.                                                                        // 1056
//                                                                                                                     // 1057
//	   Will translate to:                                                                                               // 1058
//                                                                                                                     // 1059
//		 <p>Just type <code>foo `bar` baz</code> at the prompt.</p>                                                        // 1060
//                                                                                                                     // 1061
//	There's no arbitrary limit to the number of backticks you                                                           // 1062
//	can use as delimters. If you need three consecutive backticks                                                       // 1063
//	in your code, use four for delimiters, etc.                                                                         // 1064
//                                                                                                                     // 1065
//  *  You can use spaces to get literal backticks at the edges:                                                       // 1066
//                                                                                                                     // 1067
//		 ... type `` `bar` `` ...                                                                                          // 1068
//                                                                                                                     // 1069
//	   Turns to:                                                                                                        // 1070
//                                                                                                                     // 1071
//		 ... type <code>`bar`</code> ...                                                                                   // 1072
//                                                                                                                     // 1073
                                                                                                                       // 1074
	/*                                                                                                                    // 1075
		text = text.replace(/                                                                                                // 1076
			(^|[^\\])					// Character before opening ` can't be a backslash                                                    // 1077
			(`+)						// $2 = Opening run of `                                                                                  // 1078
			(							// $3 = The code block                                                                                      // 1079
				[^\r]*?                                                                                                            // 1080
				[^`]					// attacklab: work around lack of lookbehind                                                              // 1081
			)                                                                                                                   // 1082
			\2							// Matching closer                                                                                         // 1083
			(?!`)                                                                                                               // 1084
		/gm, function(){...});                                                                                               // 1085
	*/                                                                                                                    // 1086
                                                                                                                       // 1087
	text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,                                                            // 1088
		function(wholeMatch,m1,m2,m3,m4) {                                                                                   // 1089
			var c = m3;                                                                                                         // 1090
			c = c.replace(/^([ \t]*)/g,"");	// leading whitespace                                                               // 1091
			c = c.replace(/[ \t]*$/g,"");	// trailing whitespace                                                                // 1092
			c = _EncodeCode(c);                                                                                                 // 1093
			return m1+"<code>"+c+"</code>";                                                                                     // 1094
		});                                                                                                                  // 1095
                                                                                                                       // 1096
	return text;                                                                                                          // 1097
}                                                                                                                      // 1098
                                                                                                                       // 1099
var _EncodeCode = function(text) {                                                                                     // 1100
//                                                                                                                     // 1101
// Encode/escape certain characters inside Markdown code runs.                                                         // 1102
// The point is that in code, these characters are literals,                                                           // 1103
// and lose their special Markdown meanings.                                                                           // 1104
//                                                                                                                     // 1105
	// Encode all ampersands; HTML entities are not                                                                       // 1106
	// entities within a Markdown code span.                                                                              // 1107
	text = text.replace(/&/g,"&amp;");                                                                                    // 1108
                                                                                                                       // 1109
	// Do the angle bracket song and dance:                                                                               // 1110
	text = text.replace(/</g,"&lt;");                                                                                     // 1111
	text = text.replace(/>/g,"&gt;");                                                                                     // 1112
                                                                                                                       // 1113
	// Now, escape characters that are magic in Markdown:                                                                 // 1114
	text = escapeCharacters(text,"\*_{}[]\\",false);                                                                      // 1115
                                                                                                                       // 1116
// jj the line above breaks this:                                                                                      // 1117
//---                                                                                                                  // 1118
                                                                                                                       // 1119
//* Item                                                                                                               // 1120
                                                                                                                       // 1121
//   1. Subitem                                                                                                        // 1122
                                                                                                                       // 1123
//            special char: *                                                                                          // 1124
//---                                                                                                                  // 1125
                                                                                                                       // 1126
	return text;                                                                                                          // 1127
}                                                                                                                      // 1128
                                                                                                                       // 1129
                                                                                                                       // 1130
var _DoItalicsAndBold = function(text) {                                                                               // 1131
                                                                                                                       // 1132
	// <strong> must go first:                                                                                            // 1133
	text = text.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,                                                             // 1134
		"<strong>$2</strong>");                                                                                              // 1135
                                                                                                                       // 1136
	text = text.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,                                                                     // 1137
		"<em>$2</em>");                                                                                                      // 1138
                                                                                                                       // 1139
	return text;                                                                                                          // 1140
}                                                                                                                      // 1141
                                                                                                                       // 1142
                                                                                                                       // 1143
var _DoBlockQuotes = function(text) {                                                                                  // 1144
                                                                                                                       // 1145
	/*                                                                                                                    // 1146
		text = text.replace(/                                                                                                // 1147
		(								// Wrap whole match in $1                                                                                   // 1148
			(                                                                                                                   // 1149
				^[ \t]*>[ \t]?			// '>' at the start of a line                                                                     // 1150
				.+\n					// rest of the first line                                                                                 // 1151
				(.+\n)*					// subsequent consecutive lines                                                                        // 1152
				\n*						// blanks                                                                                                 // 1153
			)+                                                                                                                  // 1154
		)                                                                                                                    // 1155
		/gm, function(){...});                                                                                               // 1156
	*/                                                                                                                    // 1157
                                                                                                                       // 1158
	text = text.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,                                                            // 1159
		function(wholeMatch,m1) {                                                                                            // 1160
			var bq = m1;                                                                                                        // 1161
                                                                                                                       // 1162
			// attacklab: hack around Konqueror 3.5.4 bug:                                                                      // 1163
			// "----------bug".replace(/^-/g,"") == "bug"                                                                       // 1164
                                                                                                                       // 1165
			bq = bq.replace(/^[ \t]*>[ \t]?/gm,"~0");	// trim one level of quoting                                              // 1166
                                                                                                                       // 1167
			// attacklab: clean up hack                                                                                         // 1168
			bq = bq.replace(/~0/g,"");                                                                                          // 1169
                                                                                                                       // 1170
			bq = bq.replace(/^[ \t]+$/gm,"");		// trim whitespace-only lines                                                    // 1171
			bq = _RunBlockGamut(bq);				// recurse                                                                              // 1172
                                                                                                                       // 1173
			bq = bq.replace(/(^|\n)/g,"$1  ");                                                                                  // 1174
			// These leading spaces screw with <pre> content, so we need to fix that:                                           // 1175
			bq = bq.replace(                                                                                                    // 1176
					/(\s*<pre>[^\r]+?<\/pre>)/gm,                                                                                     // 1177
				function(wholeMatch,m1) {                                                                                          // 1178
					var pre = m1;                                                                                                     // 1179
					// attacklab: hack around Konqueror 3.5.4 bug:                                                                    // 1180
					pre = pre.replace(/^  /mg,"~0");                                                                                  // 1181
					pre = pre.replace(/~0/g,"");                                                                                      // 1182
					return pre;                                                                                                       // 1183
				});                                                                                                                // 1184
                                                                                                                       // 1185
			return hashBlock("<blockquote>\n" + bq + "\n</blockquote>");                                                        // 1186
		});                                                                                                                  // 1187
	return text;                                                                                                          // 1188
}                                                                                                                      // 1189
                                                                                                                       // 1190
                                                                                                                       // 1191
var _FormParagraphs = function(text) {                                                                                 // 1192
//                                                                                                                     // 1193
//  Params:                                                                                                            // 1194
//    $text - string to process with html <p> tags                                                                     // 1195
//                                                                                                                     // 1196
                                                                                                                       // 1197
	// Strip leading and trailing lines:                                                                                  // 1198
	text = text.replace(/^\n+/g,"");                                                                                      // 1199
	text = text.replace(/\n+$/g,"");                                                                                      // 1200
                                                                                                                       // 1201
	var grafs = text.split(/\n{2,}/g);                                                                                    // 1202
	var grafsOut = [];                                                                                                    // 1203
                                                                                                                       // 1204
	//                                                                                                                    // 1205
	// Wrap <p> tags.                                                                                                     // 1206
	//                                                                                                                    // 1207
	var end = grafs.length;                                                                                               // 1208
	for (var i=0; i<end; i++) {                                                                                           // 1209
		var str = grafs[i];                                                                                                  // 1210
                                                                                                                       // 1211
		// if this is an HTML marker, copy it                                                                                // 1212
		if (str.search(/~K(\d+)K/g) >= 0) {                                                                                  // 1213
			grafsOut.push(str);                                                                                                 // 1214
		}                                                                                                                    // 1215
		else if (str.search(/\S/) >= 0) {                                                                                    // 1216
			str = _RunSpanGamut(str);                                                                                           // 1217
			str = str.replace(/^([ \t]*)/g,"<p>");                                                                              // 1218
			str += "</p>"                                                                                                       // 1219
			grafsOut.push(str);                                                                                                 // 1220
		}                                                                                                                    // 1221
                                                                                                                       // 1222
	}                                                                                                                     // 1223
                                                                                                                       // 1224
	//                                                                                                                    // 1225
	// Unhashify HTML blocks                                                                                              // 1226
	//                                                                                                                    // 1227
	end = grafsOut.length;                                                                                                // 1228
	for (var i=0; i<end; i++) {                                                                                           // 1229
		// if this is a marker for an html block...                                                                          // 1230
		while (grafsOut[i].search(/~K(\d+)K/) >= 0) {                                                                        // 1231
			var blockText = g_html_blocks[RegExp.$1];                                                                           // 1232
			blockText = blockText.replace(/\$/g,"$$$$"); // Escape any dollar signs                                             // 1233
			grafsOut[i] = grafsOut[i].replace(/~K\d+K/,blockText);                                                              // 1234
		}                                                                                                                    // 1235
	}                                                                                                                     // 1236
                                                                                                                       // 1237
	return grafsOut.join("\n\n");                                                                                         // 1238
}                                                                                                                      // 1239
                                                                                                                       // 1240
                                                                                                                       // 1241
var _EncodeAmpsAndAngles = function(text) {                                                                            // 1242
// Smart processing for ampersands and angle brackets that need to be encoded.                                         // 1243
                                                                                                                       // 1244
	// Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:                                              // 1245
	//   http://bumppo.net/projects/amputator/                                                                            // 1246
	text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;");                                                    // 1247
                                                                                                                       // 1248
	// Encode naked <'s                                                                                                   // 1249
	text = text.replace(/<(?![a-z\/?\$!])/gi,"&lt;");                                                                     // 1250
                                                                                                                       // 1251
	return text;                                                                                                          // 1252
}                                                                                                                      // 1253
                                                                                                                       // 1254
                                                                                                                       // 1255
var _EncodeBackslashEscapes = function(text) {                                                                         // 1256
//                                                                                                                     // 1257
//   Parameter:  String.                                                                                               // 1258
//   Returns:	The string, with after processing the following backslash                                                // 1259
//			   escape sequences.                                                                                              // 1260
//                                                                                                                     // 1261
                                                                                                                       // 1262
	// attacklab: The polite way to do this is with the new                                                               // 1263
	// escapeCharacters() function:                                                                                       // 1264
	//                                                                                                                    // 1265
	// 	text = escapeCharacters(text,"\\",true);                                                                          // 1266
	// 	text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);                                                             // 1267
	//                                                                                                                    // 1268
	// ...but we're sidestepping its use of the (slow) RegExp constructor                                                 // 1269
	// as an optimization for Firefox.  This function gets called a LOT.                                                  // 1270
                                                                                                                       // 1271
	text = text.replace(/\\(\\)/g,escapeCharacters_callback);                                                             // 1272
	text = text.replace(/\\([`*_{}\[\]()>#+-.!])/g,escapeCharacters_callback);                                            // 1273
	return text;                                                                                                          // 1274
}                                                                                                                      // 1275
                                                                                                                       // 1276
                                                                                                                       // 1277
var _DoAutoLinks = function(text) {                                                                                    // 1278
                                                                                                                       // 1279
	text = text.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi,"<a href=\"$1\">$1</a>");                                     // 1280
                                                                                                                       // 1281
	// Email addresses: <address@domain.foo>                                                                              // 1282
                                                                                                                       // 1283
	/*                                                                                                                    // 1284
		text = text.replace(/                                                                                                // 1285
			<                                                                                                                   // 1286
			(?:mailto:)?                                                                                                        // 1287
			(                                                                                                                   // 1288
				[-.\w]+                                                                                                            // 1289
				\@                                                                                                                 // 1290
				[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+                                                                                  // 1291
			)                                                                                                                   // 1292
			>                                                                                                                   // 1293
		/gi, _DoAutoLinks_callback());                                                                                       // 1294
	*/                                                                                                                    // 1295
	text = text.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,                                   // 1296
		function(wholeMatch,m1) {                                                                                            // 1297
			return _EncodeEmailAddress( _UnescapeSpecialChars(m1) );                                                            // 1298
		}                                                                                                                    // 1299
	);                                                                                                                    // 1300
                                                                                                                       // 1301
	return text;                                                                                                          // 1302
}                                                                                                                      // 1303
                                                                                                                       // 1304
                                                                                                                       // 1305
var _EncodeEmailAddress = function(addr) {                                                                             // 1306
//                                                                                                                     // 1307
//  Input: an email address, e.g. "foo@example.com"                                                                    // 1308
//                                                                                                                     // 1309
//  Output: the email address as a mailto link, with each character                                                    // 1310
//	of the address encoded as either a decimal or hex entity, in                                                        // 1311
//	the hopes of foiling most address harvesting spam bots. E.g.:                                                       // 1312
//                                                                                                                     // 1313
//	<a href="&#x6D;&#97;&#105;&#108;&#x74;&#111;:&#102;&#111;&#111;&#64;&#101;                                          // 1314
//	   x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;">&#102;&#111;&#111;                                       // 1315
//	   &#64;&#101;x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;</a>                                            // 1316
//                                                                                                                     // 1317
//  Based on a filter by Matthew Wickline, posted to the BBEdit-Talk                                                   // 1318
//  mailing list: <http://tinyurl.com/yu7ue>                                                                           // 1319
//                                                                                                                     // 1320
                                                                                                                       // 1321
	var encode = [                                                                                                        // 1322
		function(ch){return "&#"+ch.charCodeAt(0)+";";},                                                                     // 1323
		function(ch){return "&#x"+ch.charCodeAt(0).toString(16)+";";},                                                       // 1324
		function(ch){return ch;}                                                                                             // 1325
	];                                                                                                                    // 1326
                                                                                                                       // 1327
	addr = "mailto:" + addr;                                                                                              // 1328
                                                                                                                       // 1329
	addr = addr.replace(/./g, function(ch) {                                                                              // 1330
		if (ch == "@") {                                                                                                     // 1331
		   	// this *must* be encoded. I insist.                                                                             // 1332
			ch = encode[Math.floor(Math.random()*2)](ch);                                                                       // 1333
		} else if (ch !=":") {                                                                                               // 1334
			// leave ':' alone (to spot mailto: later)                                                                          // 1335
			var r = Math.random();                                                                                              // 1336
			// roughly 10% raw, 45% hex, 45% dec                                                                                // 1337
			ch =  (                                                                                                             // 1338
					r > .9  ?	encode[2](ch)   :                                                                                       // 1339
					r > .45 ?	encode[1](ch)   :                                                                                       // 1340
								encode[0](ch)                                                                                                  // 1341
				);                                                                                                                 // 1342
		}                                                                                                                    // 1343
		return ch;                                                                                                           // 1344
	});                                                                                                                   // 1345
                                                                                                                       // 1346
	addr = "<a href=\"" + addr + "\">" + addr + "</a>";                                                                   // 1347
	addr = addr.replace(/">.+:/g,"\">"); // strip the mailto: from the visible part                                       // 1348
                                                                                                                       // 1349
	return addr;                                                                                                          // 1350
}                                                                                                                      // 1351
                                                                                                                       // 1352
                                                                                                                       // 1353
var _UnescapeSpecialChars = function(text) {                                                                           // 1354
//                                                                                                                     // 1355
// Swap back in all the special characters we've hidden.                                                               // 1356
//                                                                                                                     // 1357
	text = text.replace(/~E(\d+)E/g,                                                                                      // 1358
		function(wholeMatch,m1) {                                                                                            // 1359
			var charCodeToReplace = parseInt(m1);                                                                               // 1360
			return String.fromCharCode(charCodeToReplace);                                                                      // 1361
		}                                                                                                                    // 1362
	);                                                                                                                    // 1363
	return text;                                                                                                          // 1364
}                                                                                                                      // 1365
                                                                                                                       // 1366
                                                                                                                       // 1367
var _Outdent = function(text) {                                                                                        // 1368
//                                                                                                                     // 1369
// Remove one level of line-leading tabs or spaces                                                                     // 1370
//                                                                                                                     // 1371
                                                                                                                       // 1372
	// attacklab: hack around Konqueror 3.5.4 bug:                                                                        // 1373
	// "----------bug".replace(/^-/g,"") == "bug"                                                                         // 1374
                                                                                                                       // 1375
	text = text.replace(/^(\t|[ ]{1,4})/gm,"~0"); // attacklab: g_tab_width                                               // 1376
                                                                                                                       // 1377
	// attacklab: clean up hack                                                                                           // 1378
	text = text.replace(/~0/g,"")                                                                                         // 1379
                                                                                                                       // 1380
	return text;                                                                                                          // 1381
}                                                                                                                      // 1382
                                                                                                                       // 1383
var _Detab = function(text) {                                                                                          // 1384
// attacklab: Detab's completely rewritten for speed.                                                                  // 1385
// In perl we could fix it by anchoring the regexp with \G.                                                            // 1386
// In javascript we're less fortunate.                                                                                 // 1387
                                                                                                                       // 1388
	// expand first n-1 tabs                                                                                              // 1389
	text = text.replace(/\t(?=\t)/g,"    "); // attacklab: g_tab_width                                                    // 1390
                                                                                                                       // 1391
	// replace the nth with two sentinels                                                                                 // 1392
	text = text.replace(/\t/g,"~A~B");                                                                                    // 1393
                                                                                                                       // 1394
	// use the sentinel to anchor our regex so it doesn't explode                                                         // 1395
	text = text.replace(/~B(.+?)~A/g,                                                                                     // 1396
		function(wholeMatch,m1,m2) {                                                                                         // 1397
			var leadingText = m1;                                                                                               // 1398
			var numSpaces = 4 - leadingText.length % 4;  // attacklab: g_tab_width                                              // 1399
                                                                                                                       // 1400
			// there *must* be a better way to do this:                                                                         // 1401
			for (var i=0; i<numSpaces; i++) leadingText+=" ";                                                                   // 1402
                                                                                                                       // 1403
			return leadingText;                                                                                                 // 1404
		}                                                                                                                    // 1405
	);                                                                                                                    // 1406
                                                                                                                       // 1407
	// clean up sentinels                                                                                                 // 1408
	text = text.replace(/~A/g,"    ");  // attacklab: g_tab_width                                                         // 1409
	text = text.replace(/~B/g,"");                                                                                        // 1410
                                                                                                                       // 1411
	return text;                                                                                                          // 1412
}                                                                                                                      // 1413
                                                                                                                       // 1414
                                                                                                                       // 1415
//                                                                                                                     // 1416
//  attacklab: Utility functions                                                                                       // 1417
//                                                                                                                     // 1418
                                                                                                                       // 1419
                                                                                                                       // 1420
var escapeCharacters = function(text, charsToEscape, afterBackslash) {                                                 // 1421
	// First we have to escape the escape characters so that                                                              // 1422
	// we can build a character class out of them                                                                         // 1423
	var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g,"\\$1") + "])";                                          // 1424
                                                                                                                       // 1425
	if (afterBackslash) {                                                                                                 // 1426
		regexString = "\\\\" + regexString;                                                                                  // 1427
	}                                                                                                                     // 1428
                                                                                                                       // 1429
	var regex = new RegExp(regexString,"g");                                                                              // 1430
	text = text.replace(regex,escapeCharacters_callback);                                                                 // 1431
                                                                                                                       // 1432
	return text;                                                                                                          // 1433
}                                                                                                                      // 1434
                                                                                                                       // 1435
                                                                                                                       // 1436
var escapeCharacters_callback = function(wholeMatch,m1) {                                                              // 1437
	var charCodeToEscape = m1.charCodeAt(0);                                                                              // 1438
	return "~E"+charCodeToEscape+"E";                                                                                     // 1439
}                                                                                                                      // 1440
                                                                                                                       // 1441
} // end of Showdown.converter                                                                                         // 1442
                                                                                                                       // 1443
                                                                                                                       // 1444
// export                                                                                                              // 1445
if (typeof module !== 'undefined') module.exports = Showdown;                                                          // 1446
                                                                                                                       // 1447
// stolen from AMD branch of underscore                                                                                // 1448
// AMD define happens at the end for compatibility with AMD loaders                                                    // 1449
// that don't enforce next-turn semantics on modules.                                                                  // 1450
if (typeof define === 'function' && define.amd) {                                                                      // 1451
    define('showdown', function() {                                                                                    // 1452
        return Showdown;                                                                                               // 1453
    });                                                                                                                // 1454
}                                                                                                                      // 1455
                                                                                                                       // 1456
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.markdown = {
  Showdown: Showdown
};

})();

//# sourceMappingURL=markdown.js.map
