import fs from 'fs';
import  { spawn } from "child_process";

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
export const rgb2lab = ([R, G, B]) => {
  let r = R / 255.0, 
    g = G / 255.0, 
    b = B / 255.0, 
    x, y, z;

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = (x > 0.008856) ? Math.pow(x, 1/3.0) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3.0) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3.0) : (7.787 * z) + 16/116;

  return [
      (116 * y) - 16,
    500 * (x - y),
    200 * (y - z)
  ];
}

export const lab2rgb = ([l, a, b]) => {
  var y = (l + 16) / 116,
      x = a / 500 + y,
      z = y - b / 200,
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

//difference between Lab color
export const deltaE = ([L0, A0, B0], [L1, A1, B1]) => {
  const deltaL = L0 - L1;
  const deltaA = A0 - A1;
  const deltaB = B0 - B1;

  const c1 = Math.sqrt(A0 * A0 + B0 * B0);
  const c2 = Math.sqrt(A1 * A1 + B1 * B1);
  const deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  const sc = 1.0 + 0.045 * c1;
  const sh = 1.0 + 0.015 * c1;
  const deltaLKlsl = deltaL / (1.0);
  const deltaCkcsc = deltaC / (sc);
  const deltaHkhsh = deltaH / (sh);
  const i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
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
export const pointInPoly = ({x, y}, vert) => {
  let i, j, c = 0;
  for (i = 0, j = vert.length-1; i < vert.length; j = i++) {
    if ( 
      ((vert[i].y>y) != (vert[j].y>y)) &&
      (x < (vert[j].x-vert[i].x) * (y-vert[i].y) / (vert[j].y-vert[i].y) + vert[i].x)
    )
    c++;
  }
  return c%2==1;
}

// HELPERS
export const wait = async (time) => {
  if(isNumber(time)){
    return new Promise(s => setTimeout(()=>s(), time)); 
  }
}

export const promisify = (f) => {
  return function (...args) { // return a wrapper-function (*)
    return new Promise((resolve, reject) => {
      function callback(err, result) { // our custom callback for f (**)
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
      args.push(callback); // append our custom callback to the end of f arguments
      f.call(this, ...args); // call the original function
    });
  };
}

export const $ = (cmd) => {
    return new Promise((res, rej)=>{
        const proc = spawn(cmd);
        let r = "";
        let e = "";

        proc.stdout.on("data", data => {
            r += data;
        });

        proc.stderr.on("data", data => {
            e += data;
        });

        proc.on('error', (error) => {
            e += error.message;
        });

        proc.on("close", code => {
            if(code == 0) return res(r);
            return rej(e);
        });

    });
}
