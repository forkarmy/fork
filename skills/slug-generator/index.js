// Ported from sindresorhus/slugify (MIT License)
// https://github.com/sindresorhus/slugify

const DEFAULT_OPTIONS = {
	separator: '-',
	lowercase: true,
	decamelize: true,
};

// Unescape a regex special character in a string
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Split camelCase into separate words
function decamelize(string) {
	return string
		// Separate capitalized words: FOO360 → FOO 360
		.replace(/([A-Z]{2})(\d+)/g, '$1 $2')
		// Separate: foo360BAR → foo360 BAR, fooBar → foo Bar
		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		// APISection → API Section (keep plural acronyms intact like APIs)
		.replace(/([A-Z])([A-Z](?!s(?![a-z]))[a-z\d]+)/g, '$1 $2');
}

// Remove extra separators and trim them from edges
function removeMootSeparators(string, separator) {
	const escapedSeparator = escapeRegExp(separator);
	
	return string
		// Replace multiple separators with single separator
		.replace(new RegExp(`(?:${escapedSeparator}){2,}`, 'g'), separator)
		// Remove leading and trailing separators
		.replace(new RegExp(`^(?:${escapedSeparator})|(?:${escapedSeparator})$`, 'g'), '');
}

// Common character replacements (built-in)
const BUILTIN_REPLACEMENTS = new Map([
	['&', ' and '],
	['♥', ' love '],
	['🦄', ' unicorn '],
]);

// Basic transliteration map for common accented characters
const TRANSLITERATION_MAP = new Map([
	['á', 'a'], ['à', 'a'], ['ä', 'a'], ['â', 'a'], ['ã', 'a'], ['å', 'a'],
	['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'],
	['í', 'i'], ['ì', 'i'], ['î', 'i'], ['ï', 'i'],
	['ó', 'o'], ['ò', 'o'], ['ô', 'o'], ['ö', 'o'], ['õ', 'o'],
	['ú', 'u'], ['ù', 'u'], ['û', 'u'], ['ü', 'u'],
	['ý', 'y'], ['ÿ', 'y'],
	['ç', 'c'], ['ñ', 'n'],
	['Á', 'A'], ['À', 'A'], ['Ä', 'A'], ['Â', 'A'], ['Ã', 'A'], ['Å', 'A'],
	['É', 'E'], ['È', 'E'], ['Ê', 'E'], ['Ë', 'E'],
	['Í', 'I'], ['Ì', 'I'], ['Î', 'I'], ['Ï', 'I'],
	['Ó', 'O'], ['Ò', 'O'], ['Ô', 'O'], ['Ö', 'O'], ['Õ', 'O'],
	['Ú', 'U'], ['Ù', 'U'], ['Û', 'U'], ['Ü', 'U'],
	['Ý', 'Y'],
	['Ç', 'C'], ['Ñ', 'N'],
]);

export default async function run(input) {
	const {string, options = {}} = input;

	if (typeof string !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof string}`);
	}

	const opts = {
		...DEFAULT_OPTIONS,
		...options,
	};

	if (opts.separator === '' || typeof opts.separator !== 'string') {
		// Allow empty separator
		if (opts.separator !== '') {
			throw new TypeError('separator must be a string');
		}
	}

	let result = string;

	// Apply transliteration to accented characters
	for (const [accented, plain] of TRANSLITERATION_MAP) {
		result = result.split(accented).join(plain);
	}

	// Apply built-in and custom replacements
	const allReplacements = new Map([
		...BUILTIN_REPLACEMENTS,
		...(options.customReplacements || []),
	]);

	for (const [key, value] of allReplacements) {
		// For custom replacements, the key might be a regex pattern string that needs unescaping
		// But we'll treat it as a literal string to keep it simple
		result = result.split(key).join(value);
	}

	// Handle camelCase splitting
	if (opts.decamelize) {
		result = decamelize(result);
	}

	// Handle contractions (e.g., "Conway's Law" → "conways-law")
	// Match 's' or 't' after apostrophe at word boundaries
	result = result.replace(/([a-z\d])['\u2019]([ts])(?![a-z\d])/gi, '$1$2');

	// Convert to lowercase if requested
	if (opts.lowercase) {
		result = result.toLowerCase();
	}

	// Replace anything that's not alphanumeric, separator, or explicitly preserved with separator
	const preserveChars = options.preserveCharacters ? 
		Array.from(options.preserveCharacters).map(c => escapeRegExp(c)).join('') : 
		'';
	
	const charPattern = `[^a-z0-9${escapeRegExp(opts.separator)}${preserveChars}]`;
	const regex = new RegExp(charPattern, opts.lowercase ? 'g' : 'gi');
	result = result.replace(regex, opts.separator);

	// Clean up separators
	if (opts.separator) {
		result = removeMootSeparators(result, opts.separator);
	}

	return {
		slug: result,
	};
}
