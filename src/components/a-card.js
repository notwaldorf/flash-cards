import { LitElement, html } from '../../node_modules/@polymer/lit-element/lit-element.js'
import { audioIcon } from './my-icons.js';

class ACard extends LitElement {
  render(props) {
    return html`
    <style>
      :host {
        display: block;
        width: 400px;
        min-height: 300px;
        text-align: center;
        border-radius: 3px;
        background: white;
        box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14),
           0 1px 8px 0 rgba(0, 0, 0, 0.12),
           0 3px 3px -2px rgba(0, 0, 0, 0.4);
        padding: 20px;
       }
       .question {
         font-size: 4.5em;
         font-weight: bold;
         xfont-family: "Noto Sans Japanese";
       }
       .hint {
         font-size: 1em;
         color: #499FFA;
       }
       input {
         font-size: 3rem;
         background: none;
         color: black;
         box-shadow: none;
         border: 0;
         padding: 0;
         border-bottom: 2px solid #E4E4E4;
         width: 100%;
         text-align: center;
       }
       button {
         box-shadow: none;
         border: none;
         cursor: pointer;
       }
       button.green {
         background: #4CAF50;
         color: white;
         font-size: 1em;
         text-transform: uppercase;
         font-weight: bold;
         letter-spacing: 1px;
         padding: 8px 18px;
         margin: 36px 0;
         border-radius: 4px;
       }
       button.say {
         background: transparent;
         vertical-align: middle;
       }
       :host(.yes) {
        outline: 20px solid #64D989;
        outline-offset: -20px;
       }
       :host(.no) {
        outline: 20px solid #E9404B;
        outline-offset: -20px;
       }
     </style>

     <div class="question">${props.question}</div>
     <input autofocus
        placeholder="${props.showAnswer ? props.answer : 'answer'}"
        on-change="${() => this.submit()}">
     <div class="hint">
       ${props.hint}
       <button class="say" id="sayBtn" on-click="${() => this._say()}">${audioIcon}</button>
     </div>
     <button class="green" on-click="${() => this.submit()}">${props.done ? 'next' : 'submit'}</button>
    `;
  }

  static get properties() {
    return {
      question: String,
      hint: String,
      answer: String,
      done: String,
      showAnswer: Boolean,
      say: String,
    }
  }

  ready() {
    super.ready();
    this.done = false;
    this._button = this.shadowRoot.querySelector('button.green');
    this._sayBtn = this.shadowRoot.getElementById('sayBtn');
    this._input = this.shadowRoot.querySelector('input');
    this._input.focus();

    if (!'speechSynthesis' in window) {
      this._sayBtn.hidden = true;
    } else {
      speechSynthesis.onvoiceschanged = () => {
        this._voice = this._getVoice(speechSynthesis.getVoices());
      }
      this._voice = this._getVoice(speechSynthesis.getVoices());
    }
  }

  didRender() {
    if (!this._voice || !this._input) {
      return;
    }
    if (this.say === 'start' && this._previousQuestion !== this.question) {
      this._say();
    }
  }

  _getVoice(voices) {
    this._sayBtn.hidden = false;
    // In Chrome?
    let voice = speechSynthesis.getVoices().filter((voice) => voice.name === 'Google 日本語')[0];
    if (voice) return voice;
    // On a Mac?
    voice = speechSynthesis.getVoices().filter((voice) => voice.name === 'Kyoko')[0];
    if (voice) return voice;
    // I can't find a voice that reads Japanese on Windows
    this._sayBtn.hidden = true;
  }

  _clear() {
    this.done = false;
    this.classList.remove('yes');
    this.classList.remove('no');
    this._input.value = '';
    this._input.focus();
  }

  submit() {
    this._previousQuestion = this.question;

    if (this.done) {  // next answer
      this._clear();
      this.dispatchEvent(new CustomEvent('next-question',
        {bubbles: true, composed: true}));
    } else {  // submit answer
      this.done = true;
      const correct = this._input.value === this.answer;

      if (this.say === 'end') {
        this._say();
      }

      if (correct) {
        this.classList.add('yes');
      } else {
        this._input.value = this.answer;
        this.classList.add('no');
      }
      this.dispatchEvent(new CustomEvent('answered',
        {bubbles: false, composed: true, detail: {correct: correct}}));

      this._button.focus();
    }
  }

  _say() {
    var msg = new SpeechSynthesisUtterance();
    msg.text = this.question;
    msg.lang = 'jp';
    msg.voice = this._voice;
    window.speechSynthesis.speak(msg);
  }
}
window.customElements.define('a-card', ACard);
