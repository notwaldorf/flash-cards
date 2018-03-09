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
const chai = require("chai");
const parse5 = require("parse5");
const bundler_1 = require("../bundler");
const html_bundler_1 = require("../html-bundler");
const parse5_utils_1 = require("../parse5-utils");
const url_utils_1 = require("../url-utils");
const test_utils_1 = require("./test-utils");
chai.config.showDiff = true;
const assert = chai.assert;
const stripSpace = (html) => html.replace(/>\s+/g, '>').replace(/>/g, '>\n').trim();
suite('HtmlBundler', () => {
    test('inline es6 modules', () => __awaiter(this, void 0, void 0, function* () {
        const analyzer = test_utils_1.inMemoryAnalyzer({
            'multiple-inline-modules.html': `
        <script type="module">
          import {A, B} from './abc.js';
          console.log(A,B);
        </script>

        <script type="module">
          import {B, C} from './abc.js';
          import {Y} from './xyz.js';
          console.log(B,C,Y);
        </script>

        <script type="module">
          import {D,F} from './def.js';
          console.log(D,F);
        </script>
      `,
            'abc.js': `
        import{upcase} from './upcase.js';
        export const A = upcase('a');
        export const B = upcase('b');
        export const C = upcase('c');
      `,
            'def.js': `
        import{X, Y, Z} from './xyz.js';
        const D = X + X;
        const E = Y + Y;
        const F = Z + Z;
        export { D, E, F };
      `,
            'omgz.js': `
        import {upcase} from './upcase.js';
        export const Z = upcase('omgz');
      `,
            'upcase.js': `
        export function upcase(str) {
          return str.toUpperCase();
        }
      `,
            'xyz.js': `
        import{upcase} from './upcase.js';
        export const X = upcase('x');
        export const Y = upcase('y');
        export const Z = upcase('z');
      `,
        });
        const bundler = new bundler_1.Bundler({ analyzer });
        const multipleInlineBundlesUrl = analyzer.resolveUrl('multiple-inline-modules.html');
        const manifest = yield bundler.generateManifest([multipleInlineBundlesUrl]);
        const multipleInlineBundlesBundle = manifest.getBundleForFile(multipleInlineBundlesUrl);
        const multipleInlineBundlesBundleBundler = new html_bundler_1.HtmlBundler(bundler, multipleInlineBundlesBundle, manifest);
        const multipleInlineBundlesBundleDocument = yield multipleInlineBundlesBundleBundler.bundle();
        assert.deepEqual(multipleInlineBundlesBundleDocument.content, test_utils_1.heredoc `
      <script type="module">
      import { A, B } from './shared_bundle_1.js';

      console.log(A, B);
      </script>

      <script type="module">
      import { B, C, Y } from './shared_bundle_1.js';


      console.log(B, C, Y);
      </script>

      <script type="module">
      import { X, Y, Z } from './shared_bundle_1.js';

      const D = X + X;
      const E = Y + Y;
      const F = Z + Z;

      console.log(D, F);
      </script>
    `);
    }));
    suite('unit tests of private rewriting methods', () => {
        const importDocUrl = url_utils_1.getFileUrl('foo/bar/my-element/index.html');
        const mainDocUrl = url_utils_1.getFileUrl('foo/bar/index.html');
        let bundler;
        let htmlBundler;
        let manifest;
        let bundle;
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            bundler = new bundler_1.Bundler();
            yield bundler.analyzeContents(mainDocUrl, '', true);
            manifest = yield bundler.generateManifest([mainDocUrl]);
            bundle = manifest.getBundleForFile(mainDocUrl);
            htmlBundler = new html_bundler_1.HtmlBundler(bundler, bundle, manifest);
        }));
        suite('Path rewriting', () => __awaiter(this, void 0, void 0, function* () {
            test('Rewrite URLs', () => __awaiter(this, void 0, void 0, function* () {
                const css = `
          x-element {
            background-image: url(foo.jpg);
          }
          x-bar {
            background-image: url(data:xxxxx);
          }
          x-quuz {
            background-image: url(\'https://foo.bar/baz.jpg\');
          }
        `;
                const expected = `
          x-element {
            background-image: url("my-element/foo.jpg");
          }
          x-bar {
            background-image: url("data:xxxxx");
          }
          x-quuz {
            background-image: url("https://foo.bar/baz.jpg");
          }
        `;
                const actual = htmlBundler['_rewriteCssTextBaseUrl'](css, importDocUrl, mainDocUrl);
                assert.deepEqual(actual, expected);
            }));
            suite('Resolve Paths', () => {
                test('excluding template elements', () => {
                    const html = `
            <link rel="import" href="../polymer/polymer.html">
            <link rel="stylesheet" href="my-element.css">
            <dom-module id="my-element">
            <template>
            <img src="neato.gif">
            <style>:host { background-image: url(background.svg); }</style>
            <div style="background-image: url(background.svg)"></div>
            </template>
            <script>Polymer({is: "my-element"})</script>
            </dom-module>
            <template is="dom-bind">
            <style>.outside-dom-module { background-image: url(outside-dom-module.png); }</style>
            </template>
            <style>.outside-template { background-image: url(outside-template.png); }</style>`;
                    const expected = `
            <link rel="import" href="polymer/polymer.html">
            <link rel="stylesheet" href="my-element/my-element.css">
            <dom-module id="my-element" assetpath="my-element/">
            <template>
            <img src="neato.gif">
            <style>:host { background-image: url(background.svg); }</style>
            <div style="background-image: url(background.svg)"></div>
            </template>
            <script>Polymer({is: "my-element"})</script>
            </dom-module>
            <template is="dom-bind">
            <style>.outside-dom-module { background-image: url(outside-dom-module.png); }</style>
            </template>
            <style>.outside-template { background-image: url("my-element/outside-template.png"); }</style>
          `;
                    const ast = parse5_utils_1.parse(html);
                    bundler.rewriteUrlsInTemplates = false;
                    htmlBundler['_rewriteAstBaseUrl'](ast, importDocUrl, mainDocUrl);
                    const actual = parse5.serialize(ast);
                    assert.deepEqual(stripSpace(actual), stripSpace(expected), 'relative');
                });
                test('inside template elements (rewriteUrlsInTemplates=true)', () => {
                    const html = `
              <link rel="import" href="../polymer/polymer.html">
              <link rel="stylesheet" href="my-element.css">
              <dom-module id="my-element">
              <template>
              <style>:host { background-image: url(background.svg); }</style>
              <div style="background-image: url(background.svg)"></div>
              </template>
              <script>Polymer({is: "my-element"})</script>
              </dom-module>
              <template is="dom-bind">
              <style>.something { background-image: url(something.png); }</style>
              </template>
              <style>.outside-template { background-image: url(outside-template.png); }</style>
            `;
                    const expected = `
              <link rel="import" href="polymer/polymer.html">
              <link rel="stylesheet" href="my-element/my-element.css">
              <dom-module id="my-element" assetpath="my-element/">
              <template>
              <style>:host { background-image: url("my-element/background.svg"); }</style>
              <div style="background-image: url(&quot;my-element/background.svg&quot;)"></div>
              </template>
              <script>Polymer({is: "my-element"})</script>
              </dom-module>
              <template is="dom-bind">
              <style>.something { background-image: url("my-element/something.png"); }</style>
              </template>
              <style>.outside-template { background-image: url("my-element/outside-template.png"); }</style>
            `;
                    const ast = parse5_utils_1.parse(html);
                    bundler.rewriteUrlsInTemplates = true;
                    htmlBundler['_rewriteAstBaseUrl'](ast, importDocUrl, mainDocUrl);
                    const actual = parse5.serialize(ast);
                    assert.deepEqual(stripSpace(actual), stripSpace(expected), 'relative');
                });
            });
            test('Leave Templated URLs', () => {
                const base = `
          <a href="{{foo}}"></a>
          <img src="[[bar]]">
        `;
                const ast = parse5_utils_1.parse(base);
                htmlBundler['_rewriteAstBaseUrl'](ast, importDocUrl, mainDocUrl);
                const actual = parse5.serialize(ast);
                assert.deepEqual(stripSpace(actual), stripSpace(base), 'templated urls');
            });
        }));
        suite('Document <base> tag emulation', () => {
            test('Resolve Paths with <base href> having a trailing /', () => {
                const htmlBase = `
          <base href="components/my-element/">
          <link rel="import" href="../polymer/polymer.html">
          <link rel="stylesheet" href="my-element.css">
          <dom-module id="my-element">
          <template>
          <style>:host { background-image: url(background.svg); }</style>
          <img src="bloop.gif">
          </template>
          </dom-module>
          <script>Polymer({is: "my-element"})</script>`;
                const expectedBase = `
          <link rel="import" href="components/polymer/polymer.html">
          <link rel="stylesheet" href="components/my-element/my-element.css">
          <dom-module id="my-element" assetpath="components/my-element/">
          <template>
          <style>:host { background-image: url(background.svg); }</style>
          <img src="bloop.gif">
          </template>
          </dom-module>
          <script>Polymer({is: "my-element"})</script>`;
                const ast = parse5_utils_1.parse(htmlBase);
                htmlBundler['_rewriteAstToEmulateBaseTag'](ast, url_utils_1.getFileUrl('the/doc/url'));
                const actual = parse5.serialize(ast);
                assert.deepEqual(stripSpace(actual), stripSpace(expectedBase), 'base');
            });
            // Old vulcanize did the wrong thing with base href that had no trailing
            // slash, so this proves the behavior of bundler is correct in this case.
            test('Resolve Paths with <base href> with no trailing slash', () => {
                const htmlBase = `
          <base href="components/my-element">
          <link rel="import" href="../polymer/polymer.html">
          <link rel="stylesheet" href="my-element.css">
          <dom-module id="my-element">
          <template>
          <style>:host { background-image: url(background.svg); }</style>
          <img src="bloop.gif">
          </template>
          </dom-module>
          <script>Polymer({is: "my-element"})</script>
        `;
                const expectedBase = `
          <link rel="import" href="polymer/polymer.html">
          <link rel="stylesheet" href="components/my-element.css">
          <dom-module id="my-element" assetpath="components/">
          <template>
          <style>:host { background-image: url(background.svg); }</style>
          <img src="bloop.gif">
          </template>
          </dom-module>
          <script>Polymer({is: "my-element"})</script>
        `;
                const ast = parse5_utils_1.parse(htmlBase);
                htmlBundler['_rewriteAstToEmulateBaseTag'](ast, url_utils_1.getFileUrl('the/doc/url'));
                const actual = parse5.serialize(ast);
                assert.deepEqual(stripSpace(actual), stripSpace(expectedBase), 'base');
            });
            test('Apply <base target> to all links and forms without target', () => {
                const htmlBase = `
          <base target="_blank">
          <a href="foo.html">LINK</a>
          <a href="bar.html" target="leavemealone">OTHERLINK</a>
          <form action="doit"></form>
          <form action="doitagain" target="leavemealone"></form>
          <div>Just a div.  I don't need a target</div>
        `;
                const expectedBase = `
          <a href="foo.html" target="_blank">LINK</a>
          <a href="bar.html" target="leavemealone">OTHERLINK</a>
          <form action="doit" target="_blank"></form>
          <form action="doitagain" target="leavemealone"></form>
          <div>Just a div.  I don't need a target</div>
        `;
                const ast = parse5_utils_1.parse(htmlBase);
                htmlBundler['_rewriteAstToEmulateBaseTag'](ast, url_utils_1.getFileUrl('the/doc/url'));
                const actual = parse5.serialize(ast);
                assert.deepEqual(stripSpace(actual), stripSpace(expectedBase), 'base target');
            });
        });
    });
});
//# sourceMappingURL=html-bundler_test.js.map