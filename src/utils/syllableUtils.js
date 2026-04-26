const VOWELS = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];
const CONSONANT_BLENDS = ['sh', 'ch', 'th', 'wh', 'ph', 'ck', 'ng', 'str', 'spr', 'spl', 'scr', 'squ', 'thr', 'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr', 'tw', 'sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st'];
const SPECIAL_ENDINGS = ['tion', 'sion', 'ight', 'ound', 'ear', 'air', 'are', 'ave', 'ove', 'one', 'two', 'ake', 'ale', 'ame', 'ate', 'ine', 'ive', 'obe', 'ore', 'ute', 'ule', 'ble', 'cle', 'dle', 'fle', 'gle', 'ple', 'tle', 'ste', 'nce', 'rce', 'tte', 'ppe', 'lle', 'ffe'];

const PHONETIC_DICTIONARY = {
  'a': '/ə/', 'an': '/æn/', 'is': '/ɪz/', 'it': '/ɪt/', 'in': '/ɪn/',
  'this': '/ðɪs/', 'that': '/ðæt/', 'these': '/ðiːz/', 'those': '/ðəʊz/',
  'on': '/ɒn/', 'at': '/æt/', 'as': '/æz/', 'or': '/ɔː/',
  'to': '/tuː/', 'of': '/əv/', 'the': '/ðə/', 'and': '/ænd/',
  'i': '/aɪ/', 'you': '/juː/', 'we': '/wiː/', 'me': '/miː/',
  'he': '/hiː/', 'she': '/ʃiː/', 'they': '/ðeɪ/', 'them': '/ðem/',
  'his': '/hɪz/', 'her': '/hɜː/', 'my': '/maɪ/', 'your': '/jɔː/',
  'what': '/wɒt/', 'where': '/weə/', 'when': '/wen/', 'why': '/waɪ/',
  'how': '/haʊ/', 'which': '/wɪtʃ/', 'who': '/huː/', 'whom': '/huːm/',
  'will': '/wɪl/', 'can': '/kæn/', 'could': '/kʊd/', 'would': '/wʊd/',
  'should': '/ʃʊd/', 'may': '/meɪ/', 'might': '/maɪt/', 'must': '/mʌst/',
  'have': '/hæv/', 'has': '/hæz/', 'had': '/hæd/', 'do': '/duː/',
  'does': '/dʌz/', 'did': '/dɪd/', 'been': '/biːn/', 'being': '/ˈbiːɪŋ/',
  'book': '/bʊk/', 'boy': '/bɔɪ/', 'girl': '/gɜːl/', 'child': '/tʃaɪld/',
  'children': '/ˈtʃɪldrən/', 'man': '/mæn/', 'men': '/men/', 'woman': '/ˈwʊmən/',
  'women': '/ˈwɪmɪn/', 'people': '/ˈpiːpl/', 'cat': '/kæt/', 'dog': '/dɒɡ/',
  'bird': '/bɜːd/', 'fish': '/fɪʃ/', 'tree': '/triː/', 'flower': '/ˈflaʊə/',
  'water': '/ˈwɔːtə/', 'food': '/fuːd/', 'milk': '/mɪlk/', 'eye': '/aɪ/',
  'face': '/feɪs/', 'hand': '/hænd/', 'head': '/hed/', 'home': '/həʊm/',
  'school': '/skuːl/', 'student': '/ˈstjuːdənt/', 'teacher': '/ˈtiːtʃə/',
  'apple': '/ˈæpl/', 'banana': '/bəˈnɑːnə/', 'orange': '/ˈɒrɪndʒ/',
  'beautiful': '/ˈbjuːtɪfl/', 'strawberry': '/ˈstrɔːbəri/', 'happy': '/ˈhæpi/',
  'elephant': '/ˈelɪfənt/', 'butterfly': '/ˈbʌtəflaɪ/', 'china': '/ˈtʃaɪnə/',
  'family': '/ˈfæməli/', 'rainbow': '/ˈreɪnbəʊ/', 'sunshine': '/ˈsʌnʃaɪn/',
  'mountain': '/ˈmaʊntɪn/', 'river': '/ˈrɪvə/', 'ocean': '/ˈəʊʃn/',
  'forest': '/ˈfɒrɪst/', 'hello': '/həˈləʊ/', 'yes': '/jes/', 'no': '/nəʊ/',
  'please': '/pliːz/', 'thank': '/θæŋk/', 'sorry': '/ˈsɒri/', 'good': '/ɡʊd/',
  'morning': '/ˈmɔːnɪŋ/', 'time': '/taɪm/', 'day': '/deɪ/', 'night': '/naɪt/',
  'bed': '/bed/', 'room': '/ruːm/', 'desk': '/desk/', 'bag': '/bæɡ/',
  'pen': '/pen/', 'paper': '/ˈpeɪpə/', 'name': '/neɪm/', 'class': '/klɑːs/',
  'friend': '/frend/', 'love': '/lʌv/', 'word': '/wɜːd/', 'sentence': '/ˈsentəns/',
  'cute': '/kjuːt/', 'tall': '/tɔːl/', 'short': '/ʃɔːt/', 'long': '/lɒŋ/',
  'small': '/smɔːl/', 'big': '/bɪɡ/', 'new': '/njuː/', 'old': '/əʊld/',
  'hot': '/hɒt/', 'cold': '/kəʊld/', 'warm': '/wɔːm/', 'cool': '/kuːl/',
  'eat': '/iːt/', 'drink': '/drɪŋk/', 'sleep': '/sliːp/', 'walk': '/wɔːk/',
  'sit': '/sɪt/', 'stand': '/stænd/', 'run': '/rʌn/', 'jump': '/dʒʌmp/',
};

