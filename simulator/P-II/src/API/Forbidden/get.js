
export const Forbidden_get = ({forbidden}, location)=>{
	/*
	if(memory.isPill(location)){
		return memory.set.get(location);
	}
	else if(isLocation(location)){
		return memory.getByLocation(new Vector3(...location));
	}
	if(isBox(location)){
		return memory.getByBox(location);
	}
	if(isString(...location)){
		return memory.getByColorName(...location);
	}
	*/
	return forbidden.areas.map(area=>{
		return area.toString()
	}).join("\n")
}

