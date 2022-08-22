#!/usr/bin/env node
/*----------------------------------------*\
  perpetuite-III - zProbe.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-22 17:40:34
  @Last Modified time: 2022-08-22 17:41:24
\*----------------------------------------*/

import fs from 'fs-extra';
import _conf_ from './../../common/config.js';
import {Call} from './../../common/CoreApiHelper.js';
import Command from './../../common/CommandHelper.js';

const { zProbe:{probe_points:probePoints, save_path:savePath} } = _conf_.HIGH_LEVEL_API_CONF;

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
		const $ = Call({debug});
		try{
			await $(`P-III.core.api HighPower ${debug} -- 1 `)
			await $(`P-III.core.api Go ${debug} -- 0 0 0 0`);
			for(const [x, y] of probePoints){
				await $(`P-III.core.api Go ${debug} -- ${x} ${y} 0 0`);
			}
			let probes = [];
			for(const [x, y] of probePoints){
				await $(`P-III.core.api Go ${debug} -- ${x} ${y} 0 0`);
				await $(`P-III.core.api WaitProbe ${debug}`);
				const result = await $(`P-III.core.api ZProbe ${debug} -- ${x} ${y}`);
				probes.push(result);
			}
			fs.writeFileSync(path, JSON.stringify(probes, null, 2));
		}catch(error){
			console.error(error);
		}
	})
	.parse(process.argv);