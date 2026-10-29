import {Robot_drop, Robot_go, Robot_grab} from "./../Robot";
import {Exec_findFreeLocation} from "./findFreeLocation.js";
import {Memory_get} from "./../Memory";


// HERE IS FINAL DEST
// FIND FREE DEST
// DROP CURRENT PILL(A) AT FREE DEST
// MOVE WRONG PILL(B) SOMEWHERE TASK WILL LIKE
// GRAB PILL(A) FROM FREE DEST
// DROP PILL(A) AT FINAL DEST

export const Exec_dropErrorHandling = async(BASE)=>{
	BASE.robot.actionDesc = `Drop Error Handling`;
	const finalDest = BASE.robot.location2D;
	const freeDest = await Exec_findFreeLocation(BASE);
	await Robot_drop(BASE);
	const pill = Memory_get(BASE, finalDest);
	console.log(pill);
	const subTask = await BASE.cmd.getTask(pill.color.name);
	await Exec_move(BASE, pill, subTask.location, 1);
	await Robot_go(BASE, freeDest);
	await Robot_grab(BASE);
	await Robot_go(BASE, finalDest);
	await Robot_drop(BASE);
	BASE.robot.actionDescPop();
}