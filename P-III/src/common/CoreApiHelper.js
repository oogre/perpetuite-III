/*----------------------------------------*\
  perpetuite-III - CoreApiHelper.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-22 15:21:12
  @Last Modified time: 2022-08-22 20:25:55
\*----------------------------------------*/
import util from 'util';
import {exec} from 'child_process';

const _exec = util.promisify(exec)

export const Call = ({debug = false}={})=>{
	return async (command) => {
		debug && console.log(command);
		const {stdout, stderr} = await _exec(command);
		if(stderr != '')throw new Error(stderr);
		try{
			if(stdout == '')return stdout;
			return JSON.parse(stdout);	
		}catch(e){
			throw new Error(stdout);
		}
	}
};