#!/usr/bin/env node
/*
  Round trip time of a trivial command (GetPosition), measured the two ways the robot can be reached :
    1. the way App used to do it : `P-III.core.api GetPosition` => a new node process + a new TCP connection
    2. persistent socket (Client.js)
  Needs the release build (npm run build.core.api) and the ACE server running.
  usage : node scripts/bench.core.api.js [count]
*/
const {exec} = require('child_process');
const util = require('util');
const _exec = util.promisify(exec);
const {CoreClient} = require('../release/robot/coreAPI/Client.js');

const stats = (name, times) => {
	const avg = times.reduce((a, b) => a + b, 0) / times.length;
	const sorted = [...times].sort((a, b) => a - b);
	console.log(`${name.padEnd(34)} avg ${avg.toFixed(1).padStart(8)} ms | min ${sorted[0].toFixed(1).padStart(8)} | median ${sorted[Math.floor(sorted.length/2)].toFixed(1).padStart(8)} | max ${sorted[sorted.length-1].toFixed(1).padStart(8)}   (n=${times.length})`);
};
const time = async (fn) => {
	const t0 = process.hrtime.bigint();
	await fn();
	return Number(process.hrtime.bigint() - t0) / 1e6;
};

(async () => {
	const N = parseInt(process.argv[2]) || 20;
	const old = [];
	for(let i = 0; i < N; i++) old.push(await time(() => _exec('P-III.core.api GetPosition')));
	stats("P-III.core.api (process / command)", old);

	const client = new CoreClient();
	await client.call('GetPosition'); // opens the connection, not measured
	const persistent = [];
	for(let i = 0; i < N * 10; i++) persistent.push(await time(() => client.call('GetPosition')));
	stats("persistent socket", persistent);
	client.close();
})().catch(e => { console.error(e); process.exit(1); });
