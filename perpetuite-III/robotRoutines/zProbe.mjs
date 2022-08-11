#!/usr/bin/env zx


// fly over first pos;
// wait for prob to be placed and clicked
// do the prob
// go next point

const DEBUG = (!!(argv.debug || argv.d)) ? '-d' : '';


const probePoints = [
	[-550, -250, -284.419389648437],
	[-250, -550, -285.226884765625],
	[ 250, -550, -282.537614746094],
	[ 550, -250, -282.5694140625],
	[ 550,  250, -285.108598632812],
	[ 250,  550, -284.70857421875],
	[-250,  550, -284.70857421875],
	[-550,  250, -284.70857421875],
	[   0,    0, -284.70857421875]
];

await $`client-perpetuite3 HighPower ${DEBUG} -- 1 `;

const measures = [];
for(let [x, y] of probePoints){
	await $`client-perpetuite3 Go ${DEBUG} -- ${x} ${y} 0 0`;
	await $`client-perpetuite3 IdleZ ${DEBUG}`;
	measures.push((await $`client-perpetuite3 ZProbe ${DEBUG} -- ${x} ${y}`));
}



const calcZforXY = (x, y) => {


	probePoints.reduce(( [_x, _y])=>{
		let dX = _x - x;
		let dY = _y - y;
		let dist = Math.sqrt(dX * dX + dY * dY);
	});


}