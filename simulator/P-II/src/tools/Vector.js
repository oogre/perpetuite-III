import ColorCli from "cli-color";

import {
	Vector4 as Vec4, 
	Vector3 as Vec3, 
	Vector2 as Vec2
} from 'THREE';



const positiontyle = (...args)=>{
	args.push(" ");
	args.unshift(" ");
	return ColorCli.black.bgWhite(...args);
}

let DOWNv4;
const v4Tool = new Vec4();
class Vector4 extends Vec4{
	static get DOWN() {
		if (!DOWNv4) {
			DOWNv4 = new Vec4(0, 0, -1, 0);
			Object.freeze(DOWNv4);
		}
		return DOWNv4;
	}

	constructor(...data){
		super(...data);
	}
	toString(_x=true, _y=true, _z=true, _w=true){
		return `${
			_x?this.x.toFixed(2):""
		} ${
			_y?this.y.toFixed(2):""
		} ${
			_z?this.z.toFixed(2):""
		} ${
			_w?this.w.toFixed(2):""
		}`
	}
	get style(){
		return positiontyle(`${this.toString()}`);
	}
	get styleXYZ(){
		return positiontyle(`${this.toString(1, 1, 1, 0)}`);
	}
	get styleXY(){
		return positiontyle(`${this.toStringXY(1, 1, 0 , 0)}`);
	}
};

let DOWNv3;
const v3Tool = new Vec3();
class Vector3 extends Vec3{
	static get DOWN() {
		if (!DOWNv3) {
			DOWNv3 = new Vec3(0, 0, -1);
			Object.freeze(DOWNv3);
		}
		return DOWNv3;
	}
	constructor(...data){
		super(...data);
	}
	toString(_x=true, _y=true, _z=true){
		return `${
			_x?this.x.toFixed(2):""
		} ${
			_y?this.y.toFixed(2):""
		} ${
			_z?this.z.toFixed(2):""
		}`
	}
	get style(){
		return positiontyle(`${this.toString()}`);
	}
	get styleXY(){
		return positiontyle(`${this.toStringXY(1, 1, 0)}`);
	}
};

const v2Tool = new Vec2();
class Vector2 extends Vec2{
	constructor(...data){
		super(...data);
	}
	toString(_x=true, _y=true){
		return `${
			_x?this.x.toFixed(2):""
		} ${
			_y?this.y.toFixed(2):""
		}`
	}
	get style(){
		return positiontyle(`${this.toString()}`);
	}
};

export {
	Vector4,
	Vector3,
	Vector2
};
