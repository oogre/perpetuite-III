/*----------------------------------------*\
  easyPlayer - Tools.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:52:19
  @Last Modified time: 2022-07-22 11:09:32
\*----------------------------------------*/

import Position from './Position.js';
import Request from './Request.js';

export const isFnc = (n) => n instanceof Function;
export const isBool = (n) => typeof n == "boolean"
export const isArray = (n) => Array.isArray(n);
export const isFloat = (n) => n === +n && n !== (n|0);
export const isInteger = (n) => n === +n && n === (n|0);
export const isNumber = (n) => isFloat(n) || isInteger(n);
export const isPosition = (obj) => obj instanceof Position;
export const isRequest = (obj) => obj instanceof Request;

export const uniqId = () => Math.floor(Math.random() * Date.now()).toString(16);

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
