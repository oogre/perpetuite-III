#!/usr/bin/env node
/*----------------------------------------*\
  perpetuite-III - grab.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-24 17:09:36
  @Last Modified time: 2022-08-24 17:22:47
\*----------------------------------------*/

import Command from './../../common/CommandHelper.js';
import * as RobotHelper from './../../common/CoreApiHelper.js';
import { stringToBoolean }  from './../../common/tools.js';

Command({
	name : "P-III.grab",
	usage : "[options]",
	description : `
This script is developped for Perpetuité III, an art installation 
made by Felix Luque, Damien Gernay & Vincent Evrard.
...
`,
})
.requiredOption('-f, --flag <flag>', 'true to grab false to release', stringToBoolean)
.action( async ({debug, flag}) => {
	try{
		await RobotHelper.Grab(flag, debug);
	}catch(error){
		console.error(error);
	}
})
.parse(process.argv);
