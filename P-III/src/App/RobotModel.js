/*----------------------------------------*\
  P-III - RobotModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 19:03:46
  @Last Modified time: 2022-09-28 21:11:45
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
  async go([x, y]){
    await $(`P-III.go`, "-x", x+"", "-y", y+"", '-z', "0");
    this.location.x = x;
    this.location.y = y;
    this.location.z = 0;
  }

  async grab([x, y]){
    console.log("GOTO @ WORK ALTITUDE");
    await $(`P-III.go`, "-x", x+"", "-y", y+"", '-z', "-1000");
    console.log("GRAB");
    await $(`P-III.grab`, "-f", "1");
    console.log("GOBACK TO FLY ALTITUDE");
    await $(`P-III.go`, "-x", x+"", "-y", y+"", '-z', "0");
  }

  async drop([x, y]){
    console.log("GOTO @ WORK ALTITUDE");
    await $(`P-III.go`, "-x", x+"", "-y", y+"", '-z', "-1000");
    console.log("DROP");
    await $(`P-III.grab`, "-f", "0");
    console.log("GOBACK TO FLY ALTITUDE");
    await $(`P-III.go`, "-x", x+"", "-y", y+"", '-z', "0");
  }
}

export default (new RobotModel());