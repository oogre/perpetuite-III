/*----------------------------------------*\
  client-perpetuite-3 - Parameter.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-07-22 09:03:30
  @Last Modified time: 2022-08-19 18:54:25
\*----------------------------------------*/
import {stringToBoolean} from './tools.js';

const PARAMETER_TYPE = Object.freeze({
  Float :    Symbol("Float"),
  Int :    Symbol("Int"),
  Bool :    Symbol("Bool"),
  Double :    Symbol("Double"),
  String :    Symbol("String")
});

export default class Parameter{
	constructor(type, value){
	    this.type = type;
	    this.value = value;
	}
	static fromRawType(key, value){
		switch(key){
			case "i": return Parameter.fromInt(value);
			case "f": return Parameter.fromFloat(value);
			case "d": return Parameter.fromDouble(value);
			case "b": return Parameter.fromBool(value);
			case "s": return Parameter.fromString(value);
		}
	}
	static fromInt(value){
      return new Parameter(PARAMETER_TYPE.Int, parseInt(value));
    }
	static fromFloat(value){
      return new Parameter(PARAMETER_TYPE.Float, parseFloat(value.replace(",", ".")));
    }
	static fromDouble(value){
      return new Parameter(PARAMETER_TYPE.Double, parseFloat(value.replace(",", ".")));
    }
	static fromBool(value){
      return new Parameter(PARAMETER_TYPE.Bool, stringToBoolean(value));
    }
	static fromString(value){
      return new Parameter(PARAMETER_TYPE.String, value);
    }
	static fromPosition(value){
      return [
      	new Parameter(PARAMETER_TYPE.Double, value.x),
      	new Parameter(PARAMETER_TYPE.Double, value.y),
      	new Parameter(PARAMETER_TYPE.Double, value.z),
      	new Parameter(PARAMETER_TYPE.Double, value.w),
      ];
    }
    toString(){
    	switch(this.type){
			case PARAMETER_TYPE.Float : 
				return "f"+this.value;
			break;
			case PARAMETER_TYPE.Int : 
				return "i"+this.value;
			break;
			case PARAMETER_TYPE.Bool : 
				return "b"+this.value;
			break;
			case PARAMETER_TYPE.Double : 
				return "d"+this.value;
			break;
			case PARAMETER_TYPE.String : 
				return "s"+this.value;
			break;
	    }
  	}
}