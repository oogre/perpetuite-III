#!/usr/bin/env node
/*----------------------------------------*\
  P-III - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 16:19:31
  @Last Modified time: 2022-09-28 22:50:53
\*----------------------------------------*/

import _ from "underscore";
import PillsModel from "./PillsModel.js";
import RobotModel from "./RobotModel.js";
import DrawModel from "./DrawModel.js";
import {wait} from "./../common/tools.js";
import CameraModel from "./CameraModel.js";
import _conf_ from "./../common/config.js";
import Vector from "./../common/Vector.js";

const { 
  physical : {
    pill_colors
  },
  robot : {
    default : {
      radius
    }
  }
} = _conf_.HIGH_LEVEL_API_CONF;

const colors = pill_colors.map(({name})=>name);

PillsModel.onPillDiscovered((event)=>{
  console.log(event);
});

const updateCV = async (loop = false)=>{
  // CameraModel.getFieldOfView();
  const cPills = await CameraModel.getPillPos();
  PillsModel.update(cPills);
  updateCV(loop);
}

const updateMove = async (loop = false) => {
  const pillTarget = await RobotModel.findPillByColor(_.sample(colors))
  if(pillTarget){
    RobotModel.grabPillTarget(pillTarget);
    const dest = Vector.Random2D().multiply(Math.random()*radius);
    RobotModel.dropPillTarget(dest, pillTarget)
  }
  updateMove(loop);
}

const update = async (loop = false) => {
  const [{point:[x, y], color:[r, g, b]}, len] = await DrawModel.next();
  console.log(`still : ${len} move`);
  console.log(`RobotModel.go([${x}, ${y}])`);
  // await RobotModel.go([x, y])
  // console.log(`\tif !empty`)
  // console.log(`\t\tif color != col(${r},${g},${b})`)
  // console.log(`\t\t\tGrab`)
  // console.log(`\t\t\tMove to empty place`)
  // console.log(`\t\t\tDrop`)
  // console.log(`\t\telse`)
  // console.log(`\t\t\tNEXT`)
  // console.log(`\tMove to !empty && color == col(${r},${g},${b})`)
  // await RobotModel.grab([x, y])
  // await RobotModel.go([x, y])
  // await RobotModel.drop([x, y])
  // console.log(`NEXT`)
  await wait(10);
  update(loop);
}

(async () => {
  // await RobotModel.init();
  // updateCV(true);  
  update(true)
  // updateMove(true);
})()



