/*----------------------------------------*\
  perpetuite-III - tools.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-17 09:56:30
  @Last Modified time: 2022-08-17 11:15:50
\*----------------------------------------*/

const fs = require('fs');
var getDirName = require('path').dirname;
const path = './file.txt'

try {
  if (fs.existsSync(path)) {
    //file exists
  }
} catch(err) {
  console.error(err)
}



module.exports.lerp = (a, b, amount) => a + (b - a) * Math.min(1, Math.max(0, amount));

module.exports.isFnc = (n) => n instanceof Function;
module.exports.isBool = (n) => typeof n == "boolean";
module.exports.isString = (n) => typeof n == "string";
module.exports.isDirExists = (path) => fs.existsSync(getDirName(path));
module.exports.isFileExists = (path) => fs.existsSync(path);
module.exports.isArray = (n) => Array.isArray(n);
module.exports.isFloat = (n) => n === +n && n !== (n|0);
module.exports.isInteger = (n) => n === +n && n === (n|0);
module.exports.isNumber = (n) => module.exports.isFloat(n) || module.exports.isInteger(n);
module.exports.isBuffer = (n) => Buffer.isBuffer(n);
module.exports.uniqId = () => Math.floor(Math.random() * Date.now()).toString(16);
module.exports.stringToBoolean = (n) => {
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
