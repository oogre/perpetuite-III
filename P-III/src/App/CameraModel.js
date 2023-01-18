/*----------------------------------------*\
  P-III - CameraModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-22 21:02:03
  @Last Modified time: 2023-01-18 17:06:18
\*----------------------------------------*/

import _conf_ from './../common/config.js';
import RobotModel from "./RobotModel.js";
import PillsModel from "./PillsModel.js";
import Vector from './../common/Vector.js';
import Rect from './../common/Rect.js';
import Log from './../common/Log.js';
import {$, wait, subProcessTrigger} from './../common/tools.js';
import fs from 'fs-extra';
import _ from 'underscore';


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

class CameraModel {
	static DEG_TO_RAD = Math.PI * 2 / 360.0
	static PIX_TO_MM = (new Vector(...size_mm)).divide(new Vector(...size_px)).toArray().reduce((acc, v)=>acc+=v, 0)/2 

	static CAM_SIZE_PX = new Vector(...camSize);
	static CAM_OFFSET_PX = new Vector(...camOffset);

	static CAM_SIZE_MM = CameraModel.CAM_SIZE_PX.multiply(CameraModel.PIX_TO_MM);
	static OFFSET_PX = CameraModel.CAM_SIZE_PX.multiply(0.5).subtract(CameraModel.CAM_OFFSET_PX);
	static ROTATION = camRotation * CameraModel.DEG_TO_RAD;
	
	constructor(){
		const {promise, trig, kill} = subProcessTrigger(`P-III.cv`,  []);
		this.promise = promise;
		this.trig = trig;
		this.kill = kill;
		this.killed = false;
	}

	destructor(){
		if(this.killed)return;
		this.killed = true;
		this.trig("close");
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

	async isGrabbed(){
		await wait(500);
		const rawData = await this.trig("diff");
		await wait(500);
		const tPills = JSON.parse(rawData);
		return tPills.length != 0;
	}

	async update(flag = true){
		await wait(500);
		Log.step("before Trig");
		const collectWaiter = this.trig(RobotModel.toString())
		if(flag){
			await wait(500);
			Log.step("before move");
			const move = RobotModel.adjustmentMove();
			await move();
			Log.step("after move");
		}
		const rawData = await collectWaiter;
		Log.step("after Trig");
		const tPills = JSON.parse(rawData);
		return await PillsModel.insert(tPills);
	}
}

export default (new CameraModel());
