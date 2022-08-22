/*----------------------------------------*\
  perpetuite-III - config.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-19 18:58:35
  @Last Modified time: 2022-08-22 16:14:46
\*----------------------------------------*/
import fs from 'fs-extra';


let rawConf = fs.readFileSync(`${__dirname}/../config/conf.json`, {encoding: "utf8"});

rawConf = rawConf.replace("[PIII_PATH]", process.env.PIII_PATH);

export default JSON.parse(rawConf);
