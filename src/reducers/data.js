import { UPDATE_CARDS, SHOW_CARD, GET_RIGHT, GET_WRONG, SAVE_CHOICES } from '../actions/data.js';
import { LOAD_STATS } from '../actions/app.js';
import { createSelector } from 'reselect';

const app = (state = {cards:{}, stats:{}, categories:[]}, action) => {
  let json, value;
  switch (action.type) {
    case UPDATE_CARDS:
      return {
        ...state,
        cards: {...state.cards, [action.category]: action.cards}
      }
    case LOAD_STATS:
      return {
        ...state,
        stats: action.stats
      }
    case SHOW_CARD:
      return {
        ...state,
        activeCard: action.card
      }
    case GET_RIGHT:
    case GET_WRONG:
      // Save the stats to local storage. It doesn't matter that we overwrite
      // the previous state, that's the whole point of Redux :)
      const newStats = stats(state.stats, action);
      return {
        ...state,
        stats: newStats,
        activeCard: null
      }
    case SAVE_CHOICES:
      return {
        ...state,
        categories: action.categories
      }
    default:
      return state;
  }
}

/*
* Sample stats obj:
* stats = { 'hiragana': { 1:{right:2,wrong:7}, 5:{right:1} }, 'katakana': {} }
*/
const stats = (state = {}, action) => {
  switch (action.type) {
    case GET_RIGHT:
    case GET_WRONG:
      return {
        ...state,
        [action.card.category]: byCategory(state[action.card.category], action)
      };
    default:
      return state;
  }
}

const byCategory = (state = {}, action) => {
  // example: { も:{right:2,wrong:7}, に:{right:1} }
  const card = action.card;
  switch (action.type) {
    case GET_RIGHT:
    case GET_WRONG:
      if (card.question === '') {
        return state;
      }
      return {
        ...state,
        [card.question]: question(state[card.question], action)
      };
    default:
      return state;
  }
}

const question = (state = {right: 0, wrong: 0}, action) => {
  switch (action.type) {
    case GET_RIGHT:
      return {
        'right': state.right + 1,
        'wrong': state.wrong
      }
    case GET_WRONG:
      return {
        'right': state.right,
        'wrong': state.wrong + 1
      }
    default:
      return state;
  }
}

const cardsSelector =  state => state.data.cards;
const activeCardSelector =  state => state.data.activeCard;

export const cardSelector = createSelector(
  cardsSelector,
  activeCardSelector,
  (cards, activeCard) => {
    const activeCardData = cards[activeCard.category][activeCard.index];

    return {
      question: activeCardData.jp,
      answers: [].concat(activeCardData.en),
      category: activeCard.category,
      mnemonic: activeCardData.mnemonic
    }
  }
);

export default app;
