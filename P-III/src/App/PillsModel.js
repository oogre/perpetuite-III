/*----------------------------------------*\
  P-III - PillsModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 19:03:46
  @Last Modified time: 2022-10-03 11:21:13
\*----------------------------------------*/

import _conf_ from './../common/config.js';
import CameraModel from "./CameraModel.js";
import RobotModel from "./RobotModel.js";
import EventHandler from "./../common/EventHandler.js";
import {deltaE} from './../common/tools.js';
import Color from './../common/Color.js';
import Vector from './../common/Vector.js';

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
      }
    });
  }

  getPillByColor(color){
    // console.log("getPillByColor", color.toArray());
    let pill = this.pills.find( pill => !pill.locked && pill.color.equals(color));
    if(!pill){
      pill = this.pills.find( pill => pill.color.equals(color));
    }
    if(!pill){
      pill = this.pills[Math.floor(Math.random()*this.pills.length)];
    }
    return pill;
  }

  findIndex(request){
    return this.pills.findIndex( pill => request(pill));
  }

  async getPillByLocation(x, y){
    const loc = new Vector(x, y);
    const [dist, closest] = this.pills.reduce(([dist, closest], pill)=>{
      const d = pill.center.subtract(loc).magSq();
      if(d < dist) return [d, pill];
      return [dist, closest]
    }, [Number.MAX_VALUE, null])

    // console.log("closest",  Math.sqrt(dist));


    // return pill at location or null
    if(Math.random()<0.5){
      // console.log("getPillByLocation null ");
      return null; 
    }else{
      // console.log("getPillByLocation first");
      return this.pills[0];  
    }
  }

  onPillDiscovered(fnc){
    super.on("PillDiscovered", fnc);
  }
}

const pModel = new PillsModel()

class PillModel{
  constructor(pill){
    this.locked = false;
    this.avgLAB = pill.avgLAB;
    this.label = pill.label;
    this.color = new Color(...pill.color);
    this.center = CameraModel.camToWorld(pill.center);
    this.avgRGB = pill.avgRGB;
    this.accuracy = 10;
  }
  async update(){
    const from = this.center.clone();
    console.log("need precision for", from);
    while(this.accuracy>0.15){
      await RobotModel.go(...this.center.toArray());
      const cPills = await CameraModel.getPillPos();
      const [dist, closest] = cPills.reduce(([dist, closest], cPill)=>{
        const tPill = new PillModel(cPill);
        const d = tPill.center.subtract(this.center).magSq();
        if(d < dist || !closest) return [d, tPill];
        return [dist, closest];
      }, [Number.MAX_VALUE, null]);
      pModel.update(cPills);
      this.accuracy = this.center.subtract(closest.center).length();
      this.center = closest.center;
    }
    const to = this.center.clone();
    console.log("corrected", to);
    console.log("correction", to.subtract(from));
  }

  compare(other){
    const dSpa = this.center.subtract(other.center).magSq() / pill_size_mm_sq;
    const dCol = deltaE(this.avgLAB, other.avgLAB);
    console.log("compare", dSpa, dCol, Math.sqrt(dSpa*dSpa+ dCol*dCol));

  }
}

export default pModel;