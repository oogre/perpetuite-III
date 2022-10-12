/*----------------------------------------*\
  P-III - CameraModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-22 21:02:03
  @Last Modified time: 2022-10-12 10:11:37
\*----------------------------------------*/

import _conf_ from './../common/config.js';
import RobotModel from "./RobotModel.js"
import Vector from './../common/Vector.js';
import Rect from './../common/Rect.js';
import {$, wait} from './../common/tools.js';
import fs from 'fs-extra';
import _ from 'underscore';
import EventHandler from "./../common/EventHandler.js";

const util = require("util")


const { 
  physical : {
    camera : {
        size:camSize,
        offset:camOffset,
        rotate:camRotation,
        size_px,
        size_mm,
      }
  }
} = _conf_.HIGH_LEVEL_API_CONF;

class CameraModel extends EventHandler {
	static DEG_TO_RAD = Math.PI * 2 / 360.0
	static PIX_TO_MM = (new Vector(...size_mm)).divide(new Vector(...size_px)).toArray().reduce((acc, v)=>acc+=v, 0)/2 

	static CAM_SIZE_PX = new Vector(...camSize);
	static CAM_OFFSET_PX = new Vector(...camOffset);

	static CAM_SIZE_MM = CameraModel.CAM_SIZE_PX.multiply(CameraModel.PIX_TO_MM);
	static OFFSET_PX = CameraModel.CAM_SIZE_PX.multiply(0.5).subtract(CameraModel.CAM_OFFSET_PX);
	static ROTATION = camRotation * CameraModel.DEG_TO_RAD;
	
	constructor(){
		super();
	}
	camToWorld(point){
  		return (new Vector(...point))
			.subtract(CameraModel.CAM_OFFSET_PX)
			// .rotate(Vector.Up(), CameraModel.ROTATION)
			.multiply(new Vector(-1, 1, 1))
			.multiply(CameraModel.PIX_TO_MM)
			.subtract(RobotModel.location)
			.multiply(new Vector(-1, -1, 1));
	}
	getFieldOfView(){
		const fov =  new Rect([
			...RobotModel.location.subtract(CameraModel.CAM_SIZE_MM.multiply(0.5)).toArray(), 
			...CameraModel.CAM_SIZE_MM.toArray()
		]);
		// console.log(fov, RobotModel.location, CameraModel.CAM_SIZE_MM)
	}

	async collectPillInfo(){
		if(_conf_.simulator){
			await wait(3000);
			return "[]";
		}
		if(_conf_.DEBUG){
			await wait(2000);
			return await fs.readFile(`${process.env.PIII_PATH}/data/rawPill.json`, "utf8");
		}else{
			return await $("P-III.cv");
		}
	}

	async dynamicGetPillPos(move){
		const moveWaiter = move();	
		const collectWaiter = this.collectPillInfo();
		await moveWaiter;
		console.log("moveWaiter")
		const rawData = await collectWaiter;
		console.log("collectWaiter")
		return JSON.parse(rawData);
	}
	
	async getPillPos(){
		const t = await this.collectPillInfo();
		return JSON.parse(t);
	}
}

export default (new CameraModel());
