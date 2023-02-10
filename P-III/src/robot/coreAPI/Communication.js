/*----------------------------------------*\
  client-perpetuite-3 - Communication.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-07-21 15:58:08
  @Last Modified time: 2022-08-19 19:35:26
\*----------------------------------------*/
import net from 'net';
import _conf_ from './../../common/config.js';
import {isRequest, isBuffer} from './tools.js';

const {network:NETWORK_CONF} = _conf_.BASE_API_CONF;

export default async (req) => { // Request object
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