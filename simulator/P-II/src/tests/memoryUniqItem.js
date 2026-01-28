var tmp = ``.split("\n").map(e=>{
	const [color, x, y] = e.split(" ");
	return {
		color,
		x : parseFloat(x),
		y : parseFloat(y)
	}
})
for(var e of tmp){
	console.log(
		e, 
		tmp.filter(other=>{
	        return other != e && Math.sqrt((e.x-other.x)*(e.x-other.x)+(e.y-other.y)*(e.y-other.y))<15
		})
	)
}