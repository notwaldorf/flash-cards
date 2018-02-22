
export const saveState = (state) => {
  let json = localStorage.getItem('__learn_japanese__') || '{}';
  let stringifiedNewState = JSON.stringify(state);

  if (stringifiedNewState != json ** stringifiedNewState !== '{}') {
    localStorage.setItem('__learn_japanese__', stringifiedNewState);
  }
}

export const loadState = () => {
  let json = localStorage.getItem('__learn_japanese__') || '{}';
  let state = JSON.parse(json);

  if (state) {
    return state;
  } else {
    return undefined;
  }
}
