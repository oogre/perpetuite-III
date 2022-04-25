/*----------------------------------------*\
  easyPlayer - Tools.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:52:19
  @Last Modified time: 2022-04-05 12:24:12
\*----------------------------------------*/

export const isFnc = (fnc) => fnc instanceof Function;


export const uniqId = () => Math.floor(Math.random() * Date.now()).toString(16);