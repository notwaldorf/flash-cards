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
// import './a-card.js'

class FlashCards extends LitElement {
  static get is() {
    return 'flash-cards';
  }

  render(props) {
    return html`
      hi
    `;
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
