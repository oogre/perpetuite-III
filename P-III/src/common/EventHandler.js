/*----------------------------------------*\
  P-III - EventHandler.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-23 08:41:52
  @Last Modified time: 2022-09-23 08:56:17
\*----------------------------------------*/
import _ from "underscore";

class EventHandler{
	constructor(){
		this._eventHandlers={}
	}
	createHandler(name){
		if(this._ishandlerExist(name)){
			return;
		}
		this._eventHandlers[name] = []
	}
	on(name, action){
		if(!this._ishandlerExist(name)){
			return;
		}
		if(!_.isFunction(action)){
			return;
		}
		this._eventHandlers[name].push(action);
	}
	trig(name, obj={}){
		if(!this._ishandlerExist(name)){
			return;
		}
		const event = {
			target : {...obj},
			time : (new Date()).getTime(),
			eventName : name
		}
		this._eventHandlers[name].map(handler => handler(event));
	}
	_ishandlerExist(name){
		return this._eventHandlers[name]
	}
}

export default EventHandler;