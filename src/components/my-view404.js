import { LitElement, html } from '../../node_modules/@polymer/lit-element/lit-element.js'
import { SharedStyles } from './shared-styles.js';

class MyView404 extends LitElement {
  render(props) {
    return html`
      <style>${SharedStyles}</style>
      <h2>Oops! You hit a 404!</h2>
      <p>This page is not a thing.
        Head back <a href="http://localhost:8000/">to safety</a>.
      </p>
    `
  }

  static get is() {
    return 'my-view404';
  }
}

window.customElements.define(MyView404.is, MyView404);
