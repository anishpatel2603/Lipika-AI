import { PHONETIC_LEXICON, HINGLISH_LEXICON, OCR_TYPO_REPLACEMENTS } from '../data/phoneticLexicon.js';

// Calculate Levenshtein distance for fuzzy typo correction
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Find closest dictionary match for typo tolerance
function findClosestLexiconMatch(word: string): string | null {
  const lower = word.toLowerCase();
  // Avoid aggressive matching for short words to prevent false collisions (e.g. bada matching bad)
  if (lower.length <= 4) return null;

  // Check direct matches first
  if (PHONETIC_LEXICON[lower]) return PHONETIC_LEXICON[lower];
  if (HINGLISH_LEXICON[lower]) return HINGLISH_LEXICON[lower];

  // Try distance 1 for words of length 5-7, distance 2 for longer words
  const maxDist = lower.length >= 7 ? 2 : 1;
  let bestMatch: string | null = null;
  let minDistance = maxDist + 1;

  for (const dictKey of Object.keys(PHONETIC_LEXICON)) {
    if (Math.abs(dictKey.length - lower.length) > maxDist) continue;
    // Fast check first character matches
    if (dictKey[0] !== lower[0]) continue;

    const dist = levenshteinDistance(lower, dictKey);
    if (dist <= maxDist && dist < minDistance) {
      minDistance = dist;
      bestMatch = PHONETIC_LEXICON[dictKey];
      if (dist === 1) break; // Good enough
    }
  }

  return bestMatch;
}

export function fixDevanagariOrphanMatras(text: string): string {
  // Strip out Unicode dotted circle placeholder U+25CC if rendered
  let s = text.replace(/\u25CC/g, '');

  const matraToVowel: Record<string, string> = {
    'ा': 'आ',
    'ि': 'इ',
    'ी': 'ई',
    'ु': 'उ',
    'ू': 'ऊ',
    'े': 'ए',
    'ै': 'ऐ',
    'ो': 'ओ',
    'ौ': 'औ',
    'ं': 'अं',
    'ँ': 'अँ',
    'ः': 'अः',
  };

  // Convert orphaned matras at start of word or after whitespace/punctuation into independent vowels
  s = s.replace(/(^|[\s\p{P}\p{S}])([ािीुूेैोौंँः])/gu, (_, prefix, matra) => {
    return prefix + (matraToVowel[matra] || matra);
  });

  // Convert duplicate/stacked matras following another vowel
  s = s.replace(/([अ-औा-ौ])([ािीुूेैोौ])/g, (_, prev, matra) => {
    return prev + (matraToVowel[matra] || matra);
  });

  return s;
}

/**
 * Phonetic Transliteration Engine with Syllable & Conjunct Processing
 */
