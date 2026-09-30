// Ported from jsdiff, Copyright (c) 2009-2015 Kevin Decker <kpdecker@gmail.com>.
// BSD-3-Clause. Synchronous exact-comparison subset of src/diff/base.ts and line.ts.
function tokenize(text, mode) {
  if (mode === 'characters') return Array.from(text);
  const parts = text.split(/(\n|\r\n)/);
  if (!parts[parts.length - 1]) parts.pop();
  const lines = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2) lines[lines.length - 1] += parts[i];
    else lines.push(parts[i]);
  }
  return lines.filter(Boolean);
}
function addToPath(path, type, increment) {
  const last = path.last;
  return {oldPos: path.oldPos + increment, last: {
    type, count: last && last.type === type ? last.count + 1 : 1,
    previous: last && last.type === type ? last.previous : last
  }};
}
function extractCommon(path, newer, older, diagonal) {
  let oldPos = path.oldPos, newPos = oldPos - diagonal, count = 0;
  while (newPos + 1 < newer.length && oldPos + 1 < older.length && older[oldPos + 1] === newer[newPos + 1]) {
    oldPos++; newPos++; count++;
  }
  if (count) path.last = {type: 'equal', count, previous: path.last};
  path.oldPos = oldPos;
  return newPos;
}
function buildValues(last, newer, older) {
  const components = [];
  while (last) { components.push(last); last = last.previous; }
  components.reverse();
  let oldPos = 0, newPos = 0;
  return components.map(({type, count}) => {
    let text;
    if (type === 'delete') {
      text = older.slice(oldPos, oldPos + count).join(''); oldPos += count;
    } else {
      text = newer.slice(newPos, newPos + count).join(''); newPos += count;
      if (type === 'equal') oldPos += count;
    }
    return {type, count, text};
  });
}
function diff(older, newer) {
  const oldLen = older.length, newLen = newer.length;
  const best = new Map([[0, {oldPos: -1, last: undefined}]]);
  let newPos = extractCommon(best.get(0), newer, older, 0);
  if (best.get(0).oldPos + 1 >= oldLen && newPos + 1 >= newLen) return buildValues(best.get(0).last, newer, older);
  let minDiagonal = -Infinity, maxDiagonal = Infinity;
  for (let edits = 1; edits <= oldLen + newLen; edits++) {
    for (let diagonal = Math.max(minDiagonal, -edits); diagonal <= Math.min(maxDiagonal, edits); diagonal += 2) {
      const removePath = best.get(diagonal - 1), addPath = best.get(diagonal + 1);
      if (removePath) best.delete(diagonal - 1);
      const addNewPos = addPath ? addPath.oldPos - diagonal : -1;
      const canAdd = addPath && addNewPos >= 0 && addNewPos < newLen;
      const canRemove = removePath && removePath.oldPos + 1 < oldLen;
      if (!canAdd && !canRemove) { best.delete(diagonal); continue; }
      const path = !canRemove || (canAdd && removePath.oldPos < addPath.oldPos)
        ? addToPath(addPath, 'insert', 0) : addToPath(removePath, 'delete', 1);
      newPos = extractCommon(path, newer, older, diagonal);
      if (path.oldPos + 1 >= oldLen && newPos + 1 >= newLen) return buildValues(path.last, newer, older);
      best.set(diagonal, path);
      if (path.oldPos + 1 >= oldLen) maxDiagonal = Math.min(maxDiagonal, diagonal - 1);
      if (newPos + 1 >= newLen) minDiagonal = Math.max(minDiagonal, diagonal + 1);
    }
  }
  throw new Error('Unreachable diff state');
}
export default async function run(input) {
  const fail = (error, message) => ({valid: false, error, message});
  if (!input || typeof input !== 'object' || Array.isArray(input) || typeof input.oldText !== 'string' || typeof input.newText !== 'string') return fail('INVALID_INPUT', 'oldText and newText must be strings.');
  const mode = input.mode === undefined ? 'lines' : input.mode;
  if (mode !== 'lines' && mode !== 'characters') return fail('INVALID_MODE', 'mode must be lines or characters.');
  if (input.oldText.length > 100000 || input.newText.length > 100000) return fail('INPUT_TOO_LARGE', 'Each text must contain at most 100000 UTF-16 code units.');
  const older = tokenize(input.oldText, mode), newer = tokenize(input.newText, mode);
  if (older.length > 1024 || newer.length > 1024) return fail('TOO_MANY_TOKENS', 'Each text must contain at most 1024 tokens in the selected mode.');
  const changes = diff(older, newer);
  let inserted = 0, deleted = 0, unchanged = 0;
  for (const c of changes) {
    if (c.type === 'insert') inserted += c.count;
    else if (c.type === 'delete') deleted += c.count;
    else unchanged += c.count;
  }
  return {valid: true, mode, oldTokenCount: older.length, newTokenCount: newer.length, inserted, deleted, unchanged, editDistance: inserted + deleted, changes};
}
