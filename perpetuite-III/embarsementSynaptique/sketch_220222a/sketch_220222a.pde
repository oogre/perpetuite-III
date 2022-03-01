//int resolution = 100;
//ArrayList<Pill> pills;
HexaGrid grid;
PImage src;

void setup(){
	size(1000, 1000);
	src = createImage(width/3, height/3, ARGB);

	grid = new HexaGrid(width/2, height/2, width, width/260);
	grid.addChannel(color(255, 150, 200), grid.cells.size()/20);
	grid.addChannel(color(200, 255, 255), grid.cells.size()/20);
	grid.addChannel(color(255, 200, 150), grid.cells.size()/20);
	
}

float curve(float x){
	x -=0.5;
	x *= 4*x;
	return x;
}
void draw(){
	background(0);	

	src.loadPixels();
			
	float m1 = lerp(0.001, 0.01, curve(noise(1, frameCount * 0.001)));
	float m2 = lerp(0.001, 0.01, curve(noise(2, frameCount * 0.001)));
	float m3 = lerp(0.001, 0.01, curve(noise(3, frameCount * 0.001)));
	float m4 = lerp(0.001, 0.01, curve(noise(4, frameCount * 0.001)));

	for(int y = 0 ; y < src.height ; y ++){
		for(int x = 0 ; x < src.width ; x ++){
			int index = x + y * src.width;

			float c1 = noise(0 + x*m1, 0 + y*m1, frameCount * 0.005);
			float c2 = noise(1 + x*m2, 1 + y*m2, frameCount * 0.005);
			float c3 = noise(2 + x*m3, 2 + y*m3, frameCount * 0.005);
			float c4 = noise(3 + x*m4, 3 + y*m4, frameCount * 0.005);
			float c = max(c1,max(c2, max(c3, c4))); 
			if(c1 == c){
				src.pixels[index] = color(255, 150, 200);
			}else if(c2 == c){
				src.pixels[index] = color(200, 255, 255);
			}else if(c3 == c){
				src.pixels[index] = color(255, 200, 150);
			}else{
				src.pixels[index] = color(0);
			}
		}
	}
	src.updatePixels();
	// pg.beginDraw();
	// pg.background(0);
	// pg.fill(color(255, 150, 200));
	// pg.noStroke();
	// pg.rectMode(CENTER);
	// pg.translate(width/2, height/2);
	// pg.rotate(frameCount * 0.1);
	// pg.rect(0, 0, 100, 100);
	// pg.endDraw();

	grid.display(src);
	grid.draw();



	image(src, 0, 0, 100, 100);
	noFill();
	stroke(255);
	rect(0, 0, 100, 100);
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