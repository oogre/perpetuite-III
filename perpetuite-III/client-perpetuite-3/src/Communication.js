/*----------------------------------------*\
  client-perpetuite-3 - Communication.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-07-21 15:58:08
  @Last Modified time: 2022-07-22 14:12:07
\*----------------------------------------*/

import _config_ from './_config_.js';
import {isRequest} from './Tools.js';
const net = require('net');


export default async (req) => { // Request object
	console.log("call ", req.toString());
    return new Promise((resolve, reject)=>{
		if(!isRequest(req))return reject("Call communication takes only Request Object as parameter ");
		const client = net.createConnection(_config_.connection, () => {
			console.log("send : ", req.toString());
			client.write(req.toString());
		});

		client.on('data', (data) => {
			console.log("received : ", data);
			resolve(data);
			client.end();
		});

		client.on("error", e => {
			reject(`${e && e.message}`);
		});

		client.on('end', () => {
			console.log('CLIENT: I disconnected from the server.');
		});
	});
}