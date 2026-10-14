/*----------------------------------------*\
  perpetuite-III - Client.js
  Persistent connection to the ACE server (aceServer.cs).

  Communication.js opens a TCP connection for every request and is only
  used by the `P-III.core.api` command line tool. The command line tool
  itself is started (a new node process!) for every command by the App.

  This module is meant to be imported by the App directly: one socket for the
  whole life of the process, no process to spawn, no TCP handshake, no DNS lookup.

  Protocol (see aceServer.cs): one request per line, one reply line per
  request, replies come back in the order requests were sent.
\*----------------------------------------*/
import net from 'net';
import _conf_ from './../../common/config.js';
import Request from './Request.js';
import Position from './Position.js';
import {stringToBoolean, wait} from './tools.js';

const {network:{host:HOST, port:PORT, timeout:TIMEOUT}} = _conf_.BASE_API_CONF;

// same conversion as the command line tool (index.js) does for Go & Follow
const toRobotRoll = (w) => (w>0?1:-1)*(180-Math.abs(w));

// same error shape as the command line tool: [errorId, errorLabel]
const errorOf = (res) => {
	try{
		return res.getErrorMessage();
	}catch(e){
		return [-1, String(res.parameters[0]?.value)];
	}
}

export class CoreClient{
	constructor({host = HOST, port = PORT, timeout = TIMEOUT} = {}){
		this.host = host;
		this.port = port;
		this.timeout = timeout;
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
		const socket = await this._connect();
		return new Promise((resolve, reject)=>{
			const entry = {resolve, reject};
			entry.timer = setTimeout(()=>{
				// A reply that never comes would shift every following reply.
				// Start again from a clean connection.
				reject(new Error("Timeout"));
				socket.destroy();
			}, this.timeout);
			this.pending.push(entry);
			socket.write(req.toString().trim() + "\n");
		});
	}

	close(){
		if(this.socket) this.socket.end();
	}

	// Drop-in replacement of `Call('P-III.core.api')` (tools.js)
	// ex : core.call("Go -- 10 20 -30 0") <=> $ P-III.core.api Go -- 10 20 -30 0
	async call(command){
		const [name, ...args] = command.trim().split(/\s+/).filter(a => a !== "--");
		const res = await this.send(buildRequest(name, args));
		return res.parameters.map(({value}) => value);
	}

	// Drop-in replacement of `$pipe('P-III.core.api', 'Follow')` (tools.js)
	// stdin.write("x y z w\n") sends a Follow point immediately and does not wait for the robot
	// kill() ends the stream, `promise` resolves when every point has been acknowledged
	follow(){
		const outstanding = new Set();
		let rest = "";
		let ended = false;
		let done;
		const promise = new Promise(resolve => done = resolve);
		const sendPoint = (line) => {
			const [x, y, z, w] = line.trim().split(/\s+/).map(parseFloat);
			const p = this.send(Request.Follow(new Position(x, y, z, toRobotRoll(w))))
				// like the old child process, Follow errors are not fatal for the caller
				.catch(error => console.log("[Follow]", error))
				.finally(() => outstanding.delete(p));
			outstanding.add(p);
		}
		return {
			stdin : {
				write : (message) => {
					if(ended) return;
					rest += message;
					let index;
					while((index = rest.indexOf("\n")) >= 0){
						const line = rest.slice(0, index);
						rest = rest.slice(index + 1);
						if(line.trim() !== "") sendPoint(line);
					}
				}
			},
			kill : () => {
				ended = true;
				Promise.all([...outstanding]).then(() => done(""));
			},
			promise
		}
	}
}

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

const core = new CoreClient();

// Same signature as `Call` of tools.js : CoreApi({debug})("Go -- 1 2 3 4")
export const CoreApi = ({debug = false} = {}) => {
	return async (args) => {
		if(debug){
			await wait(300);
			return console.log(`P-III.core.api ${args}`);
		}
		return core.call(args);
	}
}

export const followStream = () => core.follow();
export const closeCore = () => core.close();
export default core;
