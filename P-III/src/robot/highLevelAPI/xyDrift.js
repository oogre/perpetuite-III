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
import { getDepthFor } from './../../common/Offset.js';
import {$, wait, subProcessTrigger} from './../../common/tools.js';

const { 
	physical:{
		camera : {
			offset : [
				xDriftPath,
				yDriftPath
			]
		}
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
			
			const probePoints = [
				[0,  0], 
				...(
					new Array(4).fill(0).map((_, k, {length})=>{
        		const alpha = k * (Math.PI * 2)/length;
        		const r = 100;
        		return [r * Math.cos(alpha), r * Math.sin(alpha)];
      		})
      	),
      	...(
					new Array(4).fill(0).map((_, k, {length})=>{
        		const alpha = (k+0.5) * (Math.PI * 2)/length;
        		const r = 200;
        		return [r * Math.cos(alpha), r * Math.sin(alpha)];
      		})
      	),
      	...(
					new Array(4).fill(0).map((_, k, {length})=>{
        		const alpha = (k) * (Math.PI * 2)/length;
        		const r = 300;
        		return [r * Math.cos(alpha), r * Math.sin(alpha)];
      		})
      	),
      	...(
					new Array(4).fill(0).map((_, k, {length})=>{
        		const alpha = (k+0.5) * (Math.PI * 2)/length;
        		const r = 400;
        		return [r * Math.cos(alpha), r * Math.sin(alpha)];
      		})
      	),
      	...(
					new Array(8).fill(0).map((_, k, {length})=>{
        		const alpha = (k) * (Math.PI * 2)/length;
        		const r = 500;
        		return [r * Math.cos(alpha), r * Math.sin(alpha)];
      		})
      	),
      	...(
					new Array(8).fill(0).map((_, k, {length})=>{
        		const alpha = (k+0.5) * (Math.PI * 2)/length;
        		const r = 600;
        		return [r * Math.cos(alpha), r * Math.sin(alpha)];
      		})
      	),
			]

			for(const [x, y] of probePoints){
				await RobotHelper.Go({xpos:x, ypos:y, zpos:0, wpos:0, debug});
			}
			let probes = [];
			for(const [x, y] of probePoints){
				await RobotHelper.Go({xpos:x, ypos:y, zpos:0, wpos:0, debug});
				await RobotHelper.Gripper(1);
				await RobotHelper.WaitProbe(debug);
				await RobotHelper.Go({xpos:x, ypos:y, zpos: getDepthFor([x, y]) + 10, wpos:0, speed : 10, debug});
				await RobotHelper.Gripper(0);
				await RobotHelper.Go({xpos:x, ypos:y, zpos:0, wpos:0, debug});
				let {promise, trig, kill} = subProcessTrigger(`P-III.cv`,  []);
				const collectWaiter = await this.trig(" ");
				console.log(collectWaiter);
				await this.trig("close");
			}
			//fs.writeFileSync(path, JSON.stringify(probes, null, 2));
		}catch(error){
			console.error(error);
		}
	})
	.parse(process.argv);