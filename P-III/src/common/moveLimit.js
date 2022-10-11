/*----------------------------------------*\
  perpetuite-III - moveLimit.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-23 08:51:09
  @Last Modified time: 2022-10-11 12:03:30
\*----------------------------------------*/

import fs from 'fs-extra';
const math = require("mathjs");
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
	},
	physical : { 
		probe_height:probeHeight, 
		pill_HEIGHT:pillHeight, 
		approche:{
			height:approche
		}
	},
  zProbe : { 
  	save_path : probesPath 
  }
} = _conf_.HIGH_LEVEL_API_CONF;

const probePoints = fs.readJsonSync(probesPath);

export const limitters = {
	radius : {
		value : radius,
	},
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
		[xpos, ypos] = vh.unit().multiply(radius).toArray();
	}
	const minDepth = getDepthForXY(xpos, ypos);
	return {
		s : constrain(limitters.speed.min, limitters.speed.max, speed),
		a : constrain(limitters.acc.min, limitters.acc.max, acc),
		d : constrain(limitters.dcc.min, limitters.dcc.max, dcc),
		pos : [ 
			xpos, 
			ypos, 
			constrain(minDepth, limitters.depth.max, zpos), 
			constrain(limitters.roll.min, limitters.roll.max, wpos)
		],
	};
};

export const getDepthForXY = (x, y) => {
  const closestPoints = probePoints.map(([_x, _y, _z]) => {
    let dX = x - _x;
    let dY = y - _y;
    let dist = Math.sqrt(dX * dX + dY * dY);
    return [ _x, _y, _z, dist ];
  }).sort((a, b) => a[3] - b[3]);
  closestPoints.length = 3;

  const matB = math.matrix(closestPoints.map(([x, y, z]) => [z]))
  const matA = math.matrix(closestPoints.map(([x, y]) => [x, y, 1]))
  const maAt = math.transpose(matA);
  const fit = math.chain(maAt).multiply(matA).inv().multiply(maAt).multiply(matB).done()
  const [[a, b, c]] = math.transpose(fit).valueOf();
  const z = a * x + b * y + c;
  return z + approche + pillHeight - probeHeight;
}