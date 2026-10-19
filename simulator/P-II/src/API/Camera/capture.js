
import Pills from "./../../Pills";
import Area from "./../../Area";
import {Memory_set} from './../Memory';



export const Camera_capture = async (BASE, transport=false)=>{
	BASE.robot.actionDesc = `Camera capture`;
	
	const captureName = `${new Date().getTime()} ${BASE.robot.location4D}.png`;
	const rawData = await BASE.camera.capture(captureName);
	if(transport){
		await BASE.image.transportImageFromSourceToDest();	
	}else{
		await BASE.image.removeImageFromSource();	
	}
	
	const areas = rawData.map(item=>new Area(item.contour, item.avgRGB))
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
	return localPills
}
