/*----------------------------------------*\
  perpetuite-III - config.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-19 18:58:35
  @Last Modified time: 2022-08-30 13:27:48
\*----------------------------------------*/
import fs from 'fs-extra';


let rawConf = fs.readFileSync(`${__dirname}/../../config/conf.json`, "utf8");

rawConf = rawConf.split('[PIII_PATH]').join(process.env.PIII_PATH);




export default JSON.parse(rawConf);
