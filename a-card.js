import { LitElement, html } from '../node_modules/@polymer/lit-element/lit-element.js'

class ACard extends LitElement {
  render(props) {
    return html`
    <style>
      :host {
        display: block;
        max-width: 300px;
        text-align: center;
        font-size: 40px;
        border-radius: 5px;
        background: white;
        box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14),
           0 1px 8px 0 rgba(0, 0, 0, 0.12),
           0 3px 3px -2px rgba(0, 0, 0, 0.4);
        padding: 20px;
       }
       .question {
         font-size: 2em;
         font-weight: bold;
         font-family: "Noto Sans Japanese";
       }
       .hint {
         font-size: 0.4em;
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
         font-size: 0.3em;
         text-transform: uppercase;
         font-weight: bold;
         letter-spacing: 1;
         padding: 8px 18px;
         margin: 24px;
         border-radius: 4px;
       }
     </style>
     <div class="question">${props.question}</div>
     <input placeholder="answer">
     <div class="hint">${props.hint}</div>
     <button>submit</button>
    `;
  }

  static get properties() {
    return {
      question: String,
      hint: String
    }
  }
}
window.customElements.define('a-card', ACard);
