#!/usr/bin/env node

import config from "./config.js";
import API from "./API";
import Grid from "./Grid";
import Commands from "./Commands";
import {axisCorrection} from "./tools/correction.js";
import Robot from "./Robot";
import Memory from "./Memory";

process.title = config.window.title;

const grid = new Grid(config.grid);
const cmd = new Commands(config.commands, {grid});
const robot = new Robot(config.robot);
const memory = new Memory(config.pills);

const api = new API({
	cmd,
	grid,
	robot,
	memory,
});




process.on('exit', ()=>{});
process.on('SIGINT', ()=>process.exit(0));
process.on('SIGTERM', ()=>process.exit(0));

