
import {Memory_get} from "./../Memory/get.js";

export const Real_get = ({real}, location)=>{
	return Memory_get({memory:real}, location);
}