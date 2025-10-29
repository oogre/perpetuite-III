#!/usr/bin/env node
/*----------------------------------------*\
  perpetuite-III - zProbe.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-22 17:40:34
  @Last Modified time: 2022-08-24 13:12:16
\*----------------------------------------*/

import fs from 'fs-extra';
import _conf_ from './../../common/config.js';
import * as RobotHelper from './../../common/CoreApiHelper.js';
import Command from './../../common/CommandHelper.js';
import { getOffsetFor, getOffset2For } from './../../common/Offset.js';
import { getDepthForXY } from './../../common/moveLimit.js';
import {$, wait, subProcessTrigger} from './../../common/tools.js';
import Vector from './../../common/Vector.js';

import Log from './../../common/Log.js';
const { 
	physical:{
		camera : {
			size_mm,
			size_px,
			offset : [
				xDriftPath,
				yDriftPath
			]
		}
	}
} = _conf_.HIGH_LEVEL_API_CONF;



Command({
	name : "P-III.test",
	usage : "[options]",
	description : `
This script is developped for Perpetuité III, an art installation 
made by Felix Luque, Damien Gernay & Vincent Evrard.
This script is used to find a pill and point it.
It runs 'P-III.core.api' script who drive the robot of the installation
`,
	})
	.action( async ({debug, path}) => {
		try{

			await RobotHelper.HighPower(true, debug);
			
			let {promise, trig, kill} = subProcessTrigger(`P-III.cv`,  []);
			for(let i = 0; i < 20 ; i++){
				
				
				const [x, y] = [(Math.random()*2-1)*450, (Math.random())*450];
				await RobotHelper.Go({xpos:x, ypos:y, zpos: 0, wpos:0});
				const [rx, ry, rz] = await RobotHelper.GetPosition(debug);
				
				Log.warn("onTable : ", rx, ry);
				const z = getDepthForXY(rx, ry);
				await RobotHelper.Go({xpos:rx, ypos:ry, zpos: z+1, wpos:0, speed : 10});
				await RobotHelper.WaitProbe();
				await RobotHelper.Go({xpos:rx, ypos:ry, zpos: 0, wpos:0, speed : 10});
				
				const rawData = await trig(" ");
				const [data] = JSON.parse(rawData);
				if(!data)
					continue;
				const {isPill, box:[px, py]} = data;
				if(!isPill)
					continue;
				Log.warn("inPicture : ", isPill, px, py);

				const [ox, oy] = getOffsetFor([rx, ry]);
				Log.warn("offset : ", ox, oy);
				
				const PIX_TO_MM = (new Vector(...size_mm)).divide(new Vector(...size_px)).toArray().reduce((acc, v)=>acc+=v, 0)/2 
	  		const [mx, my] = new Vector(px, py)
					.subtract(new Vector(ox, oy))
					.multiply(new Vector(1, -1, 1))
					.multiply(PIX_TO_MM)
					.subtract(new Vector(rx, ry))
					.multiply(new Vector(-1, -1, 1)).toArray(2);

				Log.warn("Math : ", mx, my);

				Log.warn("Diff : ", Math.round(mx - rx), Math.round(my - ry));

				
			}

			
				
			// 
			
			// const [ox, oy] = getOffsetFor([rx, ry]);

			// const [ox2, oy2] = getOffset2For([rx, ry]);

			// Log.warn(ox, oy);
			// Log.warn(ox2, oy2);

		// //
  		
			
		}catch(error){
			console.error(error);
		}

		process.exit(0);

	})
	.parse(process.argv);