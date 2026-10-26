
import Pills from "./../../Pills";
import Area from "./../../Area";
import {Memory_get} from './../Memory';
import {delay} from './../../tools/helpers.js';


export const Camera_capture = async (BASE, [transport=false]=[])=>{
	BASE.robot.actionDesc = `Camera capture`;
	transport = transport==1
	const captureName = `${new Date().getTime()} ${BASE.robot.location4D}.png`;
	const rawData = await BASE.camera.capture(captureName, transport);
	const areas = rawData.map(item=>new Area(item.contour, item.avgRGB));

	// Supprime de la mémoire les pillules non locked dans un rayon de 5cm autour de la buse
	// Permet d'éviter les doublons du aux vibration de la cage
	Memory_get(BASE, [...BASE.robot.location2D, 100, 100])
		.filter(({isLock})=>!isLock)
		.map(pill=>{
			BASE.memory.delete(pill);
		})


	const localPills = new Pills(BASE.memory.conf);

	const [notPillAreas, pillAreas] = areas.reduce((out, area)=>{
		const isPill = localPills.isOnWorkingArea(area) && localPills.isRound(area) && localPills.isLargeLikeAPill(area);
		const id = +isPill;
		out[id].push(area);
		return out;
	}, [[], []]);
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
