/*
Ported from NaturalNode/natural, lib/natural/distance/jaro-winkler_distance.js.
Copyright (c) 2012, Adam Phillabaum, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
function jaro(a, b) {
  // Deliberate edge-case correction: identity, including empty strings and
  // one-unit strings, is handled after preprocessing for both scores.
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const window = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const ma = new Array(a.length).fill(false);
  const mb = new Array(b.length).fill(false);
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - window);
    const end = Math.min(i + window + 1, b.length);
    for (let k = start; k < end; k++) {
      if (mb[k] || a[i] !== b[k]) continue;
      ma[i] = true;
      mb[k] = true;
      matches++;
      break;
    }
  }
  if (!matches) return 0;
  let k = 0;
  let transpositions = 0;
  for (let i = 0; i < a.length; i++) {
    if (!ma[i]) continue;
    while (!mb[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  return (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3;
}
const fail = (message) => ({valid: false, error: 'INVALID_INPUT', message});
const round = (n) => Number(n.toFixed(12));
export default async function run(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fail('Input must be an object.');
  if (typeof input.first !== 'string' || typeof input.second !== 'string') return fail('first and second must be strings.');
  if (input.ignoreCase !== undefined && typeof input.ignoreCase !== 'boolean') return fail('ignoreCase must be a boolean.');
  if (input.first.length > 4096 || input.second.length > 4096) return fail('Each string must contain at most 4096 UTF-16 code units.');
  const a = input.ignoreCase ? input.first.toLowerCase() : input.first;
  const b = input.ignoreCase ? input.second.toLowerCase() : input.second;
  let prefixLength = 0;
  while (prefixLength < Math.min(4, a.length, b.length) && a[prefixLength] === b[prefixLength]) prefixLength++;
  const score = jaro(a, b);
  return {valid: true, jaro: round(score), jaroWinkler: round(score + prefixLength * 0.1 * (1 - score)), prefixLength, firstLength: a.length, secondLength: b.length, unit: 'utf16'};
}
