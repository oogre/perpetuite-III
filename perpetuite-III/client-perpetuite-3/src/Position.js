/*----------------------------------------*\
  client-perpetuite-3 - Position.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-07-21 15:23:22
  @Last Modified time: 2022-07-21 15:27:21
\*----------------------------------------*/
import {isNumber} from './Tools.js';


class Position {
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

export default Position; 