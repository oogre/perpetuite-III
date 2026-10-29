import {Robot_go, Robot_speed, Robot_acc, Robot_dcc} from './../Robot';
import {Vector2, Vector4} from './../../tools/Vector.js';
import {delay} from './../../tools/helpers.js';
import {Camera_capture} from './../Camera';

export const Exec_explore = async (BASE)=>{
	BASE.robot.actionDesc = `Explore`;
	const points = new Array(10).fill(0)
		.map(()=>{
			return new Vector2(...BASE.grid.getRandomCellLocation());
		});
	await Robot_acc(BASE, [25]);
	await Robot_dcc(BASE, [25]);
	for(const point of points){
		await Robot_go(BASE, new Vector4(...point, 0, 0), {enableDamping:true, curve:false});
		await delay(1000);
		await Camera_capture(BASE);
	}
	await Robot_speed(BASE, [BASE.robot.conf.default.speed]);
	await Robot_acc(BASE, [BASE.robot.conf.default.acc]);
	await Robot_dcc(BASE, [BASE.robot.conf.default.dcc]);
	BASE.robot.actionDescPop();
}