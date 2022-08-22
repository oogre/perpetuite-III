#!/usr/bin/env node
/*----------------------------------------*\
  perpetuite-III - goHome.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-22 19:39:14
  @Last Modified time: 2022-08-22 23:31:40
\*----------------------------------------*/
import _conf_ from './../../common/config.js';
import {isNumber, constrain} from './../../common/tools.js';
import {Call} from './../../common/CoreApiHelper.js';
import Command from './../../common/CommandHelper.js';

const { 
	deault:{
		speed, 
		acceleration:acc, 
		decceleration:dcc,
		max_speed:maxSpeed,
		min_speed:minSpeed,
		max_acceleration:maxAcc,
		min_acceleration:minAcc,
		min_decceleration:minDcc,
		max_decceleration:maxDcc,
		radius,
		min_depth:minDepth,
		max_depth:maxDepth,
		min_roll:minRoll,
		max_roll:maxRoll
	}
} = _conf_.ROBOT_CONF;

Command({
	name : "P-III.goHome",
	usage : "[options]",
	description : `
This script is developped for Perpetuité III, an art installation 
made by Felix Luque, Damien Gernay & Vincent Evrard.
This script is used to move robot in straight line to destination
`,
	})
	.option(`-x, --xpos <xpos>`, `x component of the 3D point of destination [${-radius}, ${radius}]`, parseFloat, "current xpos")
	.option(`-y, --ypos <ypos>`, `y component of the 3D point of destination [${-radius}, ${radius}]`, parseFloat, "current ypos")
	.option(`-z, --zpos <zpos>`, `z component of the 3D point of destination [${minDepth}, ${maxDepth}]`, parseFloat, "current zpos")
	.option(`-w, --wpos <wpos>`, `rotation component of the tool [${minRoll}, ${maxRoll}]`, parseFloat, "current wpos")
	.option(`-s, --speed <speed>`, `speed of the move [${minSpeed}, ${maxSpeed}]`, parseFloat, speed)
	.option(`-a, --acc <acc>`, `acceleration of the move [${minAcc}, ${maxAcc}]`, parseFloat, acc)
	.option(`-f, --dcc <dcc>`, `decceleration of the move [${minDcc}, ${maxDcc}]`, parseFloat, dcc)
	.action( async ({ debug, xpos, ypos, zpos, wpos, speed, acc, dcc }) => {
		const $ = Call({debug});
		if(!isNumber(xpos) || !isNumber(ypos) || !isNumber(zpos) || !isNumber(wpos)){
			const [x, y, z, w] = await $(`P-III.core.api GetPosition ${debug}`);
			if(!isNumber(xpos))xpos = x;
			if(!isNumber(ypos))ypos = y;
			if(!isNumber(zpos))zpos = z;
			if(!isNumber(wpos))wpos = w;
		}
		speed= constrain(minSpeed, maxSpeed, speed);
		acc  = constrain(minAcc, maxAcc, acc);
		dcc  = constrain(minDcc, maxDcc, dcc);
		xpos = constrain(-radius, radius, xpos);
		ypos = constrain(-radius, radius, ypos);
		zpos = constrain(minDepth, maxDepth, zpos);
		wpos = constrain(minRoll, maxRoll, wpos);
		try{
			await $(`P-III.core.api Speed ${debug} -- ${speed}`);
			await $(`P-III.core.api Acc ${debug} -- ${acc}`);
			await $(`P-III.core.api Dcc ${debug} -- ${dcc}`);
			await $(`P-III.core.api Go ${debug} -- ${xpos} ${ypos} ${zpos} ${wpos}`);
		}catch(error){
			console.error(error);
		}
	})
	.parse(process.argv);