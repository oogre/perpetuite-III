/*----------------------------------------*\
  P-III - DrawModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-21 19:03:46
  @Last Modified time: 2022-11-02 22:27:54
\*----------------------------------------*/

import {$} from './../common/tools.js';
import _conf_ from './../common/config.js';
import Color from './../common/Color.js';
import Vector from './../common/Vector.js';
import PillsModel from './PillsModel.js';
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

const pillRadius = PILL_SIZE / 2;
const pillRadiusSq = pillRadius * pillRadius;

const drawOffsetPath = `${process.env.PIII_PATH}/data/drawOffset`;
const drawPath = `${process.env.PIII_PATH}/data/draw.diff.png`;

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

class DrawModel{
  constructor(){
    this.currentFrame = 0;
    this.offset = STEP_INC;
    this.commands = [];
    this.img;
  }
  async init(){
    if(await fs.exists(drawOffsetPath)){
      this.offset = parseInt(await fs.readFile(drawOffsetPath, "utf8"));
      await $(`P-III.gen`, ""+(this.offset-STEP_INC), {NO_DEBUG : true} );
    }else{
      await $(`P-III.gen`, ""+(this.offset), {NO_DEBUG : true} );
    }
  }

  pointToDraw([x, y]){
    return [Math.round(x*this.img.bitmap.width*_DIAMETER), Math.round(y*this.img.bitmap.height*_DIAMETER)]
  }
  
  pointToColor([x, y]){
    const iPoint = this.pointToDraw([x, y]);
    const color = this.img.getPixelColor(...iPoint);
    return [color >> 24 & 0xFF, color >> 16 & 0xFF, color >> 8 & 0xFF, color >> 0 & 0xFF]
  }

  pointToWorld([x, y]){
    return new Vector(x-RADIUS, y-RADIUS);
  }

  isInCommand(location, c){
    const subCommands = this.commands
      .filter(({color}) => color.equals(c))
      .filter(({point}) => {
        const dSq = point.subtract(location).magSq();
        return dSq < pillRadiusSq;
      });
      console.log(subCommands.length, location, c);
    return subCommands.length > 0;
  }

  async next(flag = false){
    if(this.commands.length > 0){
      return [this.commands.pop(), this.commands.length, this.currentFrame, flag];
    }
    await fs.writeFile(drawOffsetPath, ""+this.offset);
    await $(`P-III.gen`, ""+(this.offset), {NO_DEBUG : true} );
    this.img = await Jimp.read(drawPath);

    this.currentFrame = this.offset;
    this.offset += STEP_INC;
    
    this.commands = pts.reduce((acc, [x, y]) => {
      const [r, g, b, a] = this.pointToColor([x, y])
      if(a != 0){
        acc.push({
          point : this.pointToWorld([x, y]),
          color : new Color(r, g, b)
        })
      }
      return acc;
    }, []).sort((a, b) => 0.5 - Math.random())
    return await this.next(true);
  }

  async getRandomPoint( inTheDrawPart = false ){
    let counter = 0 ; 
    while(true){
      const [x, y] = _.sample(pts);
      const [r, g, b, a] = this.pointToColor([x, y]);
      if(a == 0 || (inTheDrawPart && a == 255)){
        const pt = this.pointToWorld([x, y]);
        const pillJam = PillsModel.getPillsAround(pt.toArray(2), pillRadius * 3);
        if(counter > 5 || pillJam.length == 0){
          return pt;
        }else{
          counter ++;
        }
      }
    }
  }
}

export default (new DrawModel());