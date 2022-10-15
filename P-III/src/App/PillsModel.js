/*----------------------------------------*\
  P-III - PillsModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 19:03:46
  @Last Modified time: 2022-10-14 09:06:29
\*----------------------------------------*/

import _conf_ from './../common/config.js';
import CameraModel from "./CameraModel.js";
import RobotModel from "./RobotModel.js";
import EventHandler from "./../common/EventHandler.js";
import {deltaE} from './../common/tools.js';
import Color from './../common/Color.js';
import Vector from './../common/Vector.js';
import Log from './../common/Log.js';

const { 
  physical : {
    pill_size_mm,
    pill_dist_accuracy
  },
  robot : {
    default : {
      radius
    }
  }
} = _conf_.HIGH_LEVEL_API_CONF;

const pill_size_mm_sq = pill_size_mm * pill_size_mm;

const findPillCloseTo = (pillArray, location) => {
  const [d, closest, id] = pillArray.reduce(([dist, closest, id], pill, pillId)=>{
    const d = pill.center.subtract(location).magSq();
    if(d < dist || !closest) return [d, pill, pillId];
    return [dist, closest, id];
  }, [Number.MAX_VALUE, null, -1]);
  return [Math.sqrt(d), closest, id];
}



class PillsModel extends EventHandler{
  constructor(){
    super();
    this.pills = [];
    super.createHandler("PillDiscovered");
  }

  update(cPills=[]/* box in px */){
    cPills.map(cPill => {
      const pillId = this.pills.findIndex( pill => pill.center.subtract(cPill.center).magSq() < pill_size_mm_sq);
      if(pillId < 0 && cPill.center.length() < radius){
        this.pills.push(cPill);
        super.trig("PillDiscovered", cPill);
      }
    });
    return cPills;
  }

  info(){
    return  Object.entries(this.pills.reduce((acc, pill)=>{
      const color = pill.color.toString();
      if(!acc.hasOwnProperty(color))acc[color] = 0;
      acc[color]++;
      return acc;
    }, {})).flat() ;
  }

  shuffle(){
    this.pills.sort((a, b) => 0.5 - Math.random())
  }

  async getPillByColor(color, cbNotFound = async ()=>{}, depth = 0){
    Log.info(`Looking for ${color.toString()}`)
    let pillId = this.pills.findIndex( pill => !pill.locked && pill.color.equals(color));
    if(pillId < 0){
      if(depth>10){
        this.pills.filter(({color:c})=>c.equals(color)).forEach(pill=>pill.unlock());
        Log.info(`>>>> depth larger than 10 for ${color.toString()}`);
      }
      await cbNotFound();
      return await this.getPillByColor(color, cbNotFound, depth+1);
    }
    Log.info(`Found ${this.pills[pillId].color.toString()} @ ${this.pills[pillId].center.toString(2)}`)
    return [this.pills[pillId], pillId];
  }
  
  getPillByLocation(x, y, distFact = 1.5){
    const [dist, closest, id] = findPillCloseTo(this.pills, new Vector(x, y));
    if(dist < pill_size_mm * distFact ){
      return [closest, id];
    }
    return [null, -1];
  }

  onPillDiscovered(fnc){
    super.on("PillDiscovered", fnc);
  }

  insert(cPills){
    return this.update(
      cPills
        .map(pill => new PillModel(pill))
        .filter(pill => pill.valid)
    );
  }
}

const pModel = new PillsModel()

class PillModel{
  constructor(pill){
    this.locked = false;
    this.avgLAB = pill.avgLAB;
    this.color = new Color(...pill.color);
    this.center = CameraModel.camToWorld(pill.center);
    this.valid = this.center.length() <= radius;
    this.avgRGB = pill.avgRGB;
    this.accuracy = 10;
  }
  
  lock(){
    this.locked = true;
  }

  unlock(){
    this.locked = false;
    this.accuracy *= 2;
  }

  async update(){
    while(!_conf_.DEBUG && this.accuracy>pill_dist_accuracy){
      await RobotModel.simpleGo(...this.center.toArray(2));
      let cPills = await CameraModel.update();
      const [dist, closest] = findPillCloseTo(cPills, this.center);
      if(closest &&  closest.color.equals(this.color)){
        this.accuracy = this.center.subtract(closest.center).length();
        this.center = closest.center;
      }else{
        return false
      }
    }
    return true;
  }

  // compare(other){
  //   const dSpa = this.center.subtract(other.center).magSq() / pill_size_mm_sq;
  //   const dCol = deltaE(this.avgLAB, other.avgLAB);
  //   Log.info("compare", dSpa, dCol, Math.sqrt(dSpa*dSpa+ dCol*dCol));

  // }
}

export default pModel;