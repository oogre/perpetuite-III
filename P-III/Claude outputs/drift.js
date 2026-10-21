import { Vector4 } from './../../tools/Vector.js';
import { Robot_go, Robot_speed, Robot_acc, Robot_dcc, Robot_gripper, Robot_limitter } from '../Robot';
import { Camera_capture } from './../Camera';
import { Memory_get, Memory_clear } from './../Memory';
import { delay } from './../../tools/helpers.js';

// Test de dérive. Pose une pastille À LA MAIN sur la table, sous la caméra, quand le robot est en (X, Y).
// Le robot ne saisit ni ne dépose rien : il mesure la même pastille immobile, dans 3 conditions :
//   A : le robot ne fait rien (attente seule)                      -> dérive dans le temps ?
//   B : le robot fait des descentes/remontées de la buse à côté     -> dérive causée par la descente (sans aspiration) ?
//   C : idem avec l'aspiration allumée à chaque descente             -> dérive causée par l'aspiration ?
// Chaque ligne « DRIFT » : phase, n°, temps (s), position mesurée de la pastille, écart à la 1re mesure.
const X = 0, Y = 600;        // pose de mesure
const SIDE = 30;             // décalage (mm) de la descente, pour ne pas toucher la pastille
const N = 6;                 // mesures par phase
const PAUSE = 8000;          // ms entre deux mesures (même cadence que le test réel)

export const Probes_drift = async (BASE)=>{
	await Robot_speed(BASE, [BASE.robot.conf.default.speed]);
	await Robot_acc(BASE, [25]);
	await Robot_dcc(BASE, [25]);
	await Robot_gripper(BASE, [false]);
	await Robot_go(BASE, new Vector4(X, Y, 0, 0));
	await delay(1000);

	const t0 = Date.now();
	let ref = null;
	const measure = async (phase, n)=>{
		const pills = await Camera_capture(BASE);
		const pill = Memory_get({memory:pills}, BASE.robot.location2D);
		await Memory_clear(BASE);
		const pose = BASE.robot.location2D;
		if(pill===undefined || pill===null){
			console.log(`DRIFT ${phase} ${n} t=${((Date.now()-t0)/1000).toFixed(1)}s pastille introuvable`);
			return;
		}
		const {x, y} = pill.location;
		if(ref===null) ref = {x, y};
		console.log(`DRIFT ${phase} ${n} t=${((Date.now()-t0)/1000).toFixed(1)}s robot=(${pose.x.toFixed(2)},${pose.y.toFixed(2)}) pastille=(${x.toFixed(2)},${y.toFixed(2)}) ecart=(${(x-ref.x).toFixed(2)},${(y-ref.y).toFixed(2)})`);
	};
	const descend = async (suction)=>{
		const base = new Vector4(X + SIDE, Y > 0 ? Y - SIDE : Y + SIDE, 0, 0);
		await Robot_go(BASE, base);
		const down = Robot_limitter(BASE, new Vector4(base.x, base.y, -300, 0));
		await Robot_go(BASE, down);
		if(suction) await Robot_gripper(BASE, [true]);
		await delay(300);
		if(suction) await Robot_gripper(BASE, [false]);
		await Robot_go(BASE, new Vector4(base.x, base.y, 0, 0));
		await Robot_go(BASE, new Vector4(X, Y, 0, 0));
	};

	for(let n = 1; n <= N; n++){ await measure('A-attente', n); await delay(PAUSE); }
	for(let n = 1; n <= N; n++){ await descend(false); await measure('B-descente', n); }
	for(let n = 1; n <= N; n++){ await descend(true);  await measure('C-aspiration', n); }
	return true;
};
