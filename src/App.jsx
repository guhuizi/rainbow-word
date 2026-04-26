import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { syllabify, getColorForSyllable, analyzeSyllableFeatures, analyzePhoneticRules, getDefaultPhonetic } from './utils/syllableUtils'

const COMMON_MISSPELLINGS = {
  'hellow': 'hello',
  'wrold': 'world',
  'teh': 'the',
  'recieve': 'receive',
  'beleive': 'believe',
  'occured': 'occurred',
  'untill': 'until',
  'tommorow': 'tomorrow',
  'writting': 'writing',
}

const POS_COLORS = {
  noun: { bg: 'bg-blue-400', text: 'text-blue-900', shadow: 'shadow-blue-400', label: '名词', zh: '人/物' },
  verb: { bg: 'bg-red-400', text: 'text-red-900', shadow: 'shadow-red-400', label: '动词', zh: '动作' },
  adjective: { bg: 'bg-yellow-400', text: 'text-yellow-900', shadow: 'shadow-yellow-400', label: '形容词', zh: '描述' },
  adverb: { bg: 'bg-green-400', text: 'text-green-900', shadow: 'shadow-green-400', label: '副词', zh: '方式' },
  preposition: { bg: 'bg-orange-400', text: 'text-orange-900', shadow: 'shadow-orange-400', label: '介词', zh: '位置' },
  pronoun: { bg: 'bg-purple-400', text: 'text-purple-900', shadow: 'shadow-purple-400', label: '代词', zh: '代替' },
  conjunction: { bg: 'bg-pink-400', text: 'text-pink-900', shadow: 'shadow-pink-400', label: '连词', zh: '连接' },
  determiner: { bg: 'bg-indigo-400', text: 'text-indigo-900', shadow: 'shadow-indigo-400', label: '冠词/限定词', zh: '指示' },
  number: { bg: 'bg-teal-400', text: 'text-teal-900', shadow: 'shadow-teal-400', label: '数词', zh: '数量' },
  punctuation: { bg: 'bg-gray-400', text: 'text-gray-900', shadow: 'shadow-gray-400', label: '标点', zh: '' },
  unknown: { bg: 'bg-gray-400', text: 'text-gray-900', shadow: 'shadow-gray-400', label: '未知', zh: '' },
};

const POS_DICTIONARY = {
  the: 'determiner', a: 'determiner', an: 'determiner',
  i: 'pronoun', you: 'pronoun', he: 'pronoun', she: 'pronoun', it: 'pronoun',
  we: 'pronoun', they: 'pronoun', me: 'pronoun', him: 'pronoun', her: 'pronoun',
  us: 'pronoun', them: 'pronoun', my: 'pronoun', your: 'pronoun', his: 'pronoun',
  its: 'pronoun', our: 'pronoun', their: 'pronoun', this: 'pronoun', that: 'pronoun',
  these: 'pronoun', those: 'pronoun', what: 'pronoun', which: 'pronoun', who: 'pronoun',

  is: 'verb', am: 'verb', are: 'verb', was: 'verb', were: 'verb', be: 'verb',
  been: 'verb', being: 'verb', have: 'verb', has: 'verb', had: 'verb', having: 'verb',
  do: 'verb', does: 'verb', did: 'verb', doing: 'verb', will: 'verb', would: 'verb',
  can: 'verb', could: 'verb', should: 'verb', may: 'verb', might: 'verb', must: 'verb',
  to: 'verb', love: 'verb', like: 'verb', want: 'verb', need: 'verb', know: 'verb',
  think: 'verb', see: 'verb', look: 'verb', make: 'verb', go: 'verb', come: 'verb',
  say: 'verb', get: 'verb', take: 'verb', read: 'verb', play: 'verb', run: 'verb',
  eat: 'verb', drink: 'verb', sleep: 'verb', walk: 'verb', sit: 'verb', stand: 'verb',
  write: 'verb', learn: 'verb', study: 'verb', teach: 'verb', help: 'verb',
  call: 'verb', ask: 'verb', answer: 'verb', listen: 'verb', speak: 'verb', talk: 'verb',
  swim: 'verb', fly: 'verb', jump: 'verb', climb: 'verb', dance: 'verb',
  sing: 'verb', draw: 'verb', paint: 'verb', cook: 'verb', wash: 'verb',
  open: 'verb', close: 'verb', start: 'verb', stop: 'verb', finish: 'verb', begin: 'verb',

  beautiful: 'adjective', big: 'adjective', small: 'adjective', tall: 'adjective',
  short: 'adjective', long: 'adjective', new: 'adjective', old: 'adjective',
  good: 'adjective', bad: 'adjective', happy: 'adjective', sad: 'adjective',
  hot: 'adjective', cold: 'adjective', warm: 'adjective', cool: 'adjective',
  fast: 'adjective', slow: 'adjective', easy: 'adjective', hard: 'adjective',
  bright: 'adjective', dark: 'adjective', loud: 'adjective', quiet: 'adjective',
  clean: 'adjective', dirty: 'adjective', full: 'adjective', empty: 'adjective',
  young: 'adjective', rich: 'adjective', poor: 'adjective',
  safe: 'adjective', dangerous: 'adjective', healthy: 'adjective', sick: 'adjective',
  strong: 'adjective', weak: 'adjective', busy: 'adjective', free: 'adjective',
  clever: 'adjective', silly: 'adjective', kind: 'adjective', nice: 'adjective',
  brave: 'adjective', shy: 'adjective', funny: 'adjective', serious: 'adjective',

  book: 'noun', books: 'noun', cat: 'noun', cats: 'noun', dog: 'noun', dogs: 'noun',
  house: 'noun', houses: 'noun', car: 'noun', cars: 'noun', tree: 'noun', trees: 'noun',
  flower: 'noun', flowers: 'noun', sun: 'noun', moon: 'noun', star: 'noun', stars: 'noun',
  water: 'noun', food: 'noun', friend: 'noun', friends: 'noun', family: 'noun',
  mother: 'noun', father: 'noun', sister: 'noun', brother: 'noun', teacher: 'noun',
  student: 'noun', school: 'noun', class: 'noun', room: 'noun', door: 'noun',
  window: 'noun', table: 'noun', chair: 'noun', bed: 'noun', picture: 'noun',
  hand: 'noun', head: 'noun', eye: 'noun', face: 'noun', name: 'noun', day: 'noun',
  time: 'noun', year: 'noun', week: 'noun', month: 'noun', morning: 'noun',
  afternoon: 'noun', evening: 'noun', night: 'noun', today: 'noun', tomorrow: 'noun',
  monday: 'noun', tuesday: 'noun', wednesday: 'noun', thursday: 'noun', friday: 'noun',
  saturday: 'noun', sunday: 'noun', january: 'noun', february: 'noun', march: 'noun',
  apple: 'noun', banana: 'noun', orange: 'noun', egg: 'noun', milk: 'noun',
  bread: 'noun', rice: 'noun', meat: 'noun', fish: 'noun', vegetable: 'noun',
  coffee: 'noun', tea: 'noun', juice: 'noun', cake: 'noun', cookie: 'noun',
  girl: 'noun', boy: 'noun', baby: 'noun', child: 'noun', children: 'noun',
  man: 'noun', men: 'noun', woman: 'noun', women: 'noun', people: 'noun',
  bird: 'noun', birds: 'noun', rabbit: 'noun', horse: 'noun', mouse: 'noun',
  bag: 'noun', bags: 'noun', pen: 'noun', pens: 'noun', pencil: 'noun',
  desk: 'noun', desks: 'noun', garden: 'noun', park: 'noun',
  leg: 'noun', legs: 'noun', foot: 'noun', feet: 'noun', ear: 'noun', ears: 'noun',
  nose: 'noun', mouth: 'noun', hair: 'noun', neck: 'noun', arm: 'noun', arms: 'noun',
  ball: 'noun', game: 'noun', toy: 'noun', toys: 'noun', letter: 'noun',
  paper: 'noun', card: 'noun', photo: 'noun', computer: 'noun',
  street: 'noun', city: 'noun', country: 'noun', world: 'noun', thing: 'noun',
  money: 'noun', shop: 'noun', store: 'noun', hospital: 'noun', office: 'noun',
  bus: 'noun', train: 'noun', bike: 'noun', ship: 'noun', plane: 'noun',
  one: 'number', two: 'number', three: 'number', four: 'number', five: 'number',
  six: 'number', seven: 'number', eight: 'number', nine: 'number', ten: 'number',

  in: 'preposition', on: 'preposition', at: 'preposition', from: 'preposition',
  with: 'preposition', without: 'preposition', about: 'preposition',
  for: 'preposition', of: 'preposition', by: 'preposition', under: 'preposition',
  over: 'preposition', between: 'preposition', into: 'preposition',
  through: 'preposition', during: 'preposition', before: 'preposition', after: 'preposition',
  behind: 'preposition', beside: 'preposition', near: 'preposition',

  and: 'conjunction', but: 'conjunction', or: 'conjunction', so: 'conjunction',
  because: 'conjunction', when: 'conjunction', where: 'conjunction', if: 'conjunction',
  although: 'conjunction', while: 'conjunction', since: 'conjunction', unless: 'conjunction',

  very: 'adverb', really: 'adverb', also: 'adverb', too: 'adverb', only: 'adverb',
  just: 'adverb', still: 'adverb', already: 'adverb', often: 'adverb', always: 'adverb',
  never: 'adverb', sometimes: 'adverb', usually: 'adverb', quickly: 'adverb', slowly: 'adverb',
  well: 'adverb', together: 'adverb', away: 'adverb', back: 'adverb',
  here: 'adverb', there: 'adverb', now: 'adverb', then: 'adverb',
};

