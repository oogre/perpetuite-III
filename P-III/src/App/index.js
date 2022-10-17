#!/usr/bin/env node
/*----------------------------------------*\
  P-III - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 16:19:31
  @Last Modified time: 2022-10-17 13:17:24
\*----------------------------------------*/

import _ from "underscore";
import PillsModel from "./PillsModel.js";
import RobotModel from "./RobotModel.js";
import DrawModel from "./DrawModel.js";
import {wait} from "./../common/tools.js";
import CameraModel from "./CameraModel.js";
import _conf_ from "./../common/config.js";
import Vector from "./../common/Vector.js";
import Color from "./../common/Color.js";
import Log from './../common/Log.js';

process.title = "P-III.APP";

const { 
  physical : {
    pill_size_mm,
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

const stats = {
  success : 0,
  fail : 0,
};

PillsModel.onPillDiscovered((event)=>{
   // console.log(event.target.color);
});

const next = (success = true)=>{
  if(success){
    Log.step(`Done`); 
    stats.success ++;
  }
  else{
   Log.step(`Fail`); 
   stats.fail ++;
  }
}

const update = async () => {
  PillsModel.shuffle();
  const [request, len, frameID] = await DrawModel.next();

  Log.date();
  Log.title(`Current frame : ${frameID}`);
  Log.title(`Still : ${len} move`);
  Log.title(`Success VS Fail : ${stats.success}/${stats.fail}`);
  Log.title(`Known pills : ${PillsModel.info()}`);
  Log.command(`Put ${request.color.toString()} @ ${request.point.toString(2)}`);
  
  let colorResult = await cleanDropZoneIfNeeded(request.point, request.color);
  
  if(!colorResult) return next(false);
  if(request.color.isBlack()) return next(true);
  if(request.color.equals(colorResult)) return next(true);

  let result = await populateDropZone(request.point, request.color)
  if(!colorResult) return next(false);

  next(true);
}

const cleanDropZoneIfNeeded = async (dropLocation, dropColor) => {
  await RobotModel.go(...dropLocation.toArray(2));
  await wait(200);
  await CameraModel.update(false);
  let targets = PillsModel.getPillsAround(dropLocation.toArray(2), pill_size_mm * 1.75);
  let items = targets.length;
  let itemsToRemove = targets.length;
  let removedCount = 0;
  let result = Color.Black();

  while (items--) {
    const {pill:{color, center}, id} = targets[items];
    if(dropColor.equals(color)){
      PillsModel.pills[id].lock();
      result = color;
    }else{
      Log.step(`${++removedCount}/${itemsToRemove} : Remove the wrong colored pill ${color.toString()} @ ${center.toString(2)}`);
      if(!await PillsModel.pills[id].update()){
        PillsModel.pills.splice(id, 1);
        return false;
      }
      await RobotModel.go(...center.toArray(2));
      await RobotModel.grab();
      while(true){
        const randPt = await DrawModel.getRandomPoint();
        await RobotModel.go(...randPt.toArray(2));
        await CameraModel.update(false);
        const pillJam = PillsModel.getPillsAround(RobotModel.location.toArray(2), pill_size_mm *1.5);
        if(pillJam.length > 0){
          Log.step(`The random location ${RobotModel.location.toString(2)} is populated by ${pillJam.length} pills`);  
        }else{
          Log.step(`The random location ${RobotModel.location.toString(2)} is empty`);  
          await RobotModel.drop();
          PillsModel.pills[id].center = new Vector(...RobotModel.location.toArray(2));
          PillsModel.pills[id].accuracy = pill_dist_accuracy;
          break;
        }
      }
    }
  }
  return result;
}

const populateDropZone = async (dropLocation, dropColor) => {
  Log.step(`Put the good colored pill ${dropColor.toString()} @ ${dropLocation.toString(2)}`);
  let [pill, id] = await PillsModel.getPillByColor(dropColor, async () => {
    const randPt = await DrawModel.getRandomPoint();
    await RobotModel.go(...randPt.toArray(2));
    await CameraModel.update(false);
  });
  if(!await pill.update()) {
    PillsModel.pills.splice(id, 1);
    return false;
  }
  await RobotModel.grab();
  pill.lock();
  await RobotModel.go(...dropLocation.toArray(2));
  await RobotModel.drop();
  return dropColor;
}


const errorHandler = (error) => {
  Log.log(error);
  console.log(error.stack);
  
  if(_.isArray(error)){
    const [id, label] = error;
    return process.stderr.write(`${label}`);
  }
  process.stderr.write(JSON.stringify(error));
}

(async () => {
  Log.date("Run @ ");
  await DrawModel.init();
  await RobotModel.init();
  while(true){
    await update(true);  
  }
})()
.catch(errorHandler);


process.on('exit',() => {
  Log.date("Exit @ ");
  Log.end();
})

process.on("unhandledRejection", errorHandler);

