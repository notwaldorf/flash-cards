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
import { connect } from '../../node_modules/pwa-helpers/connect-mixin.js';
import { repeat } from '../../node_modules/lit-html/lib/repeat.js';

// This element is connected to the redux store.
import { store } from '../store.js';

class StatsPage extends connect(store)(LitElement) {
  render({cards, stats}) {
    return html`
      <style>${SharedStyles}</style>
      <style>
        :host {
          padding-top: 20px;
          --box-size: 40px;
        }
        .columns {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
        }
        .column {
          padding: 10px;
        }
        h3 {
          text-align: center;
        }
        .list {
          box-sizing: border-box;
          width: calc(5 * var(--box-size) + 5*8px) ;
          cursor: pointer;
          font-family: "Noto Sans Japanese";
          line-height: 1;
          text-align: center;
          font-size: 0;
        }
        .list > div {
          box-sizing: border-box;
          width: var(--box-size);
          height: var(--box-size);
          padding-top: 2px;
          display: inline-block;
          border-radius: 1.5px;
        }
        .jp {
          font-size: 20px;
          font-weight: bold;
        }
        .en {
          font-size: 12px;
          font-weight: normal;
        }
        .not-shown  { background: rgba(255,255,255,0.6); }
        .very-good  { background: #4CAF50; }
        .good       { background: #8BC34A; }
        .average    { background: #CDDC39; }
        .bad        { background: #FF9800; }
        .very-bad   { background: #FF5722; }
      </style>

      <div class="columns">
      ${repeat(Object.keys(cards), kind =>
        html`
        <div class="column">
          <h3>${kind}</h3>
          <div class="list">
            ${repeat(Object.keys(cards[kind]), entry => html`
              <div class$="${this._getPercent(kind,cards[kind][entry].jp)}">
                <div class="jp">${cards[kind][entry].jp}</div>
                <div class="en">${cards[kind][entry].en}</div>
              </div>
            `)}
          </div>
        </div>
        `
      )}
      </div>
    `;
  }

  static get is() {
    return 'stats-page';
  }

  static get properties() { return {
    stats: Object,
    cards: Object,
  }}

  ready() {
    super.ready();
  }

  stateChanged(state) {
    this.cards = state.data.cards;
    this.stats = state.data.stats;
  }

  _getPercent(kind, jp) {
    if (!this.stats) {
      return 'not-shown';
    }
    const entry = this.stats[kind] ? this.stats[kind][jp] : null;
    if (!entry) {
      return 'not-shown';
    }
    const score = entry.right/(entry.right + entry.wrong);

    // Technically shown but not answered;
    if (entry.right + entry.wrong === 0) {
      return 'not-shown'
    } else if (score >= 0.9) {
      return 'very-good';
    } else if (score >= 0.7) {
      return 'good';
    } else if (score >= 0.5) {
      return 'average';
    } else if (score >= 0.3) {
      return 'bad';
    } else {
      return 'very-bad';
    };
  }
}

window.customElements.define(StatsPage.is, StatsPage);
