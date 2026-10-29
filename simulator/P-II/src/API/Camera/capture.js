
import Pills from "./../../Pills";
import Area from "./../../Area";
import {Memory_get} from './../Memory';
import {delay} from './../../tools/helpers.js';
import {AppError, ERR } from './../../tools/Errors.js' ;

export const Camera_capture = async (BASE, [transport=false]=[], depth=0)=>{
	BASE.robot.actionDesc = `Camera capture`;
	transport = transport==1
	const localPills = new Pills(BASE.memory.conf);
	const captureName = `${new Date().getTime()} ${BASE.robot.location4D}.png`;
	const rawData = await BASE.camera.capture(captureName, transport);
	const NOISE_MM2 = 4;                                      // < 4 mm² : bruit, ni pill ni obstacle
	const areas = rawData
		.map(item=>new Area(item.contour, item.avgRGB))
		.filter(a=>a.area >= NOISE_MM2)
		.filter(a=>localPills.isOnWorkingArea(a));

	// Supprime de la mémoire les pillules non locked dans un rayon de 5cm autour de la buse
	// Permet d'éviter les doublons du aux vibration de la cage
	Memory_get(BASE, [...BASE.robot.location2D, 100, 100])
		.filter(({isLock})=>!isLock)
		.map(pill=>{
			BASE.memory.delete(pill);
		})


	

	const [notPillAreas, pillAreas] = areas.reduce((out, area)=>{
		const isPill = localPills.isRound(area) && localPills.isLargeLikeAPill(area);
		const id = +isPill;
		out[id].push(area);
		return out;
	}, [[], []]);

	if(notPillAreas.length>0){
		for(const a of notPillAreas){
			console.log("NOT PILL", {
				loc : a.location.toArray?.() ?? a.location,
				r : Math.hypot(...(a.location.toArray?.() ?? a.location)).toFixed(0),
				circ : a.circularity?.toFixed(2),
				area : a.area?.toFixed(0),
				onArea : localPills.isOnWorkingArea(a),
				round : localPills.isRound(a),
				size : localPills.isLargeLikeAPill(a),
			});
		}
		if(depth>3){
			throw new AppError(ERR.FORBIDDEN, "TOO much forbidden Area");
		}
		await delay(1000);
		return await Camera_capture(BASE, [true], depth+1)
	}
	BASE.forbidden.addEach(notPillAreas);	

	const pills = pillAreas.map(pillArea=> localPills.fromArea(pillArea));
	const [safePills, unSafePills] = pills.reduce((out, pill)=>{
		const isIntersectForbidden = BASE.forbidden.isIntersect(pill);
		const id = +isIntersectForbidden;
		out[id].push(pill);
		return out;
	}, [[], []]);
	
	BASE.memory.deleteEach(unSafePills);	
	localPills.addEach(safePills);
	BASE.memory.addEach(safePills);
	BASE.robot.actionDescPop();
	return localPills;
}
