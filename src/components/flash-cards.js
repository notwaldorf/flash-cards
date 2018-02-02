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
import { connect } from '../../node_modules/redux-helpers/connect-mixin.js';
import { SharedStyles } from './shared-styles.js';
import { store } from '../store.js';
import './a-card.js';

import alphabet from '../reducers/alphabet.js';

store.addReducers({
  alphabet
});

import { loadHiragana, loadKatakana } from '../actions/alphabet.js';

class FlashCards extends connect(store)(LitElement) {
  static get is() {
    return 'flash-cards';
  }

  static get properties() {
    return {
      cards: Array
    }
  }

  render(props) {
    return html`
      <style>${SharedStyles}</style>
      <style>
      :host {
        padding: 60px;
      }
      </style>
      <a-card id="card"></a-card>
    `;
  }

  ready() {
    super.ready();

    // Load the data from the redux store.
    store.dispatch(loadHiragana());
    store.dispatch(loadKatakana());
  }

  update(state) {
    this.cards = state.alphabet.cards;
  }

}

// function newQuestion() {
//   const choice = pickOne();
//   const whatKind = Math.floor(Math.random() * 2);
//   card.question = whatKind ? choice.hiragana : choice.katakana;
//   card.hint = whatKind ? 'hiragana' : 'katakana';
//   card.answer = choice.en;
// }
// window.addEventListener('next-question', function() {
//   newQuestion();
// });
//
// newQuestion();

window.customElements.define(FlashCards.is, FlashCards);
