/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { createStore, compose as origCompose, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import app from './reducers/app.js';
import { loadState, saveState } from './localStorage.js';
import { lazyReducerEnhancer } from 'pwa-helpers/lazy-reducer-enhancer.js';

const compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || origCompose;

export const store = createStore(
  (state, action) => state,
  loadState(),  // If there is local storage data, load it.
  compose(lazyReducerEnhancer(combineReducers), applyMiddleware(thunk))
);

// Initially loaded reducers.
store.addReducers({
  app
});

// This subscriber writes to local storage anytime the state updates.
store.subscribe(() => {
  saveState(store.getState());
});
