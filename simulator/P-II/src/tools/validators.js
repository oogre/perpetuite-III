import { Vector2, Vector3, Vector4 } from './Vector.js';

export const isString = v =>typeof v === 'string' || v instanceof String;
export const isArrayRGB = v => Array.isArray(v) && v.length == 3 && v.every(i=>Number.isInteger(i)&&i>=0&&i<256)
export const isLocation = v => {
	return 	(v instanceof Vector2) || 
			(v instanceof Vector3) || 
			(v instanceof Vector4) || 
			(	Array.isArray(v) && 
				v.length!==0 && 
				(v.length===2||v.length===3||v.length===4) && 
				v.every(i=>Number(i)===i)
			);
}
export const isNumber = v => Number(v)===v;
export const isBox = v => (Array.isArray(v) && v.length!=0 && v.length===4 && v.every(i=>Number(i)===i));
export const isPath = v => Array.isArray(v) && v.every(item=>isLocation(item));

export const isFnc = (n) => n instanceof Function;
export const isBool = (n) => typeof n == "boolean";
export const isArray = (n) => Array.isArray(n);
export const isFloat = (n) => n === +n && n !== (n|0);
export const isInteger = (n) => n === +n && n === (n|0);
//export const isNumber = (n) => isFloat(n) || isInteger(n);
export const isBuffer = (n) => Buffer.isBuffer(n);
export const isObject = (n) => (typeof n === "object" || typeof n === 'function') && (n !== null);
