import {Exec_task} from "./task.js";
import Chronos from "./../../tools/Chronos.js"
import {delay} from "./../../tools/helpers.js"
import {Memory_save} from '../Memory';
import {Move_drawer} from './../Move';

export const Exec_loop = async (BASE)=>{
	while(true){
		BASE.robot.actionDesc = `Exec loop`;
		try{
			Memory_save(BASE);
			if(!BASE.hasToLoop){
				return true;
			}
			console.log("");
			if(BASE.cmd.length==1){
				BASE.frameChronos.interval();
				console.log(`Frame accomplished in ${BASE.frameChronos.duration}s.`);
				await Move_drawer(BASE);
			}
			console.log(`Still : ${BASE.cmd.length} tasks`);
			const taskChrono = new Chronos();
			const task = await BASE.cmd.getTask();
			await Exec_task(BASE, [task.color.name, task.location.x, task.location.y]);
			taskChrono.interval();
			console.log(`Duration : ${taskChrono.duration}s.`);	
		}finally{
			BASE.robot.actionDescPop();
		}
	}
}
