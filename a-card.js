import { LitElement, html } from '../node_modules/@polymer/lit-element/lit-element.js'

class ACard extends LitElement {
  render(props) {
    return html`<h1>Hello</h1>`;
  }
}
window.customElements.define('a-card', ACard);
