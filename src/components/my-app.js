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
import { connect } from '../../node_modules/redux-helpers/connect-mixin.js';
import { installRouter } from '../../node_modules/redux-helpers/router.js';
import '../../node_modules/@polymer/app-layout/app-header/app-header.js';
import '../../node_modules/@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '../../node_modules/@polymer/app-layout/app-toolbar/app-toolbar.js';
import { setPassiveTouchGestures } from '../../node_modules/@polymer/polymer/lib/utils/settings.js';
import { menuIcon } from './my-icons.js';

import { store } from '../store.js';
import { navigate, show404 } from '../actions/app.js';
import { loadLocalStats } from '../actions/alphabet.js';

import alphabet from '../reducers/alphabet.js';

store.addReducers({
  alphabet
});

import { loadAll } from '../actions/alphabet.js';

class MyApp extends connect(store)(LitElement) {
  render({page, appTitle, drawerOpened}) {
    return html`
    <style>
      :host {
        --app-drawer-width: 256px;
        display: block;

        /* Default theme */
        --pink: #E91E63;
        --gray: #293237;
        --app-primary-color: var(--pink);
        --app-secondary-color: var(--gray);
        --app-dark-text-color: var(--app-secondary-color);
        --app-light-text-color: white;
        --app-section-even-color: #f7f7f7;
        --app-section-odd-color: white;

        --app-header-background-color: transparent;
        --app-header-text-color: var(--app-dark-text-color);
        --app-header-selected-color: var(--app-primary-color);
      }

      app-header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        text-align: center;
        background-color: var(--app-header-background-color);
        color: var(--app-header-text-color);
      }

      app-toolbar {
        background: transparent;
        margin: 0 24px;
      }

      [main-title] {
        font-family: 'Pacifico';
        text-transform: lowercase;
        font-size: 30px;
        text-align: left;
      }

      .toolbar-list {
        display: block;
      }

      .toolbar-list a {
        display: inline-block;
        color: var(--app-header-text-color);
        text-decoration: none;
        line-height: 30px;
        padding: 4px 24px;
        font-size: 14px;
        font-weight: bold;
        text-transform: uppercase;
      }

      .toolbar-list a[selected="true"] {
        color: var(--app-header-selected-color);
        border-bottom: 4px solid var(--app-header-selected-color);
      }

      .main-content {
        margin-top: 120px;
        height: 100%;
      }

      .main-content .page[selected="true"] {
        display: block;
      }

      .main-content .page[selected="false"] {
        display: none;
      }
    </style>

    <!-- Header -->
    <app-header condenses reveals effects="waterfall">
      <app-toolbar>
        <div main-title>${appTitle}</div>
        <div class="toolbar-list" role="navigation">
          <a selected$="${page === 'play'}" href="${Polymer.rootPath}play">Play</a>
          <a selected$="${page === 'stats'}" href="${Polymer.rootPath}stats">Stats</a>
        </div>
      </app-toolbar>
    </app-header>

    <!-- Main content -->
    <div class="main-content" role="main">
      <flash-cards class="page" selected$="${page === 'play'}"></flash-cards>
      <stats-page class="page" selected$="${page === 'stats'}"></stats-page>
      <my-view404 class="page" selected$="${page === 'view404'}"></my-view404>
    </div>
`;
  }

  static get is() {
    return 'my-app';
  }

  static get properties() {
    return {
      page: String,
      appTitle: String
    }
  }

  update(state) {
    this.page = state.app.page;
  }

  _propertiesChanged(props, changed, oldProps) {
    if (changed && 'page' in changed) {
      this._pageChanged();
      this._updateMetadata();
    }
    super._propertiesChanged(props, changed, oldProps);
  }

  constructor() {
    super();
    // To force all event listeners for gestures to be passive.
    // See https://www.polymer-project.org/2.0/docs/devguide/gesture-events#use-passive-gesture-listeners
    setPassiveTouchGestures(true);
  }

  ready() {
    super.ready();
    installRouter(this._notifyPathChanged.bind(this));
    store.dispatch(loadAll());

    // If there is local storage data, load it.
    localforage.getItem('__learn_japanese__', function(err, value) {
      if (value) {
        store.dispatch(loadLocalStats(value));
      }
    });
  }

  _notifyPathChanged() {
    store.dispatch(navigate(window.decodeURIComponent(window.location.pathname)));
  }

  _pageChanged() {
    // Load page import on demand. Show 404 page if fails
    let loaded;
    if (!this.page) {
      return;
    }
    switch(this.page) {
      case 'play':
        loaded = import('./flash-cards.js');
        break;
      case 'stats':
        loaded = import('./stats-page.js');
        break;
      case 'view404':
        loaded = import('./my-view404.js');
        break;
      default:
        loaded = Promise.reject();
    }

    loaded.then(
      _ => {},
      _ => { store.dispatch(show404()) }
    );
  }

  _updateMetadata() {
    document.title = this.appTitle + ' - ' + this.page;

    // Set open graph metadata
    this._setMeta('property', 'og:title', document.title);
    // You could replace this with a description, if you had one.
    this._setMeta('property', 'og:description', document.title);
    this._setMeta('property', 'og:url', document.location.href);
    // If you have an image that's specific to each page:
    //this._setMeta('property', 'og:image', ...);

    // Set twitter card metadata
    this._setMeta('property', 'twitter:title', document.title);
      // You could replace this with a description, if you had one.
    this._setMeta('property', 'twitter:description', document.title);
    this._setMeta('property', 'twitter:url', document.location.href);
    // If you have an image that's specific to each page:
    //this._setMeta('property', 'twitter:image:src', ...);
  }

  _setMeta(attrName, attrValue, content) {
    let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content || '');
  }
}

window.customElements.define(MyApp.is, MyApp);
