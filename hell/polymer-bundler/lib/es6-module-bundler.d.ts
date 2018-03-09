import { Document } from 'polymer-analyzer';
import { AssignedBundle, BundleManifest } from './bundle-manifest';
import { Bundler } from './bundler';
import { BundledDocument } from './document-collection';
export declare class Es6ModuleBundler {
    bundler: Bundler;
    assignedBundle: AssignedBundle;
    manifest: BundleManifest;
    document: Document;
    constructor(bundler: Bundler, assignedBundle: AssignedBundle, manifest: BundleManifest);
    bundle(): Promise<BundledDocument>;
    /**
     * Generate a fresh document to bundle contents into.  If we're building a
     * bundle which is based on an existing file, we should load that file and
     * prepare it as the bundle document, otherwise we'll create a clean/empty
     * JS document.
     */
    private _prepareBundleDocument();
}