const VOWEL_PATTERNS = {
  'ea': { sound: '[i]', rule: 'ea 组合发 [i] 音', example: 'read, meat, sea' },
  'ee': { sound: '[i]', rule: 'ee 组合发 [i] 音', example: 'green, see, tree' },
  'oo': { sound: '[u]', rule: 'oo 组合发 [u] 音', example: 'food, moon, room' },
  'oa': { sound: '[o]', rule: 'oa 组合发 [o] 音', example: 'boat, coat, road' },
  'ou': { sound: '[au]', rule: 'ou 组合发 [au] 音', example: 'house, about, mouse' },
  'ow': { sound: '[au]', rule: 'ow 发 [au] 音', example: 'now, how, cow' },
  'ai': { sound: '[ei]', rule: 'ai 组合发 [ei] 音', example: 'rain, wait, train' },
  'ay': { sound: '[ei]', rule: 'ay 组合发 [ei] 音', example: 'day, say, play' },
  'ie': { sound: '[ai]', rule: 'ie 组合发 [ai] 音', example: 'lie, die, tie' },
  'ei': { sound: '[ei]', rule: 'ei 组合发 [ei] 音', example: 'eight, weight, neighbor' },
  'au': { sound: '[o]', rule: 'au 组合发 [o] 音', example: 'autumn, cause, launch' },
  'aw': { sound: '[o]', rule: 'aw 组合发 [o] 音', example: 'draw, saw, law' },
  'oy': { sound: '[oi]', rule: 'oy 组合发 [oi] 音', example: 'boy, toy, enjoy' },
  'oi': { sound: '[oi]', rule: 'oi 组合发 [oi] 音', example: 'coin, point, join' },
  'ir': { sound: '[e]', rule: 'ir 组合发 [e] 音', example: 'bird, girl, first' },
  'er': { sound: '[e]', rule: 'er 组合发 [e] 音', example: 'her, after, teacher' },
  'ur': { sound: '[e]', rule: 'ur 组合发 [e] 音', example: 'turn, burn, fur' },
  'or': { sound: '[o]', rule: 'or 组合发 [o] 音', example: 'for, short, born' },
  'ar': { sound: '[a]', rule: 'ar 组合发 [a] 音', example: 'car, star, art' },
  'air': { sound: '[e]', rule: 'air 组合发 [e] 音', example: 'hair, chair, pair' },
  'ear': { sound: '[e]', rule: 'ear 组合发 [e] 音', example: 'hear, near, year' },
  'eer': { sound: '[ie]', rule: 'eer 组合发 [ie] 音', example: 'deer, beer, peer' },
  'ere': { sound: '[e]', rule: 'ere 组合发 [e] 音', example: 'here, where, there' },
  'are': { sound: '[e]', rule: 'are 组合发 [e] 音', example: 'care, share, dare' },
  'ore': { sound: '[o]', rule: 'ore 组合发 [o] 音', example: 'more, store, before' },
  'ore': { sound: '[o]', rule: 'ore 组合发 [o] 音', example: 'more, store, before' },
  'a': { sound: '[ei]', rule: 'a 在开音节发 [ei]', example: 'make, take, name' },
  'e': { sound: '[i]', rule: 'e 在开音节发 [i]', example: 'be, she, we' },
  'i': { sound: '[ai]', rule: 'i 在开音节发 [ai]', example: 'like, bike, time' },
  'o': { sound: '[o]', rule: 'o 在开音节发 [o]', example: 'go, home, no' },
  'u': { sound: '[ju]', rule: 'u 在开音节发 [ju]', example: 'use, music, tube' },
  'a_e': { sound: '[ei]', rule: 'magic e: a_e 发 [ei]', example: 'make, take, late' },
  'e_e': { sound: '[i]', rule: 'magic e: e_e 发 [i]', example: 'these, scene' },
  'i_e': { sound: '[ai]', rule: 'magic e: i_e 发 [ai]', example: 'like, time, bike' },
  'o_e': { sound: '[o]', rule: 'magic e: o_e 发 [o]', example: 'home, note, code' },
  'u_e': { sound: '[ju]', rule: 'magic e: u_e 发 [ju]', example: 'use, cute, tube' },
};

