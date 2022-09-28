/*----------------------------------------*\
  P-III - RobotModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 19:03:46
  @Last Modified time: 2022-09-26 17:27:45
\*----------------------------------------*/

import Vector from './../common/Vector.js';
import EventHandler from "./../common/EventHandler.js";
import PillsModel from "./PillsModel.js"
import {$, wait} from './../common/tools.js';
import _conf_ from './../common/config.js';

const D = _conf_.DEBUG ? "-d 1" : "";

class RobotModel extends EventHandler{
  constructor(){
    super();
    this.location = new Vector(0, 0, 0);
  }

  async findPillByColor(colorToFind){
    await wait(500);
    // move around until discover an unlocked pill colored as needed 
    return PillsModel.getPillByColor(colorToFind);
  }

  async init(){
    await $(`P-III.core.api`, `HighPower`, "1");
    await $(`P-III.goHome`);
  }

  async grabPillTarget(pill){
    
    console.log("GOTO @ FLY ALTITUDE");
    await $(`P-III.go -x ${pill.center.x} -y ${pill.center.y} -z 0`);
    console.log("GOTO @ WORK ALTITUDE");
    await $(`P-III.go -x ${pill.center.x} -y ${pill.center.y} -z -1000`);
    console.log("GRAB");
    await $(`P-III.P-III.grab -f 1`);
    pill.locked = true;
    console.log("GOBACK TO FLY ALTITUDE");
    await $(`P-III.go -x ${pill.center.x} -y ${pill.center.y} -z 0`);
  }

  async dropPillTarget(dest, pill){

    const D = _conf_.DEBUG ? "-d 1" : "";
    console.log("GOTO @ FLY ALTITUDE");
    await $(`P-III.go -x ${dest.x} -y ${dest.y} -z 0`);
    console.log("GOTO @ WORK ALTITUDE");
    await $(`P-III.go -x ${dest.x} -y ${dest.y} -z -1000`);
    console.log("DROP");
    await $(`P-III.P-III.grab -f 0`);
    pill.center = dest;
    console.log("GOBACK TO FLY ALTITUDE");
    await $(`P-III.go -x ${dest.x} -y ${dest.y} -z 0`);
  }
}

export default (new RobotModel());