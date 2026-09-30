// UUID Validator adapted from validatorjs/validator.js (MIT License)
// https://github.com/validatorjs/validator.js/blob/main/src/lib/isUUID.js

const uuid = {
  1: /^[0-9A-F]{8}-[0-9A-F]{4}-1[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  2: /^[0-9A-F]{8}-[0-9A-F]{4}-2[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  6: /^[0-9A-F]{8}-[0-9A-F]{4}-6[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  7: /^[0-9A-F]{8}-[0-9A-F]{4}-7[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  8: /^[0-9A-F]{8}-[0-9A-F]{4}-8[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,

  nil: /^00000000-0000-0000-0000-000000000000$/i,
  max: /^ffffffff-ffff-ffff-ffff-ffffffffffff$/i,
  loose: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,

  // From https://github.com/uuidjs/uuid/blob/main/src/regex.js
  all: /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i,
};

export default async function run(input) {
  const { uuid: uuidStr, version } = input;

  if (typeof uuidStr !== 'string') {
    return {
      valid: false,
      error: 'UUID must be a string',
    };
  }

  // Normalize the UUID first (remove whitespace, add hyphens if needed)
  const normalized = normalizeUUID(uuidStr);
  if (!normalized) {
    return {
      valid: false,
      error: 'Invalid UUID format',
    };
  }

  // Determine the version to check
  let versionToCheck = version !== undefined && version !== null ? version : 'all';

  // Validate the normalized UUID against the appropriate regex
  let isValid = false;
  if (versionToCheck in uuid) {
    isValid = uuid[versionToCheck].test(normalized);
  }

  const withoutHyphens = normalized.replace(/-/g, '');

  // Determine the actual version of the UUID if valid
  let detectedVersion = null;
  if (isValid) {
    detectedVersion = detectVersion(normalized);
  }

  const result = {
    valid: isValid,
  };

  if (isValid) {
    result.version = detectedVersion;
    result.canonical = normalized;
    result.compact = withoutHyphens;
  } else {
    result.error = 'Invalid UUID format';
  }

  return result;
}

function normalizeUUID(str) {
  if (typeof str !== 'string') {
    return null;
  }

  // Remove any whitespace
  str = str.trim();

  // If it looks like it might be a UUID, try to normalize it
  const cleanStr = str.replace(/-/g, '');

  // Check if we have 32 hex characters
  if (!/^[0-9a-f]{32}$/i.test(cleanStr)) {
    return null;
  }

  // Format as canonical UUID
  return (
    cleanStr.substring(0, 8) +
    '-' +
    cleanStr.substring(8, 12) +
    '-' +
    cleanStr.substring(12, 16) +
    '-' +
    cleanStr.substring(16, 20) +
    '-' +
    cleanStr.substring(20, 32)
  );
}

function detectVersion(uuidStr) {
  // Normalize and extract version field (the version is in the most significant 4 bits of time_hi_and_version)
  const cleanStr = uuidStr.replace(/-/g, '').toLowerCase();

  if (!/^[0-9a-f]{32}$/.test(cleanStr)) {
    return null;
  }

  // The version is in the first hex digit of the 13th and 14th characters (positions 12-13)
  const versionDigit = cleanStr[12];

  switch (versionDigit) {
    case '1':
      return 1;
    case '2':
      return 2;
    case '3':
      return 3;
    case '4':
      return 4;
    case '5':
      return 5;
    case '6':
      return 6;
    case '7':
      return 7;
    case '8':
      return 8;
    case '0':
      // Check if it's the nil UUID
      if (cleanStr === '00000000000000000000000000000000') {
        return 'nil';
      }
      return null;
    case 'f':
      // Check if it's the max UUID
      if (cleanStr === 'ffffffffffffffffffffffffffffffff') {
        return 'max';
      }
      return null;
    default:
      return null;
  }
}
