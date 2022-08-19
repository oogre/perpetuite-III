#!/usr/bin/env zx

const {lerp, isNumber, isString, isBool} = require("./tools.js");

const PILL_SIZE = (isNumber(argv.p) ? argv.p : 9);   // mm
const RAYON = (isNumber(argv.r) ? argv.r : 550);   // mm


const density = (isNumber(argv.d) ? argv.d : 5) * 0.01;

const DIAMETER = RAYON * 2;  // mm
const hCount = density * DIAMETER * 1;
const vCount = density * DIAMETER * 1.33;

const offsetX = (DIAMETER-PILL_SIZE) / hCount;
const offsetY = (DIAMETER-PILL_SIZE) / vCount;

const x = isNumber(argv.x) ? argv.x : 0;
const y = isNumber(argv.y) ? argv.y : 0;
const w = isNumber(argv.w) ? argv.w : hCount;
const h = isNumber(argv.h) ? argv.h : vCount;
const isHelp = isBool(argv.help) && argv.help;

const outputPath = isString(argv.o) ? argv.o : false;

const help = () => `
Usage: gridGen [options]

Description:
	This script is developped for Perpetuité III, an art installation 
	made by Felix Luque, Damien Gernay & Vincent Evrard.
	This script is used to calculate pill position for a given table radius, density
	Default output is JSON array sent to stdout.

Options:
  --help                    display help for command
  -p=<pillSize>                 pill size in mm (Default : 9)
  -r=<radius>                   radius of the table in mm (Default : 550)
  -d=<density>                  density of pill in pill/10cm (Default : 5)
 [Crope output into rect]
  -x=<posX>                     To crope default circle into Rect in mm, left of top left corner (Default : 0)
  -y=<value>                    To crope default circle into Rect in mm, top of top left corner (Default : 0)
  -w=<width>                    To crope default circle into Rect in mm, width of the rect (Default : density * radius * 2)
  -h=<height>                   To crope default circle into Rect in mm, top of top left corner (Default : density * radius * 2 * 1.33)
 [Output]
  -o=<path>                     JSON formated Array of 2D points (Default : stdout)
`;


const isValid = ([x, y]) => Math.sqrt(x * x + y* y) < RAYON;

const getPosition = (x, y) => {
	let off = Math.round(Math.random());
	const [offX, offY] = [
		( y % 2 == 0 ? 1 : 0) * 0.5,
		( x % 2 == 0 ? 0 : 0) * 0.5
	];
	return [
		(( x + offX ) * offsetX - RAYON + PILL_SIZE).toFixed(2),
		(-1 * (( y + offY ) * offsetY - RAYON + PILL_SIZE)).toFixed(2)
	]
};

const genGrid = (x0=0, y0=0, w=hCount, h=vCount) => {
	let y1 = y0 + h;
	let x1 = x0 + w;
	const grid = [];
	for(let y = y0 ; y < y1 ; y ++){
		const line = [];
		for(let x = x0 ; x < x1 ; x ++){
			const point = getPosition(x, y);
			if(isValid(point)){
				line.push(point);
			}
			
		}
		grid.push(line);
	}
	return grid.flat(1);
}


if(isHelp) {
	console.error(help());
}
else {
	const grid = genGrid(x, y, w, h)
	let data = JSON.stringify(grid).replace(/\"/g, "");
	
	if(outputPath){
		fs.writeFile(outputPath, data);		
	}else{
		console.log(data);
	}
}
