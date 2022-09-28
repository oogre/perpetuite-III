/*----------------------------------------*\
  P-III - RobotModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-08 11:21:48
  @Last Modified time: 2022-09-28 16:52:18
\*----------------------------------------*/

import _conf_ from './../common/config.js';

const { 
  robot:{
    default:{
      home
    }
  }
} = _conf_.HIGH_LEVEL_API_CONF;

exports.RobotPosition_mm = home;