// Adapted from janl/node-jsonpointer, jsonpointer.js (MIT).
// Copyright (c) 2011-2015 Jan Lehnardt <jan@apache.org> & Marc Bachmann <https://github.com/marcbachmann>.
// RFC 6901 strict validation, URI fragments and structured results added for FORK.
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const fail = (error, message) => ({ valid: false, error, message });

export default async function run(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || !own(input, 'document')) {
    return fail('INVALID_INPUT', 'Provide a document and a pointer string.');
  }
  if (typeof input.pointer !== 'string') return fail('INVALID_INPUT', 'Provide a document and a pointer string.');
  if (input.pointer.length > 100000) return fail('LIMIT_EXCEEDED', 'Pointer must not exceed 100000 UTF-16 code units.');
  let pointer = input.pointer;
  if (pointer.startsWith('#')) {
    try { pointer = decodeURIComponent(pointer.slice(1)); }
    catch { return fail('INVALID_FRAGMENT', 'URI fragment contains invalid percent encoding or UTF-8.'); }
  }
  if (pointer !== '' && !pointer.startsWith('/')) return fail('INVALID_POINTER', 'Pointer must be empty or begin with /.');
  if (/~(?:[^01]|$)/u.test(pointer)) return fail('INVALID_ESCAPE', 'Only ~0 and ~1 are valid tilde escapes.');
  // One replacement pass preserves ~01 as literal ~1, as in upstream untilde().
  const tokens = pointer === '' ? [] : pointer.slice(1).split('/').map(part => part.replace(/~[01]/g, m => m === '~1' ? '/' : '~'));
  let value = input.document;
  for (const token of tokens) {
    if (value === null || typeof value !== 'object') return { valid: true, pointer, tokens, found: false };
    if (Array.isArray(value) && (!/^(0|[1-9][0-9]*)$/.test(token) || Number(token) >= value.length)) {
      return { valid: true, pointer, tokens, found: false };
    }
    if (!own(value, token)) return { valid: true, pointer, tokens, found: false };
    value = value[token];
  }
  return { valid: true, pointer, tokens, found: true, value };
}
