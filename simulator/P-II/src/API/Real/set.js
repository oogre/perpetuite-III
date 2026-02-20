
import {Real_get} from './get.js';
import PillModel from "./../../Pills/PillModel";


export const Real_set = async ({real}, [color, x, y])=>{
	const toRemove = await Real_get({real}, [x, y]);
	if(toRemove!==undefined){
		return real.delete(toRemove);
	}
	const pill = real.createPill({
		avgRGB:(new PillModel.Color(color)).rgb,
		box :[ x, y ]
	});
	return real.add(pill);
}

export const blue = (BASE, [x, y])=>{
	return Real_set(BASE, ['blue', x, y])
}
export const red = (BASE, [x, y])=>{
	return Real_set(BASE, ['red', x, y])
}
export const yellow = (BASE, [x, y])=>{
	return Real_set(BASE, ['yellow', x, y])
}
