#!/usr/bin/env node
/*----------------------------------------*\
  perpetuite-III - getZforXY.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-22 17:40:34
  @Last Modified time: 2022-08-22 19:35:58
\*----------------------------------------*/


import fs from 'fs-extra';
const math = require("mathjs");
import _conf_ from './../../common/config.js';
import {Call} from './../../common/CoreApiHelper.js';
import Command from './../../common/CommandHelper.js';

const { probe_height:probeHeight, pill_HEIGHT:pillHeight,  } = _conf_.PHYSICAL_CONF;
const { zProbe:{save_path:savePath} } = _conf_.HIGH_LEVEL_API_CONF;
const offset = pillHeight - probeHeight;

Command({
  name : "P-III.getZforXY",
  usage : "[options]",
  description : `
This script is developped for Perpetuité III, an art installation 
made by Felix Luque, Damien Gernay & Vincent Evrard.
This script is used to calculate z altitude of a given 2D point
`,
  })
  .requiredOption('-x, --xpos <xpos>', 'x component of the 2D point to find altitude', parseFloat)
  .requiredOption('-y, --ypos <ypos>', 'y component of the 2D point to find altitude', parseFloat)
  .option('-p, --path <path>', 'destination of measured probes points', savePath)
  .action( async ({debug, xpos, ypos, path}) => {
    const getProbesMeasures = async () => {
      try{
        return await fs.readJson(path);
      }catch(error){
        throw `z probes data file not Found. Run 'P-III.zProbe' to generate file.`;
      } 
    }

    try{
      const probePoints = await getProbesMeasures();
      
      const closestPoints = probePoints.map(([_x, _y, _z]) => {
        let dX = xpos - _x;
        let dY = ypos - _y;
        let dist = Math.sqrt(dX * dX + dY * dY);
        return [ _x, _y, _z, dist ];
      }).sort((a, b) => a[3] - b[3]);
      closestPoints.length = 3;

      const matB = math.matrix(closestPoints.map(([x, y, z]) => [z]))
      const matA = math.matrix(closestPoints.map(([x, y]) => [x, y, 1]))
      const maAt = math.transpose(matA);
      const fit = math.chain(maAt).multiply(matA).inv().multiply(maAt).multiply(matB).done()
      const [[a, b, c]] = math.transpose(fit).valueOf();
      const z = a * xpos + b * ypos + c;
      process.stdout.write(`${xpos} ${ypos} ${z + offset}`); 
    }catch(error){
      console.error(error);
    }
  })
  .parse(process.argv);
