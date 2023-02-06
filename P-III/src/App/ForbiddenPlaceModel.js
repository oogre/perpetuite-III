
import EventHandler from "./../common/EventHandler.js";
import CameraModel from "./CameraModel.js";

import Log from './../common/Log.js';
import {isArray} from './../common/tools.js';
import Rect from './../common/Rect.js';


const MAX_AGE_SECOND = 10 * 60;
class ForbiddenPlaceModel extends EventHandler{
  constructor(){
    super();
    this.forbiddenPlaces = [];
    super.createHandler("newForbiddenPlaceCreated");
  }

  isAuthorizedLocation(point){
    return true;
    
    this.forbiddenPlaces = this.forbiddenPlaces.filter(area => area.getAge() < MAX_AGE_SECOND);
  	for(rect of forbiddenPlaces){
  		if(rect.contains(point))
  			return false;
  	}
  	return true;
  }

  isAlreadyKown(other){
    for(rect of forbiddenPlaces){
      if(rect.intersect(other))return true;
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

class Area {
  constructor(rect){
    this.createdAt = new Date().getTime();
    this.rect = rect;
  }
  getAge(){
    return (new Date().getTime() - this.createdAt)*0.001;
  }
}


export default (new ForbiddenPlaceModel());