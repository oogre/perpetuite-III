#!/usr/bin/env zx

const {lerp, isNumber} = require("./tools.js");

const getZ = async (_x, _y) => {
	const rawLocation = (await $`./getZfoXY.mjs -x=${_x} -y=${_y}`);
	const [, , z] = rawLocation.stdout.replace("\n", "").split(" ");
	return parseInt(z);
}

const GO_CEIL = async (x, y, w = 0) => {
	await $`client-perpetuite3 Go -- ${x} ${y} 0 ${w}`;
}

const GO = async (x, y, z = 0, w = 0) => {
	await $`client-perpetuite3 Go -- ${x} ${y} ${z} ${w}`;
}



const V_UP = async () => {
	await $`client-perpetuite3 Speed -- 60`;
	await $`client-perpetuite3 Acc -- 50`;
	await $`client-perpetuite3 Dcc -- 50`;
}

const SLOW = async () => {
	await $`client-perpetuite3 Speed -- 1`;
	await $`client-perpetuite3 Acc -- 1`;
	await $`client-perpetuite3 Dcc -- 60`;
}


const V = async () => {
	await $`client-perpetuite3 Speed -- 60`;
	await $`client-perpetuite3 Acc -- 60`;
	await $`client-perpetuite3 Dcc -- 50`;
}

const H = async () => {
	await $`client-perpetuite3 Speed -- 50`;
	await $`client-perpetuite3 Acc -- 50`;
	await $`client-perpetuite3 Dcc -- 50`;
}

const Gripper = async (flag) => {
	await $`client-perpetuite3 Gripper -- ${1-flag}`;
	
}


const WAIT = async (time) => {
	if(isNumber(time)){
		return new Promise(s => setTimeout(()=>s(), time));	
	}
	await $`client-perpetuite3 WaitProbe`;
}

const RAYON = 550;

const getRandom2DPoint = (x=0, y=0, r=RAYON) => {
	const alpha = Math.random() * Math.PI * 2;
	const rayon = lerp(0, r, Math.random());
	return [
		x + rayon * Math.cos(alpha),
		y + rayon * Math.sin(alpha)
	]
}

const pickUp = async (x, y, z) => {
	await H();
	await GO(x, y);
	await V();
	await GO(x, y, z+5);
	await SLOW();
	await GO(x, y, z);
	await WAIT();
	await Gripper(1);
	await WAIT(500);
	await GO(x, y, z+5);
	await V();
	await GO(x, y);
}

const dropDown = async (x, y, z) => {
	await H();
	await GO(x, y);
	await V();
	await GO(x, y, z+5);
	await SLOW();
	await GO(x, y, z);
	await WAIT(200);
	await Gripper(0);
	await WAIT(500);
	await GO(x, y, z+5);
	await V();
	await GO(x, y);
}
const goHome = async ()=>{
	await H();
	await GO(0, 0);
}


const inject = (A, B)=>{
	return (new Array(A.length + A.length-2)).fill(0).map((e,i) => i%2==1?A[Math.floor(i/2)]: B);
}


const p = JSON.parse((await $`./gridGen.mjs -d 5.5 -x 20 -y 40 -w 5 -h 5`).stdout);

const points = inject(p, [-550, -250])

await Gripper(0);

await goHome();

let flag = true;
for(const [x, y] of points){
	const z = await getZ(x, y);
	if(flag) await pickUp(x, y, z);
	else await dropDown(x, y, z);
	flag = !flag;
}
await Gripper(0);
await goHome();



