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

export const SharedStyles = html`
<style>
  :host {
    display: block;
    /* Add defaults so that these are set correctly in unit tests
    which don't set up <my-app> */
    background: var(--app-header-background-color, #FAE1D6);
    box-sizing: border-box;
    margin: 0 auto;
    padding: 40px;
    max-width: 600px;
  }
  a:link, a:visited {
    color: var(--app-header-selected-color, #C3134E);
    text-decoration: none;
    font-weight: bold;
  }
</style>
`;
