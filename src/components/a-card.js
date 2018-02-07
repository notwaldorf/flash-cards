import { LitElement, html } from '../../node_modules/@polymer/lit-element/lit-element.js'

class ACard extends LitElement {
  render(props) {
    return html`
    <style>
      :host {
        display: block;
        width: 300px;
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
         font-family: "Noto Sans Japanese";
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
         width: 150px;
         text-align: center;
       }
       button {
         background: #4CAF50;
         color: white;
         box-shadow: none;
         border: none;
         font-size: 1em;
         text-transform: uppercase;
         font-weight: bold;
         letter-spacing: 1px;
         padding: 8px 18px;
         margin: 36px 0;
         border-radius: 4px;
         cursor: pointer;
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
     <input placeholder="${props.showAnswer ? props.answer : 'answer'}">
     <div class="hint">${props.hint}</div>
     <button on-click="${this.submit.bind(this)}">${this.done ? 'next' : 'submit'}</button>
    `;
  }

  static get properties() {
    return {
      question: String,
      hint: String,
      answer: String,
      done: String,
      showAnswer: Boolean
    }
  }

  ready() {
    super.ready();
    this.done = false;
    this._button = this.shadowRoot.querySelector('button');
    this._input = this.shadowRoot.querySelector('input');
    this._input.addEventListener('change', () => this.submit());
    this._input.focus();
  }

  _clear() {
    this.done = false;
    this.classList.remove('yes');
    this.classList.remove('no');
    this._input.value = '';
    this._input.focus();
  }

  submit() {
    if (this.done) {  // next answer
      this._clear();
      this.dispatchEvent(new CustomEvent('next-question',
        {bubbles: true, composed: true}));
    } else {  // submit answer
      this.done = true;
      const correct = this._input.value === this.answer;

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
}
window.customElements.define('a-card', ACard);
