/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { LitElement, html } from '../../node_modules/@polymer/lit-element/lit-element.js';
import { connect } from '../../node_modules/pwa-helpers/connect-mixin.js';
import { installRouter } from '../../node_modules/pwa-helpers/router.js';
import { installOfflineWatcher } from '../../node_modules/pwa-helpers/network.js';
import { updateSEOMetadata } from '../../node_modules/pwa-helpers/seo-metadata.js';

import { store } from '../store.js';
import { navigate, updateOffline, showSnackbar } from '../actions/app.js';
import data from '../reducers/data.js';
import { loadAll } from '../actions/data.js';
import './snack-bar.js'

store.addReducers({data});
const responsiveWidth = '460px';

class MyApp extends connect(store)(LitElement) {
  render({page, appTitle, snackbarOpened, offline}) {
    if (page && appTitle) {
      const pageTitle = appTitle + ' - ' + page;
      updateSEOMetadata({
        title: pageTitle,
        description: pageTitle,
        url: document.location.href,
      });
    }
    return html`
    <style>
      :host {
        --app-drawer-width: 256px;
        display: block;

        --app-primary-color: #E91E63;
        --app-dark-text-color: #293237;

        --app-header-background-color: #FAE1D6;
        --app-header-text-color: var(--app-dark-text-color);
        --app-header-selected-color: var(--app-primary-color);
      }

      header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: var(--app-header-background-color);
        color: var(--app-header-text-color);
        display: flex;
        justify-content: space-between;
        padding: 0 24px;
        box-sizing: border-box;
      }

      [main-title] {
        font-family: 'Pacifico';
        text-transform: lowercase;
        font-size: 30px;
        text-align: left;
      }

      .toolbar-list {
        display: inline-block;
      }

      .toolbar-list a {
        display: inline-block;
        color: var(--app-header-text-color);
        text-decoration: none;
        line-height: 30px;
        padding: 4px 16px;
        font-size: 14px;
        font-weight: bold;
        text-transform: uppercase;
      }

      .toolbar-list a[selected] {
        color: var(--app-header-selected-color);
        border-bottom: 4px solid var(--app-header-selected-color);
      }

      .main-content {
        margin-top: 120px;
        height: 100%;
      }

      .main-content .page[selected] {
        display: block;
      }

      .main-content .page {
        display: none;
      }

      /* Small layout */
      @media (max-width: ${responsiveWidth}) {
        [main-title] {
          font-size: 26px;
        }
        .toolbar-list a {
          font-size: 12px;
          padding: 2px 4px;
        }
      }
    </style>

    <!-- Header -->
    <header>
      <span main-title>${appTitle}</span>
      <nav class="toolbar-list" role="navigation">
        <a selected?="${page === 'play'}" href="/play">Play</a>
        <a selected?="${page === 'stats'}" href="/stats">Stats</a>
        <a selected?="${page === 'about'}" href="/about">About</a>
      </nav>
    </header>

    <!-- Main content -->
    <main class="main-content" role="main">
      <play-page class="page" selected?="${page === 'play'}"></play-page>
      <stats-page class="page" selected?="${page === 'stats'}"></stats-page>
      <about-page class="page" selected?="${page === 'about'}"></about-page>
      <my-view404 class="page" selected?="${page === 'view404'}"></my-view404>
    </main>

    <snack-bar active$="${snackbarOpened}">
        You are now ${offline ? 'offline' : 'online'}.
    </snack-bar>
`;
  }

  static get is() {
    return 'my-app';
  }

  static get properties() {
    return {
      page: String,
      appTitle: String,
      snackbarOpened: Boolean,
      offline: Boolean
    }
  }

  ready() {
    super.ready();
    installRouter(() => this._locationChanged());
    installOfflineWatcher((offline) => this._offlineChanged(offline));
    store.dispatch(loadAll());
  }

  stateChanged(state) {
    this.page = state.app.page;
    this.offline = state.app.offline;
    this.snackbarOpened = state.app.snackbarOpened;
  }

  _offlineChanged(offline) {
    const previousOffline = this.offline;

    // Don't show the snackbar on the first load of the page.
    if (previousOffline === undefined || this.offline == offline) {
      return;
    }

    store.dispatch(updateOffline(offline));
    store.dispatch(showSnackbar());
  }

  _locationChanged() {
    store.dispatch(navigate(window.decodeURIComponent(window.location.pathname)));
  }
}

window.customElements.define(MyApp.is, MyApp);
