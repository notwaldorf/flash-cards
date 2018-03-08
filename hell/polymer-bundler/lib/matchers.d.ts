import * as parse5 from 'parse5';
export interface Matcher {
    (node: parse5.ASTNode): boolean;
}
export declare const jsMatcher: Matcher;
export declare const externalStyle: Matcher;
export declare const polymerExternalStyle: Matcher;
export declare const styleMatcher: Matcher;
export declare const targetMatcher: Matcher;
export declare const head: Matcher;
export declare const body: Matcher;
export declare const base: Matcher;
export declare const template: Matcher;
export declare const domModuleWithoutAssetpath: Matcher;
export declare const polymerElement: Matcher;
export declare const externalJavascript: Matcher;
export declare const inlineJavascript: Matcher;
export declare const eagerHtmlImport: Matcher;
export declare const lazyHtmlImport: Matcher;
export declare const htmlImport: Matcher;
export declare const stylesheetImport: Matcher;
export declare const hiddenDiv: Matcher;
export declare const inHiddenDiv: Matcher;
export declare const elementsWithUrlAttrsToRewrite: Matcher;
export declare const beforeHiddenDiv: (node: parse5.ASTNode) => boolean;
export declare const afterHiddenDiv: (node: parse5.ASTNode) => boolean;
export declare const orderedImperative: Matcher;
