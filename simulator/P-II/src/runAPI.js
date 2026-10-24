#!/usr/bin/env node

import config from "./config.js";
import Engine from "./tools/Engine.js";
import API from "./API";
import Robot from "./Robot";
import Memory from "./Memory";
import Forbidden from "./Forbidden";
import Floor from "./Floor";
import Grid from "./Grid";
import Commands from "./Commands";
import {axisCorrection} from "./tools/correction.js";

process.title = config.window.title;

const grid = new Grid(config.grid);
const cmd = new Commands(config.commands, {grid});
const table = new Floor(config.floor);
const robot = new Robot(config.robot);
	robot.on("locationChange initilized", (location) => {
		const offset = axisCorrection(location, config.flipAxis);
		robot.positionOnTable = table.toFloorLocation(location);
		robot.hoverDangerousPlace = forbidden.isHover(location);
	});

const memory = new Memory(config.pills);
const forbidden = new Forbidden(config.forbidden);


const engine = new Engine(50);
	engine.register(robot);

const api = new API({
	robot,
	memory,
	forbidden,
	cmd,
	grid,
	table
});




process.on('exit', ()=>camera.shutdownSync());
process.on('SIGINT', ()=>process.exit(0));
process.on('SIGTERM', ()=>process.exit(0));

