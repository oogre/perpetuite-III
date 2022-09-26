/*----------------------------------------*\
  P-III - RobotModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 19:03:46
  @Last Modified time: 2022-09-26 13:07:09
\*----------------------------------------*/

import Vector from './../common/Vector.js';
import EventHandler from "./../common/EventHandler.js";
import PillsModel from "./PillsModel.js"
import {$, wait} from './../common/tools.js';
import _conf_ from './../common/config.js';

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

  async grabPillTarget(pill){
    const D = _conf_.DEBUG ? "-d 1" : "";
    console.log("GOTO @ FLY ALTITUDE");
    await $(`P-III.go -x ${pill.center.x} -y ${pill.center.y} -z 0 ${D}`);
    console.log("GOTO @ WORK ALTITUDE");
    await $(`P-III.go -x ${pill.center.x} -y ${pill.center.y} -z -1000 ${D}`);
    console.log("GRAB");
    await $(`P-III.P-III.grab -f 1 ${D}`);
    pill.locked = true;
    console.log("GOBACK TO FLY ALTITUDE");
    await $(`P-III.go -x ${pill.center.x} -y ${pill.center.y} -z 0 ${D}`);
  }

  async dropPillTarget(dest, pill){

    const D = _conf_.DEBUG ? "-d 1" : "";
    console.log("GOTO @ FLY ALTITUDE");
    await $(`P-III.go -x ${dest.x} -y ${dest.y} -z 0 ${D}`);
    console.log("GOTO @ WORK ALTITUDE");
    await $(`P-III.go -x ${dest.x} -y ${dest.y} -z -1000 ${D}`);
    console.log("DROP");
    await $(`P-III.P-III.grab -f 0 ${D}`);
    pill.center = dest;
    console.log("GOBACK TO FLY ALTITUDE");
    await $(`P-III.go -x ${dest.x} -y ${dest.y} -z 0 ${D}`);
  }
}

export default (new RobotModel());