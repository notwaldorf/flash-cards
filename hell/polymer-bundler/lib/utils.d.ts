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
/**
 * Simple utility function used to find an item in a set with a predicate
 * function.  Analagous to Array.find(), without requiring converting the set
 * an Array.
 */
export declare function find<T>(items: Iterable<T>, predicate: (item: T) => boolean): T | undefined;
/**
 * Converts string like `abc-xyz__omg` to `abcXyzOmg`.
 */
export declare function camelCase(text: string): string;
/**
 * Returns a set of unique/distinct values returned by calling the given
 * function on each item.
 */
export declare function uniq<T, R>(items: Iterable<T>, map: (item: T) => R): Set<R>;
