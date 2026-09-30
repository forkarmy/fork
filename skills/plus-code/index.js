// Ported from google/open-location-code js/src/openlocationcode.js
// Copyright 2014 Google Inc. Licensed under the Apache License, Version 2.0.

const SEPARATOR = "+";
const SEPARATOR_POSITION = 8;
const PADDING_CHARACTER = "0";
const CODE_ALPHABET = "23456789CFGHJMPQRVWX";
const ENCODING_BASE = CODE_ALPHABET.length;
const LATITUDE_MAX = 90;
const LONGITUDE_MAX = 180;
const MIN_DIGIT_COUNT = 2;
const MAX_DIGIT_COUNT = 15;
const PAIR_CODE_LENGTH = 10;
const PAIR_FIRST_PLACE_VALUE = Math.pow(ENCODING_BASE, PAIR_CODE_LENGTH / 2 - 1);
const PAIR_PRECISION = Math.pow(ENCODING_BASE, 3);
const PAIR_RESOLUTIONS = [20.0, 1.0, 0.05, 0.0025, 0.000125];
const GRID_CODE_LENGTH = MAX_DIGIT_COUNT - PAIR_CODE_LENGTH;
const GRID_COLUMNS = 4;
const GRID_ROWS = 5;
const GRID_LAT_FIRST_PLACE_VALUE = Math.pow(GRID_ROWS, GRID_CODE_LENGTH - 1);
const GRID_LNG_FIRST_PLACE_VALUE = Math.pow(GRID_COLUMNS, GRID_CODE_LENGTH - 1);
const FINAL_LAT_PRECISION =
  PAIR_PRECISION * Math.pow(GRID_ROWS, MAX_DIGIT_COUNT - PAIR_CODE_LENGTH);
const FINAL_LNG_PRECISION =
  PAIR_PRECISION * Math.pow(GRID_COLUMNS, MAX_DIGIT_COUNT - PAIR_CODE_LENGTH);
const MIN_TRIMMABLE_CODE_LEN = 6;

function fail(error, message) {
  return { valid: false, error, message };
}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function clipLatitude(latitude) {
  return Math.min(90, Math.max(-90, latitude));
}

function normalizeLongitude(longitude) {
  let value = longitude;
  while (value < -180) value += 360;
  while (value >= 180) value -= 360;
  return value;
}

function isValid(code) {
  if (!code || typeof code !== "string") return false;
  if (code.indexOf(SEPARATOR) === -1) return false;
  if (code.indexOf(SEPARATOR) !== code.lastIndexOf(SEPARATOR)) return false;
  if (code.length === 1) return false;
  if (
    code.indexOf(SEPARATOR) > SEPARATOR_POSITION ||
    code.indexOf(SEPARATOR) % 2 === 1
  ) {
    return false;
  }
  if (code.indexOf(PADDING_CHARACTER) > -1) {
    if (code.indexOf(SEPARATOR) < SEPARATOR_POSITION) return false;
    if (code.indexOf(PADDING_CHARACTER) === 0) return false;
    const padMatch = code.match(new RegExp("(" + PADDING_CHARACTER + "+)", "g"));
    if (
      !padMatch ||
      padMatch.length > 1 ||
      padMatch[0].length % 2 === 1 ||
      padMatch[0].length > SEPARATOR_POSITION - 2
    ) {
      return false;
    }
    if (code.charAt(code.length - 1) !== SEPARATOR) return false;
  }
  if (code.length - code.indexOf(SEPARATOR) - 1 === 1) return false;
  const stripped = code
    .replace(new RegExp("\\" + SEPARATOR + "+"), "")
    .replace(new RegExp(PADDING_CHARACTER + "+"), "");
  for (let i = 0; i < stripped.length; i++) {
    const character = stripped.charAt(i).toUpperCase();
    if (character !== SEPARATOR && CODE_ALPHABET.indexOf(character) === -1) {
      return false;
    }
  }
  return true;
}

function isShort(code) {
  if (!isValid(code)) return false;
  return (
    code.indexOf(SEPARATOR) >= 0 &&
    code.indexOf(SEPARATOR) < SEPARATOR_POSITION
  );
}

