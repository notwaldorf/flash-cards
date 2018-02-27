import { LitElement, html } from '../../node_modules/@polymer/lit-element/lit-element.js'
import { connect } from '../../node_modules/pwa-helpers/connect-mixin.js';
import { repeat } from '../../node_modules/lit-html/lib/repeat.js';
import { store } from '../store.js';
import { settingsIcon } from './my-icons.js';
import './a-card.js';
import './check-box.js';

import { saveShowAnswer, saveShowSettings, saveSaySettings } from '../actions/app.js';
import { showNewCard, getRight, getWrong, saveAvailableTypes } from '../actions/data.js';

class FlashCards extends connect(store)(LitElement) {
  static get properties() {
    return {
      cards: Object,
      card: Object,
      showAnswer: Boolean,
      showSettings: String,
      saySettings: String,
      categories: Array,
      showSettingsPage: Boolean
    }
  }

  render({card, cards, showAnswer, showSettings, saySettings, categories, showSettingsPage}) {
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
        width: 400px;
        min-height: 540px;
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
      <button class="settings-btn" on-click=${() => this._toggleShowSettings()}">${settingsIcon}</button>

      <div id="settings" hidden?="${!showSettingsPage}">
        <check-box id="answer" label="show answer" checked="${showAnswer}"></check-box>

        <h4>Pick from</h4>
        ${repeat(Object.keys(cards), kind =>
          html`
            <check-box label="${kind}" checked="${categories.indexOf(kind)!==-1}" class="categories"></check-box>
          `
        )}

        <h4>Ask me...</h4>
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

        <h4>Read answer...</h4>
        <check-box id="start" class="say-settings"
            label="when card is shown"
            checked="${saySettings == 'start'}">
        </check-box><br>
        <check-box id="end" class="say-settings"
            label="before next card is shown"
            checked="${saySettings == 'end'}">
        </check-box><br>
        <check-box id="demand" class="say-settings"
            label="only when I want to"
            checked="${saySettings == 'demand'}">

      </div>

      <a-card hidden?="${showSettingsPage}"
        question="${card.question}"
        answer="${card.answer}"
        hint="${card.hint}"
        showAnswer="${showAnswer}"
        saySettings="${saySettings}">
      </a-card>
    `;
  }

  constructor() {
    super();
    this.card = {question: '', answer: '', hint: ''};
    this.showSettingsPage = false;
  }

  ready() {
    // Ready to render!
    super.ready();
    this._card = this.shadowRoot.querySelector('a-card');

    this.addEventListener('checked-changed', (e) => this._checkedChanged(e.composedPath()[0]))
    this.addEventListener('next-question', () => store.dispatch(showNewCard()));
    this.addEventListener('answered', (e) => {
      store.dispatch(e.detail.correct ? getRight(this.card) : getWrong(this.card));
    });
  }

  stateChanged(state) {
    this.showAnswer = state.app.showAnswer;
    this.cards = state.data.cards;
    this.categories = state.data.categories;
    this.showSettings = state.app.showSettings;
    this.saySettings = state.app.saySettings;

    const activeCard = state.data.activeCard;  // {hint, index}

    if (activeCard && activeCard.index !== undefined) {
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

  _checkedChanged(target) {
    if (target.id === 'answer') {
      store.dispatch(saveShowAnswer(target.checked));
    } if (target.classList.contains('show-settings')) {
      store.dispatch(saveShowSettings(target.id, target.checked));
    } if (target.classList.contains('say-settings')) {
      store.dispatch(saveSaySettings(target.id, target.checked));
    } else {
      let categories = [];
      const checkboxes = this.shadowRoot.querySelectorAll('.categories');
      for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
          categories.push(checkboxes[i].label)
        }
      }
      store.dispatch(saveAvailableTypes(categories));
    }
  }

  _toggleShowSettings() {
    this.showSettingsPage = !this.showSettingsPage;
  }
}

window.customElements.define('play-page', FlashCards);
