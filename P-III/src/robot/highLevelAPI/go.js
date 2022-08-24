#!/usr/bin/env node
/*----------------------------------------*\
  perpetuite-III - goHome.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-22 19:39:14
  @Last Modified time: 2022-08-24 13:45:24
\*----------------------------------------*/
import {isNumber} from './../../common/tools.js';
import {limitters} from './../../common/moveLimit.js';
import * as RobotHelper from './../../common/CoreApiHelper.js';
import Command from './../../common/CommandHelper.js';


Command({
	name : "P-III.goHome",
	usage : "[options]",
	description : `
This script is developped for Perpetuité III, an art installation 
made by Felix Luque, Damien Gernay & Vincent Evrard.
This script is used to move robot in straight line to destination
`,
	})
	.option(`-x, --xpos <xpos>`, `x component of the 3D point of destination [${limitters.x.min}, ${limitters.x.max}]`, parseFloat, "current xpos")
	.option(`-y, --ypos <ypos>`, `y component of the 3D point of destination [${limitters.y.min}, ${limitters.y.max}}]`, parseFloat, "current ypos")
	.option(`-z, --zpos <zpos>`, `z component of the 3D point of destination [${limitters.depth.min}, ${limitters.depth.max}]`, parseFloat, "current zpos")
	.option(`-w, --wpos <wpos>`, `rotation component of the tool [${limitters.roll.min}, ${limitters.roll.max}]`, parseFloat, "current wpos")
	.option(`-s, --speed <speed>`, `speed of the move [${limitters.speed.min}, ${limitters.speed.max}]`, parseFloat, limitters.speed.value)
	.option(`-a, --acc <acc>`, `acceleration of the move [${limitters.acc.min}, ${limitters.acc.max}]`, parseFloat, limitters.acc.value)
	.option(`-f, --dcc <dcc>`, `decceleration of the move [${limitters.dcc.min}, ${limitters.dcc.max}]`, parseFloat, limitters.dcc.value)
	.action( async ({ debug, xpos, ypos, zpos, wpos, speed, acc, dcc }) => {
		if(!isNumber(xpos) || !isNumber(ypos) || !isNumber(zpos) || !isNumber(wpos)){
			const [x, y, z, ] = await RobotHelper.GetPosition(debug);
			if(!isNumber(xpos))xpos = x;
			if(!isNumber(ypos))ypos = y;
			if(!isNumber(zpos))zpos = z;
			if(!isNumber(wpos))wpos = 0;
		}
		try{
			const res = await RobotHelper.Go({xpos, ypos, zpos, wpos, speed, acc, dcc, debug});
			console.log(res);
		}catch(error){
			console.error(error);
		}
	})
	.parse(process.argv);