/*----------------------------------------*\
  P-III - RobotModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 19:03:46
  @Last Modified time: 2022-10-04 11:34:10
\*----------------------------------------*/

import Vector from './../common/Vector.js';
import EventHandler from "./../common/EventHandler.js";
import PillsModel from "./PillsModel.js"
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

  // async findPillByColor(colorToFind){
  //   await wait(500);
  //   // move around until discover an unlocked pill colored as needed 
  //   return PillsModel.getPillByColor(colorToFind);
  // }

  async init(){
    await this.CoreAPI(`HighPower -- 1`);
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
      location.z = constrain(await getDepthForXY(location.x, location.y), limitters.depth.max, location.z);  
    }
    if(!location.equals(this.location)){
      await this.CoreAPI(`Go -- ${location.x} ${location.y} ${location.z} ${this.roll}`);
      this.location = location;
    }
  }
  async grab(){
    await this.gripper(1);
  }
  async drop(){
    await this.gripper(0);
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
    
    const depth = await getDepthForXY(x, y);  
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

    
    const depth = await getDepthForXY(this.location.x, this.location.y);  
    await this.go(this.location.x, this.location.y);
    await this.go(this.location.x, this.location.y, depth);
    
    await this.setSpeed(speed);
    await this.setAcceleration(acc);
    await this.setDecceleration(dcc);
    await this.CoreAPI(`Go -- ${this.location.x} ${this.location.y} ${depth - height} ${this.roll}`);
    await this.CoreAPI(`Gripper -- ${flag}`);
    await this.CoreAPI(`Go -- ${this.location.x} ${this.location.y} ${depth} ${this.roll}`);

    await this.go(this.location.x, this.location.y);
  }

  async go(x, y, z = 0){
    await this.setSpeed();
    await this.setAcceleration();
    await this.setDecceleration();
    return await this.setLocation(new Vector(x, y, z));
  }

  Follow(){
    const {stdin, kill:killFnc, promise} = $pipe('P-III.core.api', 'Follow');
    const send = (data) => {
      console.log(...data);
      stdin.write(`${data.join(' ')}\n`);
    }
    const amp = lerp(1, 90, Math.random());
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
      stopAfter : 2000,
      waitBefore : 0, 
      waitBetween : 50,
      action : async (cnt)=>{},
      ...(_.sample(animations)),
      kill : async () => {
        killFnc();
        await this.CoreAPI(`Go -- ${this.location.toArray(3).join(" ")} ${this.roll}`);
      },
      promise
    };
  }

  async goRandom(){
    let dest = this.location.add(Vector.Random2D().multiply(limitters.radius.value * Math.random()));
    let vh = new Vector(...dest.toArray(2));
    if(vh.length() > limitters.radius.value){
      vh = vh.unit().multiply(limitters.radius.value);
      if(Math.abs(dest.x) > Math.abs(vh.x)){
        dest.x - vh.x * 2
      }
      if(Math.abs(dest.y) > Math.abs(vh.y)){
        dest.y - vh.y * 2
      } 
    }
    this.go(...dest.toArray(2))
  }

  async goHome(){
    console.log("goHome");

    await this.setSpeed();
    await this.setAcceleration();
    await this.setDecceleration();
    await this.setLocation();
    await this.setRoll();
  }


  // async grab([x, y]){
  //   console.log("GOTO @ WORK ALTITUDE");
  //   await $(`P-III.go`, "-x", x+"", "-y", y+"", '-z', "-1000");
  //   console.log("GRAB");
  //   await $(`P-III.grab`, "-f", "1");
  //   console.log("GOBACK TO FLY ALTITUDE");
  //   await $(`P-III.go`, "-x", x+"", "-y", y+"", '-z', "0");
  // }

  // async drop([x, y]){
  //   console.log("GOTO @ WORK ALTITUDE");
  //   await $(`P-III.go`, "-x", x+"", "-y", y+"", '-z', "-1000");
  //   console.log("DROP");
  //   await $(`P-III.grab`, "-f", "0");
  //   console.log("GOBACK TO FLY ALTITUDE");
  //   await $(`P-III.go`, "-x", x+"", "-y", y+"", '-z', "0");
  // }
}

export default (new RobotModel());