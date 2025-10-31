
import _ from "underscore";
import PillsModel from "./PillsModel.js";
import RobotModel from "./RobotModel.js";
import DrawModel from "./DrawModel.js";
import {wait} from "./../common/tools.js";
import CameraModel from "./CameraModel.js";
import _conf_ from "./../common/config.js";
import Vector from "./../common/Vector.js";
import Color from "./../common/Color.js";
import Log from './../common/Log.js';
import {getOffsetFor} from './../common/Offset.js';
process.title = "P-III.APP";

const { 
  physical : {
    pill_size_mm,
    pill_colors,
    pill_dist_accuracy
  },
  robot : {
    default : {
      radius
    }
  }
} = _conf_.HIGH_LEVEL_API_CONF;

const pillRadius = pill_size_mm / 2;
const timeAtStart = new Date();
let now;

const colors = pill_colors.map(({name})=>name);
const stats = {
  success : 0,
  fail : 0,
};




const update = async () => {
  PillsModel.shuffle();
  const [request, len, frameID, newFrame] = await DrawModel.next();

  now = new Date();
  Log.title(`Run since ${_conf_.dateFormat.format(timeAtStart)}`);
  Log.title(`Now ${_conf_.dateFormat.format(now)}`);
  Log.title(`Current frame : ${frameID}`);
  Log.title(`Still : ${len} move`);
  Log.title(`Success VS Fail : ${stats.success}/${stats.fail}`);
  Log.title(`Known pills : ${PillsModel.info()}`);
  Log.command(`Put ${request.color.toString()} @ ${request.point.toString(2)}`);
  
  console.log(request.point);
}


const errorHandler = (error) => {
  // Log.log(error);
  // Log.log(error?.stack);

  CameraModel.destructor();
  if(_.isArray(error)){
    const [id, label] = error;
    process.stderr.write(`${label}`);
    process.exit(1);
  }
  process.stderr.write(error, error?.stack);
  process.exit(1);
}

(async () => {
  Log.date("Run @ ");
  await DrawModel.init();
  await RobotModel.init();
  while(true){
    await update(true);
  }
})()
.catch(errorHandler);


process.on('exit',() => {
  Log.date("Exit @ ");
  Log.end();
})

process.on("unhandledRejection", errorHandler);