function getPOS(word) {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  if (POS_DICTIONARY[cleanWord]) {
    return POS_DICTIONARY[cleanWord];
  }
  if (cleanWord.endsWith('ly') && cleanWord.length > 3) {
    return 'adverb';
  }
  if (cleanWord.endsWith('ing') && cleanWord.length > 4) {
    return 'verb';
  }
  if (cleanWord.endsWith('ed') && cleanWord.length > 3) {
    return 'verb';
  }
  if (cleanWord.endsWith('tion') || cleanWord.endsWith('sion')) {
    return 'noun';
  }
  if (cleanWord.endsWith('ness') || cleanWord.endsWith('ment')) {
    return 'noun';
  }
  if (cleanWord.endsWith('ful') || cleanWord.endsWith('less') || cleanWord.endsWith('able') || cleanWord.endsWith('ible')) {
    return 'adjective';
  }
  if (cleanWord.endsWith('er') && cleanWord.length > 3) {
    return 'noun';
  }
  if (cleanWord.endsWith('est')) {
    return 'adjective';
  }
  if (cleanWord.endsWith('s') && cleanWord.length > 2) {
    return 'noun';
  }
  return 'unknown';
}

function analyzeSentenceStructure(sentence) {
  const words = sentence.split(/\s+/).filter(w => w.length > 0);
  const result = [];
  let hasMissingArticle = false;
  let hasSubject = false;
  let hasVerb = false;

  for (const word of words) {
    const pos = getPOS(word);
    result.push({ word, pos });

    if (pos === 'noun' || pos === 'pronoun') hasSubject = true;
    if (pos === 'verb') hasVerb = true;
    if (word.toLowerCase() === 'a' || word.toLowerCase() === 'an' || word.toLowerCase() === 'the') {
    }
  }

  const singularNouns = result.filter(r => r.pos === 'noun' && !r.word.endsWith('s'));

  if (singularNouns.length > 0) {
    const hasArticle = result.some(r =>
      r.word.toLowerCase() === 'a' || r.word.toLowerCase() === 'an' || r.word.toLowerCase() === 'the'
    );
    if (singularNouns.length > 0 && !hasArticle && result.some(r => r.pos === 'verb')) {
      hasMissingArticle = true;
    }
  }

  return {
    words: result,
    hasMissingArticle,
    hasSubject,
    hasVerb,
    errors: [],
    suggestions: []
  };
}

