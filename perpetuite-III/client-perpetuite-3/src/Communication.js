/*----------------------------------------*\
  client-perpetuite-3 - Communication.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-07-21 15:58:08
  @Last Modified time: 2022-07-25 17:05:11
\*----------------------------------------*/

import _config_ from './_config_.js';
import {isRequest, isBuffer} from './Tools.js';
const net = require('net');


export default async (req) => { // Request object
	return new Promise((resolve, reject)=>{
		if(!isRequest(req))return reject("Call communication takes only Request Object as parameter ");
		const client = net.createConnection(_config_.connection, () => {
			client.write(req.toString());
		});

		client.on('data', (data) => {
			client.end();
			if(isBuffer(data)) data = data.toString('utf8');
			resolve(data);
		});

		client.on("error", e => {
			client.end();
			reject(`${e && e.message}`);

		});

		client.on('end', () => {
			// console.log('CLIENT : closed');
		});
	});
}