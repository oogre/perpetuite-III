
import Pills from "./../../Pills";
import {Memory_set} from './../Memory';

export const Camera_capture = async ({robot, camera, memory, image, forbidden})=>{
	const captureName = `${robot.position} ${new Date().getTime()}.png`;
	const rawData = await camera.capture(captureName);
	await image.transportImageFromSourceToDest();	
	return await Memory_set({robot, memory, forbidden}, rawData);
}
