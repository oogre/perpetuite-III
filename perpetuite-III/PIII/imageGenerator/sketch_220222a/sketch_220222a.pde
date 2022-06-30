//int resolution = 100;
//ArrayList<Pill> pills;
HexaGrid grid;
PImage src, old;
PGraphics pg;
color [] colors = {
	color(255, 0, 0), 
	color(0, 255, 0),  
	color(0, 0, 255)
}; 


void setup(){
	size(1000, 1000);
	src = createImage(width/30, height/30, ARGB);
  old = createImage(width/30, height/30, ARGB);
  pg = createGraphics(1000, 1000);
  
	grid = new HexaGrid(pg.width/2, pg.height/2, pg.width, pg.width/260);
  for(color c : colors){
    grid.addChannel(c, grid.cells.size()/200);
  }
}

float curve(float x){
	x -=0.5;
	x *= 4*x;
	return x;
}
void draw(){
	background(0);	

	src.loadPixels();
	
	Float m [] = new Float [colors.length+1];
	for(int i = 0 ; i < m.length ; i ++){
		m[i] = lerp(0.01, 0.1, curve(noise(i, frameCount * 0.001)));
	}
	
	for(int y = 0 ; y < src.height ; y ++){
		for(int x = 0 ; x < src.width ; x ++){
			int index = x + y * src.width;

			Float c [] = new Float [m.length];
			float cMax = 0;
			for(int i = 0 ; i < c.length ; i ++){
				c[i] = noise(i + x*m[i], i + y*m[i], frameCount * 0.005);
				if(cMax < c[i])cMax = c[i];
			}
			boolean tmp = false;
			for(int i = 0 ; i < c.length ; i ++){
				if (c[i] == cMax){
					try{
						src.pixels[index] = colors[i];
					}catch(ArrayIndexOutOfBoundsException e){
						src.pixels[index] = color(0);
					}
					break;
				}
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

 //  pg.beginDraw();
 //  pg.background(0);
	// grid.display(src);
	// grid.draw();
 //  pg.endDraw();


	noFill();
	stroke(255);
	rect(0, 0, 300, 300);
	image(src, 0, 0, 300, 300);

	

	image(src, 310, 0, 300, 300);
	blend(old, 310, 0, 300, 300, 300, 300, 300, 300, DIFFERENCE); 

	old = src.copy();
	
}


