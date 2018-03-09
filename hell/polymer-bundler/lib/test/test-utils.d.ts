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
import { Analyzer } from 'polymer-analyzer';
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
export declare function heredoc(strings: TemplateStringsArray, ...values: any[]): string;
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
export declare function inMemoryAnalyzer(files: {
    [key: string]: string;
}): Analyzer;
/**
 * Returns the "minimum-indent level" which is the number of leading spaces on
 * the non-empty line with the fewest leading spaces.  Used to know how many
 * leading spaces to trim off of every line to left-justify multiline text.
 */
export declare function mindent(text: string): number;
/**
 * Left-justifies text in a multi-line indented string, but preserves relative
 * indentation; `undent('  a\n    b')` returns `'a\n  b'`.
 */
export declare function undent(text: string): string;