export function advancedPhoneticTransliterate(text: string): string {
  let normalized = text;

  // Apply OCR Typo fixes first
  for (const [pattern, replacement] of OCR_TYPO_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  const lines = normalized.split('\n');
  const processedLines = lines.map((line) => {
    const tokens = line.split(/([a-zA-Z0-9]+|https?:\/\/[^\s]+|[^\s\w]+|\s+)/g).filter(Boolean);
    return tokens
      .map((tok) => {
        // Preserve URLs, emails, purely numeric strings, punctuation, spaces, and existing Devanagari
        if (/^(https?:\/\/|www\.|[a-zA-Z0-9._%+-]+@)/i.test(tok)) return tok;
        if (/^\d+$/.test(tok)) return tok;
        if (/[\u0900-\u097F]/.test(tok)) return tok;
        if (/^[\s\p{P}]+$/u.test(tok)) return tok;

        const lower = tok.toLowerCase();

        // 1. Direct dictionary match
        if (PHONETIC_LEXICON[lower]) return PHONETIC_LEXICON[lower];
        if (HINGLISH_LEXICON[lower]) return HINGLISH_LEXICON[lower];

        // 2. Fuzzy spelling match
        const fuzzyMatch = findClosestLexiconMatch(lower);
        if (fuzzyMatch) return fuzzyMatch;

        // 3. Fallback to advanced syllable phonetic breakdown
        return transcribeSyllables(lower);
      })
      .join('');
  });

  return fixDevanagariOrphanMatras(processedLines.join('\n'));
}

/**
 * Syllable and conjunct-aware phonetics for completely unmapped words
 */
function transcribeSyllables(word: string): string {
  let w = word.toLowerCase();

  // Initial vowels protection (MUST map to independent vowels)
  const initialVowels: [RegExp, string][] = [
    [/^every/i, 'एवरी'],
    [/^extra/i, 'एक्स्ट्रा'],
    [/^anti/i, 'एंटी'],
    [/^auto/i, 'ऑटो'],
    [/^over/i, 'ओवर'],
    [/^inter/i, 'इंटर'],
    [/^under/i, 'अंडर'],
    [/^super/i, 'सुपर'],
    [/^hyper/i, 'हाइपर'],
    [/^micro/i, 'माइक्रो'],
    [/^multi/i, 'मल्टी'],
    [/^tele/i, 'टेली'],
    [/^ai/i, 'ऐ'],
    [/^au/i, 'औ'],
    [/^oo/i, 'ऊ'],
    [/^ee/i, 'ई'],
    [/^ea/i, 'ई'],
    [/^aa/i, 'आ'],
    [/^a/i, 'अ'],
    [/^e/i, 'ए'],
    [/^i/i, 'इ'],
    [/^o/i, 'ओ'],
    [/^u/i, 'उ'],
  ];

  let prefix = '';
  for (const [pattern, dev] of initialVowels) {
    if (pattern.test(w)) {
      prefix = dev;
      w = w.replace(pattern, '');
      break;
    }
  }

  // Common suffixes & multigraphs
  const replacements: [RegExp, string][] = [
    [/ology$/g, 'ऑलॉजी'],
    [/ologies$/g, 'ऑलॉजीज़'],
    [/graphy$/g, 'ग्राफी'],
    [/graphic$/g, 'ग्राफिक'],
    [/tional$/g, 'शनल'],
    [/tion$/g, 'शन'],
    [/tions$/g, 'शन्स'],
    [/sion$/g, 'शन'],
    [/sions$/g, 'शन्स'],
    [/ment$/g, 'मेंट'],
    [/ments$/g, 'मेंट्स'],
    [/able$/g, 'एबल'],
    [/ible$/g, 'इबल'],
    [/ence$/g, 'एंस'],
    [/ance$/g, 'आंस'],
    [/ity$/g, 'िटी'],
    [/ties$/g, 'टीज़'],
    [/fully$/g, 'फुली'],
    [/ful$/g, 'फुल'],
    [/less$/g, 'लेस'],
    [/ness$/g, 'नेस'],
    [/ing$/g, 'इंग'],
    [/ings$/g, 'इंग्स'],
    [/ed$/g, '्ड'],
    [/ly$/g, 'ली'],
    [/ize$/g, 'इज़'],
    [/ise$/g, 'इज़'],
    [/ized$/g, 'इज़्ड'],
    [/ised$/g, 'इज़्ड'],

    // Hinglish future conjugations
    [/ayenge$/g, 'ाएंगे'],
    [/ayega$/g, 'ाएगा'],
    [/ayegi$/g, 'ाएगी'],

    // Doubled consonants (English gemination reduction)
    [/ss/g, 'स'],
    [/tt/g, 'ट'],
    [/pp/g, 'प'],
    [/ll/g, 'ल'],
    [/mm/g, 'म'],
    [/nn/g, 'न'],
    [/dd/g, 'ड'],
    [/bb/g, 'ब'],
    [/ff/g, 'फ'],
    [/gg/g, 'ग'],
    [/rr/g, 'र'],
    [/cc/g, 'क'],
    [/zz/g, 'ज़'],

    // Digraphs & consonant clusters
    [/sch/g, 'स्क'],
    [/chr/g, 'क्र'],
    [/str/g, 'स्ट्र'],
    [/spr/g, 'स्प्र'],
    [/scr/g, 'स्क्र'],
    [/spl/g, 'स्प्ल'],
    [/squ/g, 'स्कव'],
    [/ph/g, 'फ'],
    [/th/g, 'थ'],
    [/sh/g, 'श'],
    [/ch/g, 'च'],
    [/kh/g, 'ख'],
    [/gh/g, 'घ'],
    [/jh/g, 'झ'],
    [/bh/g, 'भ'],
    [/dh/g, 'ध'],
    [/tr/g, 'ट्र'],
    [/dr/g, 'ड्र'],
    [/cr/g, 'क्र'],
    [/gr/g, 'ग्र'],
    [/pr/g, 'प्र'],
    [/br/g, 'ब्र'],
    [/fr/g, 'फ्र'],
    [/pl/g, 'प्ल'],
    [/bl/g, 'ब्ल'],
    [/fl/g, 'फ्ल'],
    [/gl/g, 'ग्ला'],
    [/cl/g, 'क्ल'],
    [/st/g, 'स्ट'],
    [/sp/g, 'स्प'],
    [/sk/g, 'स्क'],
    [/sc/g, 'स्क'],
    [/sm/g, 'स्म'],
    [/sn/g, 'स्न'],
    [/sl/g, 'स्ल'],
    [/sw/g, 'स्व'],
    [/qu/g, 'क्व'],
    [/wh/g, 'व्ह'],
    [/ck/g, 'क'],
    [/ee/g, 'ी'],
    [/oo/g, 'ू'],
    [/ai/g, 'ै'],
    [/ay/g, 'े'],
    [/au/g, 'ौ'],
    [/aw/g, 'ॉ'],
    [/oa/g, 'ो'],
    [/ow/g, 'ो'],
    [/oi/g, 'ॉइ'],
    [/oy/g, 'ॉय'],
    [/ou/g, 'ाउ'],
    [/ea/g, 'ी'],
    [/ei/g, 'े'],
    [/ey/g, 'े'],
    [/ie/g, 'ी'],

    // Single vowels (as matras within words)
    [/a/g, 'ा'],
    [/e/g, 'े'],
    [/i/g, 'ि'],
    [/o/g, 'ो'],
    [/u/g, 'ु'],

    // Single consonants
    [/k/g, 'क'],
    [/g/g, 'ग'],
    [/c/g, 'क'],
    [/j/g, 'ज'],
    [/t/g, 'ट'],
    [/d/g, 'ड'],
    [/n/g, 'न'],
    [/p/g, 'प'],
    [/b/g, 'ब'],
    [/m/g, 'म'],
    [/y/g, 'य'],
    [/r/g, 'र'],
    [/l/g, 'ल'],
    [/v/g, 'व'],
    [/w/g, 'व'],
    [/s/g, 'स'],
    [/h/g, 'ह'],
    [/f/g, 'फ'],
    [/z/g, 'ज़'],
    [/q/g, 'क'],
    [/x/g, 'क्स'],
  ];

  let res = w;
  for (const [pattern, dev] of replacements) {
    res = res.replace(pattern, dev);
  }

  // Strip residual characters
  res = res.replace(/[a-z]/g, '');

  const combined = prefix + res;
  return fixDevanagariOrphanMatras(combined) || word;
}
