// tools/timed.js : mesure le temps d'une fonction (synchrone OU asynchrone) et le journalise.
//
//   await timed(this.newPattern.bind(this))                  // étiquette = nom de la fonction : « newPattern »
//   await timed(() => this.newPath(), "newPath")             // fonction fléchée : donne l'étiquette toi-même
//   await timed(this.newPath.bind(this), "extraction")       // l'étiquette remplace le nom de la fonction
//
// La fonction est appelée sans argument : passe les arguments par une fonction fléchée,
//   await timed(() => this.newPattern(offset), "newPattern")
//
//   const gen = withTiming(fn, "genPath")                    // version instrumentée, réutilisable
//   instrument(this.pathExtractor, ["genPath", "getPaths"])  // instrumente des méthodes d'un objet
//
// Réglages (variables d'environnement) :
//   TIMING=0          coupe tous les journaux (la fonction est quand même exécutée)
//   TIMING_START=0    n'affiche plus la ligne « start » (par défaut : affichée)
//   TIMING_SLOW=500   un temps supérieur (en ms) est affiché en jaune, avec « SLOW »

import ColorCli from "cli-color";

// horloge monotone : insensible aux changements d'heure du système, contrairement à Date.now()
const now = () => Number(process.hrtime.bigint()) / 1e6;

const enabled = () => process.env.TIMING !== "0";
const showStart = () => process.env.TIMING_START !== "0";
const slowLimit = () => parseFloat(process.env.TIMING_SLOW) || Infinity;

export const formatDuration = (ms) => {
	if (ms < 1000) return `${ms.toFixed(ms < 10 ? 1 : 0)} ms`;
	if (ms < 60000) return `${(ms / 1000).toFixed(2)} s`;
	return `${Math.floor(ms / 60000)} min ${((ms % 60000) / 1000).toFixed(0)} s`;
};

// nom d'une fonction : « bound newPattern » (après .bind) devient « newPattern » ; une fonction fléchée passée telle quelle n'a pas de nom
const nameOf = (fn) => (fn.name || "").replace(/^bound /, "") || "(anonymous)";

export const timed = (fn, label, {log = console.log, start = showStart()} = {}) => {
	if (typeof fn === "string") [fn, label] = [label, fn];       // ancienne écriture timed("étiquette", fn) : toujours acceptée
	label = label || nameOf(fn);
	if (!enabled()) return fn();
	if (start) log(`${label}: start`);
	const t0 = now();

	const done = (failed) => {
		const ms = now() - t0;
		const text = `${label}: ${failed ? "failed after" : "done in"} ${formatDuration(ms)}`;
		if (failed) log(ColorCli.red(text));
		else if (ms > slowLimit()) log(ColorCli.yellow(`${text}  SLOW`));
		else log(text);
	};

	let result;
	try {
		result = fn();
	} catch (error) {                                   // fonction synchrone qui lève
		done(true);
		throw error;
	}
	if (result && typeof result.then === "function") {  // fonction asynchrone : on mesure jusqu'à la fin de la promesse
		return result.then(
			(value) => { done(false); return value; },
			(error) => { done(true); throw error; }
		);
	}
	done(false);
	return result;
};

// renvoie une version instrumentée de `fn` (le `this` et les arguments sont conservés)
export const withTiming = (fn, label, options) =>
	function (...args) {
		return timed(() => fn.apply(this, args), label || nameOf(fn), options);
	};

// remplace, sur l'objet, les méthodes citées par leur version instrumentée : « Classe.méthode »
export const instrument = (object, names, prefix = object.constructor?.name ?? "") => {
	for (const name of names) {
		object[name] = withTiming(object[name], prefix ? `${prefix}.${name}` : name);
	}
	return object;
};