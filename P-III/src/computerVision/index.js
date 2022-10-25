#!/usr/bin/env node
/*----------------------------------------*\
  P-III - PillsModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 16:19:31
  @Last Modified time: 2022-10-18 19:24:00
\*----------------------------------------*/

import {deltaE, rgb2lab, subProcessTrigger} from './../common/tools.js';
import _conf_ from './../common/config.js';
// import {Call} from './../robot/CoreApi/Communication.js';
// import net from 'net';

process.title = "P-III.liveCV.wrapper";

const { 
  physical : {
    pill_colors
  }
} = _conf_.HIGH_LEVEL_API_CONF;

const main = () => {
    const {promise, trig, kill} = subProcessTrigger('python.exe', ['-u', `C:/Users/felix/Desktop/perpetuite-III/P-III/src/computerVision/liveCV.py`]);
    process.stdin.on('data', async (data)=>{
        if(data == "close\n"){
            return kill();
        }
        const res = await trig();
        const cPills = JSON.parse(res).map(rPill => {
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

    });
    return promise;
};

const stop = ()=>{
    console.log("FINISHED");
    process.exit();
}

main()
    .then(stop)
    .catch(stop);
