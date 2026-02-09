import ColorCli from "cli-color";
import { Vector3 } from 'vecteur/3d';

const positiontyle = (...args)=>{
	args.push("]");
	args.unshift("[");
	return ColorCli.black.bgWhite(...args);
}

Vector3.prototype.toStyled = function(){
	return positiontyle(`${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)}`);
}


export {Vector3} ;