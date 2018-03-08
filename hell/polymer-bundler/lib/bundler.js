"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
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
const polymer_analyzer_1 = require("polymer-analyzer");
const analyzer_utils_1 = require("./analyzer-utils");
const bundleManifestLib = require("./bundle-manifest");
const bundle_manifest_1 = require("./bundle-manifest");
const depsIndexLib = require("./deps-index");
const html_bundler_1 = require("./html-bundler");
const url_utils_1 = require("./url-utils");
__export(require("./bundle-manifest"));
class Bundler {
    constructor(options) {
        const opts = options ? options : {};
        // In order for the bundler to use a given analyzer, we'll have to fork it
        // so we can provide our own overlayUrlLoader which falls back to the
        // analyzer's load method.
        if (opts.analyzer) {
            const analyzer = opts.analyzer;
            this._overlayUrlLoader = new polymer_analyzer_1.InMemoryOverlayUrlLoader(analyzer);
            this.analyzer = analyzer._fork({ urlLoader: this._overlayUrlLoader });
        }
        else {
            this._overlayUrlLoader =
                new polymer_analyzer_1.InMemoryOverlayUrlLoader(new polymer_analyzer_1.FSUrlLoader(url_utils_1.resolvePath('.')));
            this.analyzer = new polymer_analyzer_1.Analyzer({ urlLoader: this._overlayUrlLoader });
        }
        this.excludes = Array.isArray(opts.excludes) ? opts.excludes : [];
        this.stripComments = Boolean(opts.stripComments);
        this.enableCssInlining =
            opts.inlineCss === undefined ? true : opts.inlineCss;
        this.enableScriptInlining =
            opts.inlineScripts === undefined ? true : opts.inlineScripts;
        this.rewriteUrlsInTemplates = Boolean(opts.rewriteUrlsInTemplates);
        this.sourcemaps = Boolean(opts.sourcemaps);
        this.strategy =
            opts.strategy || bundleManifestLib.generateSharedDepsMergeStrategy();
        this.urlMapper = opts.urlMapper ||
            bundleManifestLib.generateCountingSharedBundleUrlMapper(this.analyzer.resolveUrl('shared_bundle_'));
    }
    /**
     * Analyze a URL using the given contents in place of what would otherwise
     * have been loaded.
     */
    analyzeContents(url, contents) {
        return __awaiter(this, void 0, void 0, function* () {
            this._overlayUrlLoader.urlContentsMap.set(url, contents);
            yield this.analyzer.filesChanged([url]);
            const analysis = yield this.analyzer.analyze([url]);
            return analyzer_utils_1.getAnalysisDocument(analysis, url);
        });
    }
    /**
     * Given a manifest describing the bundles, produce a collection of bundled
     * documents with HTML imports, external stylesheets and external scripts
     * inlined according to the options for this Bundler.
     *
     * @param manifest - The manifest that describes the bundles to be produced.
     */
    bundle(manifest) {
        return __awaiter(this, void 0, void 0, function* () {
            const documents = new Map();
            manifest = manifest.fork();
            for (const bundleEntry of manifest.bundles) {
                const bundleUrl = bundleEntry[0];
                const bundle = { url: bundleUrl, bundle: bundleEntry[1] };
                if (bundle.url.endsWith('.html')) {
                    documents.set(bundleUrl, yield (new html_bundler_1.HtmlBundler(this, bundle, manifest).bundle()));
                }
            }
            return { manifest, documents };
        });
    }
    /**
     * Generates a BundleManifest with all bundles defined, using entrypoints,
     * strategy and mapper.
     *
     * @param entrypoints - The list of entrypoints that will be analyzed for
     *     dependencies. The results of the analysis will be passed to the
     *     `strategy`.
     * @param strategy - The strategy used to construct the output bundles.
     *     See 'polymer-analyzer/src/bundle-manifest'.
     * @param mapper - A function that produces URLs for the generated bundles.
     *     See 'polymer-analyzer/src/bundle-manifest'.
     */
    generateManifest(entrypoints) {
        return __awaiter(this, void 0, void 0, function* () {
            const dependencyIndex = yield depsIndexLib.buildDepsIndex(entrypoints, this.analyzer);
            let bundles = bundleManifestLib.generateBundles(dependencyIndex.entrypointToDeps);
            this._filterExcludesFromBundles(bundles);
            bundles = this.strategy(bundles);
            return new bundle_manifest_1.BundleManifest(bundles, this.urlMapper);
        });
    }
    /**
     * Given an array of Bundles, remove all files from bundles which are in the
     * "excludes" set.  Remove any bundles which are left empty after excluded
     * files are removed.
     */
    _filterExcludesFromBundles(bundles) {
        // Remove excluded files from bundles.
        for (const bundle of bundles) {
            for (const exclude of this.excludes) {
                const resolvedExclude = this.analyzer.resolveUrl(exclude);
                if (!resolvedExclude) {
                    continue;
                }
                bundle.files.delete(resolvedExclude);
                const excludeAsFolder = exclude.endsWith('/') ? exclude : exclude + '/';
                for (const file of bundle.files) {
                    if (file.startsWith(excludeAsFolder)) {
                        bundle.files.delete(file);
                    }
                }
            }
        }
        let b = 0;
        while (b < bundles.length) {
            if (bundles[b].files.size < 0) {
                bundles.splice(b, 1);
                continue;
            }
            ++b;
        }
    }
}
exports.Bundler = Bundler;
//# sourceMappingURL=bundler.js.map