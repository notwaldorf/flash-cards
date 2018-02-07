import { LitElement, html } from '../../node_modules/@polymer/lit-element/lit-element.js'
import { connect } from '../../node_modules/redux-helpers/connect-mixin.js';
import { repeat } from '../../node_modules/lit-html/lib/repeat.js';
import { SharedStyles } from './shared-styles.js';
import { store } from '../store.js';
import './a-card.js';
import './check-box.js';

import { saveShowAnswer } from '../actions/app.js';
import { showNewCard, getRight, getWrong, saveAvailableTypes } from '../actions/data.js';

class FlashCards extends connect(store)(LitElement) {
  static get is() {
    return 'flash-cards';
  }

  static get properties() {
    return {
      cards: Object,
      card: Object,
      showAnswer: Boolean,
      choices: Array
    }
  }

  render({card, cards, showAnswer, choices}) {
    return html`
      <style>${SharedStyles}</style>
      <style>
      :host {
        padding: 60px;
      }
      </style>
      <check-box id="answer" label="show answer" checked="${showAnswer}"></check-box>
      <br>
      ${repeat(Object.keys(cards), kind =>
        html`
          <check-box label="${kind}" checked="${choices.indexOf(kind)!==-1}" class="choices"></check-box>
        `
      )}

      <a-card
        showAnswer="${showAnswer}"
        question="${card.question}"
        answer="${card.answer}"
        hint="${card.hint}">
      </a-card>
    `;
  }

  ready() {
    // Ready to render!
    super.ready();
    this._checkboxes = this.shadowRoot.querySelectorAll('.choices');

    this.addEventListener('checked-changed', function(event) {
      const target = event.composedPath()[0];
      if (target.id === 'answer') {
        store.dispatch(saveShowAnswer(e.detail.checked));
      } else {
        let choices = [];
        for (let i = 0; i < this._checkboxes.length; i++) {
          if (this._checkboxes[i].checked) {
            choices.push(this._checkboxes[i].label)
          }
        }
        store.dispatch(saveAvailableTypes(choices));
      }
    });

    this.addEventListener('next-question', () => store.dispatch(showNewCard()));
    this.addEventListener('answered', (e) => {
      if (e.detail.correct) {
        store.dispatch(getRight(this.card));
      } else {
        store.dispatch(getWrong(this.card));
      }
    });
  }

  update(state) {
    this.showAnswer = state.app.showAnswer;
    this.cards = state.data.cards;
    this.choices = state.data.choices;
    const activeCard = state.data.activeCard;  // {hint, index}

    if (activeCard) {
      const activeCardData = this.cards[activeCard.hint][activeCard.index];
      this.card = {
        question: activeCardData.jp,
        answer: activeCardData.en,
        hint: activeCard.hint
      }
    }
  }
}

window.customElements.define(FlashCards.is, FlashCards);
