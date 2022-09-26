#!/usr/bin/env node
/*----------------------------------------*\
  perpetuite-III - goHome.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-22 19:39:14
  @Last Modified time: 2022-08-24 14:20:17
\*----------------------------------------*/
import _conf_ from './../../common/config.js';
import * as RobotHelper from './../../common/CoreApiHelper.js';
import Command from './../../common/CommandHelper.js';

const { 
	robot:{
		default:{
			home, 
			speed, 
			acceleration:acc, 
			decceleration:dcc
		}
	}
} = _conf_.HIGH_LEVEL_API_CONF;


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
		try{
			await RobotHelper.GoHome(debug)
		}catch(error){
			console.error(error);
		}
	})
	.parse(process.argv);