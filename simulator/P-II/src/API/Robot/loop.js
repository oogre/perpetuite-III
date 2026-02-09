import {Robot_putPillAt} from "./putPillAt.js";
import Chronos from "./../../tools/Chronos.js"

export const Robot_loop = async (BASE)=>{
	if(!BASE.hasToLoop) return;
	console.log("");
	if(BASE.cmd.length==1){
		BASE.frameChronos.interval();
		console.log(`Frame accomplished in ${BASE.frameChronos.duration}s.`);
	}
	console.log(`Still : ${BASE.cmd.length} tasks`);
	const taskChrono = new Chronos();
	await Robot_putPillAt(BASE, await BASE.cmd.getTask());
	taskChrono.interval();
	console.log(`Duration : ${taskChrono.duration}s.`);
	await Robot_loop(BASE);
}
