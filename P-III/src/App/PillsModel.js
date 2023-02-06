/*----------------------------------------*\
  P-III - PillsModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 19:03:46
  @Last Modified time: 2023-02-02 16:02:18
\*----------------------------------------*/

import _conf_ from './../common/config.js';
import CameraModel from "./CameraModel.js";
import DrawModel from "./DrawModel.js";
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
const pillRadius = pill_size_mm / 2;

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
      if(!acc.hasOwnProperty(color))acc[color] = [0,0];
      if(pill.locked)acc[color][1]++;
      acc[color][0]++;
      return acc;
    }, {})).flat(2) ;
  }

  shuffle(){
    this.pills.sort((a, b) => 0.5 - Math.random())
  }

  async getPillByColor(color, cbNotFound = async ()=>{}, depth = 0){
    Log.step(`Looking for ${color.toString()}`)
    let pillId = this.pills.findIndex( pill => !pill.locked && pill.color.equals(color) && !DrawModel.isInCommand(pill.center,pill.color, true));
    
    if(pillId < 0){
      if(depth>10){
        this.pills.filter(({color:c})=>c.equals(color)).forEach(pill=>pill.unlock());
        Log.info(`>>>> depth larger than 10 for ${color.toString()}`);
      }
      await cbNotFound();
      return await this.getPillByColor(color, cbNotFound, depth+1);
    }
    Log.step(`Found ${this.pills[pillId].color.toString()} @ ${this.pills[pillId].center.toString(2)}`)
    return [this.pills[pillId], pillId];
  }
  
  getPillByLocation(x, y, distFact = 1.5){
    const [dist, closest, id] = findPillCloseTo(this.pills, new Vector(x, y));
    if(dist < pill_size_mm * distFact ){
      return [closest, id];
    }
    return [null, -1];
  }


  getPillsAround(location, radius = pillRadius * 1.5){
    location = new Vector(...location)
    const distSq = radius*radius;
    return this.pills.reduce((acc, pill, id) => {
      const dSq = pill.center.subtract(location).magSq();
      if(dSq < distSq){
        acc.push({dSq, pill, id});
      }
      return acc;
    }, [])
    .sort(({dSq:a}, {dSq:b})=> a-b);
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
    this.center = CameraModel.camToWorld(pill.box.slice(0, 2));
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

  // async update(){
  //   while(!_conf_.DEBUG && this.accuracy>pill_dist_accuracy){
  //     await RobotModel.simpleGo(...this.center.toArray(2));
  //     let cPills = await CameraModel.update();
  //     const [dist, closest] = findPillCloseTo(cPills, this.center);
  //     if(closest &&  closest.color.equals(this.color)){
  //       this.accuracy = this.center.subtract(closest.center).length();
  //       this.center = closest.center;
  //     }else{
  //       return false
  //     }
  //   }
  //   return true;
  // }

  async update(){
    do{
      await RobotModel.simpleGo(...this.center.toArray(2));
      let cPills = await CameraModel.update();
      const [dist, closest] = findPillCloseTo(cPills, this.center);
      if(closest &&  closest.color.equals(this.color)){
        this.accuracy = this.center.subtract(closest.center).length();
        this.center = closest.center;
      }else{
        return false
      }
    }while(this.accuracy>pill_dist_accuracy);
    return true;
  }
}

export default pModel;