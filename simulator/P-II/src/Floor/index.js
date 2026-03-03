import Face from "./Face.js";
import FloorUI from "./UI.js";
import { Ray } from 'THREE';
import { Vector3 } from './../tools/Vector.js';


export default class Floor{
	constructor({probes, triangles}){
		this.ui = new FloorUI(this);
		this.points = probes;
		this.faces = triangles.map(([p1, p2, p3])=>{
			return new Face(probes[p1], probes[p2], probes[p3])
		});
		this.ray = new Ray(undefined, Vector3.DOWN);
		this.focusFace = this.faces[0];
	}
	get pointToExplore(){
		return [...this.points, ...this.faces.map(({centroid})=>centroid)]
	}
	getOverlapingFace(){
		return this.faces.find(({triangle})=>{
			let az, bz, cz;
			[az, triangle.a.z] = [triangle.a.z, this.ray.origin.z];
			[bz, triangle.b.z] = [triangle.b.z, this.ray.origin.z];
			[cz, triangle.c.z] = [triangle.c.z, this.ray.origin.z];
			let isContains = triangle.containsPoint(this.ray.origin);
			triangle.a.z = az;
			triangle.b.z = bz;
			triangle.c.z = cz;
			return isContains;
		});
	}
	getClosestFace(){
		const [face] = this.faces.reduce((acc, face)=>{
			let cz;
			[cz, face.centroid.z] = [face.centroid.z, this.ray.origin.z];
			const distSq = this.ray.origin.clone().sub(face.centroid).lengthSq()
			let result = [distSq<acc[1]?face:acc[0], Math.min(distSq, acc[1])];
			face.centroid.z = cz;
			return result;
		}, [null, Number.MAX_VALUE]);
		return face;
	}
	toFloorLocation(location){
		this.ray.origin.set(location.x, location.y, location.z);
		this.focusFace = this.getOverlapingFace();
		if(!this.focusFace){
			this.focusFace = this.getClosestFace();
		}
		
		return this.focusFace.getIntersectionPoint(this.ray);
	}
}



