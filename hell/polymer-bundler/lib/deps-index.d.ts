/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
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
import { Analyzer, ResolvedUrl } from 'polymer-analyzer';
export interface DepsIndex {
    entrypointToDeps: Map<ResolvedUrl, Set<ResolvedUrl>>;
}
/**
 * Analyzes all entrypoints and determines each of their transitive
 * dependencies.
 * @param entrypoints Urls of entrypoints to analyze.
 * @param analyzer
 * @return a dependency index of every entrypoint, including entrypoints that
 *     were discovered as lazy entrypoints in the graph.
 */
export declare function buildDepsIndex(entrypoints: ResolvedUrl[], analyzer: Analyzer): Promise<DepsIndex>;
