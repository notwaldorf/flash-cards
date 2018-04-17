import { LitElement, html } from '@polymer/lit-element';

class CheckBox extends LitElement {
  render({label, checked}) {
    return html`
      <style>
        :host {
          display: inline-block;
          position: relative;
          padding-left: 30px;
          margin-bottom: 12px;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Hide the browser's default checkbox */
        .container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        /* Create a custom checkbox */
        .checkmark {
          cursor: pointer;
          position: absolute;
          top: 0;
          left: 0;
          height: 20px;
          width: 20px;
          background-color: transparent;
          border: 2px solid black;
        }

        /* Create the checkmark/indicator (hidden when not checked) */
        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }

        /* Show the checkmark when checked */
        .container input:checked ~ .checkmark:after {
          display: block;
        }

        /* Style the checkmark/indicator */
        .container .checkmark:after {
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid black;
          border-width: 0 3px 3px 0;
          -webkit-transform: rotate(45deg);
          -ms-transform: rotate(45deg);
          transform: rotate(45deg);
        }
      </style>
      <label class="container">${label}
        <input type="checkbox" checked="${checked}" on-change="${(e) => this._checkedChanged(e) }">
        <span class="checkmark"></span>
      </label>
    `;
  }

  static get properties() {
    return {
      label: String,
      checked: Boolean
    }
  }

  constructor() {
    super();
    this.checked = false;
  }

  _checkedChanged(event) {
    this.checked = event.currentTarget.checked
    this.dispatchEvent(new CustomEvent('checked-changed', {bubbles: false, composed: true}));
  }
}
window.customElements.define('check-box', CheckBox);
