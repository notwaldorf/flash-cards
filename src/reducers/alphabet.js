import { UPDATE_CARDS } from '../actions/alphabet.js';

const INITIAL_STATS = {
  correct: [],
  asked: []
}

const app = (state = {cards:[]}, action) => {
  switch (action.type) {
    case UPDATE_CARDS:
      return {
        ...state,
        cards: [...state.cards, {'hint': action.hint, 'cards': action.cards}]
      }
    default:
      return state;
  }
}

export default app;
