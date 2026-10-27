// tools/ArcThrough.js : arc de cercle de `origin` à `destination` en passant par `middle`, dans l'espace XYZ.
// Trois points non alignés définissent un seul cercle, dans le plan qui les contient.
//
//   const arc = new ArcThrough(origin, middle, destination);
//   arc.getPoints(32)         // 33 Vector3, de l'origine à la destination, régulièrement répartis en angle (donc en longueur : c'est un cercle)
//   arc.getLength()           // longueur de l'arc
//   arc.center, arc.radius, arc.normal, arc.angle   // le cercle et l'angle balayé (radians)
//
// Par défaut l'arc est celui qui PASSE PAR `middle` (c'est lui qui choisit l'un des deux arcs possibles entre origin et destination).
// Si `middle` est sur le grand arc, l'arc balaie donc plus d'un demi-cercle.
//   new ArcThrough(origin, middle, destination, {shortest: true})   // toujours le plus court des deux arcs : `middle` ne sert alors qu'à définir le cercle
//
// Si les trois points sont alignés (angle inférieur à ~0,00006°, option `epsilon`) ou si origine = destination, il n'y a pas de cercle : le chemin est le segment origine -> destination (arc.straight === true).
// Le sens de parcours (horaire ou non) découle des points : `arc.normal` est la normale du plan, orientée dans le sens du parcours (règle de la main droite).

import { Curve, Vector3 } from "three";

const TWO_PI = Math.PI * 2;
const mod2pi = (a) => ((a % TWO_PI) + TWO_PI) % TWO_PI;

export default class ArcThrough extends Curve {
	constructor(origin, middle, destination, {shortest = false, epsilon = 1e-12} = {}) {
		super();
		this.origin = origin.clone();
		this.middle = middle.clone();
		this.destination = destination.clone();

		const b = new Vector3().subVectors(destination, origin);
		const c = new Vector3().subVectors(middle, origin);
		const n = new Vector3().crossVectors(b, c);                    // normale du plan (non normalisée)
		const n2 = n.lengthSq();

		// alignés (ou confondus) : pas de cercle. n2 = |b|²|c|²·sin²(angle entre les deux côtés) : on compare sin² à `epsilon` (1e-12 ~ 0,00006°)
		this.straight = n2 <= epsilon * b.lengthSq() * c.lengthSq() || b.lengthSq() === 0 || c.lengthSq() === 0;
		if (this.straight) {
			this.length = b.length();
			return;
		}

		// centre du cercle circonscrit : A + ( |c|²(b×c)×b + |b|² c×(b×c) ) / (2|b×c|²)
		const bxc_x_b = new Vector3().crossVectors(n, b).multiplyScalar(c.lengthSq());
		const c_x_bxc = new Vector3().crossVectors(c, n).multiplyScalar(b.lengthSq());
		this.center = origin.clone().add(bxc_x_b.add(c_x_bxc).divideScalar(2 * n2));
		this.radius = this.center.distanceTo(origin);

		// repère du cercle : e1 vers l'origine, e3 = normale, e2 = e3 × e1 (l'angle croît dans le sens direct autour de e3)
		const e3 = n.clone().normalize();
		const e1 = new Vector3().subVectors(origin, this.center).normalize();
		const e2 = new Vector3().crossVectors(e3, e1);
		const angleOf = (p) => {
			const d = new Vector3().subVectors(p, this.center);
			return mod2pi(Math.atan2(d.dot(e2), d.dot(e1)));           // dans [0, 2π[, l'origine est à 0
		};
		const toB = angleOf(destination), toM = angleOf(middle);

		// deux balayages possibles depuis 0 : +toB (sens direct) ou toB - 2π (sens inverse)
		let sweep = toM < toB ? toB : toB - TWO_PI;                    // celui qui passe par `middle`
		if (shortest && Math.abs(sweep) > Math.PI) sweep = sweep > 0 ? sweep - TWO_PI : sweep + TWO_PI;

		this.sweep = sweep;                                            // angle signé
		this.angle = Math.abs(sweep);                                  // angle total de l'arc
		this.normal = sweep >= 0 ? e3 : e3.clone().negate();           // orientée dans le sens du parcours
		this.e1 = e1;
		this.e2 = e2;
		this.length = this.radius * this.angle;
	}

	// t de 0 (origine) à 1 (destination)
	getPoint(t, target = new Vector3()) {
		if (this.straight) return target.lerpVectors(this.origin, this.destination, t);
		const a = this.sweep * t;
		return target.copy(this.center)
			.addScaledVector(this.e1, this.radius * Math.cos(a))
			.addScaledVector(this.e2, this.radius * Math.sin(a));
	}

	getLength() { return this.length; }

	// répartition par longueur : sur un cercle elle est proportionnelle à t
	getUtoTmapping(u) { return u; }
	getLengths() { return [0, this.length]; }
}