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
//import { getDepthFor } from './../../common/Offset.js';
import {getDepthForXY} from './../../common/moveLimit.js';
import {$, wait, subProcessTrigger} from './../../common/tools.js';

import Log from './../../common/Log.js';
const { 
	physical:{
		camera : {
			offset : [
				xDriftPath,
				yDriftPath
			]
		},
		approche:{
			height:approche
		}
	}
} = _conf_.HIGH_LEVEL_API_CONF;

const { 
	zProbe:{
		probe_points:probePoints, 
		save_path:savePath
	}
} = _conf_.HIGH_LEVEL_API_CONF;



Command({
	name : "P-III.xyDrift",
	usage : "[options]",
	description : `
This script is developped for Perpetuité III, an art installation 
made by Felix Luque, Damien Gernay & Vincent Evrard.
This script is used to measure xy drift of 2D points.
It runs 'P-III.core.api' script who drive the robot of the installation
`,
	})
	.action( async ({debug, path}) => {
		try{
			await RobotHelper.HighPower(true, debug);
			await RobotHelper.GoHome(debug);
			
			

			for(const [x, y] of probePoints){
				console.log(x, y);
				await RobotHelper.Go({xpos:x, ypos:y, zpos:0, wpos:0});
			}
			let xDrifts = [];
			let yDrifts = [];
			let {promise, trig, kill} = subProcessTrigger(`P-III.cv`,  []);
			for(const [x, y] of probePoints){
				const z = getDepthForXY(x, y);
				await RobotHelper.Go({xpos:x, ypos:y, zpos:0, wpos:0});
				await RobotHelper.Gripper(0);
				await RobotHelper.WaitProbe();
				await RobotHelper.Go({xpos:x, ypos:y, zpos: z, wpos:0, speed : 10});
				await RobotHelper.Gripper(1);
				await wait(1000);
				await RobotHelper.Go({xpos:x, ypos:y, zpos:0, wpos:0, speed : 2});
				try{
					const rawData = await trig(" ");
					const [data] = JSON.parse(rawData);
					const {box:[ox, oy]} = data;
					Log.warn([x, y, ox, oy]);
					xDrifts.push([x, y, ox]);
					yDrifts.push([x, y, oy]);
				}catch(err){
					Log.warn(err);
				}
				await RobotHelper.Go({xpos:x, ypos:y, zpos: z, wpos:0, speed : 10});
				await RobotHelper.Gripper(0);
				await RobotHelper.Go({xpos:x, ypos:y, zpos:0, wpos:0});
			}
			fs.writeFileSync(xDriftPath, JSON.stringify(xDrifts, null, 2));
			fs.writeFileSync(yDriftPath, JSON.stringify(yDrifts, null, 2));
			await RobotHelper.Gripper(1);
			process.exit(0)
		}catch(error){
			console.error(error);
		}
	})
	.parse(process.argv);