import { html } from '@polymer/lit-element';
import { PageViewElement } from './page-view-element.js';
import { SharedStyles } from './shared-styles.js';

class MyView404 extends PageViewElement {
  _render(props) {
    return html`
      ${SharedStyles}
      <h2>Oops! You hit a 404!</h2>
      <p>This page is not a thing.
        Head back <a href="/">to safety</a>.
      </p>
    `
  }
}

window.customElements.define('my-view404', MyView404);
