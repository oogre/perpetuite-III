// Cases libres d'après la mémoire, les plus dégagées en premier (à dégagement égal, les plus proches du robot)

const CLEARANCE = 14;   // mm entre centres : 2 × rayon (≈ 7) + marge ; à ajuster


export const Memory_getFreeCell = (BASE)=>{
	const pills = BASE.memory.set.toArray().map(p=>p.location);
	const here = BASE.robot.location2D;
	return BASE.grid.set.toArray()
		.filter(cell=>!BASE.forbidden.isIntersect(cell))
		.map(cell=>{
			const {x, y} = cell.location;
			let d = Infinity;
			for(const p of pills){
				d = Math.min(d, Math.hypot(p.x - x, p.y - y));
			}
			return { 
				location: cell.location, 
				d, 
				travel: Math.hypot(here.x - x, here.y - y) 
			};
		})
		.filter(c=>c.d >= CLEARANCE)
		.sort((a, b)=> (Math.min(b.d, 40) - Math.min(a.d, 40)) || (a.travel - b.travel));
}