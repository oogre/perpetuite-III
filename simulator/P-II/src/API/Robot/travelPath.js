import {Robot_go} from "./go.js";
import { Vector4 } from './../../tools/Vector.js';

export const Robot_travelPath = async (BASE, path=[])=>{

	const results = await Promise.allSettled(
		path.map( point => {
			return Robot_go(BASE, new Vector4(...point), {enableDamping:false, curve:false});
		})
	);
	// chaque go() interrompt le précédent par "Move interrupted…" : c'est normal, on l'ignore
	const failure = results.find(r =>
		r.status === "rejected" && r.reason?.message !== "Move interrupted by a new target"
	);
	if(failure) throw failure.reason;

	return true;
}
