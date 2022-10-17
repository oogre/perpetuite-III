/*----------------------------------------*\
  perpetuite-III - ChoreographicModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-10-11 21:09:22
  @Last Modified time: 2022-10-12 09:58:59
\*----------------------------------------*/

import Vector from './../common/Vector.js';
import {getArc, getMechanicalSheep, getJitter, getCross} from './../common/Path.js';
import {wait, wait2, $pipe, lerp} from './../common/tools.js';
import {limitters, moveLimit} from './../common/moveLimit.js';
import _ from "underscore";
import Log from './../common/Log.js';

const adjustmentSender = async (path, timeout=1000, beforeKill=100, afterKill=100) =>{
	const {stdin, kill, promise} = $pipe('P-III.core.api', 'Follow');
	const interval = (timeout - beforeKill - afterKill) / path.length;
	for(const pt of path){
		stdin.write(`${pt.join(' ')}\n`);
		await wait(interval);
	}
	await wait(beforeKill);
	kill();
	await wait(afterKill);
	await promise;
}

const adjustmentMoves = [
	async ({location, roll=limitters.roll.value, timeout=1000, beforeKill=100, afterKill=100}) => {
		Log.info("Random z adjustment");
		const ptLen = Math.floor(lerp(2, 5, Math.random()));
		const _ptLen = 1/ptLen;
		const amp = lerp(10, 40, Math.random());
		const path = (new Array(ptLen+1)).fill(0)
			.map((_, k) => [
				...location.toArray(2), location.z - amp * Math.random(), roll
			])
			.map(([x, y, z, w]) => {
     			const {pos} = moveLimit({xpos:x, ypos:y, zpos:z, wpos : w});
      			return pos;
    		});

		await adjustmentSender(path, timeout, beforeKill, afterKill);
	},
	async ({location, roll=limitters.roll.value, timeout=1000, beforeKill=100, afterKill=100}) => {
		Log.info("Random w adjustment");
		const ptLen = Math.floor(lerp(2, 5, Math.random()));
		const _ptLen = 1/ptLen;
		const amp = lerp(10, 40, Math.random());
		const path = (new Array(ptLen+1)).fill(0)
			.map((_, k) => [
				...location.toArray(3), roll - lerp(-amp*0.5, amp*0.5, Math.random())
			])
			.map(([x, y, z, w]) => {
     			const {pos} = moveLimit({xpos:x, ypos:y, zpos:z, wpos : w});
      			return pos;
    		});
		await adjustmentSender(path, timeout, beforeKill, afterKill);
	},
	async ({location, roll=limitters.roll.value, timeout=1000, beforeKill=100, afterKill=100}) => {
		Log.info("Random x y z w adjustment");
		const ptLen = Math.floor(lerp(2, 5, Math.random()));
		const _ptLen = 1/ptLen;
		const amp = lerp(10, 40, Math.random());
		const path = (new Array(ptLen+1)).fill(0)
			.map((_, k) => [
				location.x+lerp(-amp*0.5, amp*0.5, Math.random()), 
	            location.y+lerp(-amp*0.5, amp*0.5, Math.random()), 
	            location.z+lerp(-amp*0.5, 0, Math.random()), 
	            roll+lerp(-amp*0.5, amp*0.5, Math.random())
			])
			.map(([x, y, z, w]) => {
     			const {pos} = moveLimit({xpos:x, ypos:y, zpos:z, wpos : w});
      			return pos;
    		});
		await adjustmentSender(path, timeout, beforeKill, afterKill);
	}
];

const choreographicMoves = [
  async () => {
    Log.info("Cross choreographic");
    const {stdin, kill, promise} = $pipe('P-III.core.api', 'Follow');
    let path = getCross();
    let pt;
    for(pt of path){
      stdin.write(`${pt.join(' ')}\n`);
      await wait(500);
    }
    await wait(500);
    kill();
    await wait(500);
  },
  async () => {
    Log.info("getMechanicalSheep choreographic");
    const {stdin, kill, promise} = $pipe('P-III.core.api', 'Follow');
    let path = getMechanicalSheep();
    let pt;
    for(pt of path){
      stdin.write(`${pt.join(' ')}\n`);
      await wait(270);
    }
    path = getJitter(new Vector(...pt));
    for(pt of path){
      stdin.write(`${pt.join(' ')}\n`);
      await wait(150);
    }
    await wait(500);
    kill();
  },
  async ({location}) => {
    Log.info("jitter choreographic");
    const {stdin, kill, promise} = $pipe('P-III.core.api', 'Follow');
    let path = getJitter(location);
    for(const pt of path){
      stdin.write(`${pt.join(' ')}\n`);
      await wait(150);
    }
    await wait(500);
    kill();
  },
  async ({location}) => {
    Log.info("goArc choreographic");
    const {stdin, kill, promise} = $pipe('P-III.core.api', 'Follow');
    let old = location;
    let count = Math.random() * 10;
    while(count-- > 0){
      const smoothness =  Math.random();
      const stop = new Vector(
      	...(Vector.Random2D().multiply(limitters.radius.value * Math.random()).toArray(2)), 
      	lerp(limitters.depth.min, limitters.depth.max, Math.random())
      );
      const path = getArc({start:old, stop, smooth:lerp(3, 10, smoothness)});
      old = stop.clone();
      for(const pt of path){
        stdin.write(`${pt.join(' ')}\n`);
        await wait(lerp(250, 150, smoothness));
      }
    }
    await wait(500);
    kill();
  },
  async ({location}) => {
    Log.info("goArc choreographic");
    const {stdin, kill, promise} = $pipe('P-III.core.api', 'Follow');
    let old = location;
    let count = Math.random() * 10;
    while(count-- > 0){
      const smoothness =  Math.random();
      const stop = new Vector(
      	...(Vector.Random2D().multiply(limitters.radius.value * Math.random()).toArray(2)), 
      	lerp(limitters.depth.min, limitters.depth.max, Math.random())
      );
      const path = getArc({start:old, stop, smooth:lerp(3, 10, smoothness)});
      old = stop.clone();
      for(const pt of path){
        stdin.write(`${pt.join(' ')}\n`);
        await wait(lerp(250, 150, smoothness));
      }
    }
    await wait(500);
    kill();
  }
];

export const getChoreographicMove = () => {
	return _.sample(choreographicMoves);
}
export const getAdjustmentMoves = () => {
	return _.sample(adjustmentMoves);
}