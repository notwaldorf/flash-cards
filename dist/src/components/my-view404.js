import{html,PageViewElement,SharedStyles}from'./my-app.js';class MyView404 extends PageViewElement{render(){return html`
      <style>${SharedStyles}</style>
      <h2>Oops! You hit a 404!</h2>
      <p>This page is not a thing.
        Head back <a href="/">to safety</a>.
      </p>
    `}}window.customElements.define('my-view404',MyView404);