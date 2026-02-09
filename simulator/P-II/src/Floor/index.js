import Face from "./Face.js";
import FloorUI from "./UI.js";
import { Vector3 } from './../tools/Vector3.js';

export default class Floor{
	constructor({probes, triangles}){
		this.ui = new FloorUI(this);
		this.points = probes;
		this.faces = triangles.map(([p1, p2, p3])=>{
			return new Face(probes[p1], probes[p2], probes[p3])
		});
		this.focusFace = this.faces[0];
	}
	get pointToExplore(){
		return [...this.points, ...this.faces.map(({centroid})=>centroid)]
	}
	getOverlapingFace(location){
		return this.faces.filter(face=>{
			return location.x > face.box[0] && 
				location.x < face.box[2] && 
				location.y > face.box[1] && 
				location.y < face.box[3];
		}).find(face=>{
			const AC = Vector3.sub(face.points[2], face.points[0]);
			const AB = Vector3.sub(face.points[1], face.points[0]);
			const AP = Vector3.sub(location, face.points[0]);
			AC.z = 0;
			AB.z = 0;
			AP.z = 0;
			const dot00 = AC.dot(AC);
			const dot01 = AC.dot(AB);
			const dot02 = AC.dot(AP);
			const dot11 = AB.dot(AB);
			const dot12 = AB.dot(AP);
			const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
			const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
			const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
			return (u >= 0) && (v >= 0) && (u + v <= 1);
		});
	}
	getClosestFace(location){
		const [face] = this.faces.reduce((acc, face)=>{
			const distSq = location.distToSqrd(face.centroid)
			return [distSq<acc[1]?face:acc[0], Math.min(distSq, acc[1])];
		}, [null, Number.MAX_VALUE]);
		return face;
	}
	toFloorLocation(location){
		let face = this.getOverlapingFace(location);
		if(!face){
			face = this.getClosestFace(location);
			this.focusFace = face;
			return face.getIntersectionPointByInterpolation(location);
		}
		this.focusFace = face;
		return face.getIntersectionPoint(location);
	}
}



