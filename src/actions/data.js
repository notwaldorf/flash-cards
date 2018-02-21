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

export const saveAvailableTypes = (categories) => (dispatch, getState) => {
  if (categories) {
    dispatch({type: SAVE_CHOICES, categories});
  } else {
    const state = getState();
    dispatch({type: SAVE_CHOICES, 'categories': Object.keys(state.data.cards)});
  }
};

function getNewCard(state) {
  const cards = state.data.cards;

  // What kind of categories we can pick from (i.e. hiragana or katakana etc).
  let categories = state.data.categories || Object.keys(cards);
  let pickedCategory = Math.floor(Math.random() * categories.length);
  let cardsForCategory = cards[categories[pickedCategory]];

  // You may be in an error state, where you don't get any available cards.
  // in that case... get the first card you can?
  if (!cardsForCategory) {
    categories = Object.keys(cards);
    whatKind = Math.floor(Math.random() * categories.length);
    cardsForCategory = cards[categories[pickedCategory]];
  }

  const whichOne = Math.floor(Math.random() * cardsForCategory.length);
  return {hint: categories[pickedCategory], index: whichOne};
}
