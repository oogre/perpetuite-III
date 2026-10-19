#!/usr/bin/env node
/*----------------------------------------*\
  perpetuite-III - aceServerSimulator.js

  Simulates aceServer.cs (the ACE script that drives the Omron Quattro 650).
  Speaks the same protocol, but instead of moving a robot it prints in the
  console what the robot would do. No dependencies.

    node simulator/aceServerSimulator.js [--port 9090] [--instant]

    --port N    TCP port to listen on (default 9090, like aceServer.cs)
    --instant   moves take no time (default : duration is estimated from distance & speed)

  Point config/conf.json (BASE_API_CONF.network.host) to the machine running this.

  Protocol (same as aceServer.persistent.cs) :
    request : `Name count t<value> t<value> ...\n`   t = i f d b s
    reply   : `ok count t<value> ...\n`  or  `ko 1 s<message>\n`
    One reply per request, in order. Requests of every client go through ONE queue,
    exactly like the Main() loop of the real script : a Go blocks everybody until
    the move is done, Follow does not.
\*----------------------------------------*/
const net = require('net');

// ---------------------------------------------------------------- options
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; };
const PORT = parseInt(opt('--port')) || 9090;
const INSTANT = args.includes('--instant');

// ---------------------------------------------------------------- console
const C = process.stdout.isTTY
	? { dim:'\x1b[2m', red:'\x1b[31m', green:'\x1b[32m', yellow:'\x1b[33m', blue:'\x1b[34m', magenta:'\x1b[35m', cyan:'\x1b[36m', bold:'\x1b[1m', off:'\x1b[0m' }
	: { dim:'', red:'', green:'', yellow:'', blue:'', magenta:'', cyan:'', bold:'', off:'' };
const stamp = () => new Date().toISOString().slice(11, 23);
const log = (tag, color, msg) => console.log(`${C.dim}${stamp()}${C.off} ${color}${tag.padEnd(11)}${C.off} ${msg}`);
const f = (n) => (Number.isInteger(n) ? n.toFixed(1) : n.toFixed(2)).padStart(8);
const fmtPos = ({x, y, z, w}) => `x=${f(x)} y=${f(y)} z=${f(z)} roll=${f(w)}`;

// ---------------------------------------------------------------- simulated robot
const DEFAULTS = { speed: 50, acc: 50, dcc: 50 };
const robot = {
	power: false,
	brakeReleased: false,
	gripper: false,
	...DEFAULTS,
	pos: { x: 0, y: 0, z: 0, w: -180 },
	busyUntil: 0, // end of the last queued move (ms, Date.now() scale)
};

const MAX_LINEAR_SPEED = 2000; // mm/s at speed 100 (rough estimate, only used for the simulated duration)
const MAX_ROLL_SPEED = 1500;   // deg/s at speed 100
const moveDuration = (from, to) => {
	if (INSTANT) return 0;
	const lin = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
	const rot = Math.abs(to.w - from.w);
	const k = Math.max(robot.speed, 1) / 100;
	return Math.max(0.03, lin / (MAX_LINEAR_SPEED * k), rot / (MAX_ROLL_SPEED * k)) * 1000;
};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// queue a move in the "controller" (does not wait, like robot.Move)
const queueMove = (to) => {
	const ms = moveDuration(robot.pos, to);
	const from = robot.pos;
	robot.busyUntil = Math.max(Date.now(), robot.busyUntil) + ms;
	robot.pos = to;
	return { from, ms };
};
// like robot.WaitMoveDone()
const waitMoveDone = async () => {
	const ms = robot.busyUntil - Date.now();
	if (ms > 0) await sleep(ms);
};

// ---------------------------------------------------------------- protocol
const parseParam = (raw) => {
	const value = raw.slice(1);
	switch(raw[0]){
		case 'i': { const v = parseInt(value, 10); if(Number.isNaN(v)) throw new Error(`Bad int : ${raw}`); return v; }
		case 'f':
		case 'd': { const v = parseFloat(value.replace(',', '.')); if(Number.isNaN(v)) throw new Error(`Bad number : ${raw}`); return v; }
		case 'b': { const v = value.toLowerCase(); if(v !== 'true' && v !== 'false') throw new Error(`Bad bool : ${raw}`); return v === 'true'; }
		case 's': return value;
		default : throw new Error(`Unknown parameter type : ${raw}`);
	}
};
const parseRequest = (line) => {
	const parts = line.trim().split(' ');
	const name = parts[0];
	const params = [];
	if(parts.length > 1){
		const count = parseInt(parts[1], 10);
		if(Number.isNaN(count)) throw new Error(`Bad parameter count : ${parts[1]}`);
		for(let i = 0; i < count; i++){
			if(parts[i + 2] === undefined) throw new Error(`Missing parameter ${i + 1}/${count}`);
			params.push(parseParam(parts[i + 2]));
		}
	}
	return { name, params };
};
const encodeParam = (v) => {
	if(typeof v === 'boolean') return 'b' + (v ? 'True' : 'False');
	if(typeof v === 'string') return 's' + v;
	return 'd' + String(v);
};
const ok = (...values) => `ok ${values.length} ${values.map(encodeParam).join(' ')} `;
const ko = (e) => `ko 1 s${String(e && e.message || e).replace(/[\r\n]+/g, ' ')} `;

const need = (name, params, n) => {
	if(params.length < n) throw new Error(`${name} needs ${n} parameter(s), got ${params.length}`);
};

// ---------------------------------------------------------------- commands (mirror of Main() in aceServer.cs)
const commands = {
	async HighPower([flag]){
		robot.power = flag;
		log('HighPower', C.yellow, flag ? 'motors power ON, calibrate' : 'motors power OFF');
		return ok();
	},
	async Break([flag]){
		robot.brakeReleased = flag;
		log('Break', C.yellow, `brakes ${flag ? 'released' : 'engaged'} on all motors`);
		return ok();
	},
	async Gripper([flag]){
		robot.gripper = flag;
		log('Gripper', C.magenta, flag ? 'digital output  1 ON  (vacuum / gripper ON)' : 'digital output -1 OFF (vacuum / gripper OFF)');
		return ok();
	},
	async Speed([v]){ robot.speed = v; log('Speed', C.blue, `${v}`); return ok(); },
	async Acc([v]){ robot.acc = v; log('Acc', C.blue, `${v}`); return ok(); },
	async Dcc([v]){ robot.dcc = v; log('Dcc', C.blue, `${v}`); return ok(); },
	async Reset(){
		Object.assign(robot, DEFAULTS);
		log('Reset', C.blue, `speed=${robot.speed} acc=${robot.acc} dcc=${robot.dcc}`);
		return ok();
	},
	async Go([x, y, z, w]){
		const { from, ms } = queueMove({ x, y, z, w });
		log('Go', C.green, `${fmtPos({x, y, z, w})}  straight blend  speed=${robot.speed} acc=${robot.acc} dcc=${robot.dcc}  ${C.dim}(from ${fmtPos(from)}, ~${Math.round(robot.busyUntil - Date.now())} ms)${C.off}`);
		await waitMoveDone();
		log('', C.dim, `${C.dim}move done${C.off}`);
		return ok();
	},
	async Follow([x, y, z, w]){
		const { ms } = queueMove({ x, y, z, w });
		log('Follow', C.cyan, `${fmtPos({x, y, z, w})}  queued, not waiting  ${C.dim}(+${Math.round(ms)} ms, ${Math.max(0, Math.round(robot.busyUntil - Date.now()))} ms of motion pending)${C.off}`);
		return ok();
	},
	async GetPosition(){
		const { x, y, z, w } = robot.pos;
		log('GetPosition', C.dim, fmtPos(robot.pos));
		return ok(x, y, z, w);
	},
	async Stop(){
		const pending = Math.max(0, robot.busyUntil - Date.now());
		robot.busyUntil = Date.now();
		log('Stop', C.red, `halt${pending ? `, ${Math.round(pending)} ms of queued motion dropped` : ''}`);
		return ok();
	},
	async ZProbe([x, y]){
		// real script : go to (x, y, 0), go down slowly until the probe input 1001 triggers, back up, back to 0,0,0
		const PROBE_Z = -150;
		log('ZProbe', C.magenta, `go to x=${f(x)} y=${f(y)} z=0, descend slowly until probe (input 1001), back up, go home`);
		queueMove({ x, y, z: 0, w: 0 });
		await waitMoveDone();
		robot.pos = { x, y, z: PROBE_Z, w: 0 };
		const result = { ...robot.pos };
		log('', C.magenta, `probe triggered at z=${f(PROBE_Z).trim()} (simulated)`);
		queueMove({ x: 0, y: 0, z: 0, w: 0 });
		await waitMoveDone();
		return ok(result.x, result.y, result.z, result.w);
	},
	async IdleZ(){
		log('IdleZ', C.magenta, 'wobble roll with z=0 until probe input 1001 triggers (simulated: after 500 ms)');
		await sleep(INSTANT ? 0 : 500);
		robot.pos = { x: robot.pos.x, y: robot.pos.y, z: 0, w: 0 };
		return ok();
	},
	async WaitProbe(){
		log('WaitProbe', C.magenta, 'wait for probe input 1001 to be pressed then released (simulated: after 500 ms)');
		await sleep(INSTANT ? 0 : 500);
		return ok();
	},
};
const PARAM_COUNT = { HighPower:1, Break:1, Gripper:1, Speed:1, Acc:1, Dcc:1, Go:4, Follow:4, ZProbe:2 };

