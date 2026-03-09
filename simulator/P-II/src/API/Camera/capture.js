
import Pills from "./../../Pills";
import Area from "./../../Area";
import {Memory_set} from './../Memory';


export const Camera_capture = async ({robot, camera, memory, image, forbidden}, transport=false)=>{
	robot.actionDesc = `Camera capture`;
	
	const captureName = `${new Date().getTime()} ${robot.position}.png`;
	const rawData = await camera.capture(captureName);
	if(transport){
		await image.transportImageFromSourceToDest();	
	}else{
		await image.removeImageFromSource();	
	}
	
	const areas = rawData.map(item=>new Area(item.contour, item.avgRGB))
	const localPills = new Pills(memory.conf);

	const [notPillAreas, pillAreas] = areas.reduce((out, area)=>{
		const isPill = localPills.isOnWorkingArea(area) && localPills.isRound(area) && localPills.isLargeLikeAPill(area);
		const id = +isPill;
		out[id].push(area);
		return out;
	}, [[], []]);
	forbidden.addEach(notPillAreas);	

	const pills = pillAreas.map(pillArea=> localPills.fromArea(pillArea));
	const [safePills, unSafePills] = pills.reduce((out, pill)=>{
		const isIntersectForbidden = forbidden.isIntersect(pill);
		const id = +isIntersectForbidden;
		out[id].push(pill);
		return out;
	}, [[], []]);
	
	memory.deleteEach(unSafePills);	
	localPills.addEach(safePills);
	memory.addEach(safePills);
	robot.actionDescPop();
	return localPills
}
