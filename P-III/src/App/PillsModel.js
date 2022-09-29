/*----------------------------------------*\
  P-III - PillsModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 19:03:46
  @Last Modified time: 2022-09-29 12:00:59
\*----------------------------------------*/

import _conf_ from './../common/config.js';
import CameraModel from "./CameraModel.js";
import EventHandler from "./../common/EventHandler.js";
import {deltaE} from './../common/tools.js';

const { 
  physical : {
    pill_size_mm
  }
} = _conf_.HIGH_LEVEL_API_CONF;

const pill_size_mm_sq = pill_size_mm * pill_size_mm;

class PillsModel extends EventHandler{
  constructor(){
    super();
    this.pills = [];
    super.createHandler("PillDiscovered");
  }

  update(cPills=[]/* box in px */){
    cPills.map(cPill => {
      const tPill = new PillModel(cPill);
      const pillId = this.findIndex( pill => pill.center.subtract(tPill.center).magSq() < pill_size_mm_sq);
      if(pillId < 0){
        this.pills.push(tPill);
        super.trig("PillDiscovered", tPill);
      }else{
        this.pills[pillId].update(tPill);
      }
    });
  }

  getPillByColor(color){
    return this.pills.find((pill)=> !pill.locked && pill.label == color);
  }

  findIndex(request){
    return this.pills.findIndex((pill)=> request(pill));
  }

  onPillDiscovered(fnc){
    super.on("PillDiscovered", fnc);
  }
}


class PillModel{
  constructor(pill){
    this.locked = false;
    this.avgLAB = pill.avgLAB;
    this.label = pill.label;
    this.center = CameraModel.camToWorld(pill.center);
    this.avgRGB = pill.avgRGB;
  }
  update(p){

  }

  compare(other){
    const dSpa = this.center.subtract(other.center).magSq() / pill_size_mm_sq;
    const dCol = deltaE(this.avgLAB, other.avgLAB);
    console.log("compare", dSpa, dCol, Math.sqrt(dSpa*dSpa+ dCol*dCol));

  }
}

export default (new PillsModel());