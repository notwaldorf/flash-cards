/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { html } from '@polymer/lit-element';

/* A FAB is a floating action button. That's fabulous. */
export const FabStyles = html`
<style>
  .floating-btn {
    position: absolute;
    right: -20px;
    top: -20px;
    background-color: #FAE1D6;
    text-align: center;
    border-radius: 50%;
    padding: 6px;
    border: 6px solid #fff;
    cursor: pointer;
    z-index: 1;
  }
</style>
`;
