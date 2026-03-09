import {Robot_put} from "./put.js";
import Chronos from "./../../tools/Chronos.js"
import {delay} from "./../../tools/helpers.js"

export const Robot_loop = async (BASE)=>{
	// if(!BASE.hasToLoop) return;
	console.log("");
	if(BASE.cmd.length==1){
		BASE.frameChronos.interval();
		console.log(`Frame accomplished in ${BASE.frameChronos.duration}s.`);
	}
	console.log(`Still : ${BASE.cmd.length} tasks`);
	const taskChrono = new Chronos();
	const task = await BASE.cmd.getTask();
	await Robot_put(BASE, task.toString().split(" "));
	await delay(500);
	taskChrono.interval();
	console.log(`Duration : ${taskChrono.duration}s.`);
	await Robot_loop(BASE);
}
