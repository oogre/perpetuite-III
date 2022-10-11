/*----------------------------------------*\
  P-III - RobotModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 19:03:46
  @Last Modified time: 2022-10-10 18:39:54
\*----------------------------------------*/

import Vector from './../common/Vector.js';
import EventHandler from "./../common/EventHandler.js";
import {getArc, getMechanicalSheep, getJitter, getCross} from './../common/Path.js';
import {$, wait, Call, constrain, $pipe, lerp} from './../common/tools.js';
import _conf_ from './../common/config.js';
import {getDepthForXY, limitters} from './../common/moveLimit.js';
import _ from "underscore";

const D = _conf_.DEBUG ? "-d 1" : "";


class RobotModel extends EventHandler{
  constructor(){
    super();
    this.location = undefined;
    this.roll = Math.random();
    this.speed = undefined;
    this.acc = undefined;
    this.dcc = undefined;
    this.CoreAPI = Call(`P-III.core.api`, {debug:_conf_.DEBUG});
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
    await this.CoreAPI(`Go -- ${this.location.x} ${this.location.y} ${depth - height} ${this.roll}`);
    await this.setSpeed(speed);
    await this.setAcceleration(acc);
    await this.setDecceleration(dcc);
    await this.CoreAPI(`Gripper -- ${flag}`);
    await wait(125);
    await this.CoreAPI(`Go -- ${this.location.x} ${this.location.y} ${depth} ${this.roll}`);
    await this.go(this.location.x, this.location.y);
  
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
      await this.goArc(x, y, z = 0)
    }else{
      await this.setLocation(new Vector(x, y, z));
    }
  }

  async simpleGo(x, y, z = 0){
    await this.setSpeed();
    await this.setAcceleration();
    await this.setDecceleration();
    await this.setLocation(new Vector(x, y, z));
  }

  async danse(){
    
    const coregraphicalMoves = [
      async () => {
        console.log("Cross Anim");
        const {stdin, kill, promise} = $pipe('P-III.core.api', 'Follow');
        let path = getCross();
        let pt;
        for(pt of path){
          stdin.write(`${pt.join(' ')}\n`);
          await wait(500);
        }
        await wait(500);
        kill();
        await wait(500);
      },
      async () => {
        console.log("getMechanicalSheep Anim");
        const {stdin, kill, promise} = $pipe('P-III.core.api', 'Follow');
        let path = getMechanicalSheep();
        let pt;
        for(pt of path){
          stdin.write(`${pt.join(' ')}\n`);
          await wait(360);
        }
        await wait(500);
        path = getJitter(new Vector(...pt));
        for(pt of path){
          stdin.write(`${pt.join(' ')}\n`);
          await wait(150);
        }
        await wait(500);
        kill();
      },
      async () => {
        console.log("jitter Anim");
        const {stdin, kill, promise} = $pipe('P-III.core.api', 'Follow');
        let path = getJitter(this.location);
        for(const pt of path){
          stdin.write(`${pt.join(' ')}\n`);
          await wait(150);
        }
        await wait(500);
        kill();
      },
      async () => {
        console.log("goArc Anim");
        const {stdin, kill, promise} = $pipe('P-III.core.api', 'Follow');
        let old = this.location;
        let count = Math.random() * 10;
        while(count-- > 0){
          const smoothness =  Math.random();
          const stop = new Vector(...(Vector.Random2D().multiply(limitters.radius.value * Math.random()).toArray(2)), lerp(limitters.depth.min, limitters.depth.max, Math.random()));
          const path = getArc({start:old, stop, smooth:lerp(3, 10,smoothness)});
          old = stop.clone();
          for(const pt of path){
            stdin.write(`${pt.join(' ')}\n`);
            await wait(lerp(250, 150, smoothness));
          }
        }
        await wait(500);
        kill();
      }
    ];
    const anim = _.sample(coregraphicalMoves);
    await anim();
    await this.CoreAPI(`Go -- ${this.location.x} ${this.location.y} ${this.location.z} ${this.roll}`);
  }

  async goArc(x, y, z = 0){
    console.log("goArc");
    const smoothness =  Math.random();
    const path = getArc({start:this.location, stop:new Vector(x, y, z), smooth:lerp(3, 10,smoothness)});
    try{
      const {stdin, kill, promise} = $pipe('P-III.core.api', 'Follow');
      for(const pt of path){
        stdin.write(`${pt.join(' ')}\n`);
        await wait(lerp(300, 200, smoothness));
      }
      kill();
      await wait(200);
    }catch(error){
      console.log("CATCHED")
    }

    await this.setLocation(new Vector(x, y, z));
  }

  Follow(){
    const {stdin, kill:killFnc, promise} = $pipe('P-III.core.api', 'Follow');
    const send = (data) => {
      // console.log(...data);
      stdin.write(`${data.join(' ')}\n`);
    }
    const amp = lerp(10, 40, Math.random());
    const animations = [
      {
        waitBetween:230,
        action : async (cnt)=>{
          send([...this.location.toArray(2), this.location.z+lerp(-amp, 0, Math.cos(cnt)*0.5+0.5) ,this.roll])
        }
      },
      {
        waitBetween:230,
        action : async (cnt)=>{
          send([...this.location.toArray(3), lerp(-amp*0.5, amp*0.5, Math.cos(cnt)*0.5+0.5)]);
        }
      },
      {
        waitBetween:666,
        action : async (cnt)=>{
          if(cnt == 1){
            send([...this.location.toArray(2), limitters.depth.min * 0.666, this.roll]);
          }else{
            send([...this.location.toArray(3), this.roll]);
          }
        }
      },
      {
        waitBetween:230,
        action : async (cnt)=>{
          send([
            this.location.x+lerp(-amp*0.5, amp*0.5, Math.random()), 
            this.location.y+lerp(-amp*0.5, amp*0.5, Math.random()), 
            this.location.z+lerp(-amp*0.5, 0, Math.random()), 
            this.roll+lerp(-amp*0.5, amp*0.5, Math.random())
          ]);
        }
      }
    ];

    return {
      stopAfter : 1000,
      waitBefore : 0, 
      waitBetween : 50,
      action : async (cnt)=>{},
      ...(_.sample(animations)),
      kill : async () => {
        killFnc();
        await wait(250);
        await this.CoreAPI(`Go -- ${this.location.toArray(3).join(" ")} ${this.roll}`);
      },
      promise
    };
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