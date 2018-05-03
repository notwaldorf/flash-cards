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

// HACK: reenable this when https://github.com/Polymer/tools/issues/173 is fixed.
//import { lazyReducerEnhancer } from 'pwa-helpers/lazy-reducer-enhancer.js';

const compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || origCompose;

// GIANT HACK.
// Remove this when the bundle supports the ... operator correctly.
// See: https://github.com/Polymer/tools/issues/173
const lazyReducerEnhancer = function(combineReducers) {
  return (nextCreator) => {
    return (origReducer, preloadedState) => {
      let lazyReducers = {};
      const nextStore = nextCreator(origReducer, preloadedState)
      function addReducers(newReducers) {
        this.replaceReducer(combineReducers(lazyReducers =
          Object.assign({}, lazyReducers, newReducers)
        ));
      };
      return Object.assign({}, nextStore, {addReducers});
    }
  }
}

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
