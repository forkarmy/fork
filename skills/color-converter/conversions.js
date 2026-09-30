// MIT License - Ported from Qix-/color-convert

const LAB_FT = (6 / 29) ** 3;

function srgbNonlinearTransform(c) {
	const cc = c > 0.0031308 ? (1.055 * (c ** (1 / 2.4)) - 0.055) : c * 12.92;
	return Math.min(Math.max(0, cc), 1);
}

function srgbNonlinearTransformInv(c) {
	return c > 0.04045 ? (((c + 0.055) / 1.055) ** 2.4) : (c / 12.92);
}

export function rgbToHsl(rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);
	const delta = max - min;
	let h, s;

	if (max === min) {
		h = 0;
	} else if (max === r) {
		h = (g - b) / delta;
	} else if (max === g) {
		h = 2 + (b - r) / delta;
	} else {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);
	if (h < 0) h += 360;

	const l = (min + max) / 2;
	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
}

export function hslToRgb(hsl) {
	const h = hsl[0] / 360;
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;
	let t1, t2, t3, val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
	t1 = 2 * l - t2;

	const rgb = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) t3++;
		if (t3 > 1) t3--;

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}
		rgb[i] = val * 255;
	}
	return rgb;
}

export function rgbToHsv(rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const diff = v - Math.min(r, g, b);
	const diffc = (c) => (v - c) / 6 / diff + 1 / 2;
	let h, s;

	if (diff === 0) {
		h = 0;
		s = 0;
	} else {
		s = diff / v;
		const rdif = diffc(r);
		const gdif = diffc(g);
		const bdif = diffc(b);

		if (v === r) {
			h = bdif - gdif;
		} else if (v === g) {
			h = (1 / 3) + rdif - bdif;
		} else {
			h = (2 / 3) + gdif - rdif;
		}
		if (h < 0) h += 1;
		else if (h > 1) h -= 1;
	}

	return [h * 360, s * 100, v * 100];
}

export function hsvToRgb(hsv) {
	const h = hsv[0] / 60;
	const s = hsv[1] / 100;
	let v = hsv[2] / 100;
	const hi = Math.floor(h) % 6;
	const f = h - Math.floor(h);
	const p = 255 * v * (1 - s);
	const q = 255 * v * (1 - (s * f));
	const t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0: return [v, t, p];
		case 1: return [q, v, p];
		case 2: return [p, v, t];
		case 3: return [p, q, v];
		case 4: return [t, p, v];
		case 5: return [v, p, q];
	}
}

export function rgbToCmyk(rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const k = Math.min(1 - r, 1 - g, 1 - b);
	const c = (1 - r - k) / (1 - k) || 0;
	const m = (1 - g - k) / (1 - k) || 0;
	const y = (1 - b - k) / (1 - k) || 0;
	return [c * 100, m * 100, y * 100, k * 100];
}

export function cmykToRgb(cmyk) {
	const c = cmyk[0] / 100;
	const m = cmyk[1] / 100;
	const y = cmyk[2] / 100;
	const k = cmyk[3] / 100;
	const r = 1 - Math.min(1, c * (1 - k) + k);
	const g = 1 - Math.min(1, m * (1 - k) + k);
	const b = 1 - Math.min(1, y * (1 - k) + k);
	return [r * 255, g * 255, b * 255];
}

export function rgbToXyz(rgb) {
	const r = srgbNonlinearTransformInv(rgb[0] / 255);
	const g = srgbNonlinearTransformInv(rgb[1] / 255);
	const b = srgbNonlinearTransformInv(rgb[2] / 255);
	const x = (r * 0.4124564) + (g * 0.3575761) + (b * 0.1804375);
	const y = (r * 0.2126729) + (g * 0.7151522) + (b * 0.0721750);
	const z = (r * 0.0193339) + (g * 0.1191920) + (b * 0.9503041);
	return [x * 100, y * 100, z * 100];
}

export function xyzToRgb(xyz) {
	const x = xyz[0] / 100;
	const y = xyz[1] / 100;
	const z = xyz[2] / 100;
	let r = (x * 3.2404542) + (y * -1.5371385) + (z * -0.4985314);
	let g = (x * -0.9692660) + (y * 1.8760108) + (z * 0.0415560);
	let b = (x * 0.0556434) + (y * -0.2040259) + (z * 1.0572252);
	return [srgbNonlinearTransform(r) * 255, srgbNonlinearTransform(g) * 255, srgbNonlinearTransform(b) * 255];
}

export function xyzToLab(xyz) {
	let x = xyz[0] / 95.047;
	let y = xyz[1] / 100;
	let z = xyz[2] / 108.883;
	x = x > LAB_FT ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > LAB_FT ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > LAB_FT ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);
	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);
	return [l, a, b];
}

export function labToXyz(lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let y = (l + 16) / 116;
	let x = a / 500 + y;
	let z = y - b / 200;
	const y2 = y ** 3;
	const x2 = x ** 3;
	const z2 = z ** 3;
	y = y2 > LAB_FT ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > LAB_FT ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > LAB_FT ? z2 : (z - 16 / 116) / 7.787;
	return [x * 95.047, y * 100, z * 108.883];
}

export function rgbToLab(rgb) {
	return xyzToLab(rgbToXyz(rgb));
}

export function labToRgb(lab) {
	return xyzToRgb(labToXyz(lab));
}

export function rgbToHex(rgb) {
	const integer = ((Math.round(rgb[0]) & 0xFF) << 16) +
		((Math.round(rgb[1]) & 0xFF) << 8) +
		(Math.round(rgb[2]) & 0xFF);
	const string = integer.toString(16).toUpperCase();
	return '#' + '000000'.slice(string.length) + string;
}

export function hexToRgb(hex) {
	const match = hex.toString(16).match(/[a-f\d]{6}|[a-f\d]{3}/i);
	if (!match) return [0, 0, 0];
	let colorString = match[0];
	if (colorString.length === 3) {
		colorString = [...colorString].map(char => char + char).join('');
	}
	const integer = Number.parseInt(colorString, 16);
	const r = (integer >> 16) & 0xFF;
	const g = (integer >> 8) & 0xFF;
	const b = integer & 0xFF;
	return [r, g, b];
}
