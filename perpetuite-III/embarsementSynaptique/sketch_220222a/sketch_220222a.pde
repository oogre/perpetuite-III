//int resolution = 100;
//ArrayList<Pill> pills;
HexaGrid grid;
PGraphics pg;

void setup(){
	size(1000, 1000);


	// pg = createGraphics(width, height);
	grid = new HexaGrid(width/2, height/2, width, width/260);
	grid.addChannel(color(255, 150, 200), grid.cells.size()/10);
	grid.addChannel(color(200, 255, 255), grid.cells.size()/10);
	grid.addChannel(color(255, 200, 150), grid.cells.size()/10);
	
}

void draw(){
	background(0);	
	grid.draw();
}


/*
pillCount = cells.size()/10;

		Collections.shuffle(cells);
		for(int i = 0 ; i < pillCount ; i++){
			cells.get(i).pill = new Pill(cellSize, color(255, 0, 0));
		}

		Collections.shuffle(cells);	
		for(int i = 0 ; i < pillCount ; i++){
			while(true){
				HexaCell randomCell = cells.get((int)random(cells.size()));
				if(randomCell.pill == null){
					randomCell.pill = new Pill(cellSize, color(255));
					break;
				}
			}
		}


		*/