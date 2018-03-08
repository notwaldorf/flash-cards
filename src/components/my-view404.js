import { html } from '../../node_modules/@polymer/lit-element/lit-element.js';
import { PageViewElement } from './page-view-element.js';
import { SharedStyles } from './shared-styles.js';

class MyView404 extends PageViewElement {
  render(props) {
    return html`
      <style>${SharedStyles}</style>
      <h2>Oops! You hit a 404!</h2>
      <p>This page is not a thing.
        Head back <a href="/">to safety</a>.
      </p>
    `
  }
}

window.customElements.define('my-view404', MyView404);
