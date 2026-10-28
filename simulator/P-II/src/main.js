#!/usr/bin/env node

import config from "./config.js";
import readline from "readline"
import Engine from "./tools/Engine.js";
import API from "./API";
import {Robot_HighPower, Robot_gripper, Memory_save, Memory_clear} from "./API/Actions.js";
import UI_Manager from "./UI";
// import Real from "./Real";
import Robot from "./Robot";
import Memory from "./Memory";
import Forbidden from "./Forbidden";
import Camera from "./Camera";
import Floor from "./Floor";
import Grid from "./Grid";
import Commands from "./Commands";
import ImageManager from "./ImageManager";
import {axisCorrection} from "./tools/correction.js";
import LimitedArray from "./tools/LimitedArray.js";
import {AppError, ERR } from './tools/Errors.js' ;




process.title = config.window.title;

const image = new ImageManager(config.player);
const grid = new Grid(config.grid);
const cmd = new Commands(config.commands, {grid});
const table = new Floor(config.floor);
// const real = new Real(config.pills, {grid});
const robot = new Robot(config.robot);
const memory = new Memory(config.pills);
const forbidden = new Forbidden(config.forbidden);
const camera = new Camera(config.camera);

if(config.camera.src === 'camera'){
	camera.keepAlive(); // le serveur camera s'arrête avec P-II (voir Camera/Base.js)
}

const engine = new Engine(50);
	engine.register(robot);

const ui = new UI_Manager(config.window);
	ui.register(grid.ui);
	ui.register(table.ui);
	// ui.register(real.ui);
	ui.register(memory.ui);
	ui.register(forbidden.ui);
	ui.register(robot.ui);

// const uiPreview = new UI_Manager(config.windowPreview);
// 	uiPreview.register(image.ui);
// 	uiPreview.register(image.uiFrame);


const data = {
	history : {
		tasks : new LimitedArray(10)
	}
};

const api = new API({
	data,
	robot,
	camera,
	memory,
	forbidden,
	// real,
	cmd,
	grid,
	image,
	table
});


const update = (location)=>{
	const offset = axisCorrection(location, config.flipAxis);
	ui.forAllRegistered( item =>{
		item.offset = offset;
	});
	camera.offset = offset;
	robot.positionOnTable = table.toFloorLocation(location);
	robot.hoverDangerousPlace = forbidden.isHover(location);
}


robot.on("locationChange", update.bind(this));
robot.on("initilized", location => {
	update(location);
	config.autoStart && api.fire(`Exec_start`);
});
	



api.on('error', async (error)=>{ 
	console.log(error?.code, error?.message);
	Memory_save(api.BASE);
	Memory_clear(api.BASE);
	await Robot_gripper(api.BASE, [false]);
	await Robot_HighPower(api.BASE, [false]);

	if(error instanceof AppError && error.is(ERR.FORBIDDEN)){
		console.log(`${error.message}`);
		if(config.autoStart){
			return api.fire(`Exec_start`);	
		}
	}

	switch (error.code) {
		case "604": //*Robot power off requested*
		case "901": //*Obstacle collision detected*
		case "906": //*Robot power off requested*
		default : 
			console.log("STOP AND RESTART")
			return process.exit(1);
		case "908": //*E-STOP from front panel button*
			console.log("NORMAL STOP")
			return process.exit(0);	
	}
});



// real.load();

process.on('exit', ()=>camera.shutdownSync());
process.on('SIGINT', ()=>process.exit(0));
process.on('SIGTERM', ()=>process.exit(0));
process.on('unhandledRejection', (error)=>api.fire('error', error));

