// Adapted from sindresorhus/leven, index.js (MIT).
// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
// Port: local row buffers, code-point mode, validation and optional preprocessing.

function distance(first, second) {
  if (first.length > second.length) [first, second] = [second, first];
  let firstLength = first.length;
  let secondLength = second.length;
  // Common suffixes and prefixes do not contribute any edit cost.
  while (firstLength > 0 && first[firstLength - 1] === second[secondLength - 1]) {
    firstLength--;
    secondLength--;
  }
  let start = 0;
  while (start < firstLength && first[start] === second[start]) start++;
  firstLength -= start;
  secondLength -= start;
  if (firstLength === 0) return secondLength;
  const row = new Int32Array(firstLength);
  for (let index = 0; index < firstLength; index++) row[index] = index + 1;
  let current = 0;
  for (let rowIndex = 0; rowIndex < secondLength; rowIndex++) {
    const character = second[start + rowIndex];
    let diagonal = rowIndex;
    current = rowIndex + 1;
    for (let index = 0; index < firstLength; index++) {
      const substituted = diagonal + (character === first[start + index] ? 0 : 1);
      diagonal = row[index];
      current = row[index] = Math.min(diagonal + 1, current + 1, substituted);
    }
  }
  return current;
}

export default async function run(input) {
  const fail = message => ({valid: false, error: 'INVALID_INPUT', message});
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fail('Input must be an object.');
  if (typeof input.first !== 'string' || typeof input.second !== 'string') return fail('first and second must be strings.');
  if (input.first.length > 4096 || input.second.length > 4096) return fail('Each input must be at most 4096 UTF-16 code units.');
  const unit = input.unit === undefined ? 'codePoint' : input.unit;
  const normalization = input.normalization === undefined ? 'none' : input.normalization;
  const ignoreCase = input.ignoreCase === undefined ? false : input.ignoreCase;
  if (!['codePoint', 'utf16'].includes(unit)) return fail('unit must be codePoint or utf16.');
  if (!['none', 'NFC', 'NFD', 'NFKC', 'NFKD'].includes(normalization)) return fail('normalization must be none, NFC, NFD, NFKC, or NFKD.');
  if (typeof ignoreCase !== 'boolean') return fail('ignoreCase must be a boolean.');
  const prepare = text => {
    if (ignoreCase) text = text.toLowerCase();
    if (normalization !== 'none') text = text.normalize(normalization);
    return unit === 'codePoint' ? Array.from(text) : text.split('');
  };
  const first = prepare(input.first);
  const second = prepare(input.second);
  if (first.length > 8192 || second.length > 8192) return fail('Preprocessed strings must be at most 8192 units.');
  return {valid: true, distance: distance(first, second), firstLength: first.length, secondLength: second.length, unit};
}
