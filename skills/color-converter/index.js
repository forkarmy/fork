// MIT License - Ported from Qix-/color-convert
import {
	rgbToHex, hexToRgb,
	rgbToHsl, hslToRgb,
	rgbToHsv, hsvToRgb,
	rgbToCmyk, cmykToRgb,
	rgbToXyz, xyzToRgb,
	rgbToLab, labToRgb
} from './conversions.js';

function roundArray(arr) {
	return arr.map(val => Math.round(val));
}

export default async function run(input) {
	const { format, value } = input;
	
	if (!format || value === undefined) {
		return { valid: false, error: 'Missing format or value' };
	}

	let rgb = null;
	let parsedValue = value;

	try {
		switch (format.toLowerCase()) {
			case 'rgb':
				rgb = parsedValue;
				break;
			case 'hex':
				rgb = hexToRgb(parsedValue);
				break;
			case 'hsl':
				rgb = hslToRgb(parsedValue);
				break;
			case 'hsv':
				rgb = hsvToRgb(parsedValue);
				break;
			case 'cmyk':
				rgb = cmykToRgb(parsedValue);
				break;
			case 'xyz':
				rgb = xyzToRgb(parsedValue);
				break;
			case 'lab':
				rgb = labToRgb(parsedValue);
				break;
			default:
				return { valid: false, error: 'Unsupported format: ' + format };
		}
	} catch (e) {
		return { valid: false, error: 'Error parsing color value: ' + e.message };
	}

	if (!Array.isArray(rgb) || rgb.length < 3) {
		return { valid: false, error: 'Invalid input value for format: ' + format };
	}

	return {
		valid: true,
		hex: rgbToHex(rgb),
		rgb: roundArray(rgb),
		hsl: roundArray(rgbToHsl(rgb)),
		hsv: roundArray(rgbToHsv(rgb)),
		cmyk: roundArray(rgbToCmyk(rgb)),
		xyz: roundArray(rgbToXyz(rgb)),
		lab: roundArray(rgbToLab(rgb))
	};
}
