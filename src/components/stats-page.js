import { html } from '@polymer/lit-element';
import { PageViewElement } from './page-view-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { repeat } from 'lit-html/lib/repeat.js';

// This element is connected to the redux store.
import { store } from '../store.js';

export class StatsPage extends connect(store)(PageViewElement) {
  render({_cards, _stats}) {
    return html`
      <style>
        :host {
          display: block;
          box-sizing: border-box;
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
        .ellipsis {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      </style>

      <div class="columns">
      ${repeat(Object.keys(_cards), kind =>
        html`
        <div class="column">
          <h3>${kind}</h3>
          <div class="list">
            ${repeat(Object.keys(_cards[kind]), entry => html`
              <div style$="${this._getColor(kind, _cards[kind][entry].jp, _stats)}">
                <div class="jp ellipsis" title="${_cards[kind][entry].jp}">${_cards[kind][entry].jp}</div>
                <div class="en ellipsis" title="${_cards[kind][entry].en}">${_cards[kind][entry].en}</div>
              </div>
            `)}
          </div>
        </div>
        `
      )}
      </div>
    `;
  }
  static get properties() { return {
    _stats: Object,
    _cards: Object,
  }}

  stateChanged(state) {
    this._cards = state.data.cards;
    this._stats = state.data.stats;
  }

  _getColor(kind, jp, stats) {
    const backgroundNone = 'background: rgba(255,255,255,0.6)';
    if (!stats) {
      return backgroundNone;
    }
    const entry = stats[kind] ? stats[kind][jp] : null;
    if (!entry) {
      return backgroundNone;
    }
    const score = entry.right/(entry.right + entry.wrong);

    // Technically shown but not answered;
    if (entry.right + entry.wrong === 0) {
      return backgroundNone;
    } else if (score >= 0.5) {
      return `background: rgba(76, 175, 80,${score})`;
    } else {
      return `background: rgba(255, 87, 34,${1-score})`;
    }
  }
}

window.customElements.define('stats-page', StatsPage);