function isFull(code) {
  if (!isValid(code) || isShort(code)) return false;
  const firstLatValue =
    CODE_ALPHABET.indexOf(code.charAt(0).toUpperCase()) * ENCODING_BASE;
  if (firstLatValue >= LATITUDE_MAX * 2) return false;
  if (code.length > 1) {
    const firstLngValue =
      CODE_ALPHABET.indexOf(code.charAt(1).toUpperCase()) * ENCODING_BASE;
    if (firstLngValue >= LONGITUDE_MAX * 2) return false;
  }
  return true;
}

function locationToIntegers(latitude, longitude) {
  let latVal = Math.floor(latitude * FINAL_LAT_PRECISION);
  latVal += LATITUDE_MAX * FINAL_LAT_PRECISION;
  if (latVal < 0) {
    latVal = 0;
  } else if (latVal >= 2 * LATITUDE_MAX * FINAL_LAT_PRECISION) {
    latVal = 2 * LATITUDE_MAX * FINAL_LAT_PRECISION - 1;
  }
  let lngVal = Math.floor(longitude * FINAL_LNG_PRECISION);
  lngVal += LONGITUDE_MAX * FINAL_LNG_PRECISION;
  const lngSpan = 2 * LONGITUDE_MAX * FINAL_LNG_PRECISION;
  if (lngVal < 0) {
    lngVal = (lngVal % lngSpan) + lngSpan;
  } else if (lngVal >= lngSpan) {
    lngVal = lngVal % lngSpan;
  }
  return [latVal, lngVal];
}

function encodeIntegers(latInt, lngInt, codeLength) {
  if (typeof codeLength === "undefined" || codeLength === null) {
    codeLength = 10;
  } else {
    codeLength = Math.min(MAX_DIGIT_COUNT, Number(codeLength));
  }
  if (!Number.isFinite(latInt) || !Number.isFinite(lngInt) || !Number.isFinite(codeLength)) {
    return fail("invalid_number", "Latitude, longitude, and code length must be finite numbers.");
  }
  if (
    codeLength < MIN_DIGIT_COUNT ||
    (codeLength < PAIR_CODE_LENGTH && codeLength % 2 === 1)
  ) {
    return fail(
      "invalid_length",
      "Open Location Code length must be at least 2, at most 15, and even when shorter than 10."
    );
  }
  const code = new Array(MAX_DIGIT_COUNT + 1);
  code[SEPARATOR_POSITION] = SEPARATOR;
  if (codeLength > PAIR_CODE_LENGTH) {
    for (let i = MAX_DIGIT_COUNT - PAIR_CODE_LENGTH; i >= 1; i--) {
      const latDigit = latInt % GRID_ROWS;
      const lngDigit = lngInt % GRID_COLUMNS;
      const ndx = latDigit * GRID_COLUMNS + lngDigit;
      code[SEPARATOR_POSITION + 2 + i] = CODE_ALPHABET.charAt(ndx);
      latInt = Math.floor(latInt / GRID_ROWS);
      lngInt = Math.floor(lngInt / GRID_COLUMNS);
    }
  } else {
    latInt = Math.floor(latInt / Math.pow(GRID_ROWS, GRID_CODE_LENGTH));
    lngInt = Math.floor(lngInt / Math.pow(GRID_COLUMNS, GRID_CODE_LENGTH));
  }
  code[SEPARATOR_POSITION + 1] = CODE_ALPHABET.charAt(latInt % ENCODING_BASE);
  code[SEPARATOR_POSITION + 2] = CODE_ALPHABET.charAt(lngInt % ENCODING_BASE);
  latInt = Math.floor(latInt / ENCODING_BASE);
  lngInt = Math.floor(lngInt / ENCODING_BASE);
  for (let i = PAIR_CODE_LENGTH / 2 + 1; i >= 0; i -= 2) {
    code[i] = CODE_ALPHABET.charAt(latInt % ENCODING_BASE);
    code[i + 1] = CODE_ALPHABET.charAt(lngInt % ENCODING_BASE);
    latInt = Math.floor(latInt / ENCODING_BASE);
    lngInt = Math.floor(lngInt / ENCODING_BASE);
  }
  let encoded;
  if (codeLength >= SEPARATOR_POSITION) {
    encoded = code.slice(0, codeLength + 1).join("");
  } else {
    encoded =
      code.slice(0, codeLength).join("") +
      Array(SEPARATOR_POSITION - codeLength + 1).join(PADDING_CHARACTER) +
      SEPARATOR;
  }
  return { ok: true, code: encoded, codeLength };
}

