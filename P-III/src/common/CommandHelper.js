/*----------------------------------------*\
  perpetuite-III - CommandHelper.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-22 17:26:47
  @Last Modified time: 2022-08-22 17:33:09
\*----------------------------------------*/

import { Command } from 'commander';
import {stringToBoolean} from "./tools.js";


export default ({name, usage, description})=>{
  const program = new Command();
  program
    .name(name)
    .usage(usage)
    .description(description)
    .option('-d, --debug <debug>', 'output extra debugging', value => stringToBoolean(value) ? "-d" : "", false);
  return program;
}