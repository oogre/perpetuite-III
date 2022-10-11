#!/usr/bin/env node
/*----------------------------------------*\
  P-III - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 16:19:31
  @Last Modified time: 2022-10-05 11:15:15
\*----------------------------------------*/

import _ from "underscore";
import PillsModel from "./PillsModel.js";
import RobotModel from "./RobotModel.js";
import DrawModel from "./DrawModel.js";
import {wait} from "./../common/tools.js";
import CameraModel from "./CameraModel.js";
import _conf_ from "./../common/config.js";
import Vector from "./../common/Vector.js";
import Log from './../common/Log.js';

process.title = "P-III.APP";

const { 
  physical : {
    pill_colors,
    pill_dist_accuracy
  },
  robot : {
    default : {
      radius
    }
  }
} = _conf_.HIGH_LEVEL_API_CONF;

const colors = pill_colors.map(({name})=>name);

PillsModel.onPillDiscovered((event)=>{
   // console.log(event.target.color);
});

const updateCV = async (flag = true)=>{
  let cPills = [];
  if(flag){
    cPills = await CameraModel.dynamicGetPillPos(RobotModel.Follow());
  }else{
    cPills = await CameraModel.getPillPos();
  }
  cPills = cPills.map(pill => PillsModel.createPill(pill));
  cPills = cPills.filter(pill => pill.valid);
  PillsModel.update(cPills);
}

const update = async (loop = false) => {
  PillsModel.shuffle();
  const next = (success = true)=>{
    if(success){
      Log.step(`Done`); 
    }
    else{
     Log.step(`Fail`); 
    }
    loop && update(loop);
  }

  const [request, len, frameID] = await DrawModel.next();
  Log.title(`Current frame : ${frameID} - Still : ${len} move`);
  Log.command(`Put ${request.color.toString()} @ ${request.point.toString(2)}`);
  await RobotModel.go(...request.point.toArray(2));
  await wait(200);
  await updateCV(false);
  
  let [pillTarget, id] = PillsModel.getPillByLocation(...request.point.toArray(2), 1.75);
  
  if(pillTarget){
    if(request.color.equals(pillTarget.color)){
      pillTarget.lock();
    }else{
      Log.step(`Remove the wrong colored pill ${pillTarget.color.toString()} @ ${pillTarget.center.toString(2)}`);
      if(!await pillTarget.update()){
        PillsModel.pills.splice(id, 1);
        return next(false);
      }

      await RobotModel.go(...pillTarget.center.toArray(2));
      await RobotModel.grab();
      const currentHoledPill = pillTarget;
      PillsModel.pills.splice(id, 1);
      while(pillTarget){
        const randPt = await DrawModel.getRandomPoint();
        await RobotModel.go(...randPt.toArray(2));
        await updateCV(false);
        [pillTarget, id] = PillsModel.getPillByLocation(...RobotModel.location.toArray(2), 1.5);
        if(pillTarget){
          Log.step(`The Random location ${RobotModel.location.toString(2)} is populated by ${pillTarget.color.toString()}`);  
        }else{
          Log.step(`The Random location ${RobotModel.location.toString(2)} is empty`);  
          currentHoledPill.center = new Vector(...RobotModel.location.toArray(2));
          currentHoledPill.accuracy = pill_dist_accuracy;
        }
      }
      await RobotModel.drop();
    }
  }

  if(!pillTarget && !request.color.isBlack()){
    Log.step(`Put the good colored pill ${request.color.toString()} @ ${request.point.toString(2)}`);
    let [pill, id] = await PillsModel.getPillByColor(request.color, async () => {
      const randPt = await DrawModel.getRandomPoint();
      await RobotModel.go(...randPt.toArray(2));
      await updateCV(false);
    });
    if(!await pill.update()) {
      PillsModel.pills.splice(id, 1);
      return next(false);
    }

    await RobotModel.grab();
    pill.lock();
    await RobotModel.go(...request.point.toArray(2));
    await RobotModel.drop();
  }
  
  next();
}

(async () => {
  await DrawModel.init();
  await RobotModel.init();
  await update(true);
})()














// const testGrab = async (loop = false)=>{
//  const pill = PillsModel.pills[0];
//  if(pill){
//   await RobotModel.go(...pill.center.toArray());
//   await pill.update();
//   await RobotModel.grab();
//   await wait(1000);
//   await RobotModel.drop();
//   PillsModel.pills.shift();
//  }
//  loop && testGrab(loop);
// }
// const testMove = async (loop = false)=>{
//   const pill = _.sample(PillsModel.pills);
//   if(pill){
//     await pill.update();
//     await RobotModel.touch(...pill.center.toArray());
//   }  
//   loop && testMove(loop);
// }
// const testdynamicGetPillPos = async (loop = false) => {
//   const res = await CameraModel.dynamicGetPillPos(RobotModel.Follow());
//   console.log("")  
//   loop && testdynamicGetPillPos(loop);  
// }
// const updateMove = async (loop = false) => {
//   const pillTarget = await RobotModel.findPillByColor(_.sample(colors))
//   if(pillTarget){
//     RobotModel.grabPillTarget(pillTarget);
//     const dest = Vector.Random2D().multiply(Math.random()*radius);
//     RobotModel.dropPillTarget(dest, pillTarget)
//   }
//   updateMove(loop);
// }