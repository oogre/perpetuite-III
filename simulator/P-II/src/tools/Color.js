import {getRandomItem} from './helpers.js'
import {isString, isArrayRGB} from './validators.js';
import ColorCli from "cli-color";

// the following functions are based off of the pseudocode
// found on www.easyrgb.com
export const lab2rgb = (lab)=>{
  var y = (lab[0] + 16) / 116,
      x = lab[1] / 500 + y,
      z = y - lab[2] / 200,
      r, g, b;

  x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
  y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
  z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);

  r = x *  3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y *  1.8758 + z *  0.0415;
  b = x *  0.0557 + y * -0.2040 + z *  1.0570;

  r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
  g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
  b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;

  return [Math.max(0, Math.min(1, r)) * 255, 
          Math.max(0, Math.min(1, g)) * 255, 
          Math.max(0, Math.min(1, b)) * 255]
}


export const rgb2lab= (rgb)=>{
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      x, y, z;

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

// calculate the perceptual distance between colors in CIELAB
// https://github.com/THEjoezack/ColorMine/blob/master/ColorMine/ColorSpaces/Comparisons/Cie94Comparison.cs
export const deltaE = (labA, labB)=>{
  var deltaL = labA[0] - labB[0];
  var deltaA = labA[1] - labB[1];
  var deltaB = labA[2] - labB[2];
  var c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  var c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  var deltaC = c1 - c2;
  var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  var sc = 1.0 + 0.045 * c1;
  var sh = 1.0 + 0.015 * c1;
  var deltaLKlsl = deltaL / (1.0);
  var deltaCkcsc = deltaC / (sc);
  var deltaHkhsh = deltaH / (sh);
  var i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

/*
	palette parameter should be formed like this
	[{
		name : "red",
		rgb : [127, 73, 61]
	},{
		name : "yellow",
		rgb : [131, 98, 61]
	},{
		name : "blue",
		rgb : [66, 70, 80]
	}]
*/






export const LimitedColorPaletteGenerator = (palette)=>{
	return class LimitedColorPalette {
		static NAMED_COLOR = palette;	

		static getRandomColorName = ()=>{
			return getRandomItem(palette).name
		}
		static getRandomColorValue = ()=>{
			return getRandomItem(palette).rgb
		}
		static style = (...args)=>{
			args.push(" ");
			args.unshift(" ");
			const {style} = palette.find(({name})=>{
				return args.includes(name); 
			});
			if(style){
				return style(...args);
			}
			return `-${args.join(' ')}-`;
		}
		static getName = (rgb)=>{
			const lab = rgb2lab(rgb);
			return palette.sort((a, b)=>{
				const dA = deltaE(lab, rgb2lab(a.rgb));
				const dB = deltaE(lab, rgb2lab(b.rgb));
				return dA - dB;
			})[0].name;
		}

		constructor(param){
			let rgb = null;
			if(isString(param)) {
				const colorId = palette.findIndex(({name})=>name == param);
				if(colorId>-1){
					rgb = palette[colorId].rgb
				}
			}
			else if(isArrayRGB(param)){
				rgb = param;
			}
			else if(!param){
				rgb = LimitedColorPalette.getRandomColorValue();
			}
			else{
				throw new Error("Color Constructor Error");
			}
			this._rgb = rgb;
			this._name = LimitedColorPalette.getName(this._rgb)
		}
		get rgb(){
			return this._rgb;
		}
		get name(){
			return this._name;
		}
	}
}