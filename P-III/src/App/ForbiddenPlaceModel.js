
import EventHandler from "./../common/EventHandler.js";
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
		.map(({box:[x, y, w, h]}) => {
			forbiddenPlaces.push(new Rect(x-w/2, y-h/2, w, h));
		});
  }
}


export default (new ForbiddenPlaceModel());