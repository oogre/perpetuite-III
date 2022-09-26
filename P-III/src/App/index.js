#!/usr/bin/env node
/*----------------------------------------*\
  P-III - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 16:19:31
  @Last Modified time: 2022-09-26 13:04:09
\*----------------------------------------*/

import PillsModel from "./PillsModel.js"
import RobotModel from "./RobotModel.js"
import CameraModel from "./CameraModel.js";
import _ from "underscore";
import _conf_ from "./../common/config.js";
import {wait} from "./../common/tools.js";;
import Vector from "./../common/Vector.js";


const { 
  physical : {
    pill_colors
  }
} = _conf_.HIGH_LEVEL_API_CONF;

const colors = pill_colors.map(({name})=>name);

PillsModel.onPillDiscovered((event)=>{
  // console.log(event);
});

const updateCV = async (loop = false)=>{
  CameraModel.getFieldOfView();

  const cPills = await CameraModel.getPillPos();
  PillsModel.update(cPills);
  updateCV(loop);
}

const updateMove = async (loop = false) => {
  const pillTarget = await RobotModel.findPillByColor(_.sample(colors))
  if(pillTarget){
    RobotModel.grabPillTarget(pillTarget);
    const dest = Vector.Random2D().multiply(Math.random()*650);
    RobotModel.dropPillTarget(dest, pillTarget)
  }
  updateMove(loop);
}



(() => {
  updateCV(true);  
  updateMove(true);
})()