function generateSocraticFeedback(analysis, originalSentence) {
  const { hasMissingArticle, hasSubject, hasVerb } = analysis;

  if (hasMissingArticle) {
    return {
      type: 'suggestion',
      title: '💡 小提示',
      message: '在英语中，单数可数名词（如 girl, cat, boy）前面需要加 "a" 或 "an" 来表示"一个"。',
      example: '例如：a girl, an apple, a beautiful cat',
      question: '你能试着在名词前面加上 "a" 或 "an" 吗？',
      corrected: null
    };
  }

  if (!hasSubject || !hasVerb) {
    return {
      type: 'incomplete',
      title: '📝 句子不完整',
      message: '一个完整的句子需要包含：主语（谁）+ 谓语（做什么）。',
      question: '你的句子里，主语是谁？它做了什么动作？',
      corrected: null
    };
  }

  return null;
}

async function validateWord(word) {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');

  if (!cleanWord) {
    return { valid: false, error: '请输入英文单词' };
  }

  if (/[^a-z]/i.test(word)) {
    return { valid: false, error: '只能包含英文字母' };
  }

  if (COMMON_MISSPELLINGS[cleanWord]) {
    return {
      valid: true,
      isMisspelling: true,
      suggestion: COMMON_MISSPELLINGS[cleanWord],
      message: `您是指 "${COMMON_MISSPELLINGS[cleanWord]}" 吗？`
    };
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
    if (response.ok) {
      const data = await response.json();
      const audioData = data[0]?.phonetics?.find(p => p.audio && p.audio.length > 0);
      return { valid: true, audioUrl: audioData?.audio || null };
    } else if (response.status === 404) {
      return {
        valid: false,
        error: '未找到该单词，可能是拼写错误'
      };
    }
  } catch (error) {
    console.log('API unavailable, skipping validation');
  }

  return { valid: true };
}

const audioCache = {};

function playAudio(audioUrl) {
  return new Promise((resolve, reject) => {
    if (!audioUrl) {
      reject('No audio URL');
      return;
    }

    const audio = new Audio(audioUrl);
    audio.onended = () => resolve();
    audio.onerror = () => reject('Audio playback failed');
    audio.play().catch(reject);
  });
}

function MagicE({ children }) {
  return (
    <span className="relative inline-block">
      <span className="opacity-40 text-gray-400">{children}</span>
      <span className="absolute -top-1 -right-1 text-xs">✨</span>
    </span>
  );
}

