import { GeneratorResult } from 'babel-generator';
import { NodePath } from 'babel-traverse';
import * as babel from 'babel-types';
/**
 * Within the `root` of the babel AST, find and returns a NodePath of the
 * given `node`.  Returns `undefined` if node not found within `root`.
 */
export declare function getNodePath(root: babel.Node, node: babel.Node): NodePath | undefined;
export declare function getNodeValue(node: babel.Node): string | undefined;
/**
 * Parse the module with babylon and return a babel.Node
 */
export declare function parseModuleFile(url: string, code: string): babel.File;
/**
 * Performs an in-place rewrite of a target node's properties from a given
 * replacement node.  This is useful because there are some transformations
 * of the AST which simply require replacing a node, but it is not always
 * convenient to obtain the specific parent node property to which a node may be
 * attached out of many possible configurations.
 */
export declare function rewriteNode(target: babel.Node, replacement: babel.Node): void;
/**
 * Convenience wrapper for generating source text from the babel AST node.
 */
export declare function serialize(root: babel.Node): GeneratorResult;
