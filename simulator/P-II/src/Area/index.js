import * as ClipperLib from "js-angusj-clipper"; // es6 / typescript
import { Path2D } from '@napi-rs/canvas';
import PIP from "robust-point-in-polygon";
import polybool from '@velipso/polybool';
import GrahamScan from '@lucio/graham-scan';
import { Vector2 } from './../tools/Vector.js';


let clipper;

ClipperLib.loadNativeClipperLibInstanceAsync(
	ClipperLib.NativeClipperLibRequestedFormat.WasmWithAsmJsFallback
).then(_c=>clipper=_c);

export default class Area {
	constructor(_points=[], color=[0, 0, 0]){
		this._points = [];
		this._path = new Path2D();
		this._area = 0;
		this._length = 0;
		this._color = color;
		this._circularity = 0;
		this._centroid = new Vector2(0, 0);
		this._size = [0, 0];
		this._box = [0, 0, 0, 0];
		this.createdAt = new Date().getTime();
		this.lockedAt = -1;
		this.contour = _points;
	}

	get isLock(){
		return this.lockedAt!=-1;
	}
	lock(){
		this.lockedAt = new Date().getTime();
	}
	unlock(){
		this.lockedAt = -1;
	}
	get contour(){
		return this._points;
	}
	// À remplacer dans P-II/src/Area/index.js : le setter `contour` (lignes 43-81).
	// Changements :
	//  1. centroïde = centre de gravité de l'AIRE du polygone (et non la moyenne des sommets de l'enveloppe)
	//  2. _centroid et _length remis à zéro à chaque appel (inflate() les accumulait)
	//  3. minY / maxY lisaient la coordonnée x ( ([y]) => y  prend l'index 0 )
	set contour(points){
		if(points.length==0)return;
		this.createdAt = new Date().getTime();
		const grahamScan = new GrahamScan();
		grahamScan.setPoints(points);
		points = grahamScan.getHull();
 
		this._points = points;
		this._path = new Path2D();
		this._length = 0;
 
		let twiceArea = 0, cx = 0, cy = 0;
		let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
		const n = points.length;
		for(let i = 0; i < n; i++){
			const [x, y] = points[i];
			const [x1, y1] = points[(i + 1) % n];
			if(i == 0) this._path.moveTo(x, y); else this._path.lineTo(x, y);
			const cross = x * y1 - x1 * y;
			twiceArea += cross;
			cx += (x + x1) * cross;
			cy += (y + y1) * cross;
			this._length += Math.hypot(x1 - x, y1 - y);
			if(x < minX) minX = x; if(x > maxX) maxX = x;
			if(y < minY) minY = y; if(y > maxY) maxY = y;
		}
		this._area = Math.abs(twiceArea) / 2;
		if(Math.abs(twiceArea) > 1e-9){
			this._centroid = new Vector2(cx / (3 * twiceArea), cy / (3 * twiceArea));
		}else{ // polygone dégénéré (point ou segment) : moyenne des sommets
			this._centroid = new Vector2(
				points.reduce((s, [x]) => s + x, 0) / n,
				points.reduce((s, [, y]) => s + y, 0) / n
			);
		}
 
		this._box = {x : maxX, y : maxY, x1 : minX, y1 : minY};
		this._size = [maxX - minX, maxY - minY];
		this._path.closePath();
		this._circularity = this._length > 0 ? Math.PI * 4 * this._area/(this._length*this._length) : 0;
	}
 
	set contourOLD(points){
		if(points.length==0)return;
		this.createdAt = new Date().getTime();
		const grahamScan = new GrahamScan();
		grahamScan.setPoints(points);
		points = grahamScan.getHull();
	
		this._points = points;
		this._path = new Path2D();
		this._area = 0;
		const currentPoint = new Vector2();
		const nextPoint = new Vector2();
		points.forEach(([x, y], id)=>{
			if(id==0){
				this._path.moveTo(x, y);
			}else{
				this._path.lineTo(x, y);
			}
			let nextPointId = id == points.length-1? 0 : id+1;
			currentPoint.set(x, y);
			nextPoint.set(points[nextPointId][0], points[nextPointId][1]);
			this._area += (currentPoint.x * nextPoint.y * 0.5);
			this._area -= (nextPoint.x * currentPoint.y * 0.5);
			this._centroid.add(currentPoint);
			this._length += currentPoint.clone().sub(nextPoint).length()
		});

		const minX = Math.min(...points.map(([x])=>x));
		const maxX = Math.max(...points.map(([x])=>x));
		const minY = Math.min(...points.map(([y])=>y));
		const maxY = Math.max(...points.map(([y])=>y));

		this._box = {x : maxX, y : maxY, x1 : minX, y1 : minY};
		this._size = [maxX - minX, maxY - minY];
		this._path.closePath();
		this._area = Math.abs(this._area);
		this._centroid.divideScalar(points.length);
		this._circularity = Math.PI * 4 * this._area/(this._length*this._length);
	}
	get path(){
		return this._path;
	}
	get polygon(){
		return {
			regions: [this._points],
			inverted: false
		}
	}

	get area(){
		return this._area;
	}

	set area(value){
		this._area = value;
	}

	get location(){
		return this._centroid;
	}

	set location([x, y]){
		return this._centroid = new Vector2(x, y);
	}

	get x(){
		return this._centroid.x;
	}
	get y(){
		return this._centroid.y;
	}
	get z(){
		return this._centroid.z;
	}

	get circularity(){
		return this._circularity;
	}
	set circularity(value){
		return this._circularity = value;
	}

	set size([w, h]){
		this._size[0] = w;
		this._size[1] = h;
	}
	get size(){
		return this._size;
	}
	get box(){
		return this._box;
	}

	set color([r, g, b]){
		this._color = [r, g, b];
	}
	get color(){
		return this._color;
	}

	inflate(dist){
		if(this._points.length==0)return this;
		const scale = 100;
		
		const [offsetted] = clipper.offsetToPaths({
			delta: dist * scale,
			offsetInputs: [{
				data: this._points.map(([x, y])=>({
					x : Math.round(x*scale),
					y : Math.round(y*scale)
				})),
				joinType: ClipperLib.JoinType.Round,
				endType: ClipperLib.EndType.ClosedPolygon
			}]
		});
		this.contour = offsetted.map(({x, y})=>[x/scale, y/scale]);
		return this;
	}
	isHover([x, y]){
		return PIP(this._points, [x, y]) != 1;
	}
	union(other){
		return polybool.union(this.polygon, other.polygon).regions;
	}
	isIntersect(other){
		return this.union(other).length == 1;
	}
	toString(){
		return `${this.location.x.toFixed(2)} ${this.location.y.toFixed(2)} ${this.lockedAt}`;
	}
}