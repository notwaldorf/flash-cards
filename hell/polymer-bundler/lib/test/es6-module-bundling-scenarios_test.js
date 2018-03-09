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
/// <reference path="../../node_modules/@types/chai/index.d.ts" />
/// <reference path="../../node_modules/@types/node/index.d.ts" />
/// <reference path="../../node_modules/@types/mocha/index.d.ts" />
const chai_1 = require("chai");
const bundle_manifest_1 = require("../bundle-manifest");
const bundler_1 = require("../bundler");
const test_utils_1 = require("./test-utils");
suite('Es6 Module Bundling', () => {
    suite('rewriting import specifiers', () => {
        const analyzer = test_utils_1.inMemoryAnalyzer({
            'a.js': `
        import bee from './b.js';
        import * as b from './b.js';
        import {honey} from './b.js';
        import sea from './c.js';
        import * as c from './c.js';
        import {boat} from './c.js';
        console.log(bee, b, honey);
        console.log(sea, c, boat);
      `,
            'b.js': `
        import sea from './c.js';
        export default bee = '🐝';
        export const honey = '🍯';
        export const beeSea = bee + sea;
      `,
            'c.js': `
        export default sea = '🌊';
        export const boat = '⛵️';
      `,
            'd.js': `
        import {boat} from './c.js';
        export default deer = '🦌';
        export const deerBoat = deer + boat;
      `,
        });
        const aUrl = analyzer.resolveUrl('a.js');
        const bUrl = analyzer.resolveUrl('b.js');
        const cUrl = analyzer.resolveUrl('c.js');
        const dUrl = analyzer.resolveUrl('d.js');
        test('non-shared bundles', () => __awaiter(this, void 0, void 0, function* () {
            const bundler = new bundler_1.Bundler({ analyzer });
            const { documents } = yield bundler.bundle(yield bundler.generateManifest([aUrl, bUrl, cUrl]));
            chai_1.assert.deepEqual(documents.get(aUrl).content, test_utils_1.heredoc `
        import { $b as bee, $bDefault as bee__default, honey } from './b.js';

        import { $c as sea, $cDefault as sea__default, boat } from './c.js';


        console.log(bee__default, bee, honey);
        console.log(sea__default, sea, boat);`);
            chai_1.assert.deepEqual(documents.get(bUrl).content, test_utils_1.heredoc `
        import { $cDefault as sea } from './c.js';

        var b = bee = '🐝';
        const honey = '🍯';
        const beeSea = bee + sea;

        var b$1 = {
          default: b,
          honey: honey,
          beeSea: beeSea
        };

        export { b$1 as $b, b as $bDefault, honey, beeSea };`);
            chai_1.assert.deepEqual(documents.get(cUrl).content, test_utils_1.heredoc `
        var c = sea = '🌊';
        const boat = '⛵️';

        var c$1 = {
          default: c,
          boat: boat
        };

        export { c$1 as $c, c as $cDefault, boat };`);
        }));
        test('shared bundle', () => __awaiter(this, void 0, void 0, function* () {
            const bundler = new bundler_1.Bundler({ analyzer });
            const { documents } = yield bundler.bundle(yield bundler.generateManifest([bUrl, dUrl]));
            chai_1.assert.deepEqual(documents.get(bUrl).content, test_utils_1.heredoc `
        import { $cDefault as sea } from './shared_bundle_1.js';

        var b = bee = '🐝';
        const honey = '🍯';
        const beeSea = bee + sea;

        var b$1 = {
          default: b,
          honey: honey,
          beeSea: beeSea
        };

        export { b$1 as $b, b as $bDefault, honey, beeSea };`);
            chai_1.assert.deepEqual(documents.get(dUrl).content, test_utils_1.heredoc `
        import { boat } from './shared_bundle_1.js';

        var d = deer = '🦌';
        const deerBoat = deer + boat;

        var d$1 = {
          default: d,
          deerBoat: deerBoat
        };

        export { d$1 as $d, d as $dDefault, deerBoat };`);
        }));
        test('shell bundle', () => __awaiter(this, void 0, void 0, function* () {
            const bundler = new bundler_1.Bundler({ analyzer, strategy: bundle_manifest_1.generateShellMergeStrategy(bUrl) });
            const { documents } = yield bundler.bundle(yield bundler.generateManifest([aUrl, bUrl]));
            chai_1.assert.deepEqual(documents.get(aUrl).content, test_utils_1.heredoc `
        import { $b as bee, $bDefault as bee__default, honey, $c as sea, $cDefault as sea__default, boat } from './b.js';


        console.log(bee__default, bee, honey);
        console.log(sea__default, sea, boat);`);
            chai_1.assert.deepEqual(documents.get(bUrl).content, test_utils_1.heredoc `
        var sea$1 = sea = '🌊';
        const boat = '⛵️';

        var c = {
          default: sea$1,
          boat: boat
        };

        var b = bee = '🐝';
        const honey = '🍯';
        const beeSea = bee + sea$1;

        var b$1 = {
          default: b,
          honey: honey,
          beeSea: beeSea
        };

        export { b$1 as $b, b as $bDefault, c as $c, sea$1 as $cDefault, honey, beeSea, boat };`);
        }));
    });
    suite('dynamic imports', () => {
        test('await expression', () => __awaiter(this, void 0, void 0, function* () {
            const analyzer = test_utils_1.inMemoryAnalyzer({
                'a.js': `
          export async function go() {
            const b = await import('./b.js');
            console.log(b.bee);
          }
        `,
                'b.js': `
          export const bee = '🐝';
        `,
            });
            const aUrl = analyzer.urlResolver.resolve('a.js');
            const bundler = new bundler_1.Bundler({ analyzer });
            const { documents } = yield bundler.bundle(yield bundler.generateManifest([aUrl]));
            chai_1.assert.deepEqual(documents.get(aUrl).content, test_utils_1.heredoc `
        async function go() {
          const b = await import('./b.js').then(({
            $b
          }) => $b);
          console.log(b.bee);
        }

        var a = {
          go: go
        };

        export { a as $a, go };`);
        }));
        test('expression statement', () => __awaiter(this, void 0, void 0, function* () {
            const analyzer = test_utils_1.inMemoryAnalyzer({
                'a.js': `
          import('./b.js').then((b) => console.log(b.bee));
        `,
                'b.js': `
          export const bee = '🐝';
        `,
            });
            const aUrl = analyzer.urlResolver.resolve('a.js');
            const bundler = new bundler_1.Bundler({ analyzer });
            const { documents } = yield bundler.bundle(yield bundler.generateManifest([aUrl]));
            chai_1.assert.deepEqual(documents.get(aUrl).content, test_utils_1.heredoc `
        import('./b.js').then(({
          $b
        }) => $b).then(b => console.log(b.bee));`);
        }));
    });
});
//# sourceMappingURL=es6-module-bundling-scenarios_test.js.map