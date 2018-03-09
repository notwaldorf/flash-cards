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
const babel_traverse_1 = require("babel-traverse");
const babel = require("babel-types");
const clone = require("clone");
const rollup_1 = require("rollup");
const analyzer_utils_1 = require("./analyzer-utils");
const babel_utils_1 = require("./babel-utils");
const url_utils_1 = require("./url-utils");
const utils_1 = require("./utils");
/**
 * Looks up and/or defines the unique name for an item exported with the given
 * name in a module within a in a bundle.
 */
function getBundleModuleExportName(bundle, moduleUrl, name) {
    let basisBundle = false;
    // When the bundle contains a file with same URL as the bundle, then that
    // module's exports will remain unchanged.
    if (bundle.bundle.files.has(bundle.url) && moduleUrl === bundle.url) {
        //    basisBundle = true;
    }
    let moduleExports = bundle.bundle.bundledExports.get(moduleUrl);
    const bundledExports = bundle.bundle.bundledExports;
    if (!moduleExports) {
        moduleExports = new Map();
        bundledExports.set(moduleUrl, moduleExports);
    }
    let exportName = moduleExports.get(name);
    if (!exportName) {
        let trialName = name;
        if (!basisBundle) {
            let moduleFileNameIdentifier = '$' + utils_1.camelCase(url_utils_1.getFileName(moduleUrl).replace(/\.[a-z]+$/, ''));
            trialName =
                trialName.replace(/^default$/, `${moduleFileNameIdentifier}Default`)
                    .replace(/^\*$/, moduleFileNameIdentifier)
                    .replace(/[^a-z0-9_]/gi, '$');
        }
        while (!exportName) {
            if ([...bundledExports.values()].every((map) => [...map.values()].indexOf(trialName) === -1)) {
                exportName = trialName;
            }
            else {
                if (trialName.match(/\$[0-9]+$/)) {
                    trialName = trialName.replace(/[0-9]+$/, (v) => `${parseInt(v) + 1}`);
                }
                else {
                    trialName = `${trialName}$1`;
                }
            }
        }
        moduleExports.set(name, exportName);
    }
    return exportName;
}
exports.getBundleModuleExportName = getBundleModuleExportName;
function hasDefaultModuleExport(node) {
    let hasDefaultModuleExport = false;
    babel_traverse_1.default(node, {
        noScope: true,
        ExportDefaultDeclaration: {
            enter(path) {
                hasDefaultModuleExport = true;
                path.stop();
            }
        }
    });
    return hasDefaultModuleExport;
}
exports.hasDefaultModuleExport = hasDefaultModuleExport;
function getModuleExportNames(node) {
    const exportedNames = [];
    babel_traverse_1.default(node, {
        noScope: true,
        ExportNamedDeclaration: {
            enter(path) {
                const exportNode = path.node;
                exportedNames.push(...getModuleExportIdentifiers(...exportNode.specifiers));
                exportedNames.push(...getModuleExportIdentifiers(exportNode.declaration));
            }
        }
    });
    return new Set(exportedNames);
}
exports.getModuleExportNames = getModuleExportNames;
function getModuleExportIdentifiers(...nodes) {
    const identifiers = [];
    for (const node of nodes) {
        if (babel.isArrayPattern(node)) {
            identifiers.push(...getModuleExportIdentifiers(...node.elements));
        }
        if (babel.isClassDeclaration(node) || babel.isFunctionDeclaration(node) ||
            babel.isVariableDeclarator(node)) {
            identifiers.push(...getModuleExportIdentifiers(node.id));
        }
        if (babel.isExportSpecifier(node)) {
            identifiers.push(...getModuleExportIdentifiers(node.exported));
        }
        if (babel.isIdentifier(node)) {
            identifiers.push(node.name);
        }
        if (babel.isObjectPattern(node)) {
            identifiers.push(...getModuleExportIdentifiers(...node.properties));
        }
        if (babel.isObjectProperty(node)) {
            identifiers.push(...getModuleExportIdentifiers(node.value));
        }
        if (babel.isVariableDeclaration(node)) {
            identifiers.push(...getModuleExportIdentifiers(...node.declarations));
        }
    }
    return identifiers;
}
function reserveBundleModuleExportNames(analyzer, manifest) {
    return __awaiter(this, void 0, void 0, function* () {
        const es6ModuleBundles = [...manifest.bundles]
            .map(([url, bundle]) => ({ url, bundle }))
            .filter(({ bundle }) => bundle.type === 'es6-module');
        const analysis = yield analyzer.analyze(es6ModuleBundles.map(({ url }) => url));
        for (const { url, bundle } of es6ModuleBundles) {
            if (bundle.files.has(url)) {
                const document = analyzer_utils_1.getAnalysisDocument(analysis, url);
                for (const exportName of getModuleExportNames(document.parsedDocument.ast)) {
                    getBundleModuleExportName({ url, bundle }, url, exportName);
                }
            }
        }
    });
}
exports.reserveBundleModuleExportNames = reserveBundleModuleExportNames;
/**
 * Utility class to rollup/merge ES6 modules code using rollup and rewrite
 * import statements to point to appropriate bundles.
 */
class Es6Rewriter {
    constructor(bundler, manifest, bundle) {
        this.bundler = bundler;
        this.manifest = manifest;
        this.bundle = bundle;
    }
    rollup(url, code) {
        return __awaiter(this, void 0, void 0, function* () {
            // This is a synthetic module specifier used to identify the code to rollup
            // and differentiate it from the a request to contents of the document at
            // the actual given url which should load from the analyzer.
            const input = '*bundle*';
            const analysis = yield this.bundler.analyzer.analyze([...this.bundle.bundle.files]);
            const external = [];
            for (const [url, bundle] of this.manifest.bundles) {
                if (url !== this.bundle.url) {
                    external.push(...[...bundle.files, url]);
                }
            }
            // For each document loaded from the analyzer, we build a map of the
            // original specifiers to the resolved URLs since we want to use analyzer
            // resolutions for such things as bare module specifiers.
            const jsImportResolvedUrls = new Map();
            const rollupBundle = yield rollup_1.rollup({
                input,
                external,
                onwarn: (warning) => { },
                treeshake: false,
                plugins: [
                    {
                        name: 'analyzerPlugin',
                        resolveId: (importee, importer) => {
                            if (importee === input) {
                                return input;
                            }
                            if (importer) {
                                if (jsImportResolvedUrls.has(importer)) {
                                    const resolutions = jsImportResolvedUrls.get(importer);
                                    if (resolutions.has(importee)) {
                                        return resolutions.get(importee);
                                    }
                                }
                                return this.bundler.analyzer.urlResolver.resolve(importer === input ? url : importer, importee);
                            }
                            return this.bundler.analyzer.urlResolver.resolve(importee);
                        },
                        load: (id) => {
                            if (id === input) {
                                return code;
                            }
                            if (this.bundle.bundle.files.has(id)) {
                                const document = analyzer_utils_1.getAnalysisDocument(analysis, id);
                                if (!jsImportResolvedUrls.has(id)) {
                                    const jsImports = document.getFeatures({
                                        kind: 'js-import',
                                        imported: false,
                                        externalPackages: true,
                                        excludeBackreferences: true,
                                    });
                                    const resolutions = new Map();
                                    jsImportResolvedUrls.set(id, resolutions);
                                    for (const jsImport of jsImports) {
                                        const source = jsImport.astNode && jsImport.astNode.source &&
                                            jsImport.astNode.source.value;
                                        if (source) {
                                            resolutions.set(source, jsImport.document.url);
                                        }
                                    }
                                }
                                return document.parsedDocument.contents;
                            }
                        },
                    },
                ],
                experimentalDynamicImport: true,
            });
            const { code: rolledUpCode } = yield rollupBundle.generate({
                format: 'es',
                freeze: false,
            });
            const babelFile = babel_utils_1.parseModuleFile(url, rolledUpCode);
            this._rewriteImportStatements(url, babelFile);
            this._deduplicateImportStatements(babelFile);
            const { code: rewrittenCode } = babel_utils_1.serialize(babelFile);
            return { code: rewrittenCode, map: undefined };
        });
    }
    _deduplicateImportStatements(node) {
        const importDeclarations = new Map();
        babel_traverse_1.default(node, {
            noScope: true,
            ImportDeclaration: {
                enter(path) {
                    const importDeclaration = path.node;
                    if (!babel.isImportDeclaration(importDeclaration)) {
                        return;
                    }
                    const source = babel_utils_1.getNodeValue(importDeclaration.source);
                    if (!source) {
                        return;
                    }
                    const hasNamespaceSpecifier = importDeclaration.specifiers.some((s) => babel.isImportNamespaceSpecifier(s));
                    const hasDefaultSpecifier = importDeclaration.specifiers.some((s) => babel.isImportDefaultSpecifier(s));
                    if (!importDeclarations.has(source) && !hasNamespaceSpecifier &&
                        !hasDefaultSpecifier) {
                        importDeclarations.set(source, importDeclaration);
                    }
                    else if (importDeclarations.has(source)) {
                        const existingDeclaration = importDeclarations.get(source);
                        for (const specifier of importDeclaration.specifiers) {
                            existingDeclaration.specifiers.push(specifier);
                        }
                        path.remove();
                    }
                }
            }
        });
    }
    _rewriteImportStatements(baseUrl, node) {
        const this_ = this;
        babel_traverse_1.default(node, {
            noScope: true,
            // Dynamic import() syntax doesn't have full type support yet, so we
            // have to use generic `enter` and walk all nodes unti that's fixed.
            // TODO(usergenic): Switch this to the `Import: { enter }` style
            // after dynamic imports fully supported.
            enter(path) {
                if (path.node.type === 'Import') {
                    this_._rewriteDynamicImport(baseUrl, node, path.node);
                }
            },
        });
        babel_traverse_1.default(node, {
            noScope: true,
            ImportDeclaration: {
                enter(path) {
                    const importDeclaration = path.node;
                    const source = babel_utils_1.getNodeValue(importDeclaration.source);
                    const sourceBundle = this_.manifest.getBundleForFile(source);
                    // If there is no import bundle, then this URL is not bundled (maybe
                    // excluded or something) so we should just ensure the URL is
                    // converted back to a relative URL.
                    if (!sourceBundle) {
                        importDeclaration.source.value =
                            this_.bundler.analyzer.urlResolver.relative(baseUrl, source);
                        return;
                    }
                    for (const specifier of importDeclaration.specifiers) {
                        if (babel.isImportSpecifier(specifier)) {
                            this_._rewriteImportSpecifierName(specifier, source, sourceBundle);
                        }
                        if (babel.isImportDefaultSpecifier(specifier)) {
                            this_._rewriteImportDefaultSpecifier(specifier, source, sourceBundle);
                        }
                        if (babel.isImportNamespaceSpecifier(specifier)) {
                            this_._rewriteImportNamespaceSpecifier(specifier, source, sourceBundle);
                        }
                    }
                    importDeclaration.source.value =
                        url_utils_1.ensureLeadingDot(this_.bundler.analyzer.urlResolver.relative(baseUrl, sourceBundle.url));
                }
            }
        });
    }
    _rewriteDynamicImport(baseUrl, root, importNode) {
        const importNodePath = babel_utils_1.getNodePath(root, importNode);
        if (!importNodePath) {
            return;
        }
        const importCallExpression = importNodePath.parent;
        if (!importCallExpression ||
            !babel.isCallExpression(importCallExpression)) {
            return;
        }
        const importCallArgument = importCallExpression.arguments[0];
        if (!babel.isStringLiteral(importCallArgument)) {
            return;
        }
        const sourceUrl = importCallArgument.value;
        const resolvedSourceUrl = this.bundler.analyzer.urlResolver.resolve(baseUrl, sourceUrl);
        if (!resolvedSourceUrl) {
            return;
        }
        const sourceBundle = this.manifest.getBundleForFile(resolvedSourceUrl);
        // TODO(usergenic): To support *skipping* the rewrite, we need a way to
        // identify whether a bundle contains a single top-level module or is a
        // merged bundle with multiple top-level modules.
        //
        // if (!sourceBundle || sourceBundle.url === resolvedSourceUrl) {
        let exportName;
        if (sourceBundle) {
            exportName =
                getBundleModuleExportName(sourceBundle, resolvedSourceUrl, '*');
        }
        // If there's no source bundle or the namespace export name of the bundle
        // is just '*', then we don't need to append a .then() to transform the
        // return value of the import().  Lets just rewrite the URL to be a relative
        // path and exit.
        if (!sourceBundle || exportName === '*') {
            const relativeSourceUrl = url_utils_1.ensureLeadingDot(this.bundler.analyzer.urlResolver.relative(baseUrl, resolvedSourceUrl));
            importCallArgument.value = relativeSourceUrl;
            return;
        }
        // Rewrite the URL to be a relative path to the bundle.
        const relativeSourceUrl = url_utils_1.ensureLeadingDot(this.bundler.analyzer.urlResolver.relative(baseUrl, sourceBundle.url));
        importCallArgument.value = relativeSourceUrl;
        const importCallExpressionParent = importNodePath.parentPath.parent;
        if (!importCallExpressionParent) {
            return;
        }
        const thenifiedCallExpression = babel.callExpression(babel.memberExpression(clone(importCallExpression), babel.identifier('then')), [babel.arrowFunctionExpression([
                babel.objectPattern([babel.objectProperty(babel.identifier(exportName), babel.identifier(exportName), undefined, true)]),
            ], babel.identifier(exportName))]);
        babel_utils_1.rewriteNode(importCallExpression, thenifiedCallExpression);
    }
    _rewriteImportSpecifierName(specifier, source, sourceBundle) {
        const originalExportName = specifier.imported.name;
        const exportName = getBundleModuleExportName(sourceBundle, source, originalExportName);
        specifier.imported.name = exportName;
    }
    _rewriteImportDefaultSpecifier(specifier, source, sourceBundle) {
        const exportName = getBundleModuleExportName(sourceBundle, source, 'default');
        // No rewrite necessary if default is the name, since this indicates there
        // was no rewriting or bundling of the default export.
        if (exportName === 'default') {
            return;
        }
        const importSpecifier = specifier;
        Object.assign(importSpecifier, { type: 'ImportSpecifier', imported: babel.identifier(exportName) });
    }
    _rewriteImportNamespaceSpecifier(specifier, source, sourceBundle) {
        const exportName = getBundleModuleExportName(sourceBundle, source, '*');
        // No rewrite necessary if * is the name, since this indicates there was no
        // bundling of the namespace.
        if (exportName === '*') {
            return;
        }
        const importSpecifier = specifier;
        Object.assign(importSpecifier, { type: 'ImportSpecifier', imported: babel.identifier(exportName) });
    }
}
exports.Es6Rewriter = Es6Rewriter;
//# sourceMappingURL=es6-module-utils.js.map