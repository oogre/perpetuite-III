
import {isNumber} from './validators.js';

export default class Position {
   constructor(x, y, z, w = 0){
      if (!(isNumber(x) && isNumber(y) && isNumber(z) && isNumber(w)))
         throw Error(`Go Request Constructor takes 3 or 4 argument and they have to be numbers value`);
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
   }
   toString(){
      return `d${this.x} d${this.y} d${this.z} d${this.w}`;
   }
}
