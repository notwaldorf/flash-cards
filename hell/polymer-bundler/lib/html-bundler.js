"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const clone = require("clone");
const dom5 = require("dom5");
const parse5_1 = require("parse5");
const polymer_analyzer_1 = require("polymer-analyzer");
const analyzer_utils_1 = require("./analyzer-utils");
const constants_1 = require("./constants");
const es6_module_utils_1 = require("./es6-module-utils");
const matchers = require("./matchers");
const parse5_utils_1 = require("./parse5-utils");
const source_map_1 = require("./source-map");
const source_map_2 = require("./source-map");
const encode_string_1 = require("./third_party/UglifyJS2/encode-string");
const url_utils_1 = require("./url-utils");
const utils_1 = require("./utils");
class HtmlBundler {
    constructor(bundler, assignedBundle, manifest) {
        this.bundler = bundler;
        this.assignedBundle = assignedBundle;
        this.manifest = manifest;
    }
    bundle() {
        return __awaiter(this, void 0, void 0, function* () {
            this.document = yield this._prepareBundleDocument();
            let ast = clone(this.document.parsedDocument.ast);
            dom5.removeFakeRootElements(ast);
            this._rewriteAstToEmulateBaseTag(ast, this.assignedBundle.url);
            this._injectHtmlImportsForBundle(ast);
            // Re-analyzing the document using the updated ast to refresh the scanned
            // imports, since we may now have appended some that were not initially
            // present.
            this.document = yield this.bundler.analyzeContents(this.assignedBundle.url, parse5_1.serialize(ast));
            // The following set of operations manipulate the ast directly, so
            yield this._inlineHtmlImports(ast);
            if (this.bundler.enableScriptInlining) {
                yield this._inlineScripts(ast);
                this.document = yield this.bundler.analyzeContents(this.assignedBundle.url, parse5_1.serialize(ast));
                ast = this.document.parsedDocument.ast;
                dom5.removeFakeRootElements(ast);
                yield this._rollupInlineScripts();
            }
            if (this.bundler.enableCssInlining) {
                yield this._inlineStylesheetLinks(ast);
                yield this._inlineStylesheetImports(ast);
            }
            if (this.bundler.stripComments) {
                parse5_utils_1.stripComments(ast);
            }
            this._removeEmptyHiddenDivs(ast);
            if (this.bundler.sourcemaps) {
                ast = source_map_2.updateSourcemapLocations(this.document, ast);
            }
            const content = parse5_1.serialize(ast);
            const files = [...this.assignedBundle.bundle.files];
            return { ast, content, files };
        });
    }
    /**
     * Walk through inline scripts of an import document.
     * For each script create identity source maps unless one already exists.
     *
     * The generated script mapping detail is the relative location within
     * the script tag. Later this will be updated to account for the
     * line offset within the final bundle.
     */
    _addOrUpdateSourcemapsForInlineScripts(originalDoc, reparsedDoc, oldBaseUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const inlineScripts = dom5.queryAll(reparsedDoc.ast, matchers.inlineJavascript);
            const promises = inlineScripts.map(scriptAst => {
                let content = dom5.getTextContent(scriptAst);
                const sourceRange = reparsedDoc.sourceRangeForStartTag(scriptAst);
                return source_map_1.addOrUpdateSourcemapComment(this.bundler.analyzer, oldBaseUrl, content, sourceRange.end.line, sourceRange.end.column, -sourceRange.end.line + 1, -sourceRange.end.column)
                    .then(updatedContent => {
                    dom5.setTextContent(scriptAst, encode_string_1.default(updatedContent));
                });
            });
            return Promise.all(promises);
        });
    }
    /**
     * Set the hidden div at the appropriate location within the document.  The
     * goal is to place the hidden div at the same place as the first html
     * import.  However, the div can't be placed in the `<head>` of the document
     * so if first import is found in the head, we prepend the div to the body.
     * If there is no body, we'll just attach the hidden div to the document at
     * the end.
     */
    _attachHiddenDiv(ast, hiddenDiv) {
        const firstHtmlImport = dom5.query(ast, matchers.eagerHtmlImport);
        const body = dom5.query(ast, matchers.body);
        if (body) {
            if (firstHtmlImport &&
                dom5.predicates.parentMatches(matchers.body)(firstHtmlImport)) {
                parse5_utils_1.insertAfter(firstHtmlImport, hiddenDiv);
            }
            else {
                parse5_utils_1.prepend(body, hiddenDiv);
            }
        }
        else {
            dom5.append(ast, hiddenDiv);
        }
    }
    /**
     * Creates a hidden container <div> to which inlined content will be
     * appended.
     */
    _createHiddenDiv() {
        const hidden = dom5.constructors.element('div');
        dom5.setAttribute(hidden, 'hidden', '');
        dom5.setAttribute(hidden, 'by-polymer-bundler', '');
        return hidden;
    }
    /**
     * Append a `<link rel="import" ...>` node to `node` with a value of `url`
     * for the "href" attribute.
     */
    _createHtmlImport(url) {
        const link = dom5.constructors.element('link');
        dom5.setAttribute(link, 'rel', 'import');
        dom5.setAttribute(link, 'href', url);
        return link;
    }
    /**
     * Given a document, search for the hidden div, if it isn't found, then
     * create it.  After creating it, attach it to the desired location.  Then
     * return it.
     */
    _findOrCreateHiddenDiv(ast) {
        const hiddenDiv = dom5.query(ast, matchers.hiddenDiv) || this._createHiddenDiv();
        if (!hiddenDiv.parentNode) {
            this._attachHiddenDiv(ast, hiddenDiv);
        }
        return hiddenDiv;
    }
    /**
     * Add HTML Import elements for each file in the bundle.  Efforts are made
     * to ensure that imports are injected prior to any eager imports of other
     * bundles which are known to depend on them, to preserve expectations of
     * evaluation order.
     */
    _injectHtmlImportsForBundle(ast) {
        // Gather all the document's direct html imports.  We want the direct (not
        // transitive) imports only here, because we'll be using their AST nodes
        // as targets to prepended injected imports to.
        const existingImports = [
            ...this.document.getFeatures({ kind: 'html-import', noLazyImports: true, imported: false })
        ].filter((i) => !i.lazy);
        const existingImportDependencies = new Map(existingImports.map((existingImport) => [existingImport.document.url, [
                ...existingImport.document.getFeatures({ kind: 'html-import', imported: true, noLazyImports: true })
            ].filter((i) => !i.lazy).map((feature) => feature.document.url)]));
        // Every HTML file in the bundle is a candidate for injection into the
        // document.
        for (const importUrl of this.assignedBundle.bundle.files) {
            // We only want to inject an HTML import to an HTML file.
            if (url_utils_1.getFileExtension(importUrl) !== '.html') {
                continue;
            }
            // We don't want to inject the bundle into itself.
            if (this.assignedBundle.url === importUrl) {
                continue;
            }
            // If there is an existing import in the document that matches the
            // import URL already, we don't need to inject one.
            if (existingImports.find((e) => e.document.url === importUrl)) {
                continue;
            }
            // We are looking for the earliest eager import of an html document
            // which has a dependency on the html import we want to inject.
            let prependTarget = undefined;
            // We are only concerned with imports that are not of files in this
            // bundle.
            for (const existingImport of existingImports.filter((e) => !this.assignedBundle.bundle.files.has(e.document.url))) {
                // If the existing import has a dependency on the import we are
                // about to inject, it may be our new target.
                if (existingImportDependencies.get(existingImport.document.url)
                    .indexOf(importUrl) !== -1) {
                    const newPrependTarget = dom5.query(ast, (node) => parse5_utils_1.isSameNode(node, existingImport.astNode));
                    // IF we don't have a target already or if the old target comes
                    // after the new one in the source code, the new one will replace
                    // the old one.
                    if (newPrependTarget &&
                        (!prependTarget ||
                            parse5_utils_1.inSourceOrder(newPrependTarget, prependTarget))) {
                        prependTarget = newPrependTarget;
                    }
                }
            }
            // Inject the new html import into the document.
            const relativeImportUrl = this.bundler.analyzer.urlResolver.relative(this.assignedBundle.url, importUrl);
            const newHtmlImport = this._createHtmlImport(relativeImportUrl);
            if (prependTarget) {
                dom5.insertBefore(prependTarget.parentNode, prependTarget, newHtmlImport);
            }
            else {
                const hiddenDiv = this._findOrCreateHiddenDiv(ast);
                dom5.append(hiddenDiv.parentNode, newHtmlImport);
            }
        }
    }
    /**
     * Inline the contents of the html document returned by the link tag's href
     * at the location of the link tag and then remove the link tag.  If the
     * link is a `lazy-import` link, content will not be inlined.
     */
    _inlineHtmlImport(linkTag) {
        return __awaiter(this, void 0, void 0, function* () {
            const isLazy = dom5.getAttribute(linkTag, 'rel').match(/lazy-import/i);
            const importHref = dom5.getAttribute(linkTag, 'href');
            const resolvedImportUrl = this.bundler.analyzer.urlResolver.resolve(this.assignedBundle.url, importHref);
            if (resolvedImportUrl === undefined) {
                return;
            }
            const importBundle = this.manifest.getBundleForFile(resolvedImportUrl);
            // We don't want to process the same eager import again, but we want to
            // process every lazy import we see.
            if (!isLazy) {
                // Just remove the import from the DOM if it is in the stripImports Set.
                if (this.assignedBundle.bundle.stripImports.has(resolvedImportUrl)) {
                    parse5_utils_1.removeElementAndNewline(linkTag);
                    return;
                }
                // We've never seen this import before, so we'll add it to the
                // stripImports Set to guard against inlining it again in the future.
                this.assignedBundle.bundle.stripImports.add(resolvedImportUrl);
            }
            // If we can't find a bundle for the referenced import, we will just leave
            // the import link alone.  Unless the file was specifically excluded, we
            // need to record it as a "missing import".
            if (!importBundle) {
                if (!this.bundler.excludes.some((u) => u === resolvedImportUrl ||
                    resolvedImportUrl.startsWith(url_utils_1.ensureTrailingSlash(u)))) {
                    this.assignedBundle.bundle.missingImports.add(resolvedImportUrl);
                }
                return;
            }
            // Don't inline an import into itself.
            if (this.assignedBundle.url === resolvedImportUrl) {
                parse5_utils_1.removeElementAndNewline(linkTag);
                return;
            }
            const importIsInAnotherBundle = importBundle.url !== this.assignedBundle.url;
            // If the import is in another bundle and that bundle is in the
            // stripImports Set, we should not link to that bundle.
            const stripLinkToImportBundle = importIsInAnotherBundle &&
                this.assignedBundle.bundle.stripImports.has(importBundle.url) &&
                // We just added resolvedImportUrl to stripImports, so we'll exclude
                // the case where resolved import URL is not the import bundle.  This
                // scenario happens when importing a file from a bundle with the same
                // name as the original import, like an entrypoint or lazy edge.
                resolvedImportUrl !== importBundle.url;
            // If the html import refers to a file which is bundled and has a
            // different URL, then lets just rewrite the href to point to the bundle
            // URL.
            if (importIsInAnotherBundle) {
                // We guard against inlining any other file from a bundle that has
                // already been imported.  A special exclusion is for lazy imports,
                // which are not deduplicated here, since we can not infer developer's
                // intent from here.
                if (stripLinkToImportBundle && !isLazy) {
                    parse5_utils_1.removeElementAndNewline(linkTag);
                    return;
                }
                const relative = this.bundler.analyzer.urlResolver.relative(this.assignedBundle.url, importBundle.url) ||
                    importBundle.url;
                dom5.setAttribute(linkTag, 'href', relative);
                this.assignedBundle.bundle.stripImports.add(importBundle.url);
                return;
            }
            // We don't actually inline a `lazy-import` because its loading is
            // intended to be deferred until the client requests it.
            if (isLazy) {
                return;
            }
            // If the analyzer could not load the import document, we can't inline it,
            // so lets skip it.
            const htmlImport = utils_1.find(this.document.getFeatures({ kind: 'html-import', imported: true, externalPackages: true }), (i) => i.document && i.document.url === resolvedImportUrl);
            if (!htmlImport) {
                return;
            }
            // When inlining html documents, we'll parse it as a fragment so that we
            // do not get html, head or body wrappers.
            const importAst = parse5_1.parseFragment(htmlImport.document.parsedDocument.contents, { locationInfo: true });
            this._rewriteAstToEmulateBaseTag(importAst, resolvedImportUrl);
            this._rewriteAstBaseUrl(importAst, resolvedImportUrl, this.document.url);
            if (this.bundler.sourcemaps) {
                const reparsedDoc = new polymer_analyzer_1.ParsedHtmlDocument({
                    url: this.assignedBundle.url,
                    baseUrl: this.document.parsedDocument.baseUrl,
                    contents: htmlImport.document.parsedDocument.contents,
                    ast: importAst,
                    isInline: false,
                    locationOffset: undefined,
                    astNode: undefined,
                });
                yield this._addOrUpdateSourcemapsForInlineScripts(this.document, reparsedDoc, resolvedImportUrl);
            }
            const nestedImports = dom5.queryAll(importAst, matchers.htmlImport);
            // Move all of the import doc content after the html import.
            parse5_utils_1.insertAllBefore(linkTag.parentNode, linkTag, importAst.childNodes);
            parse5_utils_1.removeElementAndNewline(linkTag);
            // Record that the inlining took place.
            this.assignedBundle.bundle.inlinedHtmlImports.add(resolvedImportUrl);
            // Recursively process the nested imports.
            for (const nestedImport of nestedImports) {
                yield this._inlineHtmlImport(nestedImport);
            }
        });
    }
    /**
     * Replace html import links in the document with the contents of the
     * imported file, but only once per URL.
     */
    _inlineHtmlImports(ast) {
        return __awaiter(this, void 0, void 0, function* () {
            const htmlImports = dom5.queryAll(ast, matchers.htmlImport);
            for (const htmlImport of htmlImports) {
                yield this._inlineHtmlImport(htmlImport);
            }
        });
    }
    /**
     * Inlines the contents of the document returned by the script tag's src URL
     * into the script tag content and removes the src attribute.
     */
    _inlineScript(scriptTag) {
        return __awaiter(this, void 0, void 0, function* () {
            const scriptHref = dom5.getAttribute(scriptTag, 'src');
            const resolvedImportUrl = this.bundler.analyzer.urlResolver.resolve(this.assignedBundle.url, scriptHref);
            if (resolvedImportUrl === undefined) {
                return;
            }
            if (this.bundler.excludes.some((e) => resolvedImportUrl === e ||
                resolvedImportUrl.startsWith(url_utils_1.ensureTrailingSlash(e)))) {
                return;
            }
            const scriptImport = utils_1.find(this.document.getFeatures({ kind: 'html-script', imported: true, externalPackages: true }), (i) => i.document && i.document.url === resolvedImportUrl);
            if (!scriptImport) {
                this.assignedBundle.bundle.missingImports.add(resolvedImportUrl);
                return;
            }
            let scriptContent = scriptImport.document.parsedDocument.contents;
            if (this.bundler.sourcemaps) {
                // it's easier to calculate offsets if the external script contents
                // don't start on the same line as the script tag. Offset the map
                // appropriately.
                scriptContent = yield source_map_1.addOrUpdateSourcemapComment(this.bundler.analyzer, resolvedImportUrl, '\n' + scriptContent, -1, 0, 1, 0);
            }
            dom5.removeAttribute(scriptTag, 'src');
            // Second argument 'true' tells encodeString to escape the <script> content.
            dom5.setTextContent(scriptTag, encode_string_1.default(scriptContent, true));
            // Record that the inlining took place.
            this.assignedBundle.bundle.inlinedScripts.add(resolvedImportUrl);
            return scriptContent;
        });
    }
    /**
     * Replace all external javascript tags (`<script src="...">`)
     * with `<script>` tags containing the file contents inlined.
     */
    _inlineScripts(ast) {
        return __awaiter(this, void 0, void 0, function* () {
            const scriptImports = dom5.queryAll(ast, matchers.externalJavascript);
            for (const externalScript of scriptImports) {
                yield this._inlineScript(externalScript);
            }
        });
    }
    /**
     * Inlines the contents of the stylesheet returned by the link tag's href
     * URL into a style tag and removes the link tag.
     */
    _inlineStylesheet(cssLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const stylesheetHref = dom5.getAttribute(cssLink, 'href');
            const resolvedImportUrl = this.bundler.analyzer.urlResolver.resolve(this.assignedBundle.url, stylesheetHref);
            if (resolvedImportUrl === undefined) {
                return;
            }
            if (this.bundler.excludes.some((e) => resolvedImportUrl === e ||
                resolvedImportUrl.startsWith(url_utils_1.ensureTrailingSlash(e)))) {
                return;
            }
            const stylesheetImport = utils_1.find(this.document.getFeatures({ kind: 'html-style', imported: true, externalPackages: true }), (i) => i.document && i.document.url === resolvedImportUrl) ||
                utils_1.find(this.document.getFeatures({ kind: 'css-import', imported: true, externalPackages: true }), (i) => i.document && i.document.url === resolvedImportUrl);
            if (!stylesheetImport) {
                this.assignedBundle.bundle.missingImports.add(resolvedImportUrl);
                return;
            }
            const stylesheetContent = stylesheetImport.document.parsedDocument.contents;
            const media = dom5.getAttribute(cssLink, 'media');
            let newBaseUrl = this.assignedBundle.url;
            // If the css link we are about to inline is inside of a dom-module, the
            // new base URL must be calculated using the assetpath of the dom-module
            // if present, since Polymer will honor assetpath when resolving URLs in
            // `<style>` tags, even inside of `<template>` tags.
            const parentDomModule = parse5_utils_1.findAncestor(cssLink, dom5.predicates.hasTagName('dom-module'));
            if (!this.bundler.rewriteUrlsInTemplates && parentDomModule &&
                dom5.hasAttribute(parentDomModule, 'assetpath')) {
                const assetPath = (dom5.getAttribute(parentDomModule, 'assetpath') ||
                    '');
                if (assetPath) {
                    newBaseUrl =
                        this.bundler.analyzer.urlResolver.resolve(newBaseUrl, assetPath);
                }
            }
            const resolvedStylesheetContent = this._rewriteCssTextBaseUrl(stylesheetContent, resolvedImportUrl, newBaseUrl);
            const styleNode = dom5.constructors.element('style');
            if (media) {
                dom5.setAttribute(styleNode, 'media', media);
            }
            dom5.replace(cssLink, styleNode);
            dom5.setTextContent(styleNode, resolvedStylesheetContent);
            // Record that the inlining took place.
            this.assignedBundle.bundle.inlinedStyles.add(resolvedImportUrl);
            return styleNode;
        });
    }
    /**
     * Replace all polymer stylesheet imports (`<link rel="import" type="css">`)
     * with `<style>` tags containing the file contents, with internal URLs
     * relatively transposed as necessary.
     */
    _inlineStylesheetImports(ast) {
        return __awaiter(this, void 0, void 0, function* () {
            const cssImports = dom5.queryAll(ast, matchers.stylesheetImport);
            let lastInlined;
            for (const cssLink of cssImports) {
                const style = yield this._inlineStylesheet(cssLink);
                if (style) {
                    this._moveDomModuleStyleIntoTemplate(style, lastInlined);
                    lastInlined = style;
                }
            }
        });
    }
    /**
     * Replace all external stylesheet references, in `<link rel="stylesheet">`
     * tags with `<style>` tags containing file contents, with internal URLs
     * relatively transposed as necessary.
     */
    _inlineStylesheetLinks(ast) {
        return __awaiter(this, void 0, void 0, function* () {
            const cssLinks = dom5.queryAll(ast, matchers.externalStyle, undefined, dom5.childNodesIncludeTemplate);
            for (const cssLink of cssLinks) {
                yield this._inlineStylesheet(cssLink);
            }
        });
    }
    /**
     * Old Polymer supported `<style>` tag in `<dom-module>` but outside of
     * `<template>`.  This is also where the deprecated Polymer CSS import tag
     * `<link rel="import" type="css">` would generate inline `<style>`.
     * Migrates these `<style>` tags into available `<template>` of the
     * `<dom-module>`.  Will create a `<template>` container if not present.
     *
     * TODO(usergenic): Why is this in bundler... shouldn't this be some kind of
     * polyup or pre-bundle operation?
     */
    _moveDomModuleStyleIntoTemplate(style, refStyle) {
        const domModule = dom5.nodeWalkAncestors(style, dom5.predicates.hasTagName('dom-module'));
        if (!domModule) {
            return;
        }
        let template = dom5.query(domModule, matchers.template);
        if (!template) {
            template = dom5.constructors.element('template');
            parse5_1.treeAdapters.default.setTemplateContent(template, dom5.constructors.fragment());
            parse5_utils_1.prepend(domModule, template);
        }
        parse5_utils_1.removeElementAndNewline(style);
        // Ignore the refStyle object if it is contained within a different
        // dom-module.
        if (refStyle &&
            !dom5.query(domModule, (n) => n === refStyle, dom5.childNodesIncludeTemplate)) {
            refStyle = undefined;
        }
        // keep ordering if previding with a reference style
        if (!refStyle) {
            parse5_utils_1.prepend(parse5_1.treeAdapters.default.getTemplateContent(template), style);
        }
        else {
            parse5_utils_1.insertAfter(refStyle, style);
        }
    }
    /**
     * When an HTML Import is encountered in the head of the document, it needs
     * to be moved into the hidden div and any subsequent order-dependent
     * imperatives (imports, styles, scripts) must also be move into the
     * hidden div.
     */
    _moveOrderedImperativesFromHeadIntoHiddenDiv(ast) {
        const head = dom5.query(ast, matchers.head);
        if (!head) {
            return;
        }
        const firstHtmlImport = dom5.query(head, matchers.eagerHtmlImport);
        if (!firstHtmlImport) {
            return;
        }
        for (const node of [firstHtmlImport].concat(parse5_utils_1.siblingsAfter(firstHtmlImport))) {
            if (matchers.orderedImperative(node)) {
                parse5_utils_1.removeElementAndNewline(node);
                dom5.append(this._findOrCreateHiddenDiv(ast), node);
            }
        }
    }
    /**
     * Move any remaining htmlImports that are not inside the hidden div
     * already, into the hidden div.
     */
    _moveUnhiddenHtmlImportsIntoHiddenDiv(ast) {
        const unhiddenHtmlImports = dom5.queryAll(ast, dom5.predicates.AND(matchers.eagerHtmlImport, dom5.predicates.NOT(matchers.inHiddenDiv)));
        for (const htmlImport of unhiddenHtmlImports) {
            parse5_utils_1.removeElementAndNewline(htmlImport);
            dom5.append(this._findOrCreateHiddenDiv(ast), htmlImport);
        }
    }
    /**
     * Generate a fresh document to bundle contents into.  If we're building
     * a bundle which is based on an existing file, we should load that file and
     * prepare it as the bundle document, otherwise we'll create a clean/empty
     * HTML document.
     */
    _prepareBundleDocument() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.assignedBundle.bundle.files.has(this.assignedBundle.url)) {
                return this.bundler.analyzeContents(this.assignedBundle.url, '');
            }
            const analysis = yield this.bundler.analyzer.analyze([this.assignedBundle.url]);
            const document = analyzer_utils_1.getAnalysisDocument(analysis, this.assignedBundle.url);
            const ast = clone(document.parsedDocument.ast);
            this._moveOrderedImperativesFromHeadIntoHiddenDiv(ast);
            this._moveUnhiddenHtmlImportsIntoHiddenDiv(ast);
            dom5.removeFakeRootElements(ast);
            return this.bundler.analyzeContents(document.url, parse5_1.serialize(ast));
        });
    }
    /**
     * Removes all empty hidden container divs from the AST.
     */
    _removeEmptyHiddenDivs(ast) {
        for (const div of dom5.queryAll(ast, matchers.hiddenDiv)) {
            if (parse5_1.serialize(div).trim() === '') {
                dom5.remove(div);
            }
        }
    }
    /**
     * Walk through an import document, and rewrite all URLs so they are
     * correctly relative to the main document URL as they've been
     * imported from the import URL.
     */
    _rewriteAstBaseUrl(ast, oldBaseUrl, newBaseUrl) {
        this._rewriteElementAttrsBaseUrl(ast, oldBaseUrl, newBaseUrl);
        this._rewriteStyleTagsBaseUrl(ast, oldBaseUrl, newBaseUrl);
        this._setDomModuleAssetpaths(ast, oldBaseUrl, newBaseUrl);
    }
    /**
     * Given an import document with a base tag, transform all of its URLs and
     * set link and form target attributes and remove the base tag.
     */
    _rewriteAstToEmulateBaseTag(ast, docUrl) {
        const baseTag = dom5.query(ast, matchers.base);
        const p = dom5.predicates;
        // If there's no base tag, there's nothing to do.
        if (!baseTag) {
            return;
        }
        for (const baseTag of dom5.queryAll(ast, matchers.base)) {
            parse5_utils_1.removeElementAndNewline(baseTag);
        }
        if (dom5.predicates.hasAttr('href')(baseTag)) {
            const baseUrl = this.bundler.analyzer.urlResolver.resolve(docUrl, dom5.getAttribute(baseTag, 'href'));
            if (baseUrl) {
                this._rewriteAstBaseUrl(ast, baseUrl, docUrl);
            }
        }
        if (p.hasAttr('target')(baseTag)) {
            const baseTarget = dom5.getAttribute(baseTag, 'target');
            const tagsToTarget = dom5.queryAll(ast, p.AND(p.OR(p.hasTagName('a'), p.hasTagName('form')), p.NOT(p.hasAttr('target'))));
            for (const tag of tagsToTarget) {
                dom5.setAttribute(tag, 'target', baseTarget);
            }
        }
    }
    /**
     * Given a string of CSS, return a version where all occurrences of URLs,
     * have been rewritten based on the relationship of the old base URL to the
     * new base URL.
     */
    _rewriteCssTextBaseUrl(cssText, oldBaseUrl, newBaseUrl) {
        return cssText.replace(constants_1.default.URL, (match) => {
            let path = match.replace(/["']/g, '').slice(4, -1);
            path = url_utils_1.rewriteHrefBaseUrl(path, oldBaseUrl, newBaseUrl);
            return 'url("' + path + '")';
        });
    }
    /**
     * Find all element attributes which express URLs and rewrite them so they
     * are based on the relationship of the old base URL to the new base URL.
     */
    _rewriteElementAttrsBaseUrl(ast, oldBaseUrl, newBaseUrl) {
        const nodes = dom5.queryAll(ast, matchers.elementsWithUrlAttrsToRewrite, undefined, this.bundler.rewriteUrlsInTemplates ? dom5.childNodesIncludeTemplate :
            dom5.defaultChildNodes);
        for (const node of nodes) {
            for (const attr of constants_1.default.URL_ATTR) {
                const attrValue = dom5.getAttribute(node, attr);
                if (attrValue && !url_utils_1.isTemplatedUrl(attrValue)) {
                    let relUrl;
                    if (attr === 'style') {
                        relUrl =
                            this._rewriteCssTextBaseUrl(attrValue, oldBaseUrl, newBaseUrl);
                    }
                    else {
                        relUrl = url_utils_1.rewriteHrefBaseUrl(attrValue, oldBaseUrl, newBaseUrl);
                    }
                    dom5.setAttribute(node, attr, relUrl);
                }
            }
        }
    }
    /**
     * Find all URLs in imported style nodes and rewrite them so they are based
     * on the relationship of the old base URL to the new base URL.
     */
    _rewriteStyleTagsBaseUrl(ast, oldBaseUrl, newBaseUrl) {
        const childNodesOption = this.bundler.rewriteUrlsInTemplates ?
            dom5.childNodesIncludeTemplate :
            dom5.defaultChildNodes;
        // If `rewriteUrlsInTemplates` is `true`, include `<style>` tags that are
        // inside `<template>`.
        const styleNodes = dom5.queryAll(ast, matchers.styleMatcher, undefined, childNodesOption);
        // Unless rewriteUrlsInTemplates is on, if a `<style>` tag is anywhere
        // inside a `<dom-module>` tag, then it should not have its URLs
        // rewritten.
        if (!this.bundler.rewriteUrlsInTemplates) {
            for (const domModule of dom5.queryAll(ast, dom5.predicates.hasTagName('dom-module'))) {
                for (const styleNode of dom5.queryAll(domModule, matchers.styleMatcher, undefined, childNodesOption)) {
                    const styleNodeIndex = styleNodes.indexOf(styleNode);
                    if (styleNodeIndex > -1) {
                        styleNodes.splice(styleNodeIndex, 1);
                    }
                }
            }
        }
        for (const node of styleNodes) {
            let styleText = dom5.getTextContent(node);
            styleText =
                this._rewriteCssTextBaseUrl(styleText, oldBaseUrl, newBaseUrl);
            dom5.setTextContent(node, styleText);
        }
    }
    _rollupInlineScripts() {
        return __awaiter(this, void 0, void 0, function* () {
            const es6Rewriter = new es6_module_utils_1.Es6Rewriter(this.bundler, this.manifest, this.assignedBundle);
            const inlineModuleScripts = [...this.document.getFeatures({
                    kind: 'js-document',
                    imported: false,
                    externalPackages: true,
                    excludeBackreferences: true,
                })]
                .filter((f) => f.isInline &&
                f.parsedDocument.parsedAsSourceType === 'module');
            for (const inlineModuleScript of inlineModuleScripts) {
                const { code } = yield es6Rewriter.rollup(this.document.parsedDocument.baseUrl, inlineModuleScript.parsedDocument.contents);
                // Second argument 'true' tells encodeString to escape the <script>
                // content.
                dom5.setTextContent(inlineModuleScript.astNode.node, encode_string_1.default(`\n${code}\n`, true));
            }
        });
    }
    /**
     * Set the assetpath attribute of all imported dom-modules which don't yet
     * have them if the base URLs are different.
     */
    _setDomModuleAssetpaths(ast, oldBaseUrl, newBaseUrl) {
        const domModules = dom5.queryAll(ast, matchers.domModuleWithoutAssetpath);
        for (let i = 0, node; i < domModules.length; i++) {
            node = domModules[i];
            const assetPathUrl = this.bundler.analyzer.urlResolver.relative(newBaseUrl, url_utils_1.stripUrlFileSearchAndHash(oldBaseUrl));
            // There's no reason to set an assetpath on a dom-module if its
            // different from the document's base.
            if (assetPathUrl !== '') {
                dom5.setAttribute(node, 'assetpath', assetPathUrl);
            }
        }
    }
}
exports.HtmlBundler = HtmlBundler;
//# sourceMappingURL=html-bundler.js.map