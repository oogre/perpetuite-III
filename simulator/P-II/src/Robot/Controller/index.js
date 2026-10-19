import net from 'net';
import {isRequest, isBuffer} from './validators.js';


import Request from './Request.js';
import Parameter from './Parameter.js';
import Position from './Position.js';

// same error shape as the command line tool: [errorId, errorLabel]
const errorOf = (res) => {
	try{
		return res.getErrorMessage();
	}catch(e){
		return [-1, String(res.parameters[0]?.value)];
	}
}
// same conversion as the command line tool (index.js) does for Go & Follow
const toRobotRoll = (w) => (w>0?1:-1)*(180-Math.abs(w));


const buildRequest = (name, args) => {
	switch(name){
		case "HighPower": return Request.HighPower(stringToBoolean(args[0]));
		case "Gripper"  : return Request.Gripper(!stringToBoolean(args[0]));
		case "Speed"    : return Request.Speed(parseInt(args[0]));
		case "Acc"      : return Request.Acc(parseInt(args[0]));
		case "Dcc"      : return Request.Dcc(parseInt(args[0]));
		case "Go"       : {
			const [x, y, z, w] = args.map(parseFloat);
			return Request.Go(new Position(x, y, z, toRobotRoll(w)));
		}
		case "ZProbe"   : {
			const [x, y] = args.map(parseFloat);
			return Request.ZProbe(new Position(x, y, 0, 0));
		}
		case "GetPosition": return Request.GetPosition();
		case "WaitProbe": return Request.WaitProbe();
		case "IdleZ"    : return Request.IdleZ();
		case "Reset"    : return Request.Reset();
		case "Stop"     : return Request.Stop();
		default         : throw new Error(`Unknown core api command : ${name}`);
	}
}

export default class Robot{
	constructor(NETWORK_CONF){//host: 'localhost', port: 9090, timeout: 30000
		this.host = NETWORK_CONF.host;
		this.port = NETWORK_CONF.port;
		this.timeout = NETWORK_CONF.timeout;
		this.socket = null;
		this.connecting = null;
		this.buffer = "";
		this.pending = []; // sent requests waiting for their reply, in sending order
	}
	_connect(){
		if(this.socket && !this.socket.destroyed) return Promise.resolve(this.socket);
		if(this.connecting) return this.connecting;
		this.connecting = new Promise((resolve, reject)=>{
			// no `timeout` option here: it would arm an idle timeout on the socket
			const socket = net.createConnection({host:this.host, port:this.port});
			socket.setNoDelay(true);
			socket.setKeepAlive(true, 10000);
			socket.setEncoding('utf8');
			socket.once('connect', ()=>{
				this.socket = socket;
				this.buffer = "";
				this.connecting = null;
				resolve(socket);
			});
			socket.on('data', chunk => this._onData(chunk));
			socket.on('error', error => {
				if(this.connecting) {
					this.connecting = null;
					reject(error);
				}
				this._failAll(error);
			});
			socket.on('close', ()=>{
				if(this.socket === socket) this.socket = null;
				this._failAll(new Error("Connection to robot server closed"));
			});
		});
		return this.connecting;
	}

	_onData(chunk){
		this.buffer += chunk;
		let index;
		while((index = this.buffer.indexOf("\n")) >= 0){
			const line = this.buffer.slice(0, index).trim();
			console.log(line);
			this.buffer = this.buffer.slice(index + 1);
			if(line === "") continue;
			const entry = this.pending.shift();
			if(!entry) continue; // reply to a request we gave up on
			clearTimeout(entry.timer);
			try{
				const res = Request.fromRaw(line);
				if(res.isFail()) entry.reject(errorOf(res));
				else entry.resolve(res);
			}catch(error){
				entry.reject(new Error(`Bad reply from robot server : ${line}`));
			}
		}
	}

	_failAll(error){
		while(this.pending.length){
			const entry = this.pending.shift();
			clearTimeout(entry.timer);
			entry.reject(error);
		}
	}


	// send a Request object, resolves with the reply Request
	async send(req){
		console.log(req);
		const socket = await this._connect();
		return new Promise((resolve, reject)=>{
			const entry = {resolve, reject};
			entry.timer = setTimeout(()=>{
				// A reply that never comes would shift every following reply.
				// Start again from a clean connection.
				console.log("Timeout");
				reject(new Error("Timeout"));
				socket.destroy();
			}, this.timeout);
			this.pending.push(entry);
			console.log(req.trim());
			socket.write(req.trim() + "\n");
		});
	}

	close(){
		if(this.socket) this.socket.end();
	}

	// Drop-in replacement of `Call('P-III.core.api')` (tools.js)
	// ex : core.call("Go -- 10 20 -30 0") <=> $ P-III.core.api Go -- 10 20 -30 0
	async call(command){
		const [name, ...args] = command.trim().split(/\s+/).filter(a => a !== "--");
		const res = await this.send(command);
		return res.parameters.map(({value}) => value);
	}


	// Set HighPower to motors. 
	// true turns the HighPower On
	// false turns the HighPower Off
	async HighPower (flag) {
		return await this.call(Request.HighPower(flag).toString());
	}
	// Enable/Disable Gripper. 
	// true turns the Gripper On 
	// false turns the Gripper Off
	async Gripper (flag){
		return await this.call(Request.Gripper(flag).toString());
	}
	// Tell the robot to go at a position 
	// x y z  w
	async Go (location) {
		return await this.call(Request.Go(new Position(...location)).toString());
	}
		// pipe values (x y z w\\n) into this command
	async Follow (path) {
		for(const location of path){
			await this.call(Request.Follow(new Position(...location)).toString());
		}
	}
	// Tell the robot to go at max z for the position x y
	async ZProbe (location) {
		return await this.call(Request.ZProbe(new Position(location.x, location.y, 0, 0)).toString());
	}
	// Ask the robot its position x y z w 
	async GetPosition () {
		return await this.call(Request.GetPosition().toString());
	}
	// Tell the robot to wait z probe clicked
	async WaitProbe () {
		return await this.call(Request.WaitProbe().toString());
	}
	// set the speed, 0 is minimum 100 is maximum
	async Speed (speed) {
		return await this.call(Request.Speed(speed).toString());
	}
	// set the acceleration, 0 is minimum 100 is maximum
	async Acc (acc) {
		return await this.call(Request.Acc(acc).toString());
	}
	// set the deceleration, 0 is minimum 100 is maximum
	async Dcc (dcc) {
		return await this.call(Request.Dcc(dcc).toString());
	}
}

const Call = async (req, NETWORK_CONF) => { // Request object
	return new Promise((resolve, reject)=>{
		if(!isRequest(req))return reject("Call communication takes only Request Object as parameter ");
		try{
			let timer;
			const client = net.createConnection(NETWORK_CONF, () => {
				client.write(req.toString());
			});

			client.on('data', (data) => {
				clearTimeout(timer);
				client.end();
				if(isBuffer(data)) data = data.toString('utf8');
				resolve(data);
			});

			client.on("error", e => {
				clearTimeout(timer);
				client.end();
				reject(`${e && e.message}`);
			});

			client.on('end', () => {
				clearTimeout(timer);
				// console.log('CLIENT : closed');
			});

			timer = setTimeout(()=>{
				reject("Timeout");
			}, NETWORK_CONF.timeout);
		}catch(error){
			reject("Connection failed");
		}
	});
}