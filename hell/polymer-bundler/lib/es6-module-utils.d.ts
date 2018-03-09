import * as babel from 'babel-types';
import { Analyzer, ResolvedUrl } from 'polymer-analyzer';
import { AssignedBundle, BundleManifest } from './bundle-manifest';
import { Bundler } from './bundler';
/**
 * Looks up and/or defines the unique name for an item exported with the given
 * name in a module within a in a bundle.
 */
export declare function getBundleModuleExportName(bundle: AssignedBundle, moduleUrl: ResolvedUrl, name: string): string;
export declare function hasDefaultModuleExport(node: babel.Node): boolean;
export declare function getModuleExportNames(node: babel.Node): Set<string>;
export declare function reserveBundleModuleExportNames(analyzer: Analyzer, manifest: BundleManifest): Promise<void>;
/**
 * Utility class to rollup/merge ES6 modules code using rollup and rewrite
 * import statements to point to appropriate bundles.
 */
export declare class Es6Rewriter {
    bundler: Bundler;
    manifest: BundleManifest;
    bundle: AssignedBundle;
    constructor(bundler: Bundler, manifest: BundleManifest, bundle: AssignedBundle);
    rollup(url: ResolvedUrl, code: string): Promise<{
        code: string;
        map: undefined;
    }>;
    private _deduplicateImportStatements(node);
    private _rewriteImportStatements(baseUrl, node);
    private _rewriteDynamicImport(baseUrl, root, importNode);
    private _rewriteImportSpecifierName(specifier, source, sourceBundle);
    private _rewriteImportDefaultSpecifier(specifier, source, sourceBundle);
    private _rewriteImportNamespaceSpecifier(specifier, source, sourceBundle);
}
