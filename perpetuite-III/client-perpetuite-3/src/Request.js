import {isNumber, isInteger, isBool, isPosition, isArray} from './Tools.js';
import Parameter from './Parameter.js';
import ErrorDict from './ErrorDictionnary.js';
const REQUEST_TYPE = Object.freeze({
  Nothing :    Symbol("Nothing"),
  ok :         Symbol("ok"),
  ko :         Symbol("ko"),
  HighPower :  Symbol("HighPower"),    // param ON-OFF
  Gripper :    Symbol("Gripper"),      // param ON-OFF
  Speed :      Symbol("Speed"),        // param int[0-100]
  Acc :        Symbol("Acc"),          // param int[0-100]
  Go :         Symbol("Go"),           // param x y z w
  Follow :     Symbol("Follow"),       // param x1 y1 z1 w1 x2 y2 z2 w2 ... xn yn zn wn
  ZProbe :     Symbol("ZProbe"),    // param x y -- replay z
  GetPosition: Symbol("GetPosition"),  // param /
  GetSpeed :   Symbol("GetSpeed"),     // param /
  GetAcc :     Symbol("GetAcc"),       // param /
  Reset :      Symbol("Reset"),       // param / 
  Stop :       Symbol("Stop"),       // param / 
});


export default class Request{
  constructor(type, parameters=[]){
    this.type = type;
    this.parameters = parameters;
  }
  isSuccess(){
    return this.type == REQUEST_TYPE.ok;
  }
  isFail(){
    return this.type == REQUEST_TYPE.ko;
  }
  getErrorMessage(){
    return ErrorDict[""+this.parameters[0]?.value] || (`${ErrorDict.unknown} : ${this.parameters[0]?.value}`);
  }
  static fromRaw(rawData){// true for HighPower false for LowPower
      let splitedData = rawData.split(" ");
      if(splitedData.length <=0)throw Error(`Raw Data to build a request is wrong formatted`);
      const [typeName, typeValue] = Object.entries(REQUEST_TYPE).find(([key, value]) => value.description == splitedData[0]);
      const length = parseInt(splitedData[1]);
      const parameters = [];
      for(let i = 0 ; i < length ; i++){
        parameters.push(Parameter.fromRawType(splitedData[i+2].charAt(0), splitedData[i+2].substr(1)));
      }
      return new Request(typeValue, parameters);
   }
   static Nothing(){// true for HighPower false for LowPower
      return new Request(REQUEST_TYPE.Nothing);
   }
   static HighPower(bool){// true for HighPower false for LowPower
      if (!isBool(bool))
         throw Error(`HighPower Request Constructor takes one argument and it has to be boolean value (true > High and false > Low)`);
      return new Request(REQUEST_TYPE.HighPower, [Parameter.fromBool(bool)]);
   }
   static Gripper(bool){// true for Grab false for Release
      if (!isBool(bool))
         throw Error(`Gripper Request Constructor takes one argument and it has to be boolean value (true > Grab and false > Release)`);
      return new Request(REQUEST_TYPE.Gripper, [Parameter.fromBool(bool)]);
   }
   static Speed(int){// [0-100] [slowest-fastest]
      if (!isInteger(int))
         throw Error(`Speed Request Constructor takes one argument and it has to be an integer value (0 is the slowest speed 100 is the fastest)`);
      if (int<0 || int > 100)
         throw Error(`Speed Request Constructor argument must be int the interval [0 - 100]`);
      return new Request(REQUEST_TYPE.Speed, [Parameter.fromInt(int)]);
   }
   static Acc(int){// [0-100] [slowest-fastest]
      if (!isInteger(int))
         throw Error(`Acc Request Constructor takes one argument and it has to be an integer value (0 is the low acceleration speed 100 is high acceleration)`);
      if (int<0 || int > 100)
         throw Error(`Acc Request Constructor argument must be int the interval [0 - 100]`);
      return new Request(REQUEST_TYPE.Acc, [Parameter.fromInt(int)]);
   }
   static Go(position){
      if (!isPosition(position))
         throw Error(`Go Request Constructor takes a argument and it has to be a Postion value`);
      return new Request(REQUEST_TYPE.Go, [...Parameter.fromPosition(position)]);
   }

   static ZProbe(position){
      if (!isPosition(position))
         throw Error(`ZProbe Request Constructor takes a argument and it has to be a Postion value`);
      return new Request(REQUEST_TYPE.ZProbe, [...Parameter.fromPosition(position)]);
   
   }

   static Reset(){
      return new Request(REQUEST_TYPE.Reset);
   
   }

   static Stop(){
      return new Request(REQUEST_TYPE.Stop);
   }

   static Follow(positions){
    if (!isPosition(positions))
         throw Error(`Go Request Constructor takes a argument and it has to be a Postion value`);
      return new Request(REQUEST_TYPE.Follow, [...Parameter.fromPosition(positions)]);
      // if(!isArray(positions))
      //   throw Error(`Follow Request Constructor takes one argument and it has to be an array`);
      // positions.forEach(position => {
      //    if (!isPosition(position))
      //       throw Error(`Follow Request Constructor takes one argument and it has to be an array of Postion value`);
      // });
      // return new Request(REQUEST_TYPE.Follow, positions.map(position=>Parameter.fromPosition(position)).flat());
   }
   toString(){
      return `${this.type.description} ${this.parameters.length} ${this.parameters.map(parameter=>parameter.toString()).join(" ")}`
   }
}