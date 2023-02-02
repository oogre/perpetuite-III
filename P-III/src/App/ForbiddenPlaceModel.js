
import EventHandler from "./../common/EventHandler.js";
import CameraModel from "./CameraModel.js";

import Log from './../common/Log.js';
import {isArray} from './../common/tools.js';
import Rect from './../common/Rect.js';

 class ForbiddenPlaceModel extends EventHandler{
  constructor(){
    super();
    this.forbiddenPlaces = [];
    super.createHandler("newForbiddenPlaceCreated");
  }

  isAuthorizedLocation(point){
  	for(rect of forbiddenPlaces){
  		if(rect.contains(point))
  			return false;
  	}
  	return true;
  }

  insert(forbiddenPlaces=[]){
  	forbiddenPlaces
		.filter(({isPills, box})=> isPills == false && isArray(box))
		.map(({box:[left, top, right, bottom]}) => {
      [left, top] = CameraModel.camToWorld([left, top]);
      [right, bottom] = CameraModel.camToWorld([right, bottom]);
			forbiddenPlaces.push(new Rect(left, top, Math.abs(right-left), Math.abs(bottom-top)));
		});
  }
}


export default (new ForbiddenPlaceModel());