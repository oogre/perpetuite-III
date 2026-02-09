import {lerp} from "./../tools/math.js";
import { Vector3 } from './../tools/Vector3.js';
const math = require("mathjs");
import { Path2D } from '@napi-rs/canvas';

export default class Face{
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