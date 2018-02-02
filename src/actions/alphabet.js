export const UPDATE_CARDS = 'UPDATE_CARDS';
export const SHOW_CARD = 'SHOW_CARD';
export const GET_RIGHT = 'GET_RIGHT';
export const GET_WRONG = 'GET_WRONG';

const HIRAGANA = [{en:'n', jp:'ん'}, {en:'wa', jp:'わ'}, {en:'ra', jp:'ら'}, {en:'ya', jp:'や'}, {en:'ma', jp:'ま'}, {en:'ha', jp:'は'}, {en:'na', jp:'な'}, {en:'ta', jp:'た'}, {en:'sa', jp:'さ'}, {en:'ka', jp:'か'}, {en:'a', jp:'あ'}, {en:'ri', jp:'り'}, {en:'mi', jp:'み'}, {en:'hi', jp:'ひ'}, {en:'ni', jp:'に'}, {en:'chi', jp:'ち'}, {en:'shi', jp:'し'}, {en:'ki', jp:'き'}, {en:'i', jp:'い'}, {en:'ru', jp:'る'}, {en:'yu', jp:'ゆ'}, {en:'mu', jp:'む'}, {en:'fu', jp:'ふ'}, {en:'nu', jp:'ぬ'}, {en:'tsu', jp:'つ'}, {en:'su', jp:'す'}, {en:'ku', jp:'く'}, {en:'u', jp:'う'}, {en:'re', jp:'れ'}, {en:'me', jp:'め'}, {en:'he', jp:'へ'}, {en:'ne', jp:'ね'}, {en:'te', jp:'て'}, {en:'se', jp:'せ'}, {en:'ke', jp:'け'}, {en:'e', jp:'え'}, {en:'wo', jp:'を'}, {en:'ro', jp:'ろ'}, {en:'yo', jp:'よ'}, {en:'mo', jp:'も'}, {en:'ho', jp:'ほ'}, {en:'no', jp:'の'}, {en:'to', jp:'と'}, {en:'so', jp:'そ'}, {en:'ko', jp:'こ'}, {en:'o', jp:'お'}];
const KATAKANA = [{en: 'n', jp:'ン'}, {en: 'wa', jp:'ワ'}, {en: 'ra', jp:'ラ'}, {en: 'ya', jp:'ヤ'}, {en: 'ma', jp:'マ'}, {en: 'ha', jp:'ハ'}, {en: 'na', jp:'ナ'}, {en: 'ta', jp:'タ'}, {en: 'sa', jp:'サ'}, {en: 'ka', jp:'カ'}, {en: 'a', jp:'ア'}, {en: 'ri', jp:'リ'}, {en: 'mi', jp:'ミ'}, {en: 'hi', jp:'ヒ'}, {en: 'ni', jp:'ニ'}, {en: 'chi', jp:'チ'}, {en: 'shi', jp:'シ'}, {en: 'ki', jp:'キ'}, {en: 'i', jp:'イ'}, {en: 'ru', jp:'ル'}, {en: 'yu', jp:'ユ'}, {en: 'mu', jp:'ム'}, {en: 'fu', jp:'フ'}, {en: 'nu', jp:'ヌ'}, {en: 'tsu', jp:'ツ'}, {en: 'su', jp:'ス'}, {en: 'ku', jp:'ク'}, {en: 'u', jp:'ウ'}, {en: 're', jp:'レ'}, {en: 'me', jp:'メ'}, {en: 'he', jp:'ヘ'}, {en: 'ne', jp:'ネ'}, {en: 'te', jp:'テ'}, {en: 'se', jp:'セ'}, {en: 'ke', jp:'ケ'}, {en: 'e', jp:'エ'}, {en: 'wo', jp:'ヲ'}, {en: 'ro', jp:'ロ'}, {en: 'yo', jp:'ヨ'}, {en: 'mo', jp:'モ'}, {en: 'ho', jp:'ホ'}, {en: 'no', jp:'ノ'}, {en: 'to', jp:'ト'}, {en: 'so', jp:'ソ'}, {en: 'ko', jp:'コ'}, {en: 'o', jp:'オ'}];

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
