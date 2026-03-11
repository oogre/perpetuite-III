import net from 'net';
import {isRequest, isBuffer} from './validators.js';


import Request from './Request.js';
import Parameter from './Parameter.js';
import Position from './Position.js';


export default (NETWORK_CONF)=>{
	return {
		// Set HighPower to motors. 
		// true turns the HighPower On
		// false turns the HighPower Off
		HighPower : async (flag)=>{
			return await Call(Request.HighPower(flag), NETWORK_CONF);
		},
		// Enable/Disable Gripper. 
		// true turns the Gripper On 
		// false turns the Gripper Off
		Gripper : async (flag)=>{
			return await Call(Request.Gripper(flag), NETWORK_CONF);
		},
		// Tell the robot to go at a position 
		// x y z  w
		Go : async (location)=>{
			return await Call(Request.Go(new Position(...location)), NETWORK_CONF);
		},
		// pipe values (x y z w\\n) into this command
		Follow : async (path)=>{
			for(const location of path){
				await Call(Request.Follow(new Position(...location)), NETWORK_CONF);
			}
		},
		// Tell the robot to go at max z for the position x y
		ZProbe : async (location)=>{
			return await Call(Request.ZProbe(new Position(location.x, location.y, 0, 0)), NETWORK_CONF);
		},
		// Ask the robot its position x y z w 
		GetPosition : async ()=>{
			return await Call(Request.GetPosition(), NETWORK_CONF);
		},
		// Tell the robot to wait z probe clicked
		WaitProbe : async ()=>{
			return await Call(Request.WaitProbe(), NETWORK_CONF);
		},
		// set the speed, 0 is minimum 100 is maximum
		Speed : async (speed)=>{
			return await Call(Request.Speed(speed), NETWORK_CONF);
		},
		// set the acceleration, 0 is minimum 100 is maximum
		Acc : async (acc)=>{
			return await Call(Request.Acc(acc), NETWORK_CONF);
		},
		// set the deceleration, 0 is minimum 100 is maximum
		Dcc : async (dcc)=>{
			return await Call(Request.Dcc(dcc), NETWORK_CONF);
		}
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