// ---------------------------------------------------------------- one queue for everybody (Main loop)
const queue = [];
let working = false;
const work = async () => {
	if(working) return;
	working = true;
	while(queue.length){
		const { client, line } = queue.shift();
		let reply;
		try{
			const { name, params } = parseRequest(line);
			const command = commands[name];
			if(!command){
				log('?', C.dim, `unknown request "${name}" (the real server answers ok and does nothing)`);
				reply = ok();
			}else{
				if(PARAM_COUNT[name]) need(name, params, PARAM_COUNT[name]);
				reply = await command(params);
			}
		}catch(e){
			log('ERROR', C.red, `${line.trim()}  ->  ${e.message}`);
			reply = ko(e);
		}
		if(!client.destroyed) client.write(reply + '\n');
	}
	working = false;
};

// ---------------------------------------------------------------- TCP
let clientCount = 0;
const server = net.createServer((client) => {
	const id = ++clientCount;
	const who = `${client.remoteAddress}:${client.remotePort}`;
	client.setNoDelay(true);
	client.setEncoding('ascii');
	log('connect', C.green, `client #${id} (${who})`);
	let buffer = '';
	client.on('data', (chunk) => {
		buffer += chunk;
		let i;
		while((i = buffer.indexOf('\n')) >= 0){
			const line = buffer.slice(0, i).trim();
			buffer = buffer.slice(i + 1);
			if(line === '') continue;
			queue.push({ client, line });
		}
		work();
	});
	client.on('error', (e) => log('error', C.red, `client #${id} : ${e.message}`));
	client.on('close', () => log('disconnect', C.yellow, `client #${id}`));
});

server.on('error', (e) => {
	console.error(e.code === 'EADDRINUSE' ? `Port ${PORT} already in use (real server or another simulator running ?)` : e);
	process.exit(1);
});
server.listen(PORT, '0.0.0.0', () => {
	console.log(`${C.bold}ACE server simulator${C.off} listening on 0.0.0.0:${PORT}${INSTANT ? ' (instant moves)' : ''}`);
	console.log(`${C.dim}robot starts at ${fmtPos(robot.pos)}${C.off}\n`);
});
process.on('SIGINT', () => { console.log('\nbye'); process.exit(0); });
