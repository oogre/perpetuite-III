#!/usr/bin/env node

import config from "./config.js";
import { Vector3 } from 'vecteur/3d';
import readline from "readline"
import Engine from "./tools/Engine.js";
import API from "./API";
import UI_Manager from "./UI";
import Real from "./Real";
import Robot from "./Robot";
import Memory from "./Memory";
import Forbidden from "./Forbidden";

import Camera from "./Camera";
import Floor from "./Floor";
import Grid from "./Grid";
import Commands from "./Commands";
import ImageManager from "./ImageManager";

import Demon from "./Demon"

process.title = config.window.title;

const image = new ImageManager(config.player);

const grid = new Grid(config.grid);

const cmd = new Commands(config.commands, {grid})

const table = new Floor(config.floor);

const real = new Real(config.pills, {grid});

const robot = new Robot(config.robot);
robot.on("locationChange initilized", location => {
	ui.forAllRegistered( item =>{
		item.offset = location;
	});
	camera.offset = location;
	robot.intersection = table.toFloorLocation(location.clone().mult(new Vector3(-1, -1, 1)));
	robot.hoverDangerousPlace = forbidden.isHover(location.clone().mult(new Vector3(-1, -1, 1)));
});

robot.on("initilized", async ()=>{});

const memory = new Memory(config.pills);

const forbidden = new Forbidden(config.forbidden);

const camera = new Camera(config.camera, real.ui);

const engine = new Engine(50);
engine.register(robot);

const ui = new UI_Manager(config.window);
ui.register(grid.ui);
ui.register(table.ui);
ui.register(real.ui);
ui.register(robot.ui);
ui.register(memory.ui);
ui.register(forbidden.ui);

const uiPreview = new UI_Manager(config.windowPreview);
uiPreview.register(image.ui);
uiPreview.register(image.uiFrame);

const api = new API({
	robot,
	camera,
	memory,
	forbidden,
	real,
	cmd,
	grid,
	image,
	table
});

// const demon = new Demon({real, grid});
// const engineDemon = new Engine(50);
// engineDemon.register(demon);






// real.add(real.createPill({
// 	box :[ -30, -30, real.conf.radius.value, real.conf.radius.value]
// }));

// real.add(real.createPill({
// 	box :[ 0, 0, real.conf.radius.value, real.conf.radius.value]
// }));

// real.add(real.createPill({
// 	box :[ real.conf.radius.value, 0, real.conf.radius.value, real.conf.radius.value]
// }));

// real.add(real.createPill({
// 	box :[ 0, real.conf.radius.value, real.conf.radius.value, real.conf.radius.value]
// }));





process.on('SIGINT', ()=>process.exit(0));
