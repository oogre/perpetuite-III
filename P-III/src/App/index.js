#!/usr/bin/env node
/*----------------------------------------*\
  P-III - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 16:19:31
  @Last Modified time: 2022-10-12 09:54:28
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

const update = async () => {
  PillsModel.shuffle();
  const next = (success = true)=>{
    if(success){
      Log.step(`Done`); 
    }
    else{
     Log.step(`Fail`); 
    }
  }

  const [request, len, frameID] = await DrawModel.next();
  Log.title(`Current frame : ${frameID} - Still : ${len} move`);
  Log.command(`Put ${request.color.toString()} @ ${request.point.toString(2)}`);
  await RobotModel.go(...request.point.toArray(2));
  await wait(200);

  await CameraModel.update(false);
  
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
        await CameraModel.update(false);

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
      await CameraModel.update(false);
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
  while(true){
    await update(true);  
  }
})()
.then(()=>{
  console.log("OK")
})
.catch( error =>{
  if(_.isArray(error)){
    const [id, label] = error;
    return process.stderr.write(`${id}`);
  }
  console.log(error);
  process.stderr.write(JSON.stringify(error));
});