const CONSONANT_PATTERNS = {
  'sh': { sound: '[sh]', rule: 'sh 发 [sh] 音', example: 'she, fish, ship' },
  'ch': { sound: '[ch]', rule: 'ch 发 [ch] 音', example: 'chair, child, China' },
  'th': { sound: '[th]', rule: 'th 发 [th] 音', example: 'the, this, that' },
  'wh': { sound: '[w]', rule: 'wh 发 [w] 音', example: 'what, when, where' },
  'ph': { sound: '[f]', rule: 'ph 发 [f] 音', example: 'phone, photo, elephant' },
  'ck': { sound: '[k]', rule: 'ck 发 [k] 音', example: 'back, black, check' },
  'ng': { sound: '[ng]', rule: 'ng 发 [ng] 音', example: 'sing, ring, thing' },
  'nk': { sound: '[nk]', rule: 'nk 发 [nk] 音', example: 'think, ink, bank' },
  'gh': { sound: '[g]', rule: 'gh 在元音前发 [g]', example: 'ghost, ghoul' },
  'gh_quiet': { sound: '[]', rule: 'gh 不发音', example: 'night, light, high' },
  'wr': { sound: '[r]', rule: 'wr 发 [r] 音', example: 'write, wrong' },
  'kn': { sound: '[n]', rule: 'kn 发 [n] 音', example: 'know, knee, knife' },
  'mb': { sound: '[m]', rule: 'mb 发 [m] 音', example: 'comb, lamb, climb' },
  'sc': { sound: '[s]', rule: 'sc 发 [s] 音', example: 'scene, science' },
  'tion': { sound: '[shun]', rule: 'tion 发 [shun] 音', example: 'station, nation, education' },
  'sion': { sound: '[zhun]', rule: 'sion 发 [zhun] 音', example: 'vision, decision' },
  'ture': { sound: '[cher]', rule: 'ture 发 [cher] 音', example: 'picture, nature, future' },
  'sure': { sound: '[zher]', rule: 'sure 发 [zher] 音', example: 'measure, pleasure' },
  'sure': { sound: '[shur]', rule: 'sure 发 [shur] 音', example: 'sure, ensure' },
};

function isVowel(char) {
  return VOWELS.includes(char);
}

function isConsonant(char) {
  return /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/.test(char);
}

function findVowelCombo(word, index) {
  if (index + 2 < word.length) {
    const three = word.substring(index, index + 3).toLowerCase();
    if (three === 'eau') return 3;
    if (three === 'eer' || three === 'ear' || three === 'air' || three === 'ore' || three === 'are' || three === 'ere' || three === 'ire' || three === 'ure') {
      return 3;
    }
  }
  const twoCharVowels = ['ea', 'ee', 'oo', 'oa', 'ou', 'ow', 'ai', 'ay', 'ie', 'ei', 'au', 'aw', 'oy', 'oi', 'ir', 'er', 'ur', 'or', 'ar'];
  if (index + 1 < word.length) {
    const two = word.substring(index, index + 2).toLowerCase();
    if (twoCharVowels.includes(two)) return 2;
  }
  if (isVowel(word[index])) return 1;
  return 0;
}

function findBlend(word, index) {
  for (const blend of CONSONANT_BLENDS) {
    if (word.substring(index).toLowerCase().startsWith(blend)) {
      return blend.length;
    }
  }
  return 0;
}

export function getPhonetic(word) {
  if (!word) return null;
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  return PHONETIC_DICTIONARY[lower] || null;
}

export function getDefaultPhonetic(word) {
  const phonetic = getPhonetic(word);
  if (phonetic) return phonetic;
  const syllables = syllabify(word);
  if (syllables.length > 0) {
    return `[${syllables.join('-')}]`;
  }
  return null;
}

export function syllabify(word) {
  if (!word || word.length === 0) return [];

  word = word.toLowerCase().replace(/[^a-z]/g, '');

  const syllables = [];
  let current = '';
  let i = 0;

  while (i < word.length) {
    const vowelLen = findVowelCombo(word, i);

    if (vowelLen > 0) {
      current += word.substring(i, i + vowelLen);
      i += vowelLen;

      while (i < word.length && isConsonant(word[i])) {
        let added = false;
        for (const blend of CONSONANT_BLENDS) {
          if (word.substring(i).toLowerCase().startsWith(blend)) {
            current += word.substring(i, i + blend.length);
            i += blend.length;
            added = true;
            break;
          }
        }
        if (!added) {
          const two = word.substring(i, i + 2).toLowerCase();
          if (two === 'ee' || two === 'oo') {
            current += two;
            i += 2;
            added = true;
          }
        }
        if (!added) {
          if (word[i].toLowerCase() === 'e' && i + 1 < word.length && !isVowel(word[i + 1])) {
            if (i + 2 < word.length && word[i + 1].toLowerCase() === 'e' && word[i + 2].toLowerCase() === 'e') {
              current += 'ee';
              i += 3;
              added = true;
            } else if (i + 2 < word.length && word[i + 1].toLowerCase() === 'a') {
              current += 'ea';
              i += 2;
              added = true;
            } else if (word[i + 1].toLowerCase() !== 's' && word[i + 1].toLowerCase() !== 't') {
              current += 'e';
              i += 1;
              added = true;
            }
          }
        }
        if (!added) {
          current += word[i];
          i += 1;
          added = true;
        }
        if (i < word.length && findVowelCombo(word, i) > 0) break;
      }

      syllables.push(current);
      current = '';
    } else {
      current += word[i];
      i++;
    }
  }

  if (current) {
    if (syllables.length > 0 && !current.match(/[aeiou]/i)) {
      syllables[syllables.length - 1] += current;
    } else {
      syllables.push(current);
    }
  }

  if (syllables.length === 0) return [word];

  return syllables.filter(s => s.length > 0);
}

export function analyzePhoneticRules(syllable, fullWord = '') {
  const result = [];
  const word = syllable.toLowerCase();

  if (word === 'a' && (!fullWord || fullWord.toLowerCase() === 'a')) {
    result.push({
      text: 'a',
      type: 'vowel',
      sound: '[e]',
      rule: '不定冠词 a 发 [e] 音',
      example: 'a book, a girl'
    });
    return result;
  }

  if (word === 'i' && (!fullWord || fullWord.toLowerCase() === 'i')) {
    result.push({
      text: 'i',
      type: 'vowel',
      sound: '[ai]',
      rule: 'I 作为代词发 [ai] 音',
      example: 'I am, I see'
    });
    return result;
  }

  let i = 0;

  while (i < word.length) {
    let matched = false;
    let char = word[i];

    if (i + 2 < word.length) {
      const three = word.substring(i, i + 3);
      if (VOWEL_PATTERNS[three]) {
        result.push({
          text: three,
          type: 'vowel-group',
          sound: VOWEL_PATTERNS[three].sound,
          rule: VOWEL_PATTERNS[three].rule,
          example: VOWEL_PATTERNS[three].example
        });
        i += 3;
        matched = true;
        continue;
      }
    }

    if (i + 1 < word.length) {
      const two = word.substring(i, i + 2);
      if (VOWEL_PATTERNS[two]) {
        result.push({
          text: two,
          type: 'vowel-group',
          sound: VOWEL_PATTERNS[two].sound,
          rule: VOWEL_PATTERNS[two].rule,
          example: VOWEL_PATTERNS[two].example
        });
        i += 2;
        matched = true;
        continue;
      }
    }

    if (i + 3 < word.length) {
      const four = word.substring(i, i + 4);
      if (CONSONANT_PATTERNS[four]) {
        result.push({
          text: four,
          type: 'consonant-group',
          sound: CONSONANT_PATTERNS[four].sound,
          rule: CONSONANT_PATTERNS[four].rule,
          example: CONSONANT_PATTERNS[four].example
        });
        i += 4;
        matched = true;
        continue;
      }
    }

    if (i + 2 < word.length) {
      const three = word.substring(i, i + 3);
      if (CONSONANT_PATTERNS[three]) {
        result.push({
          text: three,
          type: 'consonant-group',
          sound: CONSONANT_PATTERNS[three].sound,
          rule: CONSONANT_PATTERNS[three].rule,
          example: CONSONANT_PATTERNS[three].example
        });
        i += 3;
        matched = true;
        continue;
      }
    }

    if (i + 1 < word.length) {
      const two = word.substring(i, i + 2);
      if (CONSONANT_PATTERNS[two]) {
        result.push({
          text: two,
          type: 'consonant-group',
          sound: CONSONANT_PATTERNS[two].sound,
          rule: CONSONANT_PATTERNS[two].rule,
          example: CONSONANT_PATTERNS[two].example
        });
        i += 2;
        matched = true;
        continue;
      }
    }

    if (!matched) {
      if (isVowel(char)) {
        result.push({
          text: char,
          type: 'vowel',
          sound: VOWEL_PATTERNS[char]?.sound || `[${char}]`,
          rule: '单元音字母',
          example: ''
        });
      } else if (isConsonant(char)) {
        result.push({
          text: char,
          type: 'consonant',
          sound: `[${char}]`,
          rule: '辅音字母',
          example: ''
        });
      } else {
        result.push({
          text: char,
          type: 'other',
          sound: char,
          rule: '',
          example: ''
        });
      }
      i++;
    }
  }

  return result;
}

export function analyzeSyllableFeatures(syllable, fullWord) {
  const features = {
    hasMagicE: false,
    letterCombinations: [],
    phoneticRules: [],
  };

  if (syllable.endsWith('e') && syllable.length > 2) {
    const beforeE = syllable.slice(-2, -1);
    if (isConsonant(beforeE)) {
      features.hasMagicE = true;
    }
  }

  features.phoneticRules = analyzePhoneticRules(syllable, fullWord);

  const combinations = ['tion', 'sion', 'ch', 'sh', 'th', 'wh', 'ph', 'ck', 'ng', 'ight', 'ound', 'ea', 'ou', 'ai', 'ear', 'air'];
  for (const combo of combinations) {
    if (syllable.toLowerCase().includes(combo)) {
      features.letterCombinations.push({
        text: combo,
        index: syllable.toLowerCase().indexOf(combo),
      });
    }
  }

  return features;
}

export function getColorForSyllable(index) {
  const colors = [
    { bg: 'bg-rainbow-blue', text: 'text-blue-700', shadow: 'shadow-blue-400' },
    { bg: 'bg-rainbow-green', text: 'text-green-700', shadow: 'shadow-green-400' },
    { bg: 'bg-rainbow-orange', text: 'text-orange-700', shadow: 'shadow-orange-400' },
    { bg: 'bg-rainbow-pink', text: 'text-pink-700', shadow: 'shadow-pink-400' },
    { bg: 'bg-rainbow-purple', text: 'text-purple-700', shadow: 'shadow-purple-400' },
    { bg: 'bg-rainbow-yellow', text: 'text-yellow-700', shadow: 'shadow-yellow-400' },
  ];
  return colors[index % colors.length];
}
