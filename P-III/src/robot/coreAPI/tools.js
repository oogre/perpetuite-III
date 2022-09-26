/*----------------------------------------*\
  easyPlayer - Tools.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:52:19
  @Last Modified time: 2022-08-19 18:00:52
\*----------------------------------------*/

import Position from './Position.js';
import Request from './Request.js';
export * from './../../common/tools.js';
export const isPosition = (obj) => obj instanceof Position;
export const isRequest = (obj) => obj instanceof Request;