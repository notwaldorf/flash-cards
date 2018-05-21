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
export const SAVE_SHOW_MNEMONIC = 'SAVE_SHOW_MNEMONIC';
export const SAVE_SHOW_SETTINGS = 'SAVE_SHOW_SETTINGS';
export const SAVE_SAY_SETTINGS = 'SAVE_SAY_SETTINGS';
export const LOAD_STATS = 'LOAD_STATS';
import { showNewCard, saveAvailableTypes } from './data.js';

export const navigate = (path) => (dispatch) => {
  // Extract the page name from path.
  const page = path === '/' ? 'play' : path.slice(1);

  // Any other info you might want to extract from the path (like page type),
  // you can do here
  dispatch(loadPage(page));
};

const loadPage = (page) => async (dispatch) => {
  switch(page) {
    case 'play':
      await import('../components/play-page.js');
      break;
    case 'stats':
      await import('../components/stats-page.js');
      break;
    case 'about':
      await import('../components/about-page.js');
      break;
    default:
      page = 'view404';
      await import('../components/my-view404.js');
      break;
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

export const updateOffline = (offline) => (dispatch, getState) => {
  // Show the snackbar, unless this is the first load of the page.
  if (offline !== getState().app.offline) {
    dispatch(showSnackbar());
  }
  dispatch({
    type: UPDATE_OFFLINE,
    offline
  });
}

export const saveShowAnswer = (shouldShow) => {
  return {
    type: SAVE_SHOW_ANSWER,
    shouldShow
  };
};

export const saveShowMnemonic = (shouldShow) => {
  return {
    type: SAVE_SHOW_MNEMONIC,
    shouldShow
  };
};

export const saveShowSettings = (showSettings) => {
  return {
    type: SAVE_SHOW_SETTINGS,
    showSettings
  };
};

export const saveSaySettings = (saySettings) => {
  return {
    type: SAVE_SAY_SETTINGS,
    saySettings
  };
};
