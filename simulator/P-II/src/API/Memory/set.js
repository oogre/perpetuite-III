import Pills from "./../../Pills";
import { Vector3 } from 'vecteur/3d';


export const Memory_set = ({memory, forbidden}, rawData)=>{

	
	const localPills = new Pills(memory.conf);
	const data = rawData.map(data=>localPills.createPill(data));
	const [notPills, pills] = data.reduce((acc, item)=>{
		const isPill = localPills.isLargeLikeAPill(item);


		const id = +isPill;
		acc[id].push(item);
		return acc
	}, [[], []]);



	forbidden.addEach(notPills);	
	const safePills = pills.filter(pill=>!forbidden.isIntersect(pill))
	const unSafePills = pills.filter(pill=>forbidden.isIntersect(pill))
	memory.deleteEach(unSafePills);	
	localPills.addEach(safePills);
	memory.addEach(safePills);
	return localPills;
}
