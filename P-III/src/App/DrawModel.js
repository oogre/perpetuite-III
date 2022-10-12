/*----------------------------------------*\
  P-III - DrawModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 19:03:46
  @Last Modified time: 2022-10-05 11:23:54
\*----------------------------------------*/

import EventHandler from "./../common/EventHandler.js";
import {$, wait} from './../common/tools.js';
import _conf_ from './../common/config.js';
import Color from './../common/Color.js';
import Vector from './../common/Vector.js';
import Jimp from 'jimp';
import _ from 'underscore';
import fs from 'fs-extra';

const { 
  step_incrementation:STEP_INC,
  density : DENSITY
} = _conf_.DRAW_CONF;

const { 
  physical :{
    pill_size_mm:PILL_SIZE
  },
  robot : {
    default : {
      radius:RADIUS
    }
  }
} = _conf_.HIGH_LEVEL_API_CONF;

const drawOffsetPath = `${process.env.PIII_PATH}/data/drawOffset`;

const DIAMETER = RADIUS * 2;
const _DIAMETER = 1.0/DIAMETER;

const hCount = Math.round(DENSITY * DIAMETER * 1);
const vCount = Math.round(DENSITY * DIAMETER * 1.33);

const offsetX = (DIAMETER-PILL_SIZE) / hCount;
const offsetY = (DIAMETER-PILL_SIZE) / vCount;

const isValid = ([x, y]) => x * x + y * y < RADIUS * RADIUS;
const getPosition = ([x, y]) => [
  ( x + ( y%2 == 0 ? 0.5 : 0) ) * offsetX - RADIUS + PILL_SIZE, 
  y * offsetY - RADIUS + PILL_SIZE
];

const pts = (new Array(vCount * hCount)).fill(0)
.map((_, k) => getPosition([ k % hCount, Math.floor(k / hCount) ]))
.filter(point => isValid(point))
.map(point=>point.map(c=>c+RADIUS));






new Jimp(DIAMETER, DIAMETER, (err, image) => {
  const rSize = 9; 
  const pt = (new Array(rSize * rSize)).fill(0).map((_, k)=> [(k%rSize) - rSize/2, Math.floor(k / rSize)-rSize/2])
  pts.map(([x, y])=> {
    pt.map(([offX, offY]) => image.setPixelColor(0x000000FF, Math.floor(x + offX), Math.floor(y + offY)))
  })
  image.write(`${process.env.PIII_PATH}/data/grid.png`)
});




class DrawModel extends EventHandler{
  constructor(){
    super();
    this.currentFrame = 0;
    this.offset = STEP_INC;
    this.commands = [];
  }
  async init(){
    if(await fs.exists(drawOffsetPath)){
      this.offset = parseInt(await fs.readFile(drawOffsetPath, "utf8"));
      await $(`P-III.gen`, ""+(this.offset-STEP_INC), {NO_DEBUG : true} );
    }else{
      await $(`P-III.gen`, ""+(this.offset), {NO_DEBUG : true} );
    }
  }
  
  async next(){
    if(this.commands.length > 0){
      return [this.commands.pop(), this.commands.length, this.currentFrame];
    }
    await fs.writeFile(drawOffsetPath, ""+this.offset);
    await $(`P-III.gen`, ""+(this.offset), {NO_DEBUG : true} );
    this.currentFrame = this.offset;
    this.offset += STEP_INC;
    
    const img = await Jimp.read(`${process.env.PIII_PATH}/data/draw.diff.png`);
    this.commands = pts.reduce((acc, [x, y]) => {
      const iPoint = [Math.round(x*img.bitmap.width*_DIAMETER), Math.round(y*img.bitmap.height*_DIAMETER)];
      const color = img.getPixelColor(...iPoint);
      const [r, g, b, a] = [color >> 24 & 0xFF, color >> 16 & 0xFF, color >> 8 & 0xFF, color >> 0 & 0xFF]
      if(a != 0){
        acc.push({
          point : new Vector(x-RADIUS, y-RADIUS),
          color : new Color(r, g, b)
        })
      }
      return acc;
    }, []).sort((a, b) => 0.5 - Math.random())
    return await this.next();
  }

  async getRandomPoint(){
    const img = await Jimp.read(`${process.env.PIII_PATH}/data/draw.diff.png`);
    while(true){
      const [x, y] = _.sample(pts);
      const iPoint = [Math.round(x*img.bitmap.width*_DIAMETER), Math.round(y*img.bitmap.height*_DIAMETER)];
      const color = img.getPixelColor(...iPoint);
      const [r, g, b, a] = [color >> 24 & 0xFF, color >> 16 & 0xFF, color >> 8 & 0xFF, color >> 0 & 0xFF]
      if(a == 0){
        return new Vector(x-RADIUS, y-RADIUS);
      }
    }
  }
}

export default (new DrawModel());