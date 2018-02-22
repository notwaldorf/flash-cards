export const UPDATE_CARDS = 'UPDATE_CARDS';
export const SHOW_CARD = 'SHOW_CARD';
export const GET_RIGHT = 'GET_RIGHT';
export const GET_WRONG = 'GET_WRONG';
export const SAVE_CHOICES = 'SAVE_CHOICES';

export const loadAll = () => async (dispatch) => {
  dispatch(await loadFile('hiragana'));
  dispatch(await loadFile('katakana'));
  dispatch(await loadFile('numbers'));
  dispatch(await loadFile('basic-phrases'));
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
  if (!card || !card.index) {
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
  let categories = state.data.categories.length !== 0 ? state.data.categories : Object.keys(cards);
  let showSettings = state.app.showSettings;  // all, onlyNew, mostlyRight, mostlyWrong.

  let randomCard = pickCardFromCategories(cards, state.data.stats, categories, showSettings);

  // If we didn't have any cards from this category, try again from
  while (randomCard.index === null && categories.length !== 0) {
    categories = categories.filter(item => item !== randomCard.hint);
    if (categories.length !== 0)
      randomCard = pickCardFromCategories(cards, state.data.stats, categories, showSettings);
  }

  if (randomCard.index !== null) {
    return randomCard;
  }

  // If we ran out of categories to pick from and we _still_ don't have
  // a card, then we may be in an error state, or don't have any available cards.
  // in that case... get the first card you can?
  if (categories.length === 0) {
    categories = Object.keys(cards);
    const pickedCategory = Math.floor(Math.random() * categories.length);
    const hint = categories[pickedCategory];
    const filteredCards = cards[hint];
    const whichOne = Math.floor(Math.random() * filteredCards.length);
    const index = getIndexOfCard(filteredCards[whichOne], cards[hint]);
    return {hint: hint, index:index};
  }
}

function getIndexOfCard(card, cards) {
  for (let i = 0; i < cards.length; i++) {
    if (card == cards[i]) {
      return i;
    }
  }
}

function pickCardFromCategories(cards, stats, categories, showSettings) {
  let pickedCategory = Math.floor(Math.random() * categories.length);
  let hint = categories[pickedCategory];
  let cardsForCategory = cards[hint];
  let statsForCategory = stats ? stats[hint] : [];

  let filteredCards;
  if (showSettings === 'onlyNew') {
    filteredCards = cardsForCategory.filter(card => statsForCategory[card.jp] === undefined);
  } else if (showSettings === 'mostlyRight') {
    filteredCards = cardsForCategory.filter(card => statsForCategory[card.jp] && statsForCategory[card.jp].right > statsForCategory[card.jp].wrong);
  } else if (showSettings === 'mostlyWrong') {
    filteredCards = cardsForCategory.filter(card => statsForCategory[card.jp] && statsForCategory[card.jp].right < statsForCategory[card.jp].wrong);
  } else {
    // This includes 'all' or like, invalid settings.
    filteredCards = cardsForCategory;
  }

  // If there are no available cards, return the category so that we can try
  // again from a different category.
  if (filteredCards.length === 0) {
    return {hint: hint, index:null};
  }

  const whichOne = Math.floor(Math.random() * filteredCards.length);
  const index = getIndexOfCard(filteredCards[whichOne], cardsForCategory);
  return {hint: hint, index:index};
}
