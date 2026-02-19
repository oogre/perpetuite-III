#!/usr/bin/env node


import config from "./../config.js";
import Grid from "./../Grid";
import Commands from "./../Commands";

const grid = new Grid(config.grid);
const cmd = new Commands({
	...config.commands,
	generator : {
			offsetFilePath : "./data/patterns/offset.test"
	},
	commandsPath : "./data/commands.test"
}, {grid})



const test = async ()=>{
	const res = await cmd.genTaskList();
	console.log(res);
}



test();