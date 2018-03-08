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
const dom5 = require("dom5");
const polymer_analyzer_1 = require("polymer-analyzer");
const bundle_manifest_1 = require("../bundle-manifest");
const bundler_1 = require("../bundler");
chai.config.showDiff = true;
const assert = chai.assert;
const preds = dom5.predicates;
const domModulePredicate = (id) => {
    return preds.AND(preds.hasAttrValue('id', id), preds.hasTagName('dom-module'));
};
suite('Bundler', () => {
    let analyzer;
    let bundler;
    const shell = resolve('shards/shop_style_project/shell.html');
    const common = resolve('shards/shop_style_project/common.html');
    const entrypoint1 = resolve('shards/shop_style_project/entrypoint1.html');
    const entrypoint2 = resolve('shards/shop_style_project/entrypoint2.html');
    beforeEach(() => {
        analyzer = undefined;
        bundler = undefined;
    });
    function getAnalyzer() {
        if (!analyzer) {
            analyzer = new polymer_analyzer_1.Analyzer({
                urlResolver: new polymer_analyzer_1.PackageUrlResolver({ packageDir: 'test/html' }),
                urlLoader: new polymer_analyzer_1.FSUrlLoader('test/html'),
            });
        }
        return analyzer;
    }
    function getBundler(opts) {
        if (!bundler) {
            if (!opts || !opts.analyzer) {
                opts = Object.assign({}, opts || {}, { analyzer: getAnalyzer() });
            }
            bundler = new bundler_1.Bundler(opts);
        }
        return bundler;
    }
    function resolve(url) {
        return getAnalyzer().resolveUrl(url);
    }
    function bundleMultiple(inputPath, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const bundler = getBundler(opts);
            const manifest = yield bundler.generateManifest(inputPath.map((e) => bundler.analyzer.resolveUrl(e)));
            return yield bundler.bundle(manifest);
        });
    }
    function assertContainsAndExcludes(doc, contains, excludes) {
        for (let test of contains) {
            const found = dom5.queryAll(doc, test);
            assert.equal(found.length, 1);
        }
        for (let test of excludes) {
            const found = dom5.queryAll(doc, test);
            assert.equal(found.length, 0);
        }
    }
    suite('Sharded builds', () => {
        test('with 3 entrypoints, all deps are in their places', () => __awaiter(this, void 0, void 0, function* () {
            const { documents } = yield bundleMultiple([common, entrypoint1, entrypoint2], { strategy: bundle_manifest_1.generateSharedDepsMergeStrategy(2) });
            assert.equal(documents.size, 4);
            const commonDoc = documents.get(common).ast;
            assert.isDefined(commonDoc);
            const entrypoint1Doc = documents.get(entrypoint1).ast;
            assert.isDefined(entrypoint1Doc);
            const entrypoint2Doc = documents.get(entrypoint2).ast;
            assert.isDefined(entrypoint2Doc);
            const sharedDoc = documents.get(resolve('shared_bundle_1.html')).ast;
            assert.isDefined(sharedDoc);
            const commonModule = domModulePredicate('common-module');
            const elOne = domModulePredicate('el-one');
            const elTwo = domModulePredicate('el-two');
            const depOne = domModulePredicate('el-dep1');
            const depTwo = domModulePredicate('el-dep2');
            // Check that all the dom modules are in their expected shards
            assertContainsAndExcludes(commonDoc, [commonModule], [elOne, elTwo, depOne, depTwo]);
            assertContainsAndExcludes(sharedDoc, [depOne], [elOne, elTwo, depTwo]);
            assertContainsAndExcludes(entrypoint1Doc, [elOne], [commonModule, elTwo, depOne, depTwo]);
            assertContainsAndExcludes(entrypoint2Doc, [elTwo, depTwo], [commonModule, elOne, depOne]);
        }));
        test('with 2 entrypoints and shell, all deps in their places', () => __awaiter(this, void 0, void 0, function* () {
            const analyzer = getAnalyzer();
            const { documents } = yield bundleMultiple([shell, entrypoint1, entrypoint2], {
                strategy: bundle_manifest_1.generateShellMergeStrategy(analyzer.resolveUrl(shell), 2)
            });
            assert.equal(documents.size, 3);
            const shellDoc = documents.get(shell).ast;
            assert.isDefined(shellDoc);
            const entrypoint1Doc = documents.get(entrypoint1).ast;
            assert.isDefined(entrypoint1Doc);
            const entrypoint2Doc = documents.get(entrypoint2).ast;
            assert.isDefined(entrypoint2Doc);
            const shellDiv = dom5.predicates.hasAttrValue('id', 'shell');
            const shellImport = dom5.predicates.AND(dom5.predicates.hasTagName('link'), dom5.predicates.hasSpaceSeparatedAttrValue('rel', 'import'), dom5.predicates.hasAttrValue('href', 'shell.html'));
            const commonModule = domModulePredicate('common-module');
            const elOne = domModulePredicate('el-one');
            const elTwo = domModulePredicate('el-two');
            const depOne = domModulePredicate('el-dep1');
            const depTwo = domModulePredicate('el-dep2');
            // Check that all the dom modules are in their expected shards
            assertContainsAndExcludes(shellDoc, [shellDiv, commonModule, depOne], [elOne, elTwo, depTwo]);
            assertContainsAndExcludes(entrypoint1Doc, [elOne], [commonModule, elTwo, depOne, depTwo, shellImport]);
            assertContainsAndExcludes(entrypoint2Doc, [elTwo, depTwo], [commonModule, elOne, depOne, shellImport]);
        }));
    });
});
//# sourceMappingURL=shards_test.js.map