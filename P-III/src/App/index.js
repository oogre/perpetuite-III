#!/usr/bin/env node
/*----------------------------------------*\
  P-III - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 16:19:31
  @Last Modified time: 2022-10-03 14:23:52
\*----------------------------------------*/

import _ from "underscore";
import PillsModel from "./PillsModel.js";
import RobotModel from "./RobotModel.js";
import DrawModel from "./DrawModel.js";
import {wait, lerp} from "./../common/tools.js";
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

const updateCV = async ()=>{
  const cPills = await CameraModel.getPillPos();
  PillsModel.update(cPills);
}

const update = async (loop = false) => {
  const [request, len] = await DrawModel.next();
  console.log(`>>>>>>>> put ${request.color.toArray()} @ ${request.point}`);
  console.log(`>>>>>>>> still : ${len} move`);

  await RobotModel.go(...request.point);
  await updateCV();

  let pillTarget = PillsModel.getPillByLocation(...request.point);

  if(pillTarget && !request.color.equals(pillTarget.color)){
    await RobotModel.grab();
    while(pillTarget){
      await RobotModel.goRandom();
      await updateCV();
      pillTarget = await PillsModel.getPillByLocation(RobotModel.location.toArray(2));  
    }
    await RobotModel.drop();
  }
  if(!pillTarget && !request.color.isBlack()){
    const pill = PillsModel.getPillByColor(request.color);
    await RobotModel.go(...pill.center.toArray());
    await updateCV();
    await RobotModel.grab();
    await RobotModel.go(...request.point);
    await RobotModel.drop();
  }

  await wait(100);
  update(loop);
}

(async () => {
  await DrawModel.init();
  await RobotModel.init();
  testMove(true)

})()


const testMove = async (loop = false)=>{
  await updateCV();
  await RobotModel.go(lerp(-100, 100, Math.random()), lerp(-100, 100, Math.random()));
  testMove(loop);
}



// const updateMove = async (loop = false) => {
//   const pillTarget = await RobotModel.findPillByColor(_.sample(colors))
//   if(pillTarget){
//     RobotModel.grabPillTarget(pillTarget);
//     const dest = Vector.Random2D().multiply(Math.random()*radius);
//     RobotModel.dropPillTarget(dest, pillTarget)
//   }
//   updateMove(loop);
// }