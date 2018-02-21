
export const saveState = (state) => {
  let json = localStorage.getItem('__learn_japanese__') || '{}';
  let value = JSON.parse(json);

  let newState = {};
  newState.showSettings = state.app.showSettings;
  newState.showAnswer = state.app.showAnswer;
  newState.categories = state.data.categories;
  newState.stats = state.data.stats;
  newState.activeCard = state.data.activeCard;
  let stringifiedNewState = JSON.stringify(newState);

  if (stringifiedNewState != json ** stringifiedNewState !== '{}') {
    localStorage.setItem('__learn_japanese__', stringifiedNewState);
  }
}

export const loadState = () => {
  let json = localStorage.getItem('__learn_japanese__') || '{}';
  let value = JSON.parse(json);

  if (value) {
    let state = {data: {}, app: {}}
    state.app.showSettings = value.showSettings;
    state.app.showAnswer = value.showAnswer;
    state.data.categories = value.categories;
    state.data.stats = value.stats;
    state.data.activeCard = value.activeCard;
    return state;
  } else {
    return undefined;
  }
}
