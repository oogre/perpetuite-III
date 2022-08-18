#!/usr/bin/env zx
const {lerp, isString, isDirExists, isFileExists} = require("./tools.js");

const probePoints = [
	[-550, -250],
	[-250, -550],
	[ 250, -550],
	[ 550, -250],
	[ 550,  250],
	[ 250,  550],
	[-250,  550],
	[-550,  250],
	[   0,    0]
];

const PROBE_DATA_PATH = "./../data/zProbes.json";

const isHelp = argv.h || argv.help;
const DEBUG = (argv.d || argv.debug) ? '-d' : '';
const isPath = isString(argv.p);


const help = () => `
Usage: getZforXY [options]

Description:
	This script is developped for Perpetuité III, an art installation 
	made by Felix Luque, Damien Gernay & Vincent Evrard.
	This script is used to probes z position of 9 2D points.
	It runs 'client-perpetuite3' script who drive the robot of the installation

Options:
  -h, --help                    display help for command
  -d, --debug                    debug mode
  -p <path>                   	Required path
`;

if(isHelp) {
	console.error(help());
}else{

	await $`client-perpetuite3 HighPower ${DEBUG} -- 1 `;
	await $`client-perpetuite3 Go ${DEBUG} -- 0 0 0 0`;
	for(const [x, y] of probePoints){
		await $`client-perpetuite3 Go ${DEBUG} -- ${x} ${y} 0 0`;
	}
	let probes = [];
	for(const [x, y] of probePoints){
		await $`client-perpetuite3 Go ${DEBUG} -- ${x} ${y} 0 0`;
		await $`client-perpetuite3 WaitProbe ${DEBUG}`;
		const result = await $`client-perpetuite3 ZProbe ${DEBUG} -- ${x} ${y}`;
		probes.push(JSON.parse(result.stdout));
	
	}


	let data = JSON.stringify(probes, null, 2);

	fs.writeFile(PROBE_DATA_PATH, data, (err) => {
	    if (err) throw err;
	    console.log('Data written to file');
	});

	// const path = argv.p;
	// if(!isDirExists(path)){
	// 	console.log(path, "does not exist")
	// }else{
	// 	console.log(path, "exist")
	// }

	// module.exports.isDirExists = (path) => fs.existsSync(getDirName(path));
	// module.exports.isFileExists = (path) => fs.existsSync(path);

}