import {Robot_go} from './go.js';
import {Robot_speed} from './speed.js';
import {Robot_acc} from './acc.js';
import {Robot_dcc} from './dcc.js';
import {Robot_gripper} from './gripper.js';


export const Robot_release = async (BASE)=>{
	BASE.robot.actionDesc = `Robot Release`;
	if(BASE.robot.conf.simulation){
		BASE.robot.grabbedPill.location = BASE.robot.location2D;
		await BASE.real.add(BASE.robot.grabbedPill);
		BASE.robot.grabbedPill = null;
	}else{
		const {z:tableDepth} = BASE.table.toFloorLocation(BASE.robot.location2D);
		const target = BASE.robot.location4D;
		const targetZ = target.z;
		target.z += tableDepth + BASE.real.conf.depth;
		await Robot_go(BASE, target);
		await Robot_gripper(BASE, false);

		target.z += BASE.robot.conf.approche.dist;
		await Robot_speed(BASE, BASE.robot.conf.approche.speed);
		await Robot_acc(BASE, BASE.robot.conf.approche.acc);
		await Robot_dcc(BASE, BASE.robot.conf.approche.acc);
		await Robot_go(BASE, target);
		
		target.z = targetZ;
		await Robot_speed(BASE, BASE.robot.conf.default.speed);
		await Robot_acc(BASE, BASE.robot.conf.default.acc);
		await Robot_dcc(BASE, BASE.robot.conf.default.acc);
		await Robot_go(BASE, target);
	}
	BASE.robot.actionDescPop();
	return true;
}

