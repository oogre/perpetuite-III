#!/usr/bin/env zx

const math = require("mathjs");

import {goHome, go, getPoint, follow, getPostion} from './goHome.mjs';
import {lerp, lerp3, isBool, isNumber} from './../tools.js';
import Vector from "./../Vector.js";

let isHelp = isBool(argv.help) && argv.help;

if(!isNumber(argv.x) || !isNumber(argv.y)){
	isHelp = true;
}

const x1 = argv.x;
const y1 = argv.y;

const offset = isNumber(argv.o) ? argv.o : 0;


const help = () => `
Usage: gridGen [options]

Description:
	This script is developped for Perpetuité III, an art installation 
	made by Felix Luque, Damien Gernay & Vincent Evrard.
	This script is used to drive robot along a arc from the current position to a destination on working area

Options:
  -h, --help                    display help for command
  -x=<x>                 x component of destination to reach int mm (Require)
  -y=<y>                 y component of destination to reach int mm (Require)
  -o=<offset>            distance up to the working area to reach (Default : PILL_HEIGHT)
`;


if(isHelp) {
	console.error(help());
	process.exit(1);
}

const [x0, y0, z0] = await getPostion();
const p0 = new Vector(x0, y0, z0);
const p1 = new Vector(... await getPoint(x1, y1, offset));

const _p = p1.subtract(p0);
const c  = p0.add(p1).multiply(0.5);
const radius = _p.length()/2;

const STEP_count = Math.floor(lerp(3, 80, Math.random()));
const speed = lerp(25, 80, Math.random());
const acc = lerp(25, 80, Math.random());
const dcc = lerp(25, 80, Math.random());

console.log(p1.toArray());
console.log(STEP_count, speed, acc, dcc);

const STEP_size = Math.PI / STEP_count;
const points = (new Array(STEP_count+1))
.fill(0)
.map((e, k)=>{
	const sigma = k * STEP_size;
	const s = k / STEP_count;
	const sv = s * 2 - 1;
	const sSign = Math.sign(sv);
	const sz = Math.abs(sv);
	const limit = Math.max(Math.min(p0.z, p1.z),Math.min(0, c.z + radius));
	return new Vector(
		lerp(p0.x, p1.x, s),
		lerp(p0.y, p1.y, s),
		lerp3(p0.z, limit, p1.z, sSign * sz * sz )
	).toArray();
});

await go(p0.toArray());
await follow(points, {speed, acc, dcc});
await go(p1.toArray());

process.exit(0);

