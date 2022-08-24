/*----------------------------------------*\
  perpetuite-III - CoreApiHelper.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-22 15:21:12
  @Last Modified time: 2022-08-24 13:53:13
\*----------------------------------------*/
import util from 'util';
import _conf_ from './config.js';
import {isBool} from './tools.js';
import {exec} from 'child_process';
import {moveLimit} from './moveLimit.js';
const _exec = util.promisify(exec)

const Call = ({debug = false, JsonFlag = true, ErrorFlag = true}={})=>{
	return async (command) => {
		debug && console.log(command);
		const {stdout, stderr} = await _exec(command);
		if(ErrorFlag && stderr != '')throw new Error(stderr);
		try{
			if(JsonFlag){
				if(stdout == '')return stdout;
				return JSON.parse(stdout);		
			}else{
				return stdout;
			}
		}catch(e){
			throw new Error(stdout);
		}
	}
};

export const Go = async ({xpos, ypos, zpos, wpos, speed, acc, dcc, debug=false})=>{
	debug = !debug ? '' : debug;
	const { pos, s, a, d } = moveLimit({xpos, ypos, zpos, wpos, speed, acc, dcc});
	const $ = Call({debug});
	await $(`P-III.core.api Speed ${debug} -- ${s}`);
	await $(`P-III.core.api Acc ${debug} -- ${a}`);
	await $(`P-III.core.api Dcc ${debug} -- ${d}`);
	await $(`P-III.core.api Go ${debug} -- ${pos.join(" ")}`);
	return GetPosition(debug);
}

export const GoHome = async (debug=false) => {
	const { 
		robot : {
			default:{
				home, 
				speed, 
				acceleration:acc, 
				decceleration:dcc
			}
		}
	} = _conf_.HIGH_LEVEL_API_CONF;
	return await Go({xpos:home[0], ypos:home[1], zpos:home[2], ypos:home[3], speed, acc, dcc, debug});
}

export const GetPosition = async (debug=false) => {
	debug = !debug ? '' : debug;
	const $ = Call({debug});
	const [x, y, z, w] = await $(`P-III.core.api GetPosition ${debug}`);
	return [x, y, z, w>0?w-180:w+180]
}

export const HighPower = async (flag, debug=false) => {
	debug = !debug ? '' : debug;
	const $ = Call({debug});
	if(!isBool)throw new Error('CoreApiHelper.HighPower first argument must be a boolean');
	return await $(`P-III.core.api HighPower ${debug} -- ${flag}`);
}

export const Gripper = async (flag, debug=false) => {
	debug = !debug ? '' : debug;
	const $ = Call({debug});
	if(!isBool)throw new Error('CoreApiHelper.Gripper first argument must be a boolean');
	return await $(`P-III.core.api Gripper ${debug} -- ${1-flag}`);
}

export const WaitProbe = async (debug=false) => {
	debug = !debug ? '' : debug;
	const $ = Call({debug});
	return await $(`P-III.core.api WaitProbe ${debug}`);
}

export const ZProbe = async (xpos, ypos, debug=false) => {
	debug = !debug ? '' : debug;
	const $ = Call({debug});
	const { pos:[x, y] } = moveLimit({xpos, ypos});
	return await $(`P-III.core.api ZProbe ${debug} -- ${x} ${y}`);
}

