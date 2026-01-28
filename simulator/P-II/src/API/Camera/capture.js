
import Pills from "./../../Pills";

export const Camera_capture = async ({robot, camera, memory, image, forbidden}, hasToSaveInMemory = false)=>{
	const captureName = `${robot.position} ${new Date().getTime()}.png`;
	const localPills = new Pills(memory.conf);
	const rawData = await camera.capture(captureName);

	await image.transportImageFromSourceToDest();	
	
	const data = rawData.map(data=>localPills.createPill(data));
	const [notPills, pills] = data.reduce((acc, item)=>{
		const isPill = localPills.isLargeLikeAPill(item);
		const id = +isPill;
		acc[id].push(item);
		return acc
	}, [[], []]);

	forbidden.addEach(notPills);	

	// if(result.some(r=>r)){
	// 	robot.hoverDangerousPlace = forbidden.isHover(robot._location);
	// }
	
	localPills.addEach(pills);
	if(hasToSaveInMemory){
		memory.addEach(data);	
	}
	return localPills;
}