function SyllableBlock({ syllable, index, onClick, onHover }) {
  const color = getColorForSyllable(index);
  const features = analyzeSyllableFeatures(syllable, '');

  const renderSyllableContent = () => {
    if (features.hasMagicE && syllable.length > 1) {
      const mainPart = syllable.slice(0, -1);
      const magicE = syllable.slice(-1);
      return (
        <>
          {mainPart}<MagicE>{magicE}</MagicE>
        </>
      );
    }
    return syllable;
  };

  return (
    <motion.span
      onClick={() => onClick(syllable, index)}
      onMouseEnter={() => onHover(syllable, index)}
      onTouchStart={() => onHover(syllable, index)}
      className={`
        inline-block px-2 sm:px-3 py-1 sm:py-2 mx-0.5 sm:mx-1 rounded-xl sm:rounded-2xl
        ${color.bg} ${color.text}
        font-bold text-xl sm:text-2xl md:text-3xl cursor-pointer
        shadow-lg ${color.shadow}
        select-none
      `}
      whileHover={{
        scale: 1.1,
        boxShadow: `0 12px 24px ${color.shadow.replace('shadow', 'shadow')}`,
      }}
      whileTap={{ scale: 0.92 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
    >
      {renderSyllableContent()}
    </motion.span>
  );
}

function PhoneticUnit({ text, type }) {
  if (type === 'vowel-group') {
    return <span className="px-1 bg-rose-100 text-rose-600 rounded font-bold">{text}</span>;
  }
  if (type === 'consonant-group') {
    return <span className="px-1 bg-sky-200 text-sky-700 rounded">{text}</span>;
  }
  if (type === 'vowel') {
    return <span className="px-1 bg-pink-50 text-pink-500 rounded">{text}</span>;
  }
  return <span className="px-1 bg-sky-50 text-sky-500 rounded">{text}</span>;
}

function PhoneticRuleLabel({ syllable, fullWord }) {
  const rules = analyzePhoneticRules(syllable, fullWord);

  return (
    <div className="flex flex-wrap justify-center items-center gap-1 my-1">
      {rules.map((rule, i) => (
        <PhoneticUnit key={i} text={rule.text} type={rule.type} />
      ))}
    </div>
  );
}

function WordDisplay({ word, syllables, onSyllableClick, onSyllableHover }) {
  const phonetic = getDefaultPhonetic(word);
  console.log('WordDisplay:', word, 'phonetic:', phonetic);

  if (!word) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-400 text-lg sm:text-xl md:text-2xl py-8 sm:py-12"
      >
        👆 在上方输入单词，开始彩虹学习！
      </motion.div>
    );
  }

  return (
    <motion.div className="text-center" layout>
      <motion.div
        className="flex flex-wrap justify-center items-center gap-0.5 sm:gap-1 py-4 sm:py-6 px-2"
        layout
      >
        <AnimatePresence mode="popLayout">
          {syllables.map((syllable, index) => (
            <SyllableBlock
              key={`${syllable}-${index}`}
              syllable={syllable}
              index={index}
              onClick={onSyllableClick}
              onHover={onSyllableHover}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="text-2xl font-bold text-blue-600 mb-2 py-1 bg-yellow-50 rounded-lg">
        {phonetic || '无音标'}
      </div>

      <motion.div
        className="py-2 px-2 border-t border-gray-100"
      >
        <div className="text-xs text-gray-500 mb-2 text-center">📝 发音规则：</div>
        <AnimatePresence mode="popLayout">
          {syllables.map((syllable, index) => (
            <div key={`rule-${syllable}-${index}`} className="inline-block mx-1 mb-2">
              <PhoneticRuleLabel syllable={syllable} fullWord={word} />
            </div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function SentenceWordBlock({ word, pos, onClick, onHover }) {
  const color = POS_COLORS[pos] || POS_COLORS.unknown;

  return (
    <motion.span
      onClick={() => onClick(word, pos)}
      onMouseEnter={() => onHover(word, pos)}
      onTouchStart={() => onHover(word, pos)}
      className={`
        inline-block px-2 sm:px-3 py-1 sm:py-2 mx-0.5 sm:mx-1 rounded-xl sm:rounded-2xl
        ${color.bg} ${color.text}
        font-bold text-lg sm:text-xl md:text-2xl cursor-pointer
        shadow-lg ${color.shadow}
        select-none
      `}
      whileHover={{
        scale: 1.15,
        boxShadow: `0 15px 30px ${color.shadow.replace('shadow', 'shadow')}`,
      }}
      whileTap={{ scale: 0.92 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
    >
      {word}
    </motion.span>
  );
}

function POSLabel({ pos }) {
  const color = POS_COLORS[pos] || POS_COLORS.unknown;
  return (
    <span className={`
      inline-block px-2 py-0.5 mx-0.5 rounded text-xs sm:text-sm
      ${color.bg} ${color.text}
    `}>
      {color.label}
    </span>
  );
}

function SentenceDisplay({ sentence, onWordClick, onWordHover, analysis }) {
  if (!sentence) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-400 text-lg sm:text-xl md:text-2xl py-8 sm:py-12"
      >
        👆 输入句子，学习词性和发音！
      </motion.div>
    );
  }

  const words = sentence.split(/\s+/).filter(w => w.length > 0);

  return (
    <motion.div
      className="text-center"
      layout
    >
      <motion.div
        className="flex flex-wrap justify-center items-center gap-0.5 sm:gap-1 py-4 sm:py-6 px-2"
      >
        <AnimatePresence mode="popLayout">
          {words.map((word, index) => {
            const pos = analysis?.words?.[index]?.pos || getPOS(word);
            return (
              <SentenceWordBlock
                key={`${word}-${index}`}
                word={word}
                pos={pos}
                onClick={onWordClick}
                onHover={onWordHover}
              />
            );
          })}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="flex flex-wrap justify-center items-center gap-0.5 sm:gap-1 py-2 sm:py-3 px-2 border-t border-gray-100"
      >
        <AnimatePresence mode="popLayout">
          {words.map((word, index) => {
            const pos = analysis?.words?.[index]?.pos || getPOS(word);
            return (
              <POSLabel key={`label-${word}-${index}`} pos={pos} />
            );
          })}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="flex flex-wrap justify-center items-center gap-1 py-2 sm:py-3 px-2 border-t border-gray-100 bg-blue-50 rounded-lg mx-2"
      >
        <AnimatePresence mode="popLayout">
          {words.map((word, index) => {
            const phonetic = getDefaultPhonetic(word.replace(/[^a-zA-Z]/g, ''));
            return (
              <span key={`phonetic-${word}-${index}`} className="text-sm text-blue-600 font-medium px-1">
                {phonetic || ''}
              </span>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function POSGuide({ currentWord, currentPOS, isPlaying }) {
  return (
    <AnimatePresence>
      {currentWord && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-2xl px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 z-50 max-w-[90vw]"
        >
          <span className={isPlaying ? 'animate-pulse text-lg sm:text-xl' : 'text-lg sm:text-xl'}>🔊</span>
          <span className="font-bold text-base sm:text-lg truncate">{currentWord}</span>
          {currentPOS && (
            <span className="text-sm px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
              {POS_COLORS[currentPOS]?.label || currentPOS}
            </span>
          )}
          {isPlaying && (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-lg sm:text-xl"
            >
              🎵
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function POSLegend() {
  const posList = Object.entries(POS_COLORS).filter(([key]) => key !== 'unknown' && key !== 'punctuation');

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-4 p-3 bg-gray-50 rounded-xl"
    >
      <h4 className="text-xs text-gray-500 mb-2 text-center">词性图例：</h4>
      <div className="flex flex-wrap justify-center gap-1">
        {posList.map(([key, val]) => (
          <span
            key={key}
            className={`inline-block px-2 py-0.5 ${val.bg} ${val.text} text-xs rounded-full`}
          >
            {val.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function SocraticFeedback({ feedback }) {
  if (!feedback) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200"
    >
      <h4 className="font-bold text-yellow-700 mb-2">{feedback.title}</h4>
      <p className="text-sm text-gray-700 mb-2">{feedback.message}</p>
      {feedback.example && (
        <p className="text-sm text-blue-600 mb-2">💡 {feedback.example}</p>
      )}
      <p className="text-sm text-orange-600 font-medium italic">❓ {feedback.question}</p>
    </motion.div>
  );
}

function ModeToggle({ mode, onModeChange }) {
  return (
    <div className="flex justify-center mb-4">
      <div className="bg-gray-200 rounded-full p-1 flex">
        <button
          onClick={() => onModeChange('word')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            mode === 'word'
              ? 'bg-gradient-to-r from-rainbow-blue to-rainbow-pink text-white shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📝 单词模式
        </button>
        <button
          onClick={() => onModeChange('sentence')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            mode === 'sentence'
              ? 'bg-gradient-to-r from-rainbow-blue to-rainbow-pink text-white shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📖 句子模式
        </button>
        <button
          onClick={() => onModeChange('practice')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            mode === 'practice'
              ? 'bg-gradient-to-r from-rainbow-blue to-rainbow-pink text-white shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🎯 练习模式
        </button>
      </div>
    </div>
  );
}

function App() {
  const [inputText, setInputText] = useState('');
  const [isSentence, setIsSentence] = useState(false);
  const [syllables, setSyllables] = useState([]);
  const [currentSyllable, setCurrentSyllable] = useState('');
  const [currentPOS, setCurrentPOS] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [validationState, setValidationState] = useState({ valid: true, message: '', isChecking: false });
  const [suggestion, setSuggestion] = useState('');
  const [sentenceAnalysis, setSentenceAnalysis] = useState(null);
  const [socraticFeedback, setSocraticFeedback] = useState(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [practiceWord, setPracticeWord] = useState(null);

  const speak = useCallback(async (text, isWholeWord = false, audioUrl = null, isMaleVoice = false) => {
    setIsPlaying(true);

    if (audioUrl) {
      try {
        await playAudio(audioUrl);
        setIsPlaying(false);
        return;
      } catch (e) {
        console.log('API audio failed, falling back to TTS');
      }
    }

    if (!('speechSynthesis' in window)) {
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = isWholeWord ? 0.85 : 0.75;
    utterance.pitch = isMaleVoice ? 0.9 : 1.1;

    const voices = window.speechSynthesis.getVoices();
    let preferredVoice;

    if (isMaleVoice) {
      preferredVoice = voices.find(v =>
        v.lang === 'en-US' && (v.name.toLowerCase().includes('male') || v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('Mark') || v.name.includes('James'))
      ) || voices.find(v => v.lang === 'en-US' && !v.name.includes('Female') && !v.name.includes('Zira') && !v.name.includes('Samantha') && !v.name.includes('Victoria'));
    } else {
      preferredVoice = voices.find(v =>
        v.lang === 'en-US' && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen') || v.name.includes('Google') && !v.name.includes('Male'))
      ) || voices.find(v => v.lang === 'en-US');
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInputText(value);
    setCurrentSyllable('');
    setSuggestion('');

    if (!value.trim()) {
      setIsSentence(false);
      setSyllables([]);
      setSentenceAnalysis(null);
      setSocraticFeedback(null);
      setPracticeWord(null);
      setValidationState({ valid: true, message: '', isChecking: false });
      return;
    }

    const hasSpace = value.includes(' ');
    setIsSentence(hasSpace);

    if (hasSpace) {
      const analysis = analyzeSentenceStructure(value);
      setSentenceAnalysis(analysis);
      const feedback = generateSocraticFeedback(analysis, value);
      setSocraticFeedback(feedback);
      setSyllables([]);
      setValidationState({ valid: true, message: '', isChecking: false });
      setPracticeWord(null);
    } else {
      setSentenceAnalysis(null);
      setSocraticFeedback(null);

      setValidationState(prev => ({ ...prev, isChecking: true }));

      const result = await validateWord(value);

      if (result.valid) {
        if (result.isMisspelling && result.suggestion) {
          setSuggestion(result.suggestion);
          setValidationState({
            valid: true,
            message: result.message,
            isChecking: false,
            isSuggestion: true
          });
        } else {
          setSuggestion('');
          setValidationState({ valid: true, message: '', isChecking: false });
        }

        setCurrentAudioUrl(result.audioUrl || null);
        const sliced = syllabify(value);
        setSyllables(sliced);
        setPracticeWord(value);
      } else {
        setSyllables([]);
        setCurrentAudioUrl(null);
        setPracticeWord(null);
        setValidationState({
          valid: false,
          message: result.error || '单词验证失败',
          isChecking: false
        });
      }
    }
  };

  const handleSuggestionClick = () => {
    if (suggestion) {
      setInputText(suggestion);
      setSuggestion('');
      setValidationState({ valid: true, message: '', isChecking: false });
      const sliced = syllabify(suggestion);
      setSyllables(sliced);
      setPracticeWord(suggestion);

      validateWord(suggestion).then(result => {
        if (result.audioUrl) {
          setCurrentAudioUrl(result.audioUrl);
          speak(suggestion, true, result.audioUrl, true);
        }
      });
    }
  };

  const handleSyllableClick = (syllable) => {
    setCurrentSyllable(syllable);
    const rules = analyzePhoneticRules(syllable);
    setCurrentPOS(rules.map(r => `${r.text}=${r.sound}`).join(' '));
    speak(syllable, false, null, true);
  };

  const handleSyllableHover = (syllable) => {
    setCurrentSyllable(syllable);
    const rules = analyzePhoneticRules(syllable);
    setCurrentPOS(rules.map(r => `${r.text}=${r.sound}`).join(' '));
  };

  const handleWordClick = (wordStr, pos) => {
    setCurrentSyllable(wordStr);
    setCurrentPOS(pos);
    speak(wordStr);
  };

  const handleWordHover = (wordStr, pos) => {
    setCurrentSyllable(wordStr);
    setCurrentPOS(pos);
  };

  const handlePlayWord = () => {
    if (inputText.trim() && validationState.valid && !isSentence) {
      setCurrentSyllable(inputText);
      setCurrentPOS('');
      speak(inputText, true, currentAudioUrl, true);
    }
  };

  const handlePlaySentence = () => {
    if (inputText.trim() && isSentence) {
      setCurrentSyllable(inputText);
      setCurrentPOS('');
      speak(inputText, true);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream flex flex-col items-center px-3 sm:px-4 py-6 sm:py-8">
      <header className="text-center mb-6 sm:mb-8">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rainbow-blue via-rainbow-pink to-rainbow-purple mb-2"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          🌈 彩虹单词
        </motion.h1>
        <motion.p
          className="text-gray-600 text-sm sm:text-base md:text-lg px-2"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          让背单词变得有趣又简单！
        </motion.p>
      </header>

      <main className="w-full max-w-lg sm:max-w-xl md:max-w-2xl">
        <motion.div
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <label className="block text-gray-700 font-bold mb-2 sm:mb-3 text-base sm:text-lg">
            📝 输入英文单词或句子：
          </label>
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="例如: beautiful 或 This is a book..."
            className={`
              w-full px-4 sm:px-6 py-3 sm:py-4 text-xl sm:text-2xl md:text-2xl
              border-4 rounded-xl sm:rounded-2xl
              focus:outline-none
              transition-colors duration-300
              font-rounded
              ${isSentence ? 'border-green-400 focus:border-green-500' : validationState.valid ? 'border-rainbow-blue focus:border-rainbow-pink' : 'border-red-400'}
            `}
            autoFocus
          />

          <AnimatePresence>
            {isSentence && inputText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-sm text-green-600"
              >
                📖 句子模式
              </motion.div>
            )}
            {!isSentence && validationState.isChecking && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-sm text-gray-500"
              >
                🔍 正在验证单词...
              </motion.div>
            )}

            {!validationState.valid && validationState.message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-sm text-red-500 flex items-center gap-2"
              >
                <span>❌</span>
                <span>{validationState.message}</span>
              </motion.div>
            )}

            {validationState.isSuggestion && validationState.message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-sm text-orange-500 flex items-center gap-2"
              >
                <span>💡</span>
                <span>{validationState.message}</span>
                <button
                  onClick={handleSuggestionClick}
                  className="ml-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors font-bold"
                >
                  点击使用
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {inputText && validationState.valid && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={isSentence ? handlePlaySentence : handlePlayWord}
              className={`mt-3 sm:mt-4 w-full font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg active:shadow-md transition-all text-base sm:text-lg ${
                isSentence ? 'bg-gradient-to-r from-green-400 to-teal-400' : 'bg-gradient-to-r from-rainbow-blue to-rainbow-pink'
              } text-white`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🔊 播放{isSentence ? '整句' : '整词'}发音
            </motion.button>
          )}
        </motion.div>

        {!inputText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 text-lg sm:text-xl md:text-2xl py-8 sm:py-12"
          >
            👆 在上方输入单词或句子，开始彩虹学习！
          </motion.div>
        )}

        {inputText && (
          <>
            {isSentence ? (
              <motion.div
                className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="text-gray-700 font-bold mb-3 sm:mb-4 text-base sm:text-lg md:text-xl text-center">
                  📖 句子词性分析
                </h2>
                <SentenceDisplay
                  sentence={inputText}
                  onWordClick={handleWordClick}
                  onWordHover={handleWordHover}
                  analysis={sentenceAnalysis}
                />
                <POSLegend />
                <AnimatePresence>
                  {socraticFeedback && <SocraticFeedback feedback={socraticFeedback} />}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="text-gray-700 font-bold mb-3 sm:mb-4 text-base sm:text-lg md:text-xl text-center">
                  🎨 彩色音节展示
                </h2>
                <WordDisplay
                  word={inputText}
                  syllables={syllables}
                  onSyllableClick={handleSyllableClick}
                  onSyllableHover={handleSyllableHover}
                />
              </motion.div>
            )}

            {practiceWord && (
              <motion.div
                className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h2 className="text-gray-700 font-bold mb-3 sm:mb-4 text-base sm:text-lg md:text-xl text-center">
                  🎯 练习一下
                </h2>
                <InlinePractice word={practiceWord} syllables={syllables} onPlayAudio={(text) => speak(text, true, null, true)} />
              </motion.div>
            )}
          </>
        )}
      </main>

      <POSGuide
        currentWord={currentSyllable}
        currentPOS={currentPOS}
        isPlaying={isPlaying}
      />

      <footer className="mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm text-center px-4">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ✨ 智能识别 · 单词句子一起学 · 随时练习 🚀
        </motion.span>
      </footer>
    </div>
  );
}

function InlinePractice({ word, syllables, onPlayAudio }) {
  const [practiceType, setPracticeType] = useState('syllable');
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [speakingScore, setSpeakingScore] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (practiceType === 'speaking' && !micPermissionGranted) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setMicPermissionGranted(true);
        })
        .catch(() => {
          setMicPermissionGranted(false);
        });
    }
  }, [practiceType]);

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;

    if (practiceType === 'syllable') {
      const userSyllables = userAnswer.split('-').map(s => s.trim().toLowerCase());
      const correctSyllables = syllables.map(s => s.toLowerCase());
      const correct = userSyllables.length === correctSyllables.length &&
        userSyllables.every((s, i) => s === correctSyllables[i]);
      setIsCorrect(correct);
    } else if (practiceType === 'spelling') {
      const correct = userAnswer.toLowerCase().trim() === word.toLowerCase();
      setIsCorrect(correct);
    }
    setShowResult(true);
  };

  const calculateSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 100;
    if (s1.length === 0 || s2.length === 0) return 0;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    const longerLength = longer.length;
    const editDistance = levenshteinDistance(longer, shorter);

    return Math.round((longerLength - editDistance) / longerLength * 100);
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const startRecording = () => {
    if (!window.isSecureContext) {
      alert('语音识别需要 HTTPS 连接，请确保网站使用安全连接');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('您的浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    setIsRecording(true);
    setRecognizedText('');
    setSpeakingScore(null);

    const startRecognition = () => {
      console.log('Starting recognition');
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const results = event.results;
        const transcript = results[results.length - 1][0].transcript.trim();
        setRecognizedText(transcript);

        if (results[results.length - 1].isFinal) {
          const finalTranscript = transcript;
          const score = calculateSimilarity(finalTranscript, word);
          setSpeakingScore(score);
          setShowResult(true);
          setIsCorrect(score >= 80);
          recognition.stop();
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        recognitionRef.current = null;
        if (event.error === 'not-allowed') {
          setMicPermissionGranted(false);
        }
      };

      recognition.onend = () => {
        console.log('Recognition ended');
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognition.start();
    };

    if (micPermissionGranted) {
      startRecognition();
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setMicPermissionGranted(true);
          startRecognition();
        })
        .catch((err) => {
          console.error('Microphone access error:', err);
          setIsRecording(false);
          if (err.name === 'NotAllowedError') {
            alert('请允许麦克风权限后重试');
          } else {
            alert('无法访问麦克风: ' + err.message);
          }
        });
    }
  };

  const handleNext = () => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setSpeakingScore(null);
    setRecognizedText('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        <button
          onClick={() => { setPracticeType('syllable'); handleNext(); }}
          className={`px-3 py-1 rounded-full text-sm ${practiceType === 'syllable' ? 'bg-rainbow-blue text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          🎵 音节分解
        </button>
        <button
          onClick={() => { setPracticeType('spelling'); handleNext(); }}
          className={`px-3 py-1 rounded-full text-sm ${practiceType === 'spelling' ? 'bg-rainbow-blue text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          ✏️ 拼写练习
        </button>
        <button
          onClick={() => { setPracticeType('speaking'); handleNext(); }}
          className={`px-3 py-1 rounded-full text-sm ${practiceType === 'speaking' ? 'bg-rainbow-blue text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          🎤 口语测试
        </button>
      </div>

      {practiceType === 'syllable' && (
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800 mb-4">{word}</div>
          <div className="text-sm text-gray-500 mb-4">请输入音节分解（如：{syllables.join('-')}）</div>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl text-center text-lg focus:border-rainbow-blue focus:outline-none"
            placeholder="输入音节分解..."
            onKeyPress={(e) => e.key === 'Enter' && !showResult && checkAnswer()}
          />
        </div>
      )}

      {practiceType === 'spelling' && (
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2 bg-yellow-50 rounded-lg py-2">
            {getDefaultPhonetic(word) || ''}
          </div>
          <div className="text-sm text-gray-500 mb-4">请写出对应的单词</div>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl text-center text-lg focus:border-rainbow-blue focus:outline-none"
            placeholder="输入单词..."
            onKeyPress={(e) => e.key === 'Enter' && !showResult && checkAnswer()}
          />
        </div>
      )}

      {practiceType === 'speaking' && (
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800 mb-4">{word}</div>
          <div className="text-sm text-gray-500 mb-6">
            {isRecording ? '🎤 请对准麦克风说话...' : '点击麦克风，对准设备说出这个单词'}
          </div>

          <button
            onClick={() => {
              if (!isRecording) {
                startRecording();
              }
            }}
            disabled={isRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto transition-all cursor-pointer ${
              isRecording
                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-300'
                : 'bg-gradient-to-r from-rainbow-blue to-rainbow-pink hover:scale-110 shadow-lg'
            }`}
          >
            {isRecording ? '🔴' : '🎤'}
          </button>
          <div className="text-sm text-gray-400 mt-2">
            {isRecording ? '正在聆听，请说话...' : '点击开始录音'}
          </div>

          {recognizedText && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-500">识别结果：</div>
              <div className="text-xl font-bold text-gray-800">{recognizedText}</div>
            </div>
          )}
        </div>
      )}

      {showResult && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-center p-4 rounded-xl ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {practiceType === 'speaking' && speakingScore !== null ? (
            <>
              <div className="text-2xl font-bold mb-2">🎯 得分：{speakingScore}%</div>
              {speakingScore >= 90 ? '✅ 发音非常棒！' : speakingScore >= 70 ? '👍 不错的发音！' : '💪 继续加油！'}
            </>
          ) : (
            isCorrect ? '✅ 回答正确！' : `❌ 回答错误。答案是：${practiceType === 'syllable' ? syllables.join('-') : word}`
          )}
        </motion.div>
      )}

      <div className="flex gap-2">
        {practiceType !== 'speaking' ? (
          !showResult ? (
            <button
              onClick={checkAnswer}
              disabled={!userAnswer}
              className="flex-1 bg-gradient-to-r from-rainbow-blue to-rainbow-pink text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              提交答案
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-rainbow-blue to-rainbow-pink text-white py-3 rounded-xl font-bold"
            >
              再试一次
            </button>
          )
        ) : (
          <button
            onClick={startRecording}
            disabled={isRecording}
            className="flex-1 bg-gradient-to-r from-rainbow-blue to-rainbow-pink text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRecording ? '🔴 录音中...' : '🎤 重新录音'}
          </button>
        )}
      </div>
    </div>
  );
}

function PracticeMode() {
  const [practiceType, setPracticeType] = useState('syllable');
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [options, setOptions] = useState([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);

  const wordList = ['apple', 'banana', 'beautiful', 'strawberry', 'happy', 'student', 'elephant', 'butterfly', 'china', 'family', 'girl', 'boy', 'rainbow', 'water', 'flower', 'sunshine', 'mountain', 'river', 'ocean', 'forest'];
  const sentenceList = [
    { sentence: 'This is a book', words: ['determiner', 'verb', 'determiner', 'noun'] },
    { sentence: 'She is a student', words: ['pronoun', 'verb', 'determiner', 'noun'] },
    { sentence: 'The cat is cute', words: ['determiner', 'noun', 'verb', 'adjective'] },
    { sentence: 'I love my mother', words: ['pronoun', 'verb', 'determiner', 'noun'] },
    { sentence: 'He is tall', words: ['pronoun', 'verb', 'adjective'] },
  ];

  const generateQuestion = useCallback(async () => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(null);

    if (practiceType === 'syllable' || practiceType === 'choice') {
      const word = wordList[Math.floor(Math.random() * wordList.length)];
      const syllables = syllabify(word);

      let audioUrl = null;
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (response.ok) {
          const data = await response.json();
          const audioData = data[0]?.phonetics?.find(p => p.audio && p.audio.length > 0);
          audioUrl = audioData?.audio || null;
        }
      } catch (e) {
        console.log('Audio fetch failed');
      }

      setCurrentAudioUrl(audioUrl);

      if (practiceType === 'syllable') {
        setQuestion({ word, syllables, type: 'syllable', audioUrl });
      } else {
        const correctAnswer = syllables.join('-');
        const wrongAnswers = wordList
          .filter(w => w !== word)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => syllabify(w).join('-'));
        const allOptions = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
        setQuestion({ word, correctAnswer, type: 'choice', audioUrl });
        setOptions(allOptions);
      }
    } else if (practiceType === 'spelling') {
      const word = wordList[Math.floor(Math.random() * wordList.length)];
      const phonetic = analyzePhoneticRules(word);
      const mainSound = phonetic.map(r => r.sound).join('');

      let audioUrl = null;
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (response.ok) {
          const data = await response.json();
          const audioData = data[0]?.phonetics?.find(p => p.audio && p.audio.length > 0);
          audioUrl = audioData?.audio || null;
        }
      } catch (e) {
        console.log('Audio fetch failed');
      }

      setCurrentAudioUrl(audioUrl);
      setQuestion({ word, phonetic: mainSound, type: 'spelling', audioUrl });
    } else if (practiceType === 'pos') {
      const sentenceObj = sentenceList[Math.floor(Math.random() * sentenceList.length)];
      setQuestion({ ...sentenceObj, type: 'pos' });
    }
  }, [practiceType, wordList, sentenceList]);

  useEffect(() => {
    generateQuestion();
  }, [practiceType, generateQuestion]);

  const playPracticeAudio = (audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.log('Audio play failed'));
    }
  };

  const checkAnswer = () => {
    if (!question) return;

    let correct = false;
    if (practiceType === 'syllable') {
      const userSyllables = userAnswer.split('-').map(s => s.trim().toLowerCase());
      const correctSyllables = question.syllables.map(s => s.toLowerCase());
      correct = userSyllables.length === correctSyllables.length &&
        userSyllables.every((s, i) => s === correctSyllables[i]);
    } else if (practiceType === 'spelling') {
      correct = userAnswer.toLowerCase().trim() === question.word.toLowerCase();
    } else if (practiceType === 'choice') {
      correct = userAnswer === question.correctAnswer;
      setUserAnswer(userAnswer);
    }

    setIsCorrect(correct);
    setShowResult(true);
    setTotalQuestions(prev => prev + 1);
    if (correct) {
      setScore(prev => prev + 10);
      setCorrectCount(prev => prev + 1);
    }
  };

  const selectOption = (option) => {
    setUserAnswer(option);
    setQuestion(prev => ({ ...prev, selectedAnswer: option }));
  };

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">正确率: {accuracy}%</span>
          <span className="text-lg font-bold text-rainbow-blue">分数: {score}</span>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setPracticeType('syllable')}
            className={`px-3 py-1 rounded-full text-sm ${practiceType === 'syllable' ? 'bg-rainbow-blue text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            🎵 音节分解
          </button>
          <button
            onClick={() => setPracticeType('spelling')}
            className={`px-3 py-1 rounded-full text-sm ${practiceType === 'spelling' ? 'bg-rainbow-blue text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            ✏️ 拼写练习
          </button>
          <button
            onClick={() => setPracticeType('choice')}
            className={`px-3 py-1 rounded-full text-sm ${practiceType === 'choice' ? 'bg-rainbow-blue text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            ❓ 选择题
          </button>
          <button
            onClick={() => setPracticeType('pos')}
            className={`px-3 py-1 rounded-full text-sm ${practiceType === 'pos' ? 'bg-rainbow-blue text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            🏷️ 词性标注
          </button>
        </div>

        {question && (
          <div className="text-center mb-4">
            {practiceType === 'syllable' && (
              <>
                <div className="text-2xl font-bold text-blue-600 mb-1 bg-yellow-50 rounded-lg py-1">
                  {getDefaultPhonetic(question.word) || ''}
                </div>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-gray-800">{question.word}</span>
                  <button
                    onClick={() => playPracticeAudio(question.audioUrl)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                    title="播放发音"
                  >
                    🔊
                  </button>
                </div>
                <div className="text-sm text-gray-500 mb-4">请输入音节分解（如：ap-ple）</div>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl text-center text-lg focus:border-rainbow-blue focus:outline-none"
                  placeholder="输入音节分解..."
                  onKeyPress={(e) => e.key === 'Enter' && !showResult && checkAnswer()}
                />
              </>
            )}
            {practiceType === 'spelling' && (
              <>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-gray-800">{question.phonetic}</span>
                  <button
                    onClick={() => playPracticeAudio(question.audioUrl)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                    title="播放发音"
                  >
                    🔊
                  </button>
                </div>
                <div className="text-sm text-gray-500 mb-4">请写出对应的单词</div>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl text-center text-lg focus:border-rainbow-blue focus:outline-none"
                  placeholder="输入单词..."
                  onKeyPress={(e) => e.key === 'Enter' && !showResult && checkAnswer()}
                />
              </>
            )}
            {practiceType === 'choice' && (
              <>
                <div className="text-2xl font-bold text-blue-600 mb-1 bg-yellow-50 rounded-lg py-1">
                  {getDefaultPhonetic(question.word) || ''}
                </div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-gray-800">{question.word}</span>
                  <button
                    onClick={() => playPracticeAudio(question.audioUrl)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                    title="播放发音"
                  >
                    🔊
                  </button>
                </div>
                <div className="text-sm text-gray-500 mb-3">选择正确的音节分解</div>
                <div className="grid grid-cols-2 gap-2">
                  {options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => selectOption(option)}
                      className={`p-3 rounded-xl text-lg font-medium transition-all ${
                        userAnswer === option
                          ? 'bg-rainbow-blue text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
            {practiceType === 'pos' && (
              <>
                <div className="text-2xl font-bold text-gray-800 mb-2">{question.sentence}</div>
                <div className="text-sm text-gray-500 mb-4">写出每个词的词性（用逗号分隔）</div>
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  {question.sentence.split(' ').map((w, i) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">{w}</span>
                  ))}
                </div>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl text-center text-lg focus:border-rainbow-blue focus:outline-none"
                  placeholder="如: 名词, 动词, 形容词..."
                  onKeyPress={(e) => e.key === 'Enter' && !showResult && checkAnswer()}
                />
              </>
            )}
          </div>
        )}

        {showResult && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-center p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {isCorrect ? '✅ 回答正确！' : `❌ 回答错误。正确答案：${practiceType === 'syllable' ? question.syllables.join('-') : practiceType === 'spelling' ? question.word : practiceType === 'choice' ? question.correctAnswer : question.words.join(', ')}`}
          </motion.div>
        )}

        <div className="flex gap-2">
          {!showResult ? (
            <button
              onClick={checkAnswer}
              disabled={!userAnswer}
              className="flex-1 bg-gradient-to-r from-rainbow-blue to-rainbow-pink text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              提交答案
            </button>
          ) : (
            <button
              onClick={generateQuestion}
              className="flex-1 bg-gradient-to-r from-rainbow-blue to-rainbow-pink text-white py-3 rounded-xl font-bold"
            >
              下一题
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default App
