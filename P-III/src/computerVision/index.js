#!/usr/bin/env node
/*----------------------------------------*\
  P-III - PillsModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 16:19:31
  @Last Modified time: 2022-09-30 09:12:54
\*----------------------------------------*/

import {deltaE, rgb2lab, $} from './../common/tools.js';
import _conf_ from './../common/config.js';

const { 
  physical : {
    pill_colors
  }
} = _conf_.HIGH_LEVEL_API_CONF;

(async () =>{
    try{
        const res = await $('zx', `${process.env.PIII_PATH}/release/computerVision/P-III.cv.wrapper`);
        const rawPills = JSON.parse(res);
        const cPills = rawPills.map(rPill => {
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