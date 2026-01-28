import FloorUI from "./UI.js";
import { Vector3 } from 'vecteur/3d';
import { Path2D } from '@napi-rs/canvas';
import {lerp} from "./../tools/math.js";
const math = require("mathjs");


export default class Floor{
	constructor({probes, triangles}){
		this.ui = new FloorUI(this);
		this.points = probes;
		this.faces = triangles.map(([p1, p2, p3])=>{
			return new Face(probes[p1], probes[p2], probes[p3])
		});
		this.focusFace = this.faces[0];
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



class Face{
	constructor(p1, p2, p3){
		this.points=[
			new Vector3(...p1), 
			new Vector3(...p2), 
			new Vector3(...p3)
		];
		this.centroid = Vector3.add(this.points[0], this.points[1]).add(this.points[2]).div(3);
		this.box = [
			Math.min(this.points[0].x, Math.min(this.points[1].x, this.points[2].x)),
			Math.min(this.points[0].y, Math.min(this.points[1].y, this.points[2].y)),
			Math.max(this.points[0].x, Math.max(this.points[1].x, this.points[2].x)),
			Math.max(this.points[0].y, Math.max(this.points[1].y, this.points[2].y))
		];
		this.path = new Path2D();
		this.path.moveTo(this.points[0].x, this.points[0].y);
		this.path.lineTo(this.points[1].x, this.points[1].y);
		this.path.lineTo(this.points[2].x, this.points[2].y);
		this.path.lineTo(this.points[0].x, this.points[0].y);
	}
	getIntersectionPoint(location){
		const matB = math.matrix(this.points.map((point) => [point.z]))
		const matA = math.matrix(this.points.map((point) => [point.x, point.y, 1]))
		const maAt = math.transpose(matA);
		const fit = math.chain(maAt).multiply(matA).inv().multiply(maAt).multiply(matB).done()
		const [[a, b, c]] = math.transpose(fit).valueOf();
		const z = a * location.x + b * location.y + c;
		return new Vector3(location.x, location.y, z);
	}
	getIntersectionPointByInterpolation(location){
		const rawDistToVertex = [
			[location.distTo(this.points[0]), this.points[0]],
			[location.distTo(this.points[1]), this.points[1]],
			[location.distTo(this.points[2]), this.points[2]]
		].sort(([a], [b])=>a-b);
		
		const length = rawDistToVertex[0][1].distTo(rawDistToVertex[1][1]);
		const z = lerp(rawDistToVertex[0][1].z, rawDistToVertex[1][1].z, rawDistToVertex[0][0]/length);
		return new Vector3(location.x, location.y, z);
	}
}