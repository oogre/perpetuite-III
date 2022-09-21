/*----------------------------------------*\
  P-III - PillsModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 16:19:31
  @Last Modified time: 2022-09-21 16:23:59
\*----------------------------------------*/

import {promisify, deltaE, lab2rgb} from './../common/tools.js';
import _conf_ from './../common/config.js';
import  { spawn } from "child_process";

const ls = spawn("P-III.cv");

ls.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
});

ls.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
});

ls.on('error', (error) => {
    console.log(`error: ${error.message}`);
});

ls.on("close", code => {
    console.log(`child process exited with code ${code}`);
});

// const { 
//   physical : {
//     pill_colors
//   }
// } = _conf_.HIGH_LEVEL_API_CONF;


// class PillsModel{
//   constructor(){
//     this.pills = [];
//   }
//   update(){

//   }
// }