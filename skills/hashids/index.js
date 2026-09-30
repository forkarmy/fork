import Hashids from './hashids.js';

/**
 * Ported from niieani/hashids.js (MIT License)
 */
export default async function run(input) {
  const { operation, salt = '', minLength = 0, alphabet, seps } = input;
  
  if (!['encode', 'decode', 'encodeHex', 'decodeHex'].includes(operation)) {
    return { valid: false, error: 'INVALID_OPERATION', message: 'operation must be encode, decode, encodeHex, or decodeHex' };
  }

  try {
    let instance;
    if (alphabet !== undefined && seps !== undefined) {
      instance = new Hashids(salt, minLength, alphabet, seps);
    } else if (alphabet !== undefined) {
      instance = new Hashids(salt, minLength, alphabet);
    } else {
      instance = new Hashids(salt, minLength);
    }

    if (operation === 'encode') {
      const numbers = Array.isArray(input.numbers) ? input.numbers : [input.numbers];
      // Convert to BigInt if strings
      const parsedNumbers = numbers.map(n => typeof n === 'string' && /^\d+$/.test(n) ? BigInt(n) : n);
      const result = instance.encode(parsedNumbers);
      return { valid: true, operation, result };
    } else if (operation === 'decode') {
      if (typeof input.id !== 'string') {
        return { valid: false, error: 'INVALID_ID', message: 'id must be a string' };
      }
      const decoded = instance.decode(input.id);
      // Format as string if BigInt so it serializes to JSON cleanly
      const result = decoded.map(n => typeof n === 'bigint' ? n.toString() : (Number.isSafeInteger(n) ? n : n.toString()));
      return { valid: true, operation, result };
    } else if (operation === 'encodeHex') {
      if (typeof input.hex !== 'string') {
         return { valid: false, error: 'INVALID_HEX', message: 'hex must be a string' };
      }
      const result = instance.encodeHex(input.hex);
      return { valid: true, operation, result };
    } else if (operation === 'decodeHex') {
      if (typeof input.id !== 'string') {
        return { valid: false, error: 'INVALID_ID', message: 'id must be a string' };
      }
      const result = instance.decodeHex(input.id);
      return { valid: true, operation, result };
    }

  } catch (err) {
    return { valid: false, error: 'HASHIDS_ERROR', message: err.message };
  }
}
