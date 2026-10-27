// tools/LimitedArray.js : un Array qui ne dépasse jamais `max` éléments, et dont SEULS push() et unshift() peuvent ajouter.
//   push()    : ajoute à la fin, expulse les premiers éléments si on dépasse
//   unshift() : ajoute au début, expulse les derniers éléments si on dépasse
//
//   const last3 = new LimitedArray(3);
//   last3.push(1, 2, 3, 4);   // [2, 3, 4]
//   last3.unshift(0);         // [0, 2, 3]
//   last3[5] = 1;             // TypeError (idem : splice qui ajoute, length plus grand, Array.prototype.push.call, defineProperty...)
//
// Reste permis : tout ce qui ne fait pas grandir le tableau (pop, shift, a[i] = x sur un élément existant, sort, reverse,
// fill, splice qui retire ou remplace autant qu'il retire, length plus petit...).
//
// Principe : l'objet est entouré d'un Proxy qui refuse toute écriture au-delà de la fin ; push() et unshift()
// travaillent sur le tableau d'origine (RAW), que le Proxy ne surveille pas.

const RAW = Symbol("LimitedArray.raw");
const isIndex = (key) => typeof key === "string" && /^(0|[1-9]\d*)$/.test(key) && Number(key) < 2 ** 32 - 1;
const refuse = () => { throw new TypeError("LimitedArray : ajout impossible, utilise push() ou unshift()"); };

export default class LimitedArray extends Array {
	// map(), filter(), slice()... renvoient de simples Array (sans cette ligne ils appelleraient new LimitedArray(longueur))
	static get [Symbol.species]() { return Array; }

	constructor(max = Infinity) {
		super();
		this.max = max;
		Object.defineProperty(this, RAW, {value: this});   // non énumérable : invisible pour for...in, JSON, Object.keys
		return new Proxy(this, {
			set(target, key, value, receiver) {
				if (isIndex(key) && Number(key) >= target.length) refuse();         // a[5] = x au-delà de la fin
				if (key === "length" && value > target.length) refuse();            // a.length = 10
				return Reflect.set(target, key, value, receiver);
			},
			defineProperty(target, key, descriptor) {
				if (isIndex(key) && Number(key) >= target.length) refuse();
				return Reflect.defineProperty(target, key, descriptor);
			},
		});
	}

	push(...items) {
		const raw = this[RAW];
		Array.prototype.push.apply(raw, items);
		if (raw.length > raw.max) raw.splice(0, raw.length - raw.max);   // expulse les premiers
		return raw.length;
	}

	unshift(...items) {
		const raw = this[RAW];
		Array.prototype.unshift.apply(raw, items);
		if (raw.length > raw.max) raw.length = raw.max;                  // expulse les derniers
		return raw.length;
	}
}