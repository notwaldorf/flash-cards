/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { LitElement, html } from '@polymer/lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { installRouter } from 'pwa-helpers/router.js';
import { installOfflineWatcher } from 'pwa-helpers/network.js';
import { updateMetadata } from 'pwa-helpers/metadata.js';

import { store } from '../store.js';
import { navigate, updateOffline } from '../actions/app.js';
import data from '../reducers/data.js';
import { loadAll } from '../actions/data.js';
import './snack-bar.js'

store.addReducers({data});

class MyApp extends connect(store)(LitElement) {
  _render({appTitle, _page, _snackbarOpened, _offline}) {
    return html`
    <style>
      :host {
        --app-drawer-width: 256px;
        display: block;

        --app-primary-color: #C3134E;
        --app-dark-text-color: #293237;

        --app-header-background-color: #FAE1D6;
        --app-header-text-color: var(--app-dark-text-color);
        --app-header-selected-color: var(--app-primary-color);

        height: 100vh;
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
        padding-top: 20px;
      }

      .main-content .page[active] {
        display: block;
      }

      .main-content .page {
        display: none;
      }

      /* Small layout */
      @media (max-width: 460px) {
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
        <a selected?="${_page === 'play'}" href="/play">Play</a>
        <a selected?="${_page === 'stats'}" href="/stats">Stats</a>
        <a selected?="${_page === 'about'}" href="/about">About</a>
      </nav>
    </header>

    <!-- Main content -->
    <main class="main-content" role="main">
      <play-page class="page" active?="${_page === 'play'}"></play-page>
      <stats-page class="page" active?="${_page === 'stats'}"></stats-page>
      <about-page class="page" active?="${_page === 'about'}"></about-page>
      <my-view404 class="page" active?="${_page === 'view404'}"></my-view404>
    </main>

    <snack-bar active?="${_snackbarOpened}">
        You are now ${_offline ? 'offline' : 'online'}.
    </snack-bar>
`;
  }
  static get properties() {
    return {
      appTitle: String,
      _page: String,
      _snackbarOpened: Boolean,
      _offline: Boolean
    }
  }

  _firstRendered() {
    installRouter((location) =>
        store.dispatch(navigate(window.decodeURIComponent(location.pathname))));
    installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
    store.dispatch(loadAll());
  }

  _didRender(properties, changeList) {
    if ('_page' in changeList) {
      const pageTitle = properties.appTitle + ' - ' + changeList._page;
      updateMetadata({
          title: pageTitle,
          description: pageTitle
      });
    }
  }

  _stateChanged(state) {
    this._page = state.app.page;
    this._offline = state.app.offline;
    this._snackbarOpened = state.app.snackbarOpened;
  }
}

window.customElements.define('my-app', MyApp);
