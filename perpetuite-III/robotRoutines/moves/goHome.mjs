#!/usr/bin/env zx

import {wait} from './../tools.js';

const DEFAULT_W = 0;
const DEFAULT_SPEED = 50;
const DEFAULT_ACC = 50;
const DEFAULT_DCC = 50;
const DEBUG = false ? "-d" : "";


export const goHome = async ({w=DEFAULT_W, speed=DEFAULT_SPEED, acc=DEFAULT_ACC, dcc=DEFAULT_DCC}={})=>{
	await $`client-perpetuite3 Speed ${DEBUG} -- ${speed}`;
	await $`client-perpetuite3 Acc ${DEBUG} -- ${acc}`;
	await $`client-perpetuite3 Dcc ${DEBUG} -- ${dcc}`;
	await $`client-perpetuite3 Go ${DEBUG} -- 0 0 0 0`;
}


export const go = async ([x=0, y=0, z =0], {w=DEFAULT_W, speed=DEFAULT_SPEED, acc=DEFAULT_ACC, dcc=DEFAULT_DCC}={})=>{
	await $`client-perpetuite3 Speed ${DEBUG} -- ${speed}`;
	await $`client-perpetuite3 Acc ${DEBUG} -- ${acc}`;
	await $`client-perpetuite3 Dcc ${DEBUG} -- ${dcc}`;
	await $`client-perpetuite3 Go ${DEBUG} -- ${x} ${y} ${z} ${w}`;
}

export const follow = async (points=[], {w=DEFAULT_W, speed=DEFAULT_SPEED, acc=DEFAULT_ACC, dcc=DEFAULT_DCC}={}) => {
	await $`client-perpetuite3 Speed ${DEBUG} -- ${speed}`;
	await $`client-perpetuite3 Acc ${DEBUG} -- ${acc}`;
	await $`client-perpetuite3 Dcc ${DEBUG} -- ${dcc}`;
	const fProcess = $`client-perpetuite3 Follow ${DEBUG} - `;
	for(const point of points){
		fProcess.stdin.write(`${point.join(" ")}\n`)
		await wait(100);
	}
}

export const getPostion = async () => {
	return JSON.parse((await $`client-perpetuite3 GetPosition`).stdout);
}




export const getZ = async (_x, _y, offset = 0) => {
	const rawLocation = (await $`./getZfoXY.mjs -x=${_x} -y=${_y}`);
	const [, , rawZ] = rawLocation.stdout.replace("\n", "").split(" ");
	const z = parseFloat(rawZ);
	return Math.min(0, Math.max(z, z+offset));
}

export const getPoint = async (x, y, offset = 0) => [x, y, await getZ(x, y, offset)];
