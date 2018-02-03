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
import { repeat } from '../../node_modules/lit-html/lib/repeat.js';

// This element is connected to the redux store.
import { store } from '../store.js';

class StatsPage extends connect(store)(LitElement) {
  render({stats}) {
    return html`
      <style>${SharedStyles}</style>
      <style>
        :host {
          padding-top: 20px;
        }
      </style>

      <h1>Stats</h1>
      <div>hiragana</div>
      ${repeat(Object.keys(stats.hiragana), entry => html`
        <div>
          <div class="circle">${entry}</div>
          <div class="circle right">${stats.hiragana[entry].right}</div>
          <div class="circle wrong">${stats.hiragana[entry].wrong}</div>
        </div>
      `)}

      <div>katakana</div>
      <div>
      ${repeat(Object.keys(stats.katakana), entry => html`
        <div>
          <div class="circle">${entry}</div>
          <div class="circle right">${stats.katakana[entry].right}</div>
          <div class="circle wrong">${stats.katakana[entry].wrong}</div>
        </div>
      `)}
      </div>
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

  update(state) {
    // TODO: Currently if you load the stats page and not the play page,
    // the stats aren't initialized.
    if (!state.alphabet) {
      this.stats = {'katakana': {}, 'hiragana': {}};
    } else {
      this.stats = state.alphabet.stats;
    }
  }
}

window.customElements.define(StatsPage.is, StatsPage);
