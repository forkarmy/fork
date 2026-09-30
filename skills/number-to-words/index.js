// Ported from marlun78/number-to-words (MIT) by Martin Hansson (marlun78).
// src/toWords.js, src/makeOrdinal.js, src/toOrdinal.js

const LT20 = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS = ['zero','ten','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
const SCALES = [[1e15,'quadrillion'],[1e12,'trillion'],[1e9,'billion'],[1e6,'million'],[1e3,'thousand']];
const ORD = {zero:'zeroth',one:'first',two:'second',three:'third',four:'fourth',five:'fifth',six:'sixth',
  seven:'seventh',eight:'eighth',nine:'ninth',ten:'tenth',eleven:'eleventh',twelve:'twelfth'};

function gen(n, words) {
  if (n === 0) return words.length ? words.join(' ').replace(/,$/, '') : 'zero';
  let rem, word;
  if (n < 20) { rem = 0; word = LT20[n]; }
  else if (n < 100) { rem = 0; word = TENS[Math.floor(n / 10)] + (n % 10 ? '-' + LT20[n % 10] : ''); }
  else if (n < 1000) { rem = n % 100; word = gen(Math.floor(n / 100), []) + ' hundred'; }
  else {
    for (const [v, name] of SCALES) {
      if (n >= v) { rem = n % v; word = gen(Math.floor(n / v), []) + ' ' + name + ','; break; }
    }
  }
  words.push(word);
  return gen(rem, words);
}

function makeOrdinal(w) {
  if (/(hundred|thousand|(m|b|tr|quadr)illion)$/.test(w) || /teen$/.test(w)) return w + 'th';
  if (/y$/.test(w)) return w.replace(/y$/, 'ieth');
  return w.replace(/(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)$/, (m, x) => ORD[x]);
}

function suffix(n) {
  const a = Math.abs(n), t = a % 100;
  if (t >= 11 && t <= 13) return 'th';
  return ['th','st','nd','rd'][a % 10] || 'th';
}

export default async function run(input) {
  const raw = input && input.number;
  let n;
  if (typeof raw === 'number') n = raw;
  else if (typeof raw === 'string' && /^\s*[+-]?\d+\s*$/.test(raw)) n = Number(raw.trim());
  else return { valid: false, error: 'invalid_input', message: 'number must be an integer or a digit string' };
  if (!Number.isInteger(n)) return { valid: false, error: 'not_integer', message: 'number must be an integer' };
  if (!Number.isSafeInteger(n)) return { valid: false, error: 'out_of_range', message: 'number must be within ±9007199254740991' };
  if (Object.is(n, -0)) n = 0;
  const abs = gen(Math.abs(n), []);
  const words = (n < 0 ? 'minus ' : '') + abs;
  return { valid: true, number: n, words, ordinalWords: makeOrdinal(words), ordinal: n + suffix(n) };
}
