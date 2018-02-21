import { LitElement, html } from '../../node_modules/@polymer/lit-element/lit-element.js'
import { connect } from '../../node_modules/pwa-helpers/connect-mixin.js';
import { repeat } from '../../node_modules/lit-html/lib/repeat.js';
import { store } from '../store.js';
import { settingsIcon } from './my-icons.js';
import './a-card.js';
import './check-box.js';

import { saveShowAnswer, saveShowSettings } from '../actions/app.js';
import { showNewCard, getRight, getWrong, saveAvailableTypes } from '../actions/data.js';

class FlashCards extends connect(store)(LitElement) {
  static get is() {
    return 'play-page';
  }

  static get properties() {
    return {
      cards: Object,
      card: Object,
      showAnswer: Boolean,
      showSettings: String,
      categories: Array
    }
  }

  render({card, cards, showAnswer, showSettings, categories}) {
    return html`
      <style>
      :host {
        display: block;
        box-sizing: border-box;
        padding: 60px;
        position: relative;
      }

      [hidden] {
        display: none !important;
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
        height: 340px;
        border-radius: 3px;
        background: white;
        box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14),
           0 1px 8px 0 rgba(0, 0, 0, 0.12),
           0 3px 3px -2px rgba(0, 0, 0, 0.4);
        padding: 20px;
      }
      h4 {
        line-height: 1;
      }
      </style>
      <button class="settings-btn">${settingsIcon}</button>

      <div id="settings" hidden>
        <check-box id="answer" label="show answer" checked="${showAnswer}"></check-box>

        <h4>Pick from</h4>
        ${repeat(Object.keys(cards), kind =>
          html`
            <check-box label="${kind}" checked="${categories.indexOf(kind)!==-1}" class="categories"></check-box>
          `
        )}

        <h4>Type of card</h4>
        <check-box id="all" class="show-settings"
            label="all cards"
            checked="${showSettings == 'all'}">
        </check-box><br>
        <check-box id="onlyNew" class="show-settings"
            label="only cards I haven't seen"
            checked="${showSettings == 'onlyNew'}">
        </check-box><br>
        <check-box id="mostlyWrong" class="show-settings"
            label="only cards I've gotten mostly wrong"
            checked="${showSettings == 'mostlyWrong'}">
        </check-box><br>
        <check-box id="mostlyRight" class="show-settings"
            label="only cards I've gotten mostly right"
            checked="${showSettings == 'mostlyRight'}">
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

  constructor() {
    super();
    this.card = {question: '', answer: '', hint: ''}
  }

  ready() {
    // Ready to render!
    super.ready();
    this._checkboxes = this.shadowRoot.querySelectorAll('.categories');
    this._settings = this.shadowRoot.querySelector('#settings');
    this._card = this.shadowRoot.querySelector('a-card');

    this.shadowRoot.querySelector('button.settings-btn').addEventListener('click',
      (event) => {
        this._settings.hidden = !this._settings.hidden;
        this._card.hidden = !this._card.hidden;
      });
    this.addEventListener('checked-changed', (e) => {
      debugger
      const target = e.composedPath()[0];
      if (target.id === 'answer') {
        store.dispatch(saveShowAnswer(target.checked));
      } if (target.classList.contains('show-settings')) {
        store.dispatch(saveShowSettings(target.id, target.checked));
      } else {
        let categories = [];
        for (let i = 0; i < this._checkboxes.length; i++) {
          if (this._checkboxes[i].checked) {
            categories.push(this._checkboxes[i].label)
          }
        }
        store.dispatch(saveAvailableTypes(categories));
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
    this.categories = state.data.categories;
    this.showSettings = state.app.showSettings;
    const activeCard = state.data.activeCard;  // {hint, index}

    if (activeCard && activeCard.index) {
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
