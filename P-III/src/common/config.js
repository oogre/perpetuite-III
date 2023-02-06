/*----------------------------------------*\
  perpetuite-III - config.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-19 18:58:35
  @Last Modified time: 2022-10-05 19:41:50
\*----------------------------------------*/
import fs from 'fs-extra';
import os from "os";

let rawConf = fs.readFileSync(`${__dirname}/../../config/conf.json`, "utf8");

rawConf = rawConf.split('[PIII_PATH]').join(process.env.PIII_PATH);

const conf = JSON.parse(rawConf)
conf.DEBUG = false;
if( os.hostname() === "oogre" || os.hostname() === "oogre.local"){
  conf.BASE_API_CONF.network.host = "oogre.local";
  conf.simulator = true;
}else{
  const content = fs.readFileSync(`${__dirname}/../../data/parent_IP.conf`, "utf8");
  const [HOST_IP] = content.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/);
  conf.BASE_API_CONF.network.host = HOST_IP;
}


conf.dateFormat = new Intl.DateTimeFormat('fr', { year : "2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit",  day:"2-digit", month: '2-digit' });


export default conf;
