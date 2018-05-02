import { UPDATE_CARDS, SHOW_CARD, GET_RIGHT, GET_WRONG, SAVE_CHOICES } from '../actions/data.js';
import { LOAD_STATS } from '../actions/app.js';

const app = (state = {cards:{}, stats:{}, categories:[]}, action) => {
  let json, value;
  switch (action.type) {
    case UPDATE_CARDS:
      state.cards[action.hint] = action.cards;
      return Object.assign({}, state);
      // return {
      //   ...state,
      //   cards: {...state.cards, [action.hint]: action.cards}
      // }
    case LOAD_STATS:
      state.stats = action.stats;
      return Object.assign({}, state);
      // return {
      //   ...state,
      //   stats: action.stats
      // }
    case SHOW_CARD:
      state.activeCard = action.card;
      return Object.assign({}, state);
      // return {
      //   ...state,
      //   activeCard: action.card
      // }
    case GET_RIGHT:
    case GET_WRONG:
      // Save the stats to local storage. It doesn't matter that we overwrite
      // the previous state, that's the whole point of Redux :)
      const newStats = stats(state.stats, action);
      state.stats = newStats;
      state.activeCard = null;
      return Object.assign({}, state);
      // return {
      //   ...state,
      //   stats: newStats,
      //   activeCard: null
      // }
    case SAVE_CHOICES:
      state.categories = action.categories;
      return Object.assign({}, state);
      // return {
      //   ...state,
      //   categories: action.categories
      // }
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
      state[action.card.hint] = byHint(state[action.card.hint], action);
      return Object.assign({}, state);
      // return {
      //   ...state,
      //   [action.card.hint]: byHint(state[action.card.hint], action)
      // };
    default:
      return state;
  }
}

const byHint = (state = {}, action) => {
  // example: { も:{right:2,wrong:7}, に:{right:1} }
  const card = action.card;
  switch (action.type) {
    case GET_RIGHT:
    case GET_WRONG:
      if (card.question === '') {
        return state;
      }
      state[card.question] = question(state[card.question], action);
      return Object.assign({}, state);
      // return {
      //   ...state,
      //   [card.question]: question(state[card.question], action)
      // };
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

export default app;
