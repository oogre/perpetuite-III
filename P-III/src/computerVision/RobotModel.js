/*----------------------------------------*\
  P-III - RobotModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-08 11:21:48
  @Last Modified time: 2022-09-08 11:55:41
\*----------------------------------------*/

import _conf_ from './../common/config.js';

const { 
  robot:{
    default:{
      home
    }
  },
  physical : {
    pill_size_mm,
    pill_size_px
  }
} = _conf_.HIGH_LEVEL_API_CONF;

exports.PIX_TO_MM = pill_size_mm / pill_size_px;
exports.RobotPosition_mm = home;