"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
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
const chai_1 = require("chai");
const test_utils_1 = require("./test-utils");
suite('test-utils', () => {
    suite('inMemoryAnalyzer', () => {
        test('can load the provided string literals as files', () => __awaiter(this, void 0, void 0, function* () {
            const analyzer = test_utils_1.inMemoryAnalyzer({
                'index.html': `
        <link rel="import" href="components/cool-element/cool-element.html">
        <cool-element></cool-element>
      `,
                'components/cool-element/cool-element.html': `
        <!-- something something custom elements -->
      `,
            });
            const indexUrl = analyzer.resolveUrl('index.html');
            const elementUrl = analyzer.resolveUrl('components/cool-element/cool-element.html');
            const analysis = yield analyzer.analyze([indexUrl, elementUrl]);
            const indexResult = analysis.getDocument(indexUrl);
            chai_1.assert.equal(indexResult.successful, true);
            const indexDocument = indexResult.successful && indexResult.value;
            chai_1.assert.deepEqual(indexDocument && indexDocument.parsedDocument.contents, '<link rel="import" href="components/cool-element/cool-element.html">\n' +
                '<cool-element></cool-element>\n');
        }));
    });
    suite('heredoc', () => {
        test('fixes indent level', () => {
            chai_1.assert.deepEqual(test_utils_1.heredoc `
          check

        this
            out
      `, '  check\n\nthis\n    out\n');
        });
    });
    suite('mindent', () => {
        test('returns the minimum indentation in a string', () => {
            chai_1.assert.equal(test_utils_1.mindent('  x'), 2);
            chai_1.assert.equal(test_utils_1.mindent(`
          x
        y <-- 8 characters indented
            z
      `), 8);
        });
    });
    suite('undent', () => {
        test('removes the minimum indentation from a string', () => {
            chai_1.assert.deepEqual(test_utils_1.undent('  x'), 'x');
            chai_1.assert.deepEqual(test_utils_1.undent(`
          x
        y
            z
      `), '\n  x\ny\n    z\n');
        });
    });
});
//# sourceMappingURL=test-utils_test.js.map