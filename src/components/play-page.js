import { html } from '@polymer/lit-element';
import { PageViewElement } from './page-view-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { repeat } from 'lit-html/lib/repeat.js';
import { store } from '../store.js';
import { settingsIcon } from './my-icons.js';
import { SharedStyles } from './shared-styles.js';
import './a-card.js';
import './check-box.js';

import { saveShowAnswer, saveShowSettings, saveSaySettings } from '../actions/app.js';
import { showNewCard, getRight, getWrong, saveAvailableTypes } from '../actions/data.js';

class FlashCards extends connect(store)(PageViewElement) {
  static get properties() {
    return {
      _cards: Object,
      _card: Object,
      _showAnswer: Boolean,
      _showSettings: String,
      _saySettings: String,
      _categories: Array,
      _showSettingsPage: Boolean
    }
  }

  render({_card, _cards, _showAnswer, _showSettings, _saySettings, _categories, _showSettingsPage}) {
    return html`
      <style>
      ${SharedStyles}

      :host {
        display: block;
        box-sizing: border-box;
        position: relative;
        /* Override shared styles */
        margin: 60px 40px !important;
        padding: 0!important;
      }

      [hidden] {
        display: none !important;
      }

      .settings-btn {
        position: absolute;
        right: -20px;
        top: -20px;
        background-color: #FAE1D6;
        text-align: center;
        border-radius: 50%;
        padding: 6px;
        border: 6px solid #fff;
        cursor: pointer;
        z-index: 1;
      }
      #settings {
        min-height: 540px;
        border-radius: 3px;
        background: white;
        box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14),
           0 1px 8px 0 rgba(0, 0, 0, 0.12),
           0 3px 3px -2px rgba(0, 0, 0, 0.4);
        padding: 20px;
      }
      a-card, #settings {
        box-sizing: border-box;
        max-width: 400px;
        width: 100%;
      }
      h4 {
        line-height: 1;
      }
      </style>
      <button class="settings-btn"
          title="settings"
          on-click=${() => this._toggleShowSettings()}">
        ${settingsIcon}
      </button>

      <div id="settings" hidden?="${!_showSettingsPage}">
        <check-box id="answer" label="show answer" checked="${_showAnswer}"></check-box>

        <h4>Pick from</h4>
        ${repeat(Object.keys(_cards), kind =>
          html`
            <check-box label="${kind}" checked="${_categories.indexOf(kind)!==-1}" class="categories"></check-box>
          `
        )}

        <h4>Ask me...</h4>
        <check-box id="all" class="show-settings"
            label="all cards"
            checked="${_showSettings == 'all'}">
        </check-box><br>
        <check-box id="onlyNew" class="show-settings"
            label="only cards I haven't seen"
            checked="${_showSettings == 'onlyNew'}">
        </check-box><br>
        <check-box id="mostlyWrong" class="show-settings"
            label="only cards I've gotten mostly wrong"
            checked="${_showSettings == 'mostlyWrong'}">
        </check-box><br>
        <check-box id="mostlyRight" class="show-settings"
            label="only cards I've gotten mostly right"
            checked="${_showSettings == 'mostlyRight'}">
        </check-box>

        <h4>Read answer...</h4>
        <check-box id="start" class="say-settings"
            label="when card is shown"
            checked="${_saySettings == 'start'}">
        </check-box><br>
        <check-box id="end" class="say-settings"
            label="before next card is shown"
            checked="${_saySettings == 'end'}">
        </check-box><br>
        <check-box id="demand" class="say-settings"
            label="only when I want to"
            checked="${_saySettings == 'demand'}">
      </div>

      <a-card hidden?="${_showSettingsPage}"
        question="${_card.question}"
        answer="${_card.answer}"
        hint="${_card.hint}"
        showAnswer="${_showAnswer}"
        saySettings="${_saySettings}">
      </a-card>
    `;
  }

  constructor() {
    super();
    this._card = {question: '', answer: '', hint: ''};
    this._showSettingsPage = false;
  }

  ready() {
    // Ready to render!
    super.ready();

    this.addEventListener('checked-changed', (e) => this._checkedChanged(e.composedPath()[0]))
    this.addEventListener('next-question', () => store.dispatch(showNewCard()));
    this.addEventListener('answered', (e) => {
      store.dispatch(e.detail.correct ? getRight(this._card) : getWrong(this._card));
    });
  }

  stateChanged(state) {
    this._showAnswer = state.app.showAnswer;
    this._cards = state.data.cards;
    this._categories = state.data.categories;
    this._showSettings = state.app.showSettings;
    this._saySettings = state.app.saySettings;

    const activeCard = state.data.activeCard;  // {hint, index}

    if (activeCard && activeCard.index !== undefined) {
      if (!this._cards[activeCard.hint]) {
        // Oops, you're in an error state. This card doesn't exist anymore.
        store.dispatch(showNewCard());
        return;
      }
      const activeCardData = this._cards[activeCard.hint][activeCard.index];
      this._card = {
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
    this._showSettingsPage = !this._showSettingsPage;
  }
}

window.customElements.define('play-page', FlashCards);
