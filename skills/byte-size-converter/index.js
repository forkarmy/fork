/*!
 * bytes
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015 Jed Watson
 * MIT Licensed
 */

const formatThousandsRegExp = /\B(?=(\d{3})+(?!\d))/g;
const formatDecimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;

const map = {
  b:  1,
  kb: 1 << 10,
  mb: 1 << 20,
  gb: 1 << 30,
  tb: Math.pow(1024, 4),
  pb: Math.pow(1024, 5),
};

const parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i;

function format(value, options) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const mag = Math.abs(value);
  const thousandsSeparator = (options && options.thousandsSeparator) || '';
  const unitSeparator = (options && options.unitSeparator !== undefined ? options.unitSeparator : '');
  const decimalPlaces = (options && options.decimalPlaces !== undefined) ? options.decimalPlaces : 2;
  const fixedDecimals = Boolean(options && options.fixedDecimals);
  let unit = (options && options.unit) || '';

  if (!unit || !map[unit.toLowerCase()]) {
    if (mag >= map.pb) {
      unit = 'PB';
    } else if (mag >= map.tb) {
      unit = 'TB';
    } else if (mag >= map.gb) {
      unit = 'GB';
    } else if (mag >= map.mb) {
      unit = 'MB';
    } else if (mag >= map.kb) {
      unit = 'KB';
    } else {
      unit = 'B';
    }
  }

  const val = value / map[unit.toLowerCase()];
  let str = val.toFixed(decimalPlaces);

  if (!fixedDecimals) {
    str = str.replace(formatDecimalsRegExp, '$1');
  }

  if (thousandsSeparator) {
    str = str.split('.').map(function (s, i) {
      return i === 0
        ? s.replace(formatThousandsRegExp, thousandsSeparator)
        : s
    }).join('.');
  }

  return str + unitSeparator + unit;
}

function parse(val) {
  if (typeof val === 'number' && !isNaN(val)) {
    return val;
  }

  if (typeof val !== 'string') {
    return null;
  }

  const results = parseRegExp.exec(val);
  let floatValue;
  let unit = 'b';

  if (!results) {
    floatValue = parseInt(val, 10);
    unit = 'b';
  } else {
    floatValue = parseFloat(results[1]);
    unit = results[4].toLowerCase();
  }

  if (isNaN(floatValue)) {
    return null;
  }

  return Math.floor(map[unit] * floatValue);
}

export default async function run(input) {
  const { value, options } = input;
  let res;

  if (typeof value === 'string') {
    res = parse(value);
  } else if (typeof value === 'number') {
    res = format(value, options);
  } else {
    res = null;
  }

  if (res === null) {
    return { valid: false, error: 'Invalid input', message: 'Could not parse or format the provided value.' };
  }

  return { valid: true, result: res };
}
