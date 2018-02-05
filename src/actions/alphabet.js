export const UPDATE_CARDS = 'UPDATE_CARDS';
export const SHOW_CARD = 'SHOW_CARD';
export const GET_RIGHT = 'GET_RIGHT';
export const GET_WRONG = 'GET_WRONG';
//
// const order=['a','i','u','e','o',
// 'ka','ki','ku','ke','ko',
// 'sa','shi','su','se','so',
// 'ta','chi','tsu','te','to',
// 'na','ni','nu','ne','no',
// 'ha','hi','fu','he','ho',
// 'ma','mi','mu','me','mo',
// 'ya','i','yu','e','yo',
// 'ra','ri','ru','re','ro',
// 'wa','i','u','e','o',
// 'n'];
//

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
