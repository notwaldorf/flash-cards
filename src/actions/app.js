/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

export const NAVIGATE = 'NAVIGATE';
export const SHOW_404 = 'SHOW_404';
export const SAVE_SHOW_ANSWER = 'SAVE_SHOW_ANSWER';
export const SAVE_SHOW_SETTINGS = 'SAVE_SHOW_SETTINGS';
export const LOAD_STATS = 'LOAD_STATS';
import { showNewCard, saveAvailableTypes } from './data.js';

export const loadInitialState = (path) => (dispatch) => {
  // If there is local storage data, load it.
  let json = localStorage.getItem('__learn_japanese__') || '{}';
  let value = JSON.parse(json);
  if (value) {
    dispatch(saveShowAnswer(value.showAnswer));
    dispatch(saveShowSettings(value.showSettings));
    dispatch({ type: LOAD_STATS, stats: value.stats });
    dispatch(showNewCard(value.activeCard));
    dispatch(saveAvailableTypes(value.choices));
  }
};

export const navigate = (path) => {
  return {
    type: NAVIGATE,
    path
  };
};

export const show404 = (path) => {
  return {
    type: SHOW_404,
    path
  };
};

export const saveShowAnswer = (shouldShow) => {
  return {
    type: SAVE_SHOW_ANSWER,
    shouldShow
  };
};

export const saveShowSettings = (showSettings) => {
  return {
    type: SAVE_SHOW_SETTINGS,
    showSettings
  };
};
