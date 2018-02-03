/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { LitElement, html } from '../../node_modules/@polymer/lit-element/lit-element.js'
import { SharedStyles } from './shared-styles.js';
import { connect } from '../../node_modules/redux-helpers/connect-mixin.js';

// This element is connected to the redux store.
import { store } from '../store.js';

class StatsPage extends connect(store)(LitElement) {
  render(props) {
    return html`
      <style>${SharedStyles}</style>
      <section>
        <div class="circle">${props.clicks}</div>
        <div class="circle">${props.clicks}</div>
        <br><br>
      </section>
      <section>
        <p>
          <counter-element value="${props.value}" clicks="${props.clicks}"></counter-element>
        </p>
      </section>
    `;
  }

  static get is() {
    return 'stats-page';
  }

  static get properties() { return {
    stats: Object
  }}

  ready() {
    super.ready();
  }

  // This is called every time something is updated in the store.
  update(state) {
    this.stats = state.alphabet.stats;
    debugger
  }
}

window.customElements.define(StatsPage.is, StatsPage);
