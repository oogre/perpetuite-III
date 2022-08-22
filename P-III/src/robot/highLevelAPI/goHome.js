#!/usr/bin/env node
/*----------------------------------------*\
  perpetuite-III - goHome.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-22 19:39:14
  @Last Modified time: 2022-08-22 19:51:03
\*----------------------------------------*/
import _conf_ from './../../common/config.js';
import {Call} from './../../common/CoreApiHelper.js';
import Command from './../../common/CommandHelper.js';

const { deault:{home, speed, acceleration:acc, decceleration:dcc} } = _conf_.ROBOT_CONF;


Command({
	name : "P-III.goHome",
	usage : "[options]",
	description : `
This script is developped for Perpetuité III, an art installation 
made by Felix Luque, Damien Gernay & Vincent Evrard.
This script is used to send robot at home
`,
	})
	.action( async ({debug}) => {
		const $ = Call({debug});
		try{
			await $(`P-III.core.api Speed ${debug} -- ${speed}`);
			await $(`P-III.core.api Acc ${debug} -- ${acc}`);
			await $(`P-III.core.api Dcc ${debug} -- ${dcc}`);
			await $(`P-III.core.api Go ${debug} -- ${home.join(' ')}`);
		}catch(error){
			console.error(error);
		}
	})
	.parse(process.argv);