import { Vector2 } from './../../tools/Vector.js';


export const Command_getPath = async (BASE)=>{
	const radius = BASE.robot.conf.radius;
	const data = BASE.cmd.patterGen.pathExtractor.getPaths();
	const midPoint = new Vector2(data.width/2, data.height/2);
	const scale = new Vector2(2 * radius / data.width, 2 * radius / data.height);
	const paths = Object.keys(data.paths).map(c=>{
				return data.paths[c].map(path=>{
					return path.map(([x, y]) => new Vector2(x, y))
							.map(point => point.sub(midPoint).multiply(scale) )
							.filter(point => {
								return point.lengthSq() <= radius * radius;
							})
							.map(point => point.toArray());
				}).filter(({length})=>length>4)
			}).flatten();
	if(paths.length==0){
		return [];
	}
	return paths[Math.floor(Math.random() * paths.length)];
}

