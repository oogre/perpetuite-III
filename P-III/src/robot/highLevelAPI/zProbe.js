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

const { 
	zProbe:{
		probe_points:probePoints, 
		save_path:savePath
	}
} = _conf_.HIGH_LEVEL_API_CONF;

Command({
	name : "P-III.zProbe",
	usage : "[options]",
	description : `
This script is developped for Perpetuité III, an art installation 
made by Felix Luque, Damien Gernay & Vincent Evrard.
This script is used to probes z position of 9 2D points.
It runs 'P-III.core.api' script who drive the robot of the installation
`,
	})
	.option('-p, --path <path>', 'destination of measured probes points', savePath)
	.action( async ({debug, path}) => {
		try{
			await RobotHelper.HighPower(true, debug);
			await RobotHelper.GoHome(debug);
			
			for(const [x, y] of probePoints){
				await RobotHelper.Go({xpos:x, ypos:y, zpos:0, wpos:0, debug});
			}
			let probes = [];
			for(const [x, y] of probePoints){
				await RobotHelper.Go({xpos:x, ypos:y, zpos:0, wpos:0, debug});
				await RobotHelper.WaitProbe(debug);
				const result = await RobotHelper.ZProbe(x, y, debug);
				probes.push(result);
			}
			fs.writeFileSync(path, JSON.stringify(probes, null, 2));
		}catch(error){
			console.error(error);
		}
	})
	.parse(process.argv);