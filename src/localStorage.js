
export const saveState = (state) => {
  let json = localStorage.getItem('__learn_japanese__') || '{}';
  let stringifiedNewState = JSON.stringify(state);

  if (stringifiedNewState != json && stringifiedNewState !== '{}') {
    localStorage.setItem('__learn_japanese__', stringifiedNewState);
  }
}

export const loadState = () => {
  let json;
   
  // Don't load the state in testing mode.
  if (window.location.hash !== '#test') {
    json = localStorage.getItem('__learn_japanese__') || '{}';
  } else {
    json = '{}';
  }

  let state = JSON.parse(json);

  if (state) {
    // Some sane defaults
    if (state.app) {
      state.app.snackbarOpened = false;
    }
    if (state.data && !state.data.categories) {
      state.data.categories = [];
    }
    return state;
  } else {
    return undefined;
  }
}
