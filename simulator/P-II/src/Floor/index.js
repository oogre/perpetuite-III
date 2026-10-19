import fs from 'fs-extra';
import Face from "./Face.js";
import FloorUI from "./UI.js";
import { Ray } from 'THREE';
import { Vector3 } from './../tools/Vector.js';

export default class Floor{
	constructor(conf){
		this.conf = conf;
		if(!fs.pathExistsSync(this.conf.probePointsPath)){
			throw new Error("Floor probe points not configured!")
		}

		const rawPoints = JSON.parse(fs.readFileSync(this.conf.probePointsPath,"utf8"));
		this.points = rawPoints.map(([x, y])=>new Vector3(x, y, 0));
	
		if(!fs.pathExistsSync(this.conf.zValuesPath)){
			throw new Error("Floor probe z values not configured!")
		}

		const zValues = JSON.parse(fs.readFileSync(this.conf.zValuesPath,"utf8"));
		if(this.points.length != zValues.length){
			throw new MyError("Floor probe z values wrong configured!")
		}

		this.points = this.points.map((point, id)=> {
			point.z = zValues[id];
			return point;
		});

		this.ui = new FloorUI(this);
		
		this.faces = conf.triangles.map(([p1, p2, p3])=>{
			return new Face(this.points[p1], this.points[p2], this.points[p3])
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
		this.ray.origin.set(location.x, location.y, 0);
		this.focusFace = this.getOverlapingFace();
		if(!this.focusFace){
			this.focusFace = this.getClosestFace();
		}
		
		return this.focusFace.getIntersectionPoint(this.ray);
	}
}



