// Roman numeral converter for FORK.
// Ported from qbunt/romans (romans.js) by Jeremy Bunting, MIT License,
// https://github.com/qbunt/romans
// Changes: returns result objects instead of throwing, accepts lowercase and
// surrounding whitespace, and only accepts canonical numerals (the same forms
// the library's romanize() produces), which closes gaps in the original regex
// blacklist (e.g. "IIV", "IXI", "MCMC").

const CHAR_VALUES = Object.freeze({ I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 })

const CONVERSION_PAIRS = Object.freeze([
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I']
])

// Pre-computed lookup tables, as in the original library.
const ROMAN_LOOKUP = new Array(4000)
const DECIMAL_LOOKUP = new Map()

function buildRoman(num) {
  let result = ''
  for (const [value, symbol] of CONVERSION_PAIRS) {
    while (num >= value) {
      result += symbol
      num -= value
    }
  }
  return result
}

for (let i = 1; i < 4000; i++) {
  ROMAN_LOOKUP[i] = buildRoman(i)
  DECIMAL_LOOKUP.set(ROMAN_LOOKUP[i], i)
}

function breakdown(num) {
  const parts = []
  for (const [value, symbol] of CONVERSION_PAIRS) {
    while (num >= value) {
      parts.push({ symbol, value })
      num -= value
    }
  }
  return parts
}

// Original deromanize() summation (right-to-left, subtract when smaller than
// the previous symbol). Used only to tell users what a non-canonical form
// would sum to.
function additiveValue(str) {
  let result = 0
  let prev = 0
  for (let i = str.length - 1; i >= 0; i--) {
    const cur = CHAR_VALUES[str[i]]
    result += cur < prev ? -cur : cur
    prev = cur
  }
  return result
}

function fail(error, message, extra) {
  return Object.assign({ valid: false, error, message }, extra || {})
}

function romanize(n) {
  if (n === Infinity) {
    return fail('OUT_OF_RANGE', 'requires max value of less than 4000')
  }
  if (typeof n !== 'number' || !Number.isInteger(n) || n <= 0) {
    return fail('NOT_POSITIVE_INTEGER', 'requires an unsigned integer')
  }
  if (n >= 4000) {
    return fail('OUT_OF_RANGE', 'requires max value of less than 4000')
  }
  return {
    valid: true,
    direction: 'decimal-to-roman',
    roman: ROMAN_LOOKUP[n],
    decimal: n,
    breakdown: breakdown(n)
  }
}

function deromanize(raw) {
  const str = raw.trim().toUpperCase()
  if (str.length === 0) {
    return fail('EMPTY', 'requires valid roman numeral string')
  }
  for (let i = 0; i < str.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(CHAR_VALUES, str[i])) {
      return fail(
        'INVALID_CHARACTER',
        `requires valid roman numeral string: invalid character "${str[i]}" at position ${i + 1}`
      )
    }
  }
  const value = DECIMAL_LOOKUP.get(str)
  if (value === undefined) {
    const sum = additiveValue(str)
    const extra = {}
    let message = 'requires valid roman numeral string: not a canonical Roman numeral'
    if (sum > 0 && sum < 4000) {
      extra.suggestion = ROMAN_LOOKUP[sum]
      message += ` (naive sum is ${sum}, written canonically as ${ROMAN_LOOKUP[sum]})`
    }
    return fail('NON_CANONICAL', message, extra)
  }
  return {
    valid: true,
    direction: 'roman-to-decimal',
    roman: str,
    decimal: value,
    breakdown: breakdown(value)
  }
}

export default async function run(input) {
  const value = input && typeof input === 'object' ? input.value : input
  if (typeof value === 'number') return romanize(value)
  if (typeof value === 'string') {
    const t = value.trim()
    if (/^[+-]?\d+$/.test(t)) return romanize(parseInt(t, 10))
    return deromanize(value)
  }
  return fail('INVALID_INPUT', 'value must be a Roman numeral string or an integer')
}
