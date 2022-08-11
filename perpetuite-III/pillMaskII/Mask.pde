public PImage mask(PImage input, float[] alpha) {
  PImage out = createImage(input.width, input.height, ARGB);
  input.loadPixels();
  for (int i = 0; i < input.pixels.length; i ++) {
    float[] CURRENT = rgb2lab(new float[]{
      input.pixels[i]>> 16 & 0xFF, 
      input.pixels[i]>> 8 & 0xFF, 
      input.pixels[i]>> 0 & 0xFF, 
      input.pixels[i]>> 24 & 0xFF 
      });

    float d4 = deltaE(CURRENT, alpha);

    if (CURRENT[3] == 0 || d4 < 20 ) {
      out.pixels[i] = color(255);
    } else {
      out.pixels[i] = color(0);
    }
  }
  out.updatePixels();
  return out;
}
