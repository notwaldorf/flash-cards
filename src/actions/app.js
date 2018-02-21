/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';
export const OPEN_SNACKBAR = 'OPEN_SNACKBAR';
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';
export const SAVE_SHOW_ANSWER = 'SAVE_SHOW_ANSWER';
export const SAVE_SHOW_SETTINGS = 'SAVE_SHOW_SETTINGS';
export const LOAD_STATS = 'LOAD_STATS';
import { showNewCard, saveAvailableTypes } from './data.js';

export const navigate = (path) => (dispatch) => {
  // Extract the page name from path.
  const page = path === '/' ? 'view1' : path.slice(1);

  // Any other info you might want to extract from the path (like page type),
  // you can do here
  dispatch(loadPage(page));
};

const loadPage = (page) => async (dispatch) => {
  switch(page) {
    case 'play':
      await import('../components/flash-cards.js');
      // Put code here that you want it to run every time when
      // navigate to view1 page and my-view1.js is loaded
      break;
    case 'stats':
      await import('../components/stats-page.js');
      break;
    default:
      page = 'view404';
      await import('../components/my-view404.js');
  }

  dispatch(updatePage(page));
}

const updatePage = (page) => {
  return {
    type: UPDATE_PAGE,
    page
  };
}

let snackbarTimer;

export const showSnackbar = () => (dispatch) => {
  dispatch({
    type: OPEN_SNACKBAR
  });
  clearTimeout(snackbarTimer);
  snackbarTimer = setTimeout(() =>
    dispatch({ type: CLOSE_SNACKBAR }), 3000);
};

export const updateOffline = (offline) => {
  return {
    type: UPDATE_OFFLINE,
    offline
  };
};

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
