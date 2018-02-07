import { LitElement, html } from '../../node_modules/@polymer/lit-element/lit-element.js'
import { connect } from '../../node_modules/redux-helpers/connect-mixin.js';
import { repeat } from '../../node_modules/lit-html/lib/repeat.js';
import { SharedStyles } from './shared-styles.js';
import { store } from '../store.js';
import { settingsIcon } from './my-icons.js';
import './a-card.js';
import './check-box.js';

import { saveShowAnswer, saveShowSettings } from '../actions/app.js';
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
      showSettings: String,
      choices: Array
    }
  }

  render({card, cards, showAnswer, showSettings, choices}) {
    return html`
      <style>${SharedStyles}</style>
      <style>
      :host {
        padding: 60px;
        position: relative;
      }
      .settings-btn {
        position: absolute;
        right: 40px;
        top: 40px;
        background-color: #FAE1D6;
        text-align: center;
        border-radius: 50%;
        padding: 6px;
        border: 6px solid #fff;
        cursor: pointer;
        z-index: 1;
      }
      #settings {
        width: 300px;
        height: 300px;
        border-radius: 3px;
        background: white;
        box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14),
           0 1px 8px 0 rgba(0, 0, 0, 0.12),
           0 3px 3px -2px rgba(0, 0, 0, 0.4);
        padding: 20px;
      }
      [hidden] {
        display: none !important;
      }
      </style>
      <button class="settings-btn">${settingsIcon}</button>

      <div id="settings" hidden>
        <check-box id="answer" label="show answer" checked="${showAnswer}"></check-box>

        <h4>Pick from</h4>
        ${repeat(Object.keys(cards), kind =>
          html`
            <check-box label="${kind}" checked="${choices.indexOf(kind)!==-1}" class="choices"></check-box>
          `
        )}

        <h4>Show me</h4>
        <check-box id="onlyNew" class="show-settings"
            label="only cards I haven't seen"
            checked="${showSettings == 'onlyNew'}">
        </check-box><br>
        <check-box id="onlyWrong" class="show-settings"
            label="only cards I've gotten wrong"
            checked="${showSettings == 'onlyWrong'}">
        </check-box><br>
        <check-box id="onlyRight" class="show-settings"
            label="only cards I've gotten right"
            checked="${showSettings == 'onlyRight'}">
        </check-box>
      </div>

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
    this._settings = this.shadowRoot.querySelector('#settings');
    this._card = this.shadowRoot.querySelector('a-card');

    this.shadowRoot.querySelector('button.settings-btn').addEventListener('click',
      (event) => {
        this._settings.hidden = !this._settings.hidden;
        this._card.hidden = !this._card.hidden;
      });
    this.addEventListener('checked-changed', (e) => {
      const target = e.composedPath()[0];
      if (target.id === 'answer') {
        store.dispatch(saveShowAnswer(target.checked));
      } if (target.classList.contains('show-settings')) {
        store.dispatch(saveShowSettings(target.id, target.checked));
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

  stateChanged(state) {
    this.showAnswer = state.app.showAnswer;
    this.cards = state.data.cards;
    this.choices = state.data.choices;
    this.showSettings = state.app.showSettings;
    const activeCard = state.data.activeCard;  // {hint, index}

    if (activeCard) {
      if (!this.cards[activeCard.hint]) {
        // Oops, you're in an error state. This card doesn't exist anymore.
        store.dispatch(showNewCard());
        return;
      }
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
