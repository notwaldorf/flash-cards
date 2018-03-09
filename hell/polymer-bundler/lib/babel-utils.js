"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const babel_generator_1 = require("babel-generator");
const babel_traverse_1 = require("babel-traverse");
const babel = require("babel-types");
const babylon = require("babylon");
/**
 * Within the `root` of the babel AST, find and returns a NodePath of the
 * given `node`.  Returns `undefined` if node not found within `root`.
 */
function getNodePath(root, node) {
    let nodepath;
    babel_traverse_1.default(root, {
        noScope: true,
        enter(path) {
            if (path.node === node) {
                nodepath = path;
                path.stop();
            }
        }
    });
    return nodepath;
}
exports.getNodePath = getNodePath;
function getNodeValue(node) {
    if (babel.isStringLiteral(node)) {
        return node.value;
    }
}
exports.getNodeValue = getNodeValue;
/**
 * Parse the module with babylon and return a babel.Node
 */
function parseModuleFile(url, code) {
    return babylon.parse(code, {
        sourceFilename: url,
        sourceType: 'module',
        plugins: [
            'asyncGenerators',
            'dynamicImport',
            // 'importMeta', // not yet in the @types file
            'objectRestSpread',
        ],
    });
}
exports.parseModuleFile = parseModuleFile;
/**
 * Performs an in-place rewrite of a target node's properties from a given
 * replacement node.  This is useful because there are some transformations
 * of the AST which simply require replacing a node, but it is not always
 * convenient to obtain the specific parent node property to which a node may be
 * attached out of many possible configurations.
 */
function rewriteNode(target, replacement) {
    // Strip all properties from target
    for (const key in target) {
        if (target.hasOwnProperty(key)) {
            delete target[key];
        }
    }
    // Transfer remaining properties from replacement
    for (const key in replacement) {
        if (replacement.hasOwnProperty(key)) {
            target[key] = replacement[key];
        }
    }
}
exports.rewriteNode = rewriteNode;
/**
 * Convenience wrapper for generating source text from the babel AST node.
 */
function serialize(root) {
    return babel_generator_1.default(root, { quotes: 'single' });
}
exports.serialize = serialize;
//# sourceMappingURL=babel-utils.js.map