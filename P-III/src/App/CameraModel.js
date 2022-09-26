/*----------------------------------------*\
  P-III - CameraModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-22 21:02:03
  @Last Modified time: 2022-09-26 12:42:55
\*----------------------------------------*/

import _conf_ from './../common/config.js';
import RobotModel from "./RobotModel.js"
import Vector from './../common/Vector.js';
import Rect from './../common/Rect.js';
import {$, wait} from './../common/tools.js';
import fs from 'fs-extra';
import EventHandler from "./../common/EventHandler.js";



const { 
  physical : {
    camera : {
        size:camSize,
        offset:camOffset,
        rotate:camRotation
      },
    pill_size_mm,
    pill_size_px
  }
} = _conf_.HIGH_LEVEL_API_CONF;

class CameraModel extends EventHandler {
	static DEG_TO_RAD = Math.PI * 2 / 360.0
	static PIX_TO_MM = pill_size_mm / pill_size_px;
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
			.subtract(CameraModel.OFFSET_PX)
			.rotate(Vector.Up(), CameraModel.ROTATION)
			.multiply(new Vector(1, -1, 1))
			.multiply(CameraModel.PIX_TO_MM)
			.subtract(RobotModel.location);
	}
	getFieldOfView(){
		const fov =  new Rect([
			...RobotModel.location.subtract(CameraModel.CAM_SIZE_MM.multiply(0.5)).toArray(), 
			...CameraModel.CAM_SIZE_MM.toArray()
		]);
		console.log(fov, RobotModel.location, CameraModel.CAM_SIZE_MM)
	}
	
	async getPillPos(){
		const grabber = async () => {
			if(_conf_.DEBUG){
				await wait(2000);
				return await fs.readFile(`${__dirname}/../../data/rawPill.json`, "utf8");
			}else{
				return await $("P-III.cv");
			}  
		}
		const t = await grabber();
		return JSON.parse(t);
	}
}

export default (new CameraModel());
