// IBAN validator for FORK.
// Ported from iban4j by Artur Mkrtchyan (https://github.com/arturmkrtchyan/iban4j),
// Copyright 2013 Artur Mkrtchyan, licensed under the Apache License, Version 2.0.
// Logic from src/main/java/org/iban4j/IbanUtil.java, bban/BbanStructure.java and CharacterUtil.java.

import { STRUCTURES } from './structures.js';

const isDigit = (ch) => ch >= '0' && ch <= '9';
const isUpper = (ch) => ch >= 'A' && ch <= 'Z';
const isAlnum = (ch) => isDigit(ch) || isUpper(ch);

const CLASS_CHECK = { n: isDigit, a: isUpper, c: isAlnum };
const CLASS_NAME = { n: 'digits', a: 'upper case letters', c: 'digits or letters' };

// ISO 13616 mod-97 over BBAN + country code + check digits (iban4j calculateMod).
function calculateMod(iban) {
  const s = iban.slice(4) + iban.slice(0, 4);
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    let v;
    if (isDigit(ch)) v = ch.charCodeAt(0) - 48;
    else if (isUpper(ch)) v = ch.charCodeAt(0) - 55;
    else return -1;
    total = (v > 9 ? total * 100 : total * 10) + v;
    if (total > 999999999) total = total % 97;
  }
  return total % 97;
}

function calculateCheckDigit(iban) {
  const mod = calculateMod(iban.slice(0, 2) + '00' + iban.slice(4));
  const cd = 98 - mod;
  return cd > 9 ? String(cd) : '0' + cd;
}

// Groups of four separated by spaces (iban4j toFormattedString).
function toFormatted(iban) {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

export default async function run(input) {
  const raw = input && typeof input.iban === 'string' ? input.iban : null;
  const iban = raw === null ? '' : raw.replace(/\s+/g, '').toUpperCase();

  const result = {
    valid: false,
    error: null,
    message: null,
    iban,
    formatted: toFormatted(iban),
    countryCode: iban.length >= 2 ? iban.slice(0, 2) : null,
    checkDigits: iban.length >= 4 ? iban.slice(2, 4) : null,
    expectedCheckDigits: null,
    bban: iban.length > 4 ? iban.slice(4) : null,
    length: iban.length,
    expectedLength: null,
    fields: null,
  };
  const fail = (error, message) => {
    result.error = error;
    result.message = message;
    return result;
  };

  if (raw === null) return fail('IBAN_NOT_NULL', 'Input must have an "iban" string.');
  if (iban.length === 0) return fail('IBAN_NOT_EMPTY', 'Empty string cannot be a valid IBAN.');

  // Country code
  if (iban.length < 2) return fail('COUNTRY_CODE_TWO_LETTERS', 'IBAN must start with a 2 letter country code.');
  const cc = iban.slice(0, 2);
  if (!isUpper(cc[0]) || !isUpper(cc[1])) {
    return fail('COUNTRY_CODE_LETTERS', 'IBAN country code must consist of letters.');
  }
  const structure = STRUCTURES[cc];
  if (!structure) return fail('UNSUPPORTED_COUNTRY', `Country code ${cc} is not supported for IBAN.`);
  result.expectedLength = 4 + structure.bbanLength;

  // Check digits
  if (iban.length < 4) return fail('CHECK_DIGIT_TWO_DIGITS', 'IBAN must contain 2 check digits after the country code.');
  const cd = iban.slice(2, 4);
  if (!isDigit(cd[0]) || !isDigit(cd[1])) {
    return fail('CHECK_DIGIT_ONLY_DIGITS', "IBAN's check digits must be digits.");
  }

  // BBAN length and structure
  const bban = iban.slice(4);
  if (bban.length !== structure.bbanLength) {
    return fail('BBAN_LENGTH',
      `BBAN length is ${bban.length}, expected ${structure.bbanLength} for ${cc} (IBAN length ${result.expectedLength}).`);
  }
  const fields = {};
  let offset = 0;
  for (const entry of structure.entries) {
    const value = bban.slice(offset, offset + entry.length);
    offset += entry.length;
    const check = CLASS_CHECK[entry.charClass];
    for (const ch of value) {
      if (!check(ch)) {
        return fail('BBAN_INVALID_CHARACTER',
          `${entry.field} [${value}] must contain only ${CLASS_NAME[entry.charClass]}; found '${ch}'.`);
      }
    }
    fields[entry.field] = value;
  }
  result.fields = fields;

  // Mod-97 checksum
  result.expectedCheckDigits = calculateCheckDigit(iban);
  if (calculateMod(iban) !== 1) {
    return fail('INVALID_CHECK_DIGIT',
      `Check digits ${cd} are invalid, expected ${result.expectedCheckDigits}.`);
  }

  result.valid = true;
  return result;
}
