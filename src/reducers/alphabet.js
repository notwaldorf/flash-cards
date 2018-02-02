import { UPDATE_CARDS, SHOW_CARD, GET_RIGHT, GET_WRONG } from '../actions/alphabet.js';

const app = (state = {cards:{}, stats:{}}, action) => {
  switch (action.type) {
    case UPDATE_CARDS:
      return {
        ...state,
        cards: {...state.cards, [action.hint]: action.cards},
        stats: {...state.stats, [action.hint]: {}}
      }
    case SHOW_CARD:
      return {
        ...state,
        stats: stats(state.stats, action)
      }
      return state;
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
    case SHOW_CARD:
      var f = {
        ...state,
        [action.card.hint]: byHint(state[action.card.hint], action)
      };
      return f;
    default:
      return state;
  }
}

const byHint = (state = {}, action) => {
  // { も:{right:2,wrong:7}, に:{right:1} }
  const card = action.card;
  switch (action.type) {
    case SHOW_CARD:
      return {
        ...state,
        [card.question]: question(state[card.question], action)
      };
    default:
      return state;
  }
}

const question = (state = {right: {}, wrong: {}}, action) => {
  switch (action.type) {
    case GET_RIGHT:
      return {
        'right': state.right + 1,
        wrong
      }
    case GET_WRONG:
      return {
        'wrong': state.wrong + 1,
        right
      }
    default:
      return state;
  }
}


export default app;