function encode(latitude, longitude, codeLength) {
  const integers = locationToIntegers(latitude, longitude);
  return encodeIntegers(integers[0], integers[1], codeLength);
}

function decode(code) {
  if (!isFull(code)) {
    return fail("invalid_code", "Passed Plus Code is not a valid full code: " + code);
  }
  const cleaned = code.replace("+", "").replace(/0/g, "").toUpperCase();
  let normalLat = -LATITUDE_MAX * PAIR_PRECISION;
  let normalLng = -LONGITUDE_MAX * PAIR_PRECISION;
  let gridLat = 0;
  let gridLng = 0;
  let digits = Math.min(cleaned.length, PAIR_CODE_LENGTH);
  let pv = PAIR_FIRST_PLACE_VALUE;
  for (let i = 0; i < digits; i += 2) {
    normalLat += CODE_ALPHABET.indexOf(cleaned.charAt(i)) * pv;
    normalLng += CODE_ALPHABET.indexOf(cleaned.charAt(i + 1)) * pv;
    if (i < digits - 2) pv /= ENCODING_BASE;
  }
  let latPrecision = pv / PAIR_PRECISION;
  let lngPrecision = pv / PAIR_PRECISION;
  if (cleaned.length > PAIR_CODE_LENGTH) {
    let rowpv = GRID_LAT_FIRST_PLACE_VALUE;
    let colpv = GRID_LNG_FIRST_PLACE_VALUE;
    digits = Math.min(cleaned.length, MAX_DIGIT_COUNT);
    for (let i = PAIR_CODE_LENGTH; i < digits; i++) {
      const digitVal = CODE_ALPHABET.indexOf(cleaned.charAt(i));
      const row = Math.floor(digitVal / GRID_COLUMNS);
      const col = digitVal % GRID_COLUMNS;
      gridLat += row * rowpv;
      gridLng += col * colpv;
      if (i < digits - 1) {
        rowpv /= GRID_ROWS;
        colpv /= GRID_COLUMNS;
      }
    }
    latPrecision = rowpv / FINAL_LAT_PRECISION;
    lngPrecision = colpv / FINAL_LNG_PRECISION;
  }
  const lat = normalLat / PAIR_PRECISION + gridLat / FINAL_LAT_PRECISION;
  const lng = normalLng / PAIR_PRECISION + gridLng / FINAL_LNG_PRECISION;
  const codeLength = Math.min(cleaned.length, MAX_DIGIT_COUNT);
  const latitudeLo = lat;
  const longitudeLo = lng;
  const latitudeHi = lat + latPrecision;
  const longitudeHi = lng + lngPrecision;
  return {
    ok: true,
    codeLength,
    latitudeLo,
    longitudeLo,
    latitudeHi,
    longitudeHi,
    latitudeCenter: Math.min(latitudeLo + (latitudeHi - latitudeLo) / 2, LATITUDE_MAX),
    longitudeCenter: Math.min(longitudeLo + (longitudeHi - longitudeLo) / 2, LONGITUDE_MAX),
  };
}

function recoverNearest(shortCode, referenceLatitude, referenceLongitude) {
  if (!isShort(shortCode)) {
    if (isFull(shortCode)) return { ok: true, code: shortCode.toUpperCase() };
    return fail("invalid_code", "Passed short code is not valid: " + shortCode);
  }
  referenceLatitude = clipLatitude(referenceLatitude);
  referenceLongitude = normalizeLongitude(referenceLongitude);
  const upper = shortCode.toUpperCase();
  const paddingLength = SEPARATOR_POSITION - upper.indexOf(SEPARATOR);
  const resolution = Math.pow(20, 2 - paddingLength / 2);
  const halfResolution = resolution / 2.0;
  const prefix = encode(referenceLatitude, referenceLongitude).code.substr(0, paddingLength);
  const area = decode(prefix + upper);
  if (!area.ok) return area;
  if (
    referenceLatitude + halfResolution < area.latitudeCenter &&
    area.latitudeCenter - resolution >= -LATITUDE_MAX
  ) {
    area.latitudeCenter -= resolution;
  } else if (
    referenceLatitude - halfResolution > area.latitudeCenter &&
    area.latitudeCenter + resolution <= LATITUDE_MAX
  ) {
    area.latitudeCenter += resolution;
  }
  if (referenceLongitude + halfResolution < area.longitudeCenter) {
    area.longitudeCenter -= resolution;
  } else if (referenceLongitude - halfResolution > area.longitudeCenter) {
    area.longitudeCenter += resolution;
  }
  const recovered = encode(area.latitudeCenter, area.longitudeCenter, area.codeLength);
  if (!recovered.ok) return recovered;
  return { ok: true, code: recovered.code };
}

function shorten(code, latitude, longitude) {
  if (!isFull(code)) {
    return fail("invalid_code", "Passed code is not valid and full: " + code);
  }
  if (code.indexOf(PADDING_CHARACTER) !== -1) {
    return fail("padded_code", "Cannot shorten padded codes: " + code);
  }
  const upper = code.toUpperCase();
  const codeArea = decode(upper);
  if (!codeArea.ok) return codeArea;
  if (codeArea.codeLength < MIN_TRIMMABLE_CODE_LEN) {
    return fail(
      "invalid_length",
      "Code length must be at least " + MIN_TRIMMABLE_CODE_LEN + " to shorten."
    );
  }
  latitude = clipLatitude(latitude);
  longitude = normalizeLongitude(longitude);
  const range = Math.max(
    Math.abs(codeArea.latitudeCenter - latitude),
    Math.abs(codeArea.longitudeCenter - longitude)
  );
  for (let i = PAIR_RESOLUTIONS.length - 2; i >= 1; i--) {
    if (range < PAIR_RESOLUTIONS[i] * 0.3) {
      return { ok: true, code: upper.substring((i + 1) * 2) };
    }
  }
  return { ok: true, code: upper };
}

function areaFields(area) {
  return {
    codeLength: area.codeLength,
    latitudeLo: area.latitudeLo,
    longitudeLo: area.longitudeLo,
    latitudeHi: area.latitudeHi,
    longitudeHi: area.longitudeHi,
    latitudeCenter: area.latitudeCenter,
    longitudeCenter: area.longitudeCenter,
  };
}

function withArea(op, code, extra) {
  const area = decode(code);
  if (!area.ok) return area;
  return Object.assign(
    { valid: true, operation: op, code },
    areaFields(area),
    extra || {}
  );
}

export default async function run(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return fail("invalid_input", "Input must be an object.");
  }
  const rawCode = input.code;
  if (rawCode !== undefined && rawCode !== null && String(rawCode).trim() !== "") {
    if (typeof rawCode !== "string") {
      return fail("invalid_input", "Code must be a string.");
    }
    const code = rawCode.trim();
    const hasRef = isNumber(input.referenceLatitude) || isNumber(input.referenceLongitude);
    if (hasRef && (!isNumber(input.referenceLatitude) || !isNumber(input.referenceLongitude))) {
      return fail("invalid_number", "Reference latitude and longitude must both be finite numbers.");
    }
    if (isShort(code)) {
      if (!hasRef) {
        return fail("missing_reference", "A short Plus Code needs referenceLatitude and referenceLongitude.");
      }
      const recovered = recoverNearest(code, input.referenceLatitude, input.referenceLongitude);
      if (!recovered.ok) return recovered;
      return withArea("recover", recovered.code, { shortCode: code.toUpperCase() });
    }
    if (!isValid(code)) {
      return fail("invalid_code", "Plus Code is not valid.");
    }
    if (!isFull(code)) {
      return fail("invalid_code", "Plus Code is not a valid full code.");
    }
    if (hasRef) {
      const shortened = shorten(code, input.referenceLatitude, input.referenceLongitude);
      if (!shortened.ok) return shortened;
      return withArea("shorten", code.toUpperCase(), { shortCode: shortened.code });
    }
    return withArea("decode", code.toUpperCase());
  }
  if (!isNumber(input.latitude) || !isNumber(input.longitude)) {
    return fail(
      "invalid_input",
      "Provide a Plus Code, or finite latitude and longitude to encode."
    );
  }
  if (
    input.codeLength !== undefined &&
    input.codeLength !== null &&
    !isNumber(input.codeLength)
  ) {
    return fail("invalid_length", "codeLength must be a finite number.");
  }
  const encoded = encode(input.latitude, input.longitude, input.codeLength);
  if (!encoded.ok) return encoded;
  return withArea("encode", encoded.code, { requestedLength: encoded.codeLength });
}
