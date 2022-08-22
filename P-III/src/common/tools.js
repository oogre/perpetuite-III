import fs from 'fs';

// VALIDATIONS
export const isFnc = (n) => n instanceof Function;
export const isBool = (n) => typeof n == "boolean";
export const isString = (n) => typeof n == "string";
export const isDirExists = (path) => fs.existsSync(getDirName(path));
export const isFileExists = (path) => fs.existsSync(path);
export const isArray = (n) => Array.isArray(n);
export const isFloat = (n) => n === +n && n !== (n|0);
export const isInteger = (n) => n === +n && n === (n|0);
export const isNumber = (n) => isFloat(n) || isInteger(n);
export const isBuffer = (n) => Buffer.isBuffer(n);
export const isObject = (n) => (typeof n === "object" || typeof n === 'function') && (n !== null);

// CONVERTIONS
export const stringToBoolean = (n) => {
  if(isBool(n))return n;
  switch(n?.toLowerCase()?.trim()){
    case "true":
    case "1":
    case "yes":
      return true;
    case "false":
    case "0":
    case "no":
    case null:
    case undefined:
      return false;
    default :
      JSON.parse(n);
  }
}

// GENERATORS
export const uniqId = () => Math.floor(Math.random() * Date.now()).toString(16);


// MATH
export const constrain = (min, max, value) => Math.min( Math.max(max, min), Math.max(Math.min(max, min), value));
export const lerp = (a, b, amount) => a + (b - a) * constrain(0, 1, amount);
export const lerp3 = (a, b, c, t) => {
    if (t <= 0.0)
      [a, b, t] = [b, a, -t];
    else
      [a, b, t] = [b, c, t];
    return lerp(a, b, t);
}


// HELPERS
export const wait = async (time) => {
  if(isNumber(time)){
    return new Promise(s => setTimeout(()=>s(), time)); 
  }
}