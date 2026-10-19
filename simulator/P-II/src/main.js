#!/usr/bin/env node

import config from "./config.js";
import readline from "readline"
import Engine from "./tools/Engine.js";
import API from "./API";
import UI_Manager from "./UI";
import Real from "./Real";
import Robot from "./Robot";
import Memory from "./Memory";
import Forbidden from "./Forbidden";
//import Camera from "./Camera";
import Floor from "./Floor";
import Grid from "./Grid";
import Commands from "./Commands";
import ImageManager from "./ImageManager";
import {axisCorrection} from "./tools/correction.js";


import fs from 'fs';
const hb = fs.openSync(`${process.env.HOME}/p2-hb.log`, 'a');
setInterval(() => {
  const m = process.memoryUsage();
  fs.writeSync(hb, `${Date.now()} rss=${m.rss/1e6|0}MB heap=${m.heapUsed/1e6|0}MB ext=${m.external/1e6|0}MB ab=${m.arrayBuffers/1e6|0}MB\n`);
  fs.fsyncSync(hb);
  if (m.rss > 2e9) { console.error('RSS > 2 Go, arrêt'); process.exit(1); }
}, 1000);

process.title = config.window.title;

const image = new ImageManager(config.player);
const grid = new Grid(config.grid);
const cmd = new Commands(config.commands, {grid});
const table = new Floor(config.floor);
const real = new Real(config.pills, {grid});
const robot = new Robot(config.robot);
	robot.on("locationChange initilized", (location) => {
		console.log("locationChange", location);
		const offset = axisCorrection(location, config.flipAxis);
		ui.forAllRegistered( item =>{
			item.offset = offset;
		});
		//camera.offset = offset;
		robot.positionOnTable = table.toFloorLocation(location);
		robot.hoverDangerousPlace = forbidden.isHover(location);
	});

const memory = new Memory(config.pills);
const forbidden = new Forbidden(config.forbidden);
//const camera = new Camera(config.camera, real.ui);
const engine = new Engine(50);
	engine.register(robot);

const ui = new UI_Manager(config.window);
	ui.register(grid.ui);
	ui.register(table.ui);
	ui.register(real.ui);
	ui.register(robot.ui);
	ui.register(memory.ui);
	ui.register(forbidden.ui);

// const uiPreview = new UI_Manager(config.windowPreview);
// 	uiPreview.register(image.ui);
// 	uiPreview.register(image.uiFrame);

const api = new API({
	robot,
	// camera,
	memory,
	forbidden,
	real,
	cmd,
	grid,
	image,
	table
});

real.load();




process.on('SIGINT', ()=>process.exit(0));
process.on('SIGTERM', ()=>process.exit(0));

