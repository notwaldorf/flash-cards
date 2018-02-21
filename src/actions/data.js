export const UPDATE_CARDS = 'UPDATE_CARDS';
export const SHOW_CARD = 'SHOW_CARD';
export const GET_RIGHT = 'GET_RIGHT';
export const GET_WRONG = 'GET_WRONG';
export const SAVE_CHOICES = 'SAVE_CHOICES';

import { loadInitialState } from './app.js';

export const loadAll = () => async (dispatch) => {
  dispatch(await loadFile('hiragana'));
  dispatch(await loadFile('katakana'));
  dispatch(await loadFile('numbers'));

  dispatch(loadInitialState());
}

async function loadFile(name) {
  const resp = await fetch(`/src/data/${name}.json`);
  const data = await resp.json();
  return {
    type: UPDATE_CARDS,
    cards: data,
    hint: name
  }
}

export const showNewCard = (card) => (dispatch, getState) => {
  // Generate a new card if there's none to show.
  if (!card) {
    card = getNewCard(getState());
  }
  dispatch({ type: SHOW_CARD, card});
};

export const getRight = (card) => {
  return {
    type: GET_RIGHT,
    card
  }
};

export const getWrong = (card) => {
  return {
    type: GET_WRONG,
    card
  }
};

export const saveAvailableTypes = (choices) => (dispatch, getState) => {
  if (choices) {
    dispatch({type: SAVE_CHOICES, choices});
  } else {
    const state = getState();
    dispatch({type: SAVE_CHOICES, 'choices': Object.keys(state.data.cards)});
  }
};

function getNewCard(state) {
  const cards = state.data.cards;
  let choices = state.data.choices || Object.keys(cards);
  let whatKind = Math.floor(Math.random() * choices.length); // i.e. hiragana or katakana.
  let availableCards = cards[choices[whatKind]];

  // You may be in an error state, where you don't get any available cards.
  // in that case... get the first card you can?
  if (!availableCards) {
    choices = Object.keys(cards);
    whatKind = Math.floor(Math.random() * choices.length);
    availableCards = cards[choices[whatKind]];
  }

  const whichOne = Math.floor(Math.random() * availableCards.length);
  return {hint: choices[whatKind], index: whichOne};
}
