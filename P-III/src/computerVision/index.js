#!/usr/bin/env node
/*----------------------------------------*\
  P-III - PillsModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 16:19:31
  @Last Modified time: 2022-10-05 22:17:47
\*----------------------------------------*/

import {deltaE, rgb2lab, $, isBuffer} from './../common/tools.js';
import _conf_ from './../common/config.js';
import {Call} from './../robot/CoreApi/Communication.js';
import net from 'net';


const { 
  physical : {
    pill_colors
  }
} = _conf_.HIGH_LEVEL_API_CONF;




const {network:NETWORK_CONF} = _conf_.BASE_API_CONF;

const Comm = async (req) => { // Request object
    return new Promise((resolve, reject)=>{
        const client = net.createConnection(NETWORK_CONF, () => {
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

(async () =>{
    try{
        const getRawPills = async ()=>{
            if(_conf_.simulator){
                const res = await Comm(`Snap`);
                return JSON.parse(res);
            }else{
                const res = await $('zx', `${process.env.PIII_PATH}/release/computerVision/P-III.cv.wrapper`);
                return JSON.parse(res);
            }
        }

        const tPills = await getRawPills();
        const cPills = tPills.map(rPill => {
            const avgLAB = rgb2lab(rPill.avgRGB);

            const [, color] = pill_colors.reduce((acc, color) => {
                const d = deltaE(avgLAB, color.lab);
                if(!acc)return [d, color];
                if(d>acc[0])return acc;
                return [d, color];
            }, null);
            return {
                avgLAB,
                label : color.name,
                color : color.color,
                ...rPill
            }
        });
        console.log(JSON.stringify(cPills))    
    }catch(error){
        console.log(error)
    }
    
})();