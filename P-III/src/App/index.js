#!/usr/bin/env node
/*----------------------------------------*\
  P-III - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 16:19:31
  @Last Modified time: 2022-09-21 16:23:59
\*----------------------------------------*/

import {$} from './../common/tools.js';
import PillsModel from "./PillsModel.js"

const updateCV = async ()=>{
  const cPills = await $("P-III.cv");
  console.log(cPills);
  //cPills.map(PillsModel.addIfUnknown);
  //updateCV();
}


/*class RobotModel{
  constructor(){
    this.location = [0, 0, 0, 0]
  }
}*/





(() => {
  updateCV();  
})()
