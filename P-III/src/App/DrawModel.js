/*----------------------------------------*\
  P-III - DrawModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 19:03:46
  @Last Modified time: 2022-09-26 17:27:45
\*----------------------------------------*/

import EventHandler from "./../common/EventHandler.js";
import {$, wait} from './../common/tools.js';
import _conf_ from './../common/config.js';


const { 
  step_incrementation:STEP_INC
} = _conf_.DRAW_CONF;

class DrawModel extends EventHandler{
  constructor(){
    super();
    this.offset = 1;
  }

  async draw(){
    await $(`P-III.gen`, this.offset += STEP_INC );
  }

}

export default (new DrawModel());