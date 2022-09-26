/*----------------------------------------*\
  perpetuite-III - config.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-19 18:58:35
  @Last Modified time: 2022-09-21 19:25:49
\*----------------------------------------*/
import fs from 'fs-extra';
import os from "os";

let rawConf = fs.readFileSync(`${__dirname}/../../config/conf.json`, "utf8");

rawConf = rawConf.split('[PIII_PATH]').join(process.env.PIII_PATH);

const conf = JSON.parse(rawConf)
conf.DEBUG = os.hostname() === "oogre" || os.hostname() === "oogre.local" ;


export default conf;
