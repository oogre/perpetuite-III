import {isBool} from "./validators.js";

export const getRandomItem = (arr) => {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
}

export const delay = (time)=>{
  return new Promise(res=>{
    setTimeout(()=>res(), time)
  });
}
export const pythagor = (...d) => {
  return Math.sqrt(
    d.reduce((acc, v)=>{
      acc += v*v;
      return acc;
    }, 0)
  );
}

export const nTry = async (maxTry, action)=>{
  let result = false;
  let counter = 0;
  do{
    result = await action(counter++);  
  }while(!result && counter < maxTry);
  return result;
}

export const spacer = (count=0, char="-")=>{
  return new Array(count).fill(char).join("");
}

export const spacedLog = (count=0, char="-")=>{
  return (...data)=>console.log(`${spacer(count, char)}`, ...data);
}

export const stringToBoolean = (n) => {
  if(isBool(n))return n;
  switch(n?.toLowerCase()?.trim()){
    case "true":
    case "1":
    case "yes":
      return true;
    case "false":
    case "0":
    case "no":
    case null:
    case undefined:
      return false;
    default :
      JSON.parse(n);
  }
}