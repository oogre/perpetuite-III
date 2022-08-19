#!/usr/bin/env zx
const math = require("mathjs");
const {lerp, isNumber} = require("./tools.js");


const PROBE_HEIGHT = 23; // 22mm
const PILL_HEIGHT = 5;
const PROBE_DATA_PATH = "./../data/zProbes.json";
const OFFSET = PILL_HEIGHT - PROBE_HEIGHT;

const isPosX = isNumber(argv.x);
const isPosY = isNumber(argv.y);
const isHelp = argv.h || argv.help;

const help = () => `
Usage: getZforXY [options]

Description:
	This script is developped for Perpetuité III, an art installation 
	made by Felix Luque, Damien Gernay & Vincent Evrard.
	This script is used to calculate z position for a given 2D point

Options:
  -h, --help                    display help for command
  -x=<value>                    Required Number (ex : -x=123)
  -y=<value>                    Required Number (ex : -y=-678)
`;


const getPprobes = async () => {
	try{
		return await fs.readJson(PROBE_DATA_PATH);
	}catch(error){
		await $`./zProbe.mjs --quiet`;
		return await getPprobes();
	}	
}


const getClosestPoint = async (x, y, count = 3) => {
	const probePoints = await getPprobes();
	const points = probePoints.map(([_x, _y, _z]) => {
		let dX = x - _x;
		let dY = y - _y;
		let dist = Math.sqrt(dX * dX + dY * dY);
		return [ _x, _y, _z, dist ];
	}).sort((a, b) => a[3] - b[3]);
	points.length = count;
	return points;
}

const calcZforXY = async (x, y) => {
	const points = await getClosestPoint(x, y, 3);
	const matB = math.matrix(points.map(([x, y, z]) => [z]))
	const matA = math.matrix(points.map(([x, y]) => [x, y, 1]))
	const maAt = math.transpose(matA);
	const fit = math.chain(maAt).multiply(matA).inv().multiply(maAt).multiply(matB).done()
	const [[a, b, c]] = math.transpose(fit).valueOf();
	// console.log(`solution: ${a} x + ${b} y + ${c} = z`)
	return a * x + b * y + c;
}

if(!isPosX || !isPosY || isHelp) {
	console.error(help());
}
else {
	try{
		process.stdout.write(`${argv.x} ${argv.y} ${await calcZforXY(argv.x, argv.y) + OFFSET}`);	
	}catch(error){
		console.error(error);
	}
}
	
