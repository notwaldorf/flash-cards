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
const child_process_1 = require("child_process");
const fs = require("fs");
const os = require("os");
const url_utils_1 = require("../url-utils");
chai.config.showDiff = true;
const assert = chai.assert;
suite('polymer-bundler CLI', () => {
    const getTempDir = () => fs.mkdtempSync(url_utils_1.resolvePath(url_utils_1.ensureTrailingSlash(os.tmpdir())));
    const cliPath = url_utils_1.resolvePath(__dirname, '../bin/polymer-bundler.js');
    test('uses the current working folder as loader root', () => __awaiter(this, void 0, void 0, function* () {
        const projectRoot = url_utils_1.resolvePath('test/html');
        const stdout = child_process_1.execSync(`cd ${projectRoot} && ` +
            `node ${cliPath} --inline-scripts --inline-css absolute-paths.html`)
            .toString();
        assert.include(stdout, '.absolute-paths-style');
        assert.include(stdout, 'hello from /absolute-paths/script.js');
    }));
    test('uses the --root value option as loader root', () => __awaiter(this, void 0, void 0, function* () {
        const stdout = child_process_1.execSync([
            `node ${cliPath} --root test/html --inline-scripts --inline-css absolute-paths.html`,
        ].join(' && '))
            .toString();
        assert.include(stdout, '.absolute-paths-style');
        assert.include(stdout, 'hello from /absolute-paths/script.js');
    }));
    test('Does not inline if --inline-scripts or --inline-css are not set', () => __awaiter(this, void 0, void 0, function* () {
        const stdout = child_process_1.execSync([
            `node ${cliPath} test/html/external.html`,
        ].join(' && '))
            .toString();
        assert.include(stdout, 'href="external/external.css"');
        assert.include(stdout, 'src="external/external.js"');
    }));
    suite('--out-dir', () => {
        test('writes to the dir even for single bundle', () => __awaiter(this, void 0, void 0, function* () {
            const projectRoot = url_utils_1.resolvePath(__dirname, '../../test/html');
            const tempdir = getTempDir();
            child_process_1.execSync(`cd ${projectRoot} && ` +
                `node ${cliPath} absolute-paths.html ` +
                `--out-dir ${tempdir}`)
                .toString();
            const html = fs.readFileSync(url_utils_1.resolvePath(tempdir, 'absolute-paths.html'))
                .toString();
            assert.notEqual(html, '');
        }));
        test('a single in-html file with deep path stays deep', () => __awaiter(this, void 0, void 0, function* () {
            const projectRoot = url_utils_1.resolvePath(__dirname, '../../test');
            const tempdir = getTempDir();
            child_process_1.execSync(`cd ${projectRoot} && ` +
                `node ${cliPath} html/default.html ` +
                `--out-dir ${tempdir}`)
                .toString();
            const html = fs.readFileSync(url_utils_1.resolvePath(tempdir, 'html/default.html')).toString();
            assert.notEqual(html, '');
        }));
    });
    suite('--manifest-out', () => {
        test('writes out the bundle manifest to given path', () => __awaiter(this, void 0, void 0, function* () {
            const projectRoot = url_utils_1.resolvePath(__dirname, '../../test/html');
            const tempdir = getTempDir();
            const manifestPath = url_utils_1.resolvePath(tempdir, 'bundle-manifest.json');
            child_process_1.execSync(`cd ${projectRoot} && ` +
                `node ${cliPath} --inline-scripts --inline-css absolute-paths.html ` +
                `--manifest-out ${manifestPath}`)
                .toString();
            const manifestJson = fs.readFileSync(manifestPath).toString();
            const manifest = JSON.parse(manifestJson);
            assert.deepEqual(manifest, {
                'absolute-paths.html': [
                    'absolute-paths.html',
                    'absolute-paths/import.html',
                    'absolute-paths/script.js',
                    'absolute-paths/style.css',
                ],
                '_missing': [
                    'this/does/not/exist.html',
                    'this/does/not/exist.js',
                    'this/does/not/exist.css',
                ]
            });
        }));
        test('manifest includes all files including basis', () => __awaiter(this, void 0, void 0, function* () {
            const projectRoot = url_utils_1.resolvePath(__dirname, '../../test/html/imports');
            const tempdir = getTempDir();
            const manifestPath = url_utils_1.resolvePath(tempdir, 'bundle-manifest.json');
            child_process_1.execSync(`cd ${projectRoot} && ` +
                `node ${cliPath} --inline-scripts --inline-css ` +
                `--in-html eagerly-importing-a-fragment.html ` +
                `--in-html importing-fragments/fragment-a.html ` +
                `--in-html importing-fragments/fragment-b.html ` +
                `--in-html importing-fragments/shell.html ` +
                `--shell importing-fragments/shell.html ` +
                `--out-dir ${tempdir}/bundled/ ` +
                `--manifest-out ${manifestPath}`)
                .toString();
            const manifestJson = fs.readFileSync(manifestPath).toString();
            const manifest = JSON.parse(manifestJson);
            assert.deepEqual(manifest, {
                'eagerly-importing-a-fragment.html': [
                    'eagerly-importing-a-fragment.html',
                ],
                'importing-fragments/fragment-a.html': [
                    'importing-fragments/fragment-a.html',
                ],
                'importing-fragments/fragment-b.html': [
                    'importing-fragments/fragment-b.html',
                ],
                'importing-fragments/shell.html': [
                    'importing-fragments/shell.html',
                    'importing-fragments/shared-util.html',
                ],
            });
        }));
    });
    suite('--redirect', () => {
        test('handles URLs with arbitrary protocols and hosts', () => __awaiter(this, void 0, void 0, function* () {
            const projectRoot = url_utils_1.resolvePath(__dirname, '../../test/html')
                .replace(/\\/g, '/');
            const tempdir = getTempDir();
            const manifestPath = url_utils_1.resolvePath(tempdir, 'bundle-manifest.json');
            const stdout = child_process_1.execSync([
                `cd ${projectRoot}`,
                `node ${cliPath} myapp://app/index.html ` +
                    `--redirect="myapp://app/|${projectRoot}/url-redirection/" ` +
                    `--redirect="vendor://|${projectRoot}/bower_components/" ` +
                    `--manifest-out ${manifestPath}`
            ].join(' && '))
                .toString();
            assert.include(stdout, 'This is an external dependency');
            assert.include(stdout, 'id="home-page"');
            assert.include(stdout, 'id="settings-page"');
            const manifestJson = fs.readFileSync(manifestPath).toString();
            const manifest = JSON.parse(manifestJson);
            assert.deepEqual(manifest, {
                'myapp://app/index.html': [
                    'myapp://app/index.html',
                    'myapp://app/home.html',
                    'vendor://external-dependency/external-dependency.html',
                    'myapp://app/settings.html'
                ],
            });
        }));
    });
});
//# sourceMappingURL=polymer-bundler_test.js.map