#!/usr/bin/env zx

const {lerp, isNumber} = require("./tools.js");

const PILL_SIZE = 9; // mm
const RAYON = 650;   // mm
const DIAMETER = RAYON * 2;  // mm

const density = (isNumber(argv.d) ? argv.d : 8) * 0.01;

const hCount = density * DIAMETER * 1;
const vCount = density * DIAMETER * 1.33;

const offsetX = (DIAMETER-PILL_SIZE) / hCount;
const offsetY = (DIAMETER-PILL_SIZE) / vCount;

const x = isNumber(argv.x) ? argv.x : 0;
const y = isNumber(argv.y) ? argv.y : 0;
const w = isNumber(argv.w) ? argv.w : hCount;
const h = isNumber(argv.h) ? argv.h : vCount;

const isValid = ([x, y]) => Math.sqrt(x * x + y* y) < RAYON;

const getPosition = (x, y) => {
	let off = Math.round(Math.random());
	const [offX, offY] = [
		( y % 2 == 0 ? 1 : 0) * 0.5,
		( x % 2 == 0 ? 0 : 0) * 0.5
	];
	return [
		(( x + offX ) * offsetX - RAYON + PILL_SIZE).toFixed(2),
		(( y + offY ) * offsetY - RAYON + PILL_SIZE).toFixed(2)
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

const grid = genGrid(x, y, w, h)
for(let i = 0 ; i < 1352 ; i++){
	grid.splice(Math.floor(grid.length * Math.random()), 1);
}

let data = JSON.stringify(grid).replace(/\"/g, "");
console.log(data);

fs.writeFile("./../data/grid.json", data, (err) => {
    if (err) throw err;
    console.log('Data written to file');
});






