import{html,PageViewElement,SharedStyles}from'./my-app.js';class AboutPage extends PageViewElement{render(){return html`
      <style>${SharedStyles}</style>
      <h2>About</h2>
      <p>
        <b>Theory</b>: much like presentation-slides-in-javascript libraries, every
        developer will eventually write their own flash cards app.
      </p>
        This app is built on top of
        <a href="https://github.com/PolymerLabs/pwa-starter-kit">pwa-starer-kit</a>,
        with Web Components, Redux and <a href="https://github.com/polymer/lit-html">lit-html</a>.
        Find the code on <a href="https://github.com/notwaldorf/flash-cards">GitHub</a>.
      </p>
      <p>🐣💫🎊 by <a href="https://twitter.com/notwaldorf">Monica</a></p>
    `}}window.customElements.define('about-page',AboutPage);