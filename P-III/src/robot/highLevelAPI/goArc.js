#!/usr/bin/env node
/*----------------------------------------*\
  perpetuite-III - goArc.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-23 08:38:53
  @Last Modified time: 2022-08-24 18:07:42
\*----------------------------------------*/

import {isNumber, constrain, lerp3, lerp} from './../../common/tools.js';
import {moveLimit, limitters} from './../../common/moveLimit.js';
import * as RobotHelper from './../../common/CoreApiHelper.js';
import Command from './../../common/CommandHelper.js';
import Vector from "./../../common/Vector.js";
const math = require("mathjs");

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
		const [x0, y0, z0, w0] = await RobotHelper.GetPosition(debug);
		const p0 = new Vector(x0, y0, z0);
		if(!isNumber(xpos))xpos = x0;
		if(!isNumber(ypos))ypos = y0;
		if(!isNumber(zpos))zpos = z0;
		if(!isNumber(wpos))wpos = w0;
		const { pos:[x1, y1, z1, w1], s, a, d } = await moveLimit({xpos, ypos, zpos, wpos, speed, acc, dcc});
		const p1 = new Vector(x1, y1, z1);
	
		const _p = p1.subtract(p0);
		const c  = p0.add(p1).multiply(0.5);
		const radius = _p.length()*0.5;

		const STEP_count = Math.max(3, Math.round(_p.length()*0.2));
		// const STEP_size = Math.PI / STEP_count;
		
		const points = (new Array(STEP_count+1))
			.fill(0)
			.map((e, k)=>{
				// const sigma = k * STEP_size;
				const s = k / STEP_count;
				const sv = s * 2 - 1;
				const sSign = Math.sign(sv);
				const sz = Math.abs(sv);
				const limit = constrain(0, Math.min(p0.z, p1.z), c.z + radius);
				return new Vector(
					lerp(p0.x, p1.x, s),
					lerp(p0.y, p1.y, s),
					lerp3(p0.z, limit, p1.z, sSign * sz * sz )
				).toArray();
			})

		console.log(points);
		
		try{
			// await $(`P-III.core.api Speed ${debug} -- ${s}`);
			// await $(`P-III.core.api Acc ${debug} -- ${a}`);
			// await $(`P-III.core.api Dcc ${debug} -- ${d}`);
			// await $(`P-III.core.api Go ${debug} -- ${x} ${y} ${z} ${w}`);
		}catch(error){
			console.error(error);
		}
	})
	.parse(process.argv);