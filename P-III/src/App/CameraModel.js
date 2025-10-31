/*----------------------------------------*\
  P-III - CameraModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-22 21:02:03
  @Last Modified time: 2023-02-11 16:56:37
\*----------------------------------------*/

import _conf_ from './../common/config.js';
import RobotModel from "./RobotModel.js";
import PillsModel from "./PillsModel.js";
import ForbiddenPlaceModel from "./ForbiddenPlaceModel.js";
import Vector from './../common/Vector.js';
import Rect from './../common/Rect.js';
import Log from './../common/Log.js';
import {getOffsetFor} from './../common/Offset.js';
import {$, wait, subProcessTrigger} from './../common/tools.js';
import fs from 'fs-extra';
import _ from 'underscore';

const { 
  physical : {
    camera : {
        size:camSize,
        size_px,
        size_mm,
      }
  }
} = _conf_.HIGH_LEVEL_API_CONF;

const {
	enabled:camEnabled
} = _conf_.CAMERA_CONF;
const lerp  = (a, b, t) => a + (b - a) * t;
const inverseLerp  = (a, b, x) => (x - a) / (b - a);

class CameraModel {
	static DEG_TO_RAD = Math.PI * 2 / 360.0
	static PIX_TO_MM = (new Vector(...size_mm)).divide(new Vector(...size_px)).toArray().reduce((acc, v)=>acc+=v, 0)/2 
	static CAM_SIZE_PX = new Vector(...camSize);
	static CAM_SIZE_MM = CameraModel.CAM_SIZE_PX.multiply(CameraModel.PIX_TO_MM);
	
	constructor(){
		this.initCV()
		this.killed = false;
	}

	initCV(){
		if(!camEnabled)return;
		Log.warn("init CV");
		let {promise, trig, kill} = subProcessTrigger(`P-III.cv`,  []);
		this.promise = promise;
		this.promise
			.then(data => Log.warn(`P-III.cv released`, data))
			.catch(error => this.initCV());
		this.trig = (s)=>{
			Log.warn("> "+s);
			return trig(s);
		}
		this.kill = kill;

	}
	destructor(){
		if(this.killed)return;
		this.killed = true;
		this.trig("close");
	}

	camToWorld(point){
		const [ox, oy] = getOffsetFor([RobotModel.location.x, RobotModel.location.y]);

		//Log.warn(RobotModel.location.x, RobotModel.location.y, ox, oy);
  		return (new Vector(...point))
			.subtract(new Vector(ox, oy))
			.multiply(new Vector(1, -1, 1))
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
		if(!camEnabled)return true;
		await wait(500);
		try{
			const rawData = await this.trig("diff");
			//await wait(100);
			const tPills = JSON.parse(rawData);
			const realPills = tPills.filter(({isPill}) => isPill);
			Log.warn(realPills.length);
			return realPills.length != 0;
		}catch(error){
			return true;
		}
	}

	async update(flag = true){
		if(!camEnabled)return [];
		await wait(500);
		const collectWaiter = this.trig(" ")
		if(flag){
			await wait(500);
			const move = RobotModel.adjustmentMove();
			await move();
		}
		let rawData;
		try {
			rawData = await collectWaiter;
		}
		catch(error){
			console.error(`trig is dead ${error}`);
		}
		try {
			const rawPills = JSON.parse(rawData);
			const realPills = rawPills.filter(({isPill}) => isPill);
			//const fakePills = rawPills.filter(({isPill}) => !isPill);

			//ForbiddenPlaceModel.insert(fakePills);
			return await PillsModel.insert(realPills);
		}
		catch(error){
			// console.error(error);
			return [];
		}
	}
}

export default (new CameraModel());
