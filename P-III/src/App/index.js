#!/usr/bin/env node
/*----------------------------------------*\
  P-III - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 16:19:31
  @Last Modified time: 2022-11-02 22:18:27
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

const pillRadius = pill_size_mm / 2;


const colors = pill_colors.map(({name})=>name);
const stats = {
  success : 0,
  fail : 0,
};

let dropInTheDrawPart = false;

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
  const [request, len, frameID, newFrame] = await DrawModel.next();

  if(newFrame){
    dropInTheDrawPart = false;
  }
  
  Log.date();
  Log.title(`Current frame : ${frameID}`);
  Log.title(`Still : ${len} move`);
  Log.title(`Success VS Fail : ${stats.success}/${stats.fail}`);
  Log.title(`Known pills : ${PillsModel.info()}`);
  Log.command(`Put ${request.color.toString()} @ ${request.point.toString(2)}`);
  
  let cleanResult = await cleanDropZoneIfNeeded(request.point, request.color);
  
  if(!cleanResult) return next(false);
  if(request.color.isBlack()) return next(true);
  if(request.color.equals(cleanResult)) return next(true);

  let dropResult = await populateDropZone(request.point, request.color)
  if(!dropResult) return next(false);

  next(true);
}

const grabProcess = async () => {
  const originLocation = RobotModel.location.clone();
  const offsets = [
    new Vector( 0,  0),
    new Vector(-2,  0),
    new Vector( 2,  0),
    new Vector( 0, -2),
    new Vector( 0,  2),
  ];
  for(const offset of offsets){
    await RobotModel.go(...originLocation.add(offset).toArray(2));
    await RobotModel.grab();
    await RobotModel.go(...originLocation.toArray(2));
    if(await CameraModel.isGrabbed())break;
    await RobotModel.gripperOpen();
  }
}

const cleanDropZoneIfNeeded = async (dropLocation, dropColor) => {
  await RobotModel.go(...dropLocation.toArray(2));
  await wait(200);
  await CameraModel.update(false);

  let targets = PillsModel.getPillsAround(dropLocation.toArray(2), pillRadius * 3.5);
  let items = targets.length;
  let itemsToRemove = targets.length;
  let removedCount = 0;
  let result = Color.Black();

  while (items--) {
    const {pill:{color, center}, id, dSq} = targets[items];
    if(dropColor.equals(color) && items == 0 ){
      if(dSq >= pillRadius * pillRadius){
        Log.step(`Adjust the good colored pill ${color.toString()} @ ${dropLocation.toString(2)}`);
        if(!await PillsModel.pills[id].update()){
          PillsModel.pills.splice(id, 1);
          return false;
        }
        await RobotModel.go(...center.toArray(2));
        await grabProcess();

        await RobotModel.go(...dropLocation.toArray(2));
        await RobotModel.drop();
      }else{
        Log.step(`The good colored pill ${color.toString()} is already @ ${Math.round(Math.sqrt(dSq))}mm of ${center.toString(2)}`);
      }
      PillsModel.pills[id].lock();
      result = color;
    }else{
      Log.step(`${++removedCount}/${itemsToRemove} : Remove the wrong colored pill ${color.toString()} @ ${center.toString(2)}`);
      if(!await PillsModel.pills[id].update()){
        PillsModel.pills.splice(id, 1);
        return false;
      }
      await RobotModel.go(...center.toArray(2));
      await grabProcess();
      let counter = 0;
      while(true){
        dropInTheDrawPart = counter > 10;
        counter++;
        const randPt = await DrawModel.getRandomPoint(dropInTheDrawPart);
        await RobotModel.go(...randPt.toArray(2));
        await CameraModel.update(false);
        const pillJam = PillsModel.getPillsAround(RobotModel.location.toArray(2), pillRadius * 3);
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
  if(!await PillsModel.pills[id].update()) {
    PillsModel.pills.splice(id, 1);
    return false;
  }
  await grabProcess();
  await RobotModel.go(...dropLocation.toArray(2));
  await RobotModel.drop();
  PillsModel.pills[id].lock();
  PillsModel.pills[id].center = new Vector(...dropLocation.toArray(2));
  PillsModel.pills[id].accuracy = pill_dist_accuracy;
  return dropColor;
}


const errorHandler = (error) => {
  Log.log(error);
  Log.log(error?.stack);
  CameraModel.destructor();
  if(_.isArray(error)){
    const [id, label] = error;
    return process.stderr.write(`${label}`);
  }
  process.stderr.write(JSON.stringify(error));
  process.exit(1);
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
  CameraModel.destructor();
  Log.date("Exit @ ");
  Log.end();
})

process.on("unhandledRejection", errorHandler);

