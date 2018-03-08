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
// jshint node:true
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const url = require("url");
const constants_1 = require("./constants");
const vscode_uri_1 = require("vscode-uri");
/**
 * Given a string representing a URL or path of some form, append a `/`
 * character if it doesn't already end with one.
 */
function ensureTrailingSlash(href) {
    const hrefString = href;
    return hrefString.endsWith('/') ? href : (href + '/');
}
exports.ensureTrailingSlash = ensureTrailingSlash;
/**
 * Returns a WHATWG ResolvedURL for a filename on local filesystem.
 */
function getFileUrl(filename) {
    return vscode_uri_1.default.file(resolvePath(filename)).toString();
}
exports.getFileUrl = getFileUrl;
/**
 * Returns a URL with the basename removed from the pathname.  Strips the
 * search off of the URL as well, since it will not apply.
 */
function stripUrlFileSearchAndHash(href) {
    const u = url.parse(href);
    // Using != so tests for null AND undefined
    if (u.pathname != null) {
        // Suffix path with `_` so that `/a/b/` is treated as `/a/b/_` and that
        // `path.posix.dirname()` returns `/a/b` because it would otherwise
        // return `/a` incorrectly.
        u.pathname = ensureTrailingSlash(path.posix.dirname(u.pathname + '_'));
    }
    // Assigning to undefined because TSC says type of these is
    // `string | undefined` as opposed to `string | null`
    u.search = undefined;
    u.hash = undefined;
    return url.format(u);
}
exports.stripUrlFileSearchAndHash = stripUrlFileSearchAndHash;
/**
 * Returns true if the href is an absolute path.
 */
function isAbsolutePath(href) {
    return constants_1.default.ABS_URL.test(href);
}
exports.isAbsolutePath = isAbsolutePath;
/**
 * Returns true if the href is a templated value, i.e. `{{...}}` or `[[...]]`
 */
function isTemplatedUrl(href) {
    return href.search(constants_1.default.URL_TEMPLATE) >= 0;
}
exports.isTemplatedUrl = isTemplatedUrl;
/**
 * TODO(usergenic): Remove this hack if nodejs bug is fixed:
 * https://github.com/nodejs/node/issues/13683
 */
function pathPosixRelative(from, to) {
    const relative = path.posix.relative(from, to);
    return path === path.win32 ? relative.replace(/\.\.\.\./g, '../..') :
        relative;
}
/**
 * The path library's resolve function drops the trailing slash from the input
 * when returning the result.  This is bad because clients of the function then
 * have to ensure it is reapplied conditionally.  This function resolves the
 * input path while preserving the trailing slash, when present.
 */
function resolvePath(...segments) {
    if (segments.length === 0) {
        // Special cwd case
        return ensureTrailingSlash(path.resolve());
    }
    const lastSegment = segments[segments.length - 1];
    const resolved = path.resolve(...segments);
    return lastSegment.endsWith('/') ? ensureTrailingSlash(resolved) : resolved;
}
exports.resolvePath = resolvePath;
/**
 * Modifies an href by the relative difference between the old base URL and
 * the new base URL.
 */
function rewriteHrefBaseUrl(href, oldBaseUrl, newBaseUrl) {
    if (isAbsolutePath(href)) {
        return href;
    }
    const relativeUrl = url.resolve(oldBaseUrl, href);
    const parsedFrom = url.parse(newBaseUrl);
    const parsedTo = url.parse(relativeUrl);
    if (parsedFrom.protocol === parsedTo.protocol &&
        parsedFrom.host === parsedTo.host) {
        let dirFrom = path.posix.dirname(
        // Have to append a '_' to the path because path.posix.dirname('foo/')
        // returns '.' instead of 'foo'.
        parsedFrom.pathname ? parsedFrom.pathname + '_' : '');
        let pathTo = parsedTo.pathname || '';
        if (isAbsolutePath(oldBaseUrl) || isAbsolutePath(newBaseUrl)) {
            dirFrom = makeAbsolutePath(dirFrom);
            pathTo = makeAbsolutePath(pathTo);
        }
        const pathname = pathPosixRelative(dirFrom, pathTo);
        return url.format({
            pathname: pathname,
            search: parsedTo.search,
            hash: parsedTo.hash,
        });
    }
    return relativeUrl;
}
exports.rewriteHrefBaseUrl = rewriteHrefBaseUrl;
function makeAbsolutePath(path) {
    return path.startsWith('/') ? path : '/' + path;
}
//# sourceMappingURL=url-utils.js.map