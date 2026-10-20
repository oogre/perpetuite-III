
export const Probes_ground = async ({robot})=>{

	console.log(`Probes ground ${robot.location4D}`);
	robot.actionDesc = `Probes ground ${robot.location4D}`;
	const location = await robot.controller.ZProbe(robot.location4D);	
	
	robot.actionDescPop();
	return location;
}

