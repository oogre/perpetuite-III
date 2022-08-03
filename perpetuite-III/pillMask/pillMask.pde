import java.awt.Color;

PImage img;
PImage out;

color BLUE = color(125, 168, 210);
color RED = color(210, 168, 125);
color YELLOW = color(210, 210, 168);

color target = BLUE;
PImage blueMask, redMask, yellowMask;
void setup() {
  size(1800, 600);
  
  img = loadImage("/Users/ogre/works/2202/Felix/perpetuite-III/perpetuite-III/buildCameraMapperScript/data/out.png");
  blueMask = level(circleMask(colorMask(img, BLUE), img.width - 200, img.width/2, img.height/2, color(255)), 0, 55);
  redMask = level(circleMask(colorMask(img, RED), img.width - 200, img.width/2, img.height/2, color(255)), 0, 55);
  yellowMask = level(circleMask(colorMask(img, YELLOW), img.width - 200, img.width/2, img.height/2, color(255)), 0, 55);
  
  blueMask.save("blueMask.jpg");
  redMask.save("redMask.jpg");
  yellowMask.save("yellowMask.jpg");
  exit();
}

PImage colorMask(PImage input, color mask) {
  PImage out = createImage(input.width, input.height, RGB);
  float [] HSB_TARGET = new float[3];
  float [] HSB_CURRENT = new float[3];
  Color.RGBtoHSB( mask >> 16 & 0xFF, mask >> 8 & 0xFF, mask >> 0 & 0xFF, HSB_TARGET);

  input.loadPixels();
  out.loadPixels();
  for (int i = 0; i < input.pixels.length; i ++) {
    Color.RGBtoHSB(input.pixels[i] >> 16 & 0xFF, input.pixels[i] >> 8 & 0xFF, input.pixels[i] >> 0 & 0xFF, HSB_CURRENT);
    float distH = abs(HSB_CURRENT[0] - HSB_TARGET[0]);
    float distS = abs(HSB_CURRENT[1] - HSB_TARGET[1]);
    float distB = abs(HSB_CURRENT[2] - HSB_TARGET[2]);
    float dist = 0.33 * (distH + distS + distB);
    out.pixels[i] = color(lerp(0, 255, dist));
  }
  out.updatePixels();
  return out;
}

PImage circleMask(PImage input, int diameter, int cx, int cy, color mask) {
  PImage out = createImage(input.width, input.height, RGB);
  img.loadPixels();
  out.loadPixels();
  for (int i = 0; i < img.pixels.length; i ++) {
    int x = i % img.width;
    int y = i / img.width;
    int dX = x - cx ;
    int dY = y - cy;
    int d = (int)sqrt(dX * dX + dY * dY);
    out.pixels[i] = d >diameter>>1 ? mask : input.pixels[i];
  }
  out.updatePixels();
  return out;
}

PImage level(PImage input, int black, int white) {
  PImage out = createImage(input.width, input.height, RGB);
  img.loadPixels();
  out.loadPixels();
  for (int i = 0; i < img.pixels.length; i ++) {
    int lum = input.pixels[i] >> 16 & 0xFF;
    out.pixels[i] = color((int)constrain(map(lum, black, white, 0, 255), 0, 255));
  }
  out.updatePixels();
  return out;
}




void draw() {
  //tint(0, 0, 255);
  image(blueMask, 0 * height, 0, height, height);
  //tint(255, 0, 0);
  image(redMask, 1 * height, 0, height, height);
  //tint(255, 255, 0);
  image(yellowMask, 2 * height, 0, height, height);
}
