/*----------------------------------------*\
  P-III - RobotModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 19:03:46
  @Last Modified time: 2022-10-25 10:11:28
\*----------------------------------------*/


import {getChoreographicMove, getAdjustmentMoves} from './ChoreographicModel.js';
import Vector from './../common/Vector.js';
import {getArc} from './../common/Path.js';
import {wait, Call, constrain, $pipe, lerp} from './../common/tools.js';
import _conf_ from './../common/config.js';
import {getDepthForXY, limitters} from './../common/moveLimit.js';
import _ from "underscore";

import Log from './../common/Log.js';


const D = _conf_.DEBUG ? "-d 1" : "";


class RobotModel{
  constructor(){
    this.location = undefined;
    this.roll = 0;
    this.speed = undefined;
    this.acc = undefined;
    this.dcc = undefined;
    this.CoreAPI = Call(`P-III.core.api`, {debug:_conf_.DEBUG});
  }

  toString(){
    return this.location.toArray()
            .map((p, k)=>{
              return [String.fromCharCode(k + ('x').charCodeAt(0)), p.toFixed(2)]
            })
            .concat(['w', this.roll.toFixed(2)])
            .flat()
            .join('');
  }

  async init(){
    await this.CoreAPI(`HighPower -- 1`);
    await this.CoreAPI(`Gripper -- 1`);
    await this.goHome();
  }

  async setSpeed(speed = limitters.speed.value){
    speed = constrain(limitters.speed.min, limitters.speed.max, speed);
    if(this.speed != speed){
      await this.CoreAPI(`Speed -- ${speed}`);
      this.speed = speed;
    }
  }

  async setAcceleration(acc = limitters.acc.value){
    acc = constrain(limitters.acc.min, limitters.acc.max, acc);
    if(this.acc != acc){
      await this.CoreAPI(`Acc -- ${acc}`);
      this.acc = acc;
    }
  }

  async setDecceleration(dcc = limitters.dcc.value){
    dcc = constrain(limitters.dcc.min, limitters.dcc.max, dcc);
    if(this.dcc != dcc){
      await this.CoreAPI(`Dcc -- ${dcc}`);
      this.dcc = dcc;
    }
  }

  async setRoll(roll = limitters.roll.value){
    roll = constrain(limitters.roll.min, limitters.roll.max, roll);
    if(this.roll != roll){
      await this.CoreAPI(`Go -- ${this.location.x} ${this.location.y} ${this.location.z} ${roll}`);
      this.roll = roll;
    }
  }

  async setLocation(location = new Vector(limitters.x.value, limitters.y.value, limitters.depth.value)){
    const vh = new Vector(location.x, location.y, 0);
    if(vh.length() > limitters.radius.value){
      [location.x, location.y] = vh.unit().multiply(limitters.radius.value).toArray();
    }
    if(location.z != limitters.depth.max){
      location.z = constrain(getDepthForXY(location.x, location.y), limitters.depth.max, location.z);  
    }
    // if(!location.equals(this.location)){
      await this.CoreAPI(`Go -- ${location.x} ${location.y} ${location.z} ${this.roll}`);
      this.location = location;
    // }
  }
  async grab(){
    await this.gripper(0);
    
  }
  async drop(){
    await this.gripper(1);
  }

  async gripperOpen(){
    await this.CoreAPI(`Gripper -- 1`);
  }

  async gripperClose(){
    await this.CoreAPI(`Gripper -- 0`);
  }

  async touch(x, y){
    const { 
      physical : {
        approche :{
          height,
          speed,
          acc,
          dcc
        }
      }
    } = _conf_.HIGH_LEVEL_API_CONF;
    
    const depth = getDepthForXY(x, y);  
    await this.go(x, y);
    await this.go(x, y, depth);
    await this.go(x, y);
  }

  async gripper(flag = 1){
    const { 
      physical : {
        approche :{
          height,
          speed,
          acc,
          dcc
        }
      }
    } = _conf_.HIGH_LEVEL_API_CONF;

    
    const depth = getDepthForXY(this.location.x, this.location.y);  

    await this.CoreAPI(`Go -- ${this.location.x} ${this.location.y} 0 ${this.roll}`);
    await wait(125);
    await this.CoreAPI(`Go -- ${this.location.x} ${this.location.y} ${depth - height + 0.5} ${this.roll}`);
    await this.setSpeed(speed);
    await this.setAcceleration(acc);
    await this.setDecceleration(dcc);
    await this.CoreAPI(`Gripper -- ${flag}`);
    // await wait(125);
    await this.CoreAPI(`Go -- ${this.location.x} ${this.location.y} ${depth} ${this.roll}`);
    await this.simpleGo(this.location.x, this.location.y);
  
  }

  async goRandom(){
    const dest = Vector.Random2D().multiply(limitters.radius.value * Math.random());
    const depth = getDepthForXY(dest.x, dest.y);  
    dest.z = lerp(depth, limitters.depth.max , Math.random());
    const w = lerp(limitters.roll.min , limitters.roll.max , Math.random());
    await this.CoreAPI(`Go -- ${dest.x} ${dest.y} ${dest.z} ${w}`);
  }

  async go(x, y, z = 0){


    await this.setSpeed();
    await this.setAcceleration();
    await this.setDecceleration();

    if(Math.random()<0.1){
     await this.danse();
    }

    if(Math.random()<0.66){
      Log.info("go arc to", new Vector(x, y, z));
      await this.goArc(x, y, z = 0)
    }else{
      Log.info("go straight to", new Vector(x, y, z));
      await this.setLocation(new Vector(x, y, z));
    }
  }

  async simpleGo(x, y, z = 0){
    await this.setSpeed();
    await this.setAcceleration();
    await this.setDecceleration();
    Log.info("simple go to", new Vector(x, y, z));
    await this.setLocation(new Vector(x, y, z));
  }

  async danse(){
    const move = getChoreographicMove();
    await move({
      location : this.location
    });
    await this.CoreAPI(`Go -- ${this.location.x} ${this.location.y} ${this.location.z} ${this.roll}`);
  }

  async goArc(x, y, z = 0){
    const smoothness =  Math.random();
    const path = getArc({start:this.location, stop:new Vector(x, y, z), smooth:lerp(3, 10,smoothness)});
    const {stdin, kill, promise} = $pipe('P-III.core.api', 'Follow');
    for(const pt of path){
      stdin.write(`${pt.join(' ')}\n`);
      await wait(lerp(300, 200, smoothness));
    }
    await wait(200);
    kill();
    await wait(200);
  
    await this.setLocation(new Vector(x, y, z));
  }

  adjustmentMove(){
    return async () => {
      const move = getAdjustmentMoves()
      await move({
        location : this.location,
        roll : this.roll
      });
      await this.CoreAPI(`Go -- ${this.location.toArray(3).join(" ")} ${this.roll}`);
    }
  }

  // async goRandom(){
  //   let dest = this.location.add(Vector.Random2D().multiply(limitters.radius.value * Math.random()));
  //   let vh = new Vector(...dest.toArray(2));
  //   if(vh.length() > limitters.radius.value){
  //     vh = vh.unit().multiply(limitters.radius.value);
  //     if(Math.abs(dest.x) > Math.abs(vh.x)){
  //       dest.x -= vh.x * 2
  //     }
  //     if(Math.abs(dest.y) > Math.abs(vh.y)){
  //       dest.y -= vh.y * 2
  //     } 
  //   }
  //   await this.go(...dest.toArray(2))
  // }

  async goHome(){
    await this.setSpeed();
    await this.setAcceleration();
    await this.setDecceleration();
    await this.setLocation();
    await this.setRoll();
  }
}

export default (new RobotModel());