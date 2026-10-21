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
