final int RES = 300; // pix_per_inch
final float INCH = 25.4; // mm_per_inch
final float SIZE = 100; // mm
final int WIDTH = round(SIZE / INCH * RES); // pix
final int PILL_SIZE = 9;//mm
final int PILL_WIDTH = round(PILL_SIZE / INCH * RES);//mm
void settings() {
  size(WIDTH, WIDTH);
}

void setup() {
}


void draw() {
  background(255);
  //int n = 0 ;
  //for(float i = 4 ; i < 8 ; i += 0.25){
  //  n++;
  //  .save("mat"+n+".jpg");
  //}
  //float i = lerp(6, 9, (frameCount % 100)  * 0.01);
  
  matrix(6).save("matrix.1.jpg");
  matrix(6.25).save("matrix.2.jpg");
  matrix(6.5).save("matrix.3.jpg");
  matrix(6.75).save("matrix.4.jpg");
  matrix(7).save("matrix.5.jpg");
  matrix(7.25).save("matrix.6.jpg");
  matrix(7.5).save("matrix.7.jpg");
  matrix(7.75).save("matrix.8.jpg");
  exit();
}


PImage matrix(float density) {
  PGraphics pg = createGraphics(width, height);
  pg.beginDraw();
  pg.ellipseMode(CORNER);
  pg.background(255);
  pg.stroke(0);
  pg.strokeWeight(4);
  pg.noFill();
  float offX = 0;
  float offY = 0;
  int i = 0;
  while (offY <= height-PILL_WIDTH) {
    offX = i%2==1?0 : (width-PILL_WIDTH) / (density *  2);
    while (offX <= width-PILL_WIDTH) {
      pg.ellipse(offX, offY, PILL_WIDTH, PILL_WIDTH);
      offX += (width-PILL_WIDTH) / (float)density;
    }
    offY += (height-PILL_WIDTH) / (density * 1.33);
    i++;
  }
  pg.fill(0);
  pg.noStroke();
  pg.textSize(64);
  pg.textAlign(CENTER, BOTTOM);
  pg.text(density, width/2, height - 100);
  pg.endDraw();
  return pg;
}
