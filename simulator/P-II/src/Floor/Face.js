import {lerp} from "./../tools/math.js";
import { Vector3 } from './../tools/Vector.js';
import { Triangle, Plane } from 'THREE';
import { Path2D } from '@napi-rs/canvas';

export default class Face{
	constructor(p1, p2, p3){
		this.triangle=new Triangle(
			new Vector3(...p1), 
			new Vector3(...p2), 
			new Vector3(...p3)
		);
		this.centroid = this.triangle.getMidpoint(new Vector3());
		this.plane = this.triangle.getPlane(new Plane());
		this.path = new Path2D();
		this.path.moveTo(this.triangle.a.x, this.triangle.a.y);
		this.path.lineTo(this.triangle.b.x, this.triangle.b.y);
		this.path.lineTo(this.triangle.c.x, this.triangle.c.y);
		this.path.lineTo(this.triangle.a.x, this.triangle.a.y);
	}
	getIntersectionPoint(ray){
		return ray.intersectPlane(this.plane, new Vector3());
	}
}