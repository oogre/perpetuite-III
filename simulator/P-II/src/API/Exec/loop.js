import {Exec_task} from "./task.js";
import Chronos from "./../../tools/Chronos.js"
import {delay} from "./../../tools/helpers.js"

export const Exec_loop = async (BASE)=>{
	if(!BASE.hasToLoop) return;
	BASE.robot.actionDesc = `Exec loop`;
	console.log("");
	if(BASE.cmd.length==1){
		BASE.frameChronos.interval();
		console.log(`Frame accomplished in ${BASE.frameChronos.duration}s.`);
	}
	console.log(`Still : ${BASE.cmd.length} tasks`);
	const taskChrono = new Chronos();
	const task = await BASE.cmd.getTask();
	await Exec_task(BASE, [task.color.name, task.location.x, task.location.y]);
	taskChrono.interval();
	console.log(`Duration : ${taskChrono.duration}s.`);
	BASE.robot.actionDescPop();
	await Exec_loop(BASE);
}
