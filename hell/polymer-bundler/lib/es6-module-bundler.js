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
const babel_generator_1 = require("babel-generator");
const babel = require("babel-types");
const analyzer_utils_1 = require("./analyzer-utils");
const es6_module_utils_1 = require("./es6-module-utils");
const url_utils_1 = require("./url-utils");
class Es6ModuleBundler {
    constructor(bundler, assignedBundle, manifest) {
        this.bundler = bundler;
        this.assignedBundle = assignedBundle;
        this.manifest = manifest;
    }
    bundle() {
        return __awaiter(this, void 0, void 0, function* () {
            this.document = yield this._prepareBundleDocument();
            const baseUrl = this.document.parsedDocument.baseUrl;
            const es6Rewriter = new es6_module_utils_1.Es6Rewriter(this.bundler, this.manifest, this.assignedBundle);
            const { code } = yield es6Rewriter.rollup(baseUrl, this.document.parsedDocument.contents);
            this.document =
                yield this.bundler.analyzeContents(this.assignedBundle.url, code);
            return {
                ast: this.document.parsedDocument.ast,
                content: this.document.parsedDocument.contents,
                files: [...this.assignedBundle.bundle.files]
            };
        });
    }
    /**
     * Generate a fresh document to bundle contents into.  If we're building a
     * bundle which is based on an existing file, we should load that file and
     * prepare it as the bundle document, otherwise we'll create a clean/empty
     * JS document.
     */
    _prepareBundleDocument() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.assignedBundle.bundle.files.has(this.assignedBundle.url) ||
                'a'.match(/a/)) {
                let bundleSource = babel.program([]);
                const sourceAnalysis = yield this.bundler.analyzer.analyze([...this.assignedBundle.bundle.files]);
                for (const sourceUrl of [...this.assignedBundle.bundle.files].sort()) {
                    const rebasedSourceUrl = url_utils_1.ensureLeadingDot(this.bundler.analyzer.urlResolver.relative(url_utils_1.stripUrlFileSearchAndHash(this.assignedBundle.url), sourceUrl));
                    const result = sourceAnalysis.getDocument(sourceUrl);
                    if (!result.successful) {
                        continue;
                    }
                    const moduleDocument = result.value.parsedDocument;
                    const moduleExports = es6_module_utils_1.getModuleExportNames(moduleDocument.ast);
                    const starExportName = es6_module_utils_1.getBundleModuleExportName(this.assignedBundle, sourceUrl, '*');
                    bundleSource.body.push(babel.importDeclaration([babel.importNamespaceSpecifier(babel.identifier(starExportName))], babel.stringLiteral(rebasedSourceUrl)));
                    if (moduleExports.size > 0) {
                        bundleSource.body.push(babel.exportNamedDeclaration(undefined, [babel.exportSpecifier(babel.identifier(starExportName), babel.identifier(starExportName))]));
                        bundleSource.body.push(babel.exportNamedDeclaration(undefined, [...moduleExports].map((e) => babel.exportSpecifier(babel.identifier(e), babel.identifier(es6_module_utils_1.getBundleModuleExportName(this.assignedBundle, sourceUrl, e)))), babel.stringLiteral(rebasedSourceUrl)));
                    }
                    if (es6_module_utils_1.hasDefaultModuleExport(moduleDocument.ast)) {
                        const defaultExportName = es6_module_utils_1.getBundleModuleExportName(this.assignedBundle, sourceUrl, 'default');
                        bundleSource.body.push(babel.importDeclaration([babel.importDefaultSpecifier(babel.identifier(defaultExportName))], babel.stringLiteral(rebasedSourceUrl)));
                        bundleSource.body.push(babel.exportNamedDeclaration(undefined, [babel.exportSpecifier(babel.identifier(defaultExportName), babel.identifier(defaultExportName))]));
                    }
                }
                const { code } = babel_generator_1.default(bundleSource);
                return this.bundler.analyzeContents(this.assignedBundle.url, code);
            }
            const analysis = yield this.bundler.analyzer.analyze([this.assignedBundle.url]);
            const document = analyzer_utils_1.getAnalysisDocument(analysis, this.assignedBundle.url);
            const ast = document.parsedDocument.ast;
            const exportNames = es6_module_utils_1.getModuleExportNames(ast);
            const exportNamesMap = new Map();
            for (const name of exportNames) {
                exportNamesMap.set(name, name);
            }
            if (es6_module_utils_1.hasDefaultModuleExport(ast)) {
                exportNamesMap.set('default', 'default');
            }
            exportNamesMap.set('*', '*');
            this.assignedBundle.bundle.bundledExports.set(this.assignedBundle.url, exportNamesMap);
            return document;
        });
    }
}
exports.Es6ModuleBundler = Es6ModuleBundler;
//# sourceMappingURL=es6-module-bundler.js.map