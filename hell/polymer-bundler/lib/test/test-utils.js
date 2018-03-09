"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const polymer_analyzer_1 = require("polymer-analyzer");
/**
 * Automatically left-justifies an indented multi-line template literal string
 * so you can match your indent level with other surrounding source code.
 *
 * Example:
 * ```typescript
 *   const f = heredoc`
 *     function f() {
 *       something();
 *     }
 *   `;
 *   assert(f === 'function f() {\n  something();\n}\n');
 * ```
 */
function heredoc(strings, ...values) {
    let buildAString = '';
    for (const s of strings) {
        buildAString += s;
        if (values.length > 0) {
            buildAString += values.shift();
        }
    }
    buildAString = undent(buildAString);
    // Remove first blank line.
    buildAString = buildAString.replace(/^ *\n/, '');
    return buildAString;
}
exports.heredoc = heredoc;
/**
 * Convenience function to build an Analyzer with a purely in-memory file map.
 * Example:
 * ```
 * const analyzer = inMemoryAnalyzer({
 *   'file1.html': `
 *     <script src="./components/this-is-great/this-is-great.js"></script>
 *     <this-is-great></this-is-great>
 *   `,
 *   `components/this-is-great/this-is-great.js': `
 *     // something something custom elements
 *   `,
 * });
 * ```
 */
function inMemoryAnalyzer(files) {
    const inMemoryLoader = new polymer_analyzer_1.InMemoryOverlayUrlLoader();
    const urlResolver = new polymer_analyzer_1.PackageUrlResolver({ packageDir: '/memory/' });
    for (const packageUrl in files) {
        if (!files.hasOwnProperty(packageUrl)) {
            continue;
        }
        const content = files[packageUrl];
        const resolvedUrl = urlResolver.resolve(packageUrl);
        inMemoryLoader.urlContentsMap.set(resolvedUrl, heredoc `${content}`);
    }
    const analyzer = new polymer_analyzer_1.Analyzer({ urlLoader: inMemoryLoader, urlResolver });
    return analyzer;
}
exports.inMemoryAnalyzer = inMemoryAnalyzer;
/**
 * Returns the "minimum-indent level" which is the number of leading spaces on
 * the non-empty line with the fewest leading spaces.  Used to know how many
 * leading spaces to trim off of every line to left-justify multiline text.
 */
function mindent(text) {
    const matches = text.match(/^ *(?=[^ \n])/mg) || [];
    let mindent = null;
    for (const match of matches) {
        if (mindent === null || mindent > match.length) {
            mindent = match.length;
        }
    }
    return mindent === null ? 0 : mindent;
}
exports.mindent = mindent;
/**
 * Left-justifies text in a multi-line indented string, but preserves relative
 * indentation; `undent('  a\n    b')` returns `'a\n  b'`.
 */
function undent(text) {
    return text.replace(new RegExp(`^ {0,${mindent(text)}}`, 'mg'), '');
}
exports.undent = undent;
//# sourceMappingURL=test-utils.js.map