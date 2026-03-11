
import { Robot_go } from "./../Robot";
import { Vector3, Vector4 } from './../../tools/Vector.js';


export const Move_cross = async (BASE)=>{
  const path = [];
  const origin = BASE.robot.location4D;
  const work = new Vector3(origin.x, origin.y, 0);
  
  path.push(new Vector4(origin.x, origin.y, BASE.table.toFloorLocation(origin).z, origin.w));

  work.setLength(BASE.robot.conf.radius);

  work.z = 0;
  work.applyAxisAngle(Vector3.DOWN, Math.PI);
  work.z = BASE.table.toFloorLocation(work).z;
  path.push(new Vector4(...work, origin.w));
  
  work.z = 0;
  work.applyAxisAngle(Vector3.DOWN, Math.PI/2);
  work.z = BASE.table.toFloorLocation(work).z;
  path.push(new Vector4(...work, origin.w));
  
  work.z = 0;
  work.applyAxisAngle(Vector3.DOWN, Math.PI);
  work.z = BASE.table.toFloorLocation(work).z;
  path.push(new Vector4(...work, origin.w));
  
  work.z = 0;
  work.applyAxisAngle(Vector3.DOWN, -Math.PI/2);
  work.z = BASE.table.toFloorLocation(work).z;
  path.push(new Vector4(...work, origin.w));
  
  path.push(path[0]);
  path.push(new Vector4(...origin));

  console.log(path);

	return true;
}