/*----------------------------------------*\
  perpetuite-III - moveLimit.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-23 08:51:09
  @Last Modified time: 2022-08-24 13:45:54
\*----------------------------------------*/

import {constrain} from './tools.js';
import _conf_ from './config.js';
import Vector from './Vector.js';

const { 
	robot : {
		default : {
			home:[x, y, depth, roll],
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
	}
} = _conf_.HIGH_LEVEL_API_CONF;

export const limitters = {
	speed : {
		value: speed,
		min : minSpeed,
		max : maxSpeed
	},
	acc : {
		value: acc,
		min : minAcc,
		max : maxAcc
	},
	dcc : {
		value: dcc,
		min : minDcc,
		max : maxDcc
	},
	x : {
		value : x,
		min : -radius,
		max : radius
	},
	y : {
		value : y,
		min : -radius,
		max : radius
	},
	depth : {
		value: depth,
		min : minDepth,
		max : maxDepth
	},
	roll : {
		value : roll,
		min : minRoll,
		max : maxRoll
	}
}

export const moveLimit = ({xpos=limitters.x.value, ypos=limitters.y.value, zpos=limitters.depth.value, wpos=limitters.roll.value, speed=limitters.speed.value, acc=limitters.acc.value, dcc=limitters.dcc.value}) => {
	const vh = new Vector(xpos, ypos, 0);
	if(vh.length() > radius){
		const [x, y] = vh.unit().multiply(radius).toArray();
		xpos = x;
		ypos = y;
	}
	return {
		s : constrain(limitters.speed.min, limitters.speed.max, speed),
		a : constrain(limitters.acc.min, limitters.acc.max, acc),
		d : constrain(limitters.dcc.min, limitters.dcc.max, dcc),
		pos : [ 
			xpos, 
			ypos, 
			constrain(limitters.depth.min, limitters.depth.max, zpos), 
			constrain(limitters.roll.min, limitters.roll.max, wpos)
		],
	};
};