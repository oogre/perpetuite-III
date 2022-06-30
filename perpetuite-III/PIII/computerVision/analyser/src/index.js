#!/usr/bin/env node

/*----------------------------------------*\
  sketch_220222a - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-07 17:36:21
  @Last Modified time: 2022-04-11 16:00:02
\*----------------------------------------*/
import { program } from 'commander';
const cv = require('opencv4nodejs');
const Path = require('path');

process.title = "pIII.computerVision";

program
  .option('-i, --input <file>')
  .action(async ({input}) => {
    try{
      const pils = await imageToPils(Path.resolve(input))
      console.log(
        JSON.stringify(pils)
      );
    }catch(error){
      console.log(error);
    }
  });

const imageToPils = async (filePath) => {
  const mat = await cv.imreadAsync(filePath);
  const matGray = mat.bgrToGray().threshold(127, 255, 0);
  return matGray.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
                    .map(contour => {
                      const {x, y, width:w, height:h } = contour.boundingRect();
                      return [x, y, w, h];
                    });
}


program.parse(process.argv);