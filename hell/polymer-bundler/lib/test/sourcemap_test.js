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
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
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
const path = require("path");
const polymer_analyzer_1 = require("polymer-analyzer");
const source_map_1 = require("source-map");
const bundler_1 = require("../bundler");
const source_map_2 = require("../source-map");
const url_utils_1 = require("../url-utils");
chai.config.showDiff = true;
const assert = chai.assert;
const matchers = require('../matchers');
suite('Bundler', () => {
    let bundler;
    function bundle(inputPath, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            // Don't modify options directly because test-isolation problems occur.
            const bundlerOpts = Object.assign({}, opts || {});
            if (!bundlerOpts.analyzer) {
                bundlerOpts.analyzer = new polymer_analyzer_1.Analyzer({ urlLoader: new polymer_analyzer_1.FSUrlLoader(path.dirname(inputPath)) });
                inputPath = path.basename(inputPath);
            }
            bundler = new bundler_1.Bundler(bundlerOpts);
            const manifest = yield bundler.generateManifest([bundler.analyzer.resolveUrl(inputPath)]);
            const { documents } = yield bundler.bundle(manifest);
            return documents.get(bundler.analyzer.resolveUrl(inputPath));
        });
    }
    function getLine(original, lineNum) {
        const lines = original.split('\n');
        return lines[lineNum - 1];
    }
    function testMapping(sourcemap, html, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const consumer = new source_map_1.SourceMapConsumer(sourcemap);
            let foundMapping = false;
            const mappings = [];
            consumer.eachMapping(mapping => mappings.push(mapping));
            for (let j = 0; j < mappings.length; j++) {
                if (mappings[j].name === name) {
                    foundMapping = true;
                    const generatedLine = getLine(html, mappings[j].generatedLine);
                    assert(generatedLine, 'generated line not found');
                    assert.equal(mappings[j].generatedColumn, generatedLine.indexOf(name), 'generated column');
                    const originalContents = yield urlLoader.load(mappings[j].source);
                    const originalLine = getLine(originalContents, mappings[j].originalLine);
                    assert(originalLine, 'original line not found');
                    assert.equal(mappings[j].originalColumn, originalLine.indexOf(name), 'original column');
                }
            }
        });
    }
    const basePath = url_utils_1.resolvePath('test/html/sourcemaps/');
    const urlLoader = new polymer_analyzer_1.FSUrlLoader(basePath);
    const analyzer = new polymer_analyzer_1.Analyzer({
        urlResolver: new polymer_analyzer_1.PackageUrlResolver({ packageDir: basePath }),
        urlLoader: urlLoader
    });
    suite('Sourcemaps', () => {
        test('inline maps are compiled correctly', () => __awaiter(this, void 0, void 0, function* () {
            const { ast: doc, content: compiledHtml } = yield bundle('inline.html', { inlineScripts: true, sourcemaps: true, analyzer: analyzer });
            assert(doc);
            const inlineScripts = dom5.queryAll(doc, matchers.inlineJavascript);
            assert.equal(inlineScripts.length, 3);
            for (let i = 0; i < inlineScripts.length; i++) {
                if (i === 5) {
                    continue;
                }
                const sourcemap = yield source_map_2.getExistingSourcemap(analyzer, 'inline.html', dom5.getTextContent(inlineScripts[i]));
                assert(sourcemap, 'scripts found');
                yield testMapping(sourcemap, compiledHtml, 'console');
            }
        }));
        test('external map files are compiled correctly', () => __awaiter(this, void 0, void 0, function* () {
            const { ast: doc, content: compiledHtml } = yield bundle('external.html', { inlineScripts: true, sourcemaps: true, analyzer: analyzer });
            assert(doc);
            const inlineScripts = dom5.queryAll(doc, matchers.inlineJavascript);
            assert.equal(inlineScripts.length, 3);
            for (let i = 0; i < inlineScripts.length; i++) {
                const sourcemap = yield source_map_2.getExistingSourcemap(analyzer, 'external.html', dom5.getTextContent(inlineScripts[i]));
                assert(sourcemap, 'scripts found');
                yield testMapping(sourcemap, compiledHtml, 'console');
            }
        }));
        test('mix of inline and external maps are compiled correctly', () => __awaiter(this, void 0, void 0, function* () {
            const { ast: doc, content: compiledHtml } = yield bundle('combined.html', { inlineScripts: true, sourcemaps: true, analyzer: analyzer });
            assert(doc);
            const inlineScripts = dom5.queryAll(doc, matchers.inlineJavascript);
            assert.equal(inlineScripts.length, 7);
            for (let i = 0; i < inlineScripts.length; i++) {
                const sourcemap = yield source_map_2.getExistingSourcemap(analyzer, 'combined.html', dom5.getTextContent(inlineScripts[i]));
                assert(sourcemap, 'scripts found');
                yield testMapping(sourcemap, compiledHtml, 'console');
            }
        }));
        test('invalid maps are compiled correctly', () => __awaiter(this, void 0, void 0, function* () {
            const { ast: doc, content: compiledHtml } = yield bundle('invalid.html', { inlineScripts: true, sourcemaps: true, analyzer: analyzer });
            assert(doc);
            const inlineScripts = dom5.queryAll(doc, matchers.inlineJavascript);
            assert.equal(inlineScripts.length, 2);
            for (let i = 0; i < inlineScripts.length; i++) {
                const sourcemap = yield source_map_2.getExistingSourcemap(analyzer, 'invalid.html', dom5.getTextContent(inlineScripts[i]));
                assert(sourcemap, 'scripts found');
                yield testMapping(sourcemap, compiledHtml, 'console');
            }
        }));
    });
});
//# sourceMappingURL=sourcemap_test.js.map