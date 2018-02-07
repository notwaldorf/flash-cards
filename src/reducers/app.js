/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { NAVIGATE, SHOW_404, SAVE_SHOW_ANSWER, SAVE_SHOW_SETTINGS } from '../actions/app.js';

const app = (state = {page:'', showAnswer:false}, action) => {
  let json, value;
  switch (action.type) {
    case NAVIGATE:
      const path = action.path === '/' ? '/play' : action.path;
      const page = path.slice(1);
      return {
        ...state,
        page: page
      };
    case SHOW_404:
      return {
        ...state,
        page: 'view404'
      };
    case SAVE_SHOW_ANSWER:
      const answer = action.shouldShow;
      json = localStorage.getItem('__learn_japanese__') || '{}';
      value = JSON.parse(json);
      value.showAnswer = answer;
      localStorage.setItem('__learn_japanese__', JSON.stringify(value));
      // Save in store.
      return {
        ...state,
        showAnswer: answer
      };
    case SAVE_SHOW_SETTINGS:
      const settings = action.showSettings;

      json = localStorage.getItem('__learn_japanese__') || '{}';
      value = JSON.parse(json);
      value.showSettings = settings;
      localStorage.setItem('__learn_japanese__', JSON.stringify(value));

      // Save in store.
      return {
        ...state,
        showSettings: settings
      };
    default:
      return state;
  }
}

export default app;
