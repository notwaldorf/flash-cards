export const UPDATE_CARDS = 'UPDATE_CARDS';
export const SHOW_CARD = 'SHOW_CARD';
export const GET_RIGHT = 'GET_RIGHT';
export const GET_WRONG = 'GET_WRONG';

const HIRAGANA = [
  {"en":"a","jp":"あ"},{"en":"i","jp":"い"},{"en":"u","jp":"う"},{"en":"e","jp":"え"},{"en":"o","jp":"お"},
  {"en":"ka","jp":"か"},{"en":"ki","jp":"き"},{"en":"ku","jp":"く"},{"en":"ke","jp":"け"},{"en":"ko","jp":"こ"},
  {"en":"sa","jp":"さ"},{"en":"shi","jp":"し"},{"en":"su","jp":"す"},{"en":"se","jp":"せ"},{"en":"so","jp":"そ"},
  {"en":"ta","jp":"た"},{"en":"chi","jp":"ち"},{"en":"tsu","jp":"つ"},{"en":"te","jp":"て"},{"en":"to","jp":"と"},
  {"en":"na","jp":"な"},{"en":"ni","jp":"に"},{"en":"nu","jp":"ぬ"},{"en":"ne","jp":"ね"},{"en":"no","jp":"の"},
  {"en":"ha","jp":"は"},{"en":"hi","jp":"ひ"},{"en":"fu","jp":"ふ"},{"en":"he","jp":"へ"},{"en":"ho","jp":"ほ"},
  {"en":"ma","jp":"ま"},{"en":"mi","jp":"み"},{"en":"mu","jp":"む"},{"en":"me","jp":"め"},{"en":"mo","jp":"も"},
  {"en":"ya","jp":"や"},{"en":"i","jp":"い"},{"en":"yu","jp":"ゆ"},{"en":"e","jp":"え"},{"en":"yo","jp":"よ"},
  {"en":"ra","jp":"ら"},{"en":"ri","jp":"り"},{"en":"ru","jp":"る"},{"en":"re","jp":"れ"},{"en":"ro","jp":"ろ"},
  {"en":"wa","jp":"わ"},{"en":"i","jp":"い"},{"en":"u","jp":"う"},{"en":"e","jp":"え"},{"en":"o","jp":"お"},
  {"en":"n","jp":"ん"}
];

const KATAKANA = [
  {"en":"a","jp":"ア"},{"en":"i","jp":"イ"},{"en":"u","jp":"ウ"},{"en":"e","jp":"エ"},{"en":"o","jp":"オ"},
  {"en":"ka","jp":"カ"},{"en":"ki","jp":"キ"},{"en":"ku","jp":"ク"},{"en":"ke","jp":"ケ"},{"en":"ko","jp":"コ"},
  {"en":"sa","jp":"サ"},{"en":"shi","jp":"シ"},{"en":"su","jp":"ス"},{"en":"se","jp":"セ"},{"en":"so","jp":"ソ"},
  {"en":"ta","jp":"タ"},{"en":"chi","jp":"チ"},{"en":"tsu","jp":"ツ"},{"en":"te","jp":"テ"},{"en":"to","jp":"ト"},
  {"en":"na","jp":"ナ"},{"en":"ni","jp":"ニ"},{"en":"nu","jp":"ヌ"},{"en":"ne","jp":"ネ"},{"en":"no","jp":"ノ"},
  {"en":"ha","jp":"ハ"},{"en":"hi","jp":"ヒ"},{"en":"fu","jp":"フ"},{"en":"he","jp":"ヘ"},{"en":"ho","jp":"ホ"},
  {"en":"ma","jp":"マ"},{"en":"mi","jp":"ミ"},{"en":"mu","jp":"ム"},{"en":"me","jp":"メ"},{"en":"mo","jp":"モ"},
  {"en":"ya","jp":"ヤ"},{"en":"i","jp":"イ"},{"en":"yu","jp":"ユ"},{"en":"e","jp":"エ"},{"en":"yo","jp":"ヨ"},
  {"en":"ra","jp":"ラ"},{"en":"ri","jp":"リ"},{"en":"ru","jp":"ル"},{"en":"re","jp":"レ"},{"en":"ro","jp":"ロ"},
  {"en":"wa","jp":"ワ"},{"en":"i","jp":"イ"},{"en":"u","jp":"ウ"},{"en":"e","jp":"エ"},{"en":"o","jp":"オ"},
  {"en":"n","jp":"ン"}
];

const NUMBERS = [{en: '0',	jp:'零', say: 'zero'},
{en: '1',	jp:'一', say: 'ichi'},
{en: '2',	jp:'二', say: 'ni'},
{en: '3',	jp:'三', say: 'san'},
{en: '4',	jp:'四', say: 'yon'},
{en: '5',	jp:'五', say: 'go'},
{en: '6',	jp:'六', say: 'roku'},
{en: '7',	jp:'七', say: 'nana'},
{en: '8',	jp:'八', say: 'hachi'},
{en: '9',	jp:'九', say: 'kyū'},
{en: '10', jp:'十', say: 'jū'}];

export const loadAll = () => (dispatch) => {
  dispatch(loadHiragana());
  dispatch(loadKatakana());
  dispatch(loadNumbers());
}

export const loadNumbers = () => {
  return {
    type: UPDATE_CARDS,
    cards: NUMBERS,
    hint: 'numbers'
  }
};

export const loadHiragana = () => {
  return {
    type: UPDATE_CARDS,
    cards: HIRAGANA,
    hint: 'hiragana'
  }
};

export const loadKatakana = () => {
  return {
    type: UPDATE_CARDS,
    cards: KATAKANA,
    hint: 'katakana'
  }
};

export const showCard = (card) => {
  return {
    type: SHOW_CARD,
    card
  }
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
