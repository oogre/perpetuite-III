
final float DIAMETER = 1400;// mm
void setup() {
  size(1000, 1000);
}


void draw() {
  try {
    JSONArray grid = loadJSONArray("./../data/grid.json");


    background(0);
    translate(width/2, height/2);
    scale(width/DIAMETER, -1 * width/DIAMETER);

    noStroke();
    int count = 0;
    for (int i = 0; i < grid.size(); i++) {

      JSONArray point = grid.getJSONArray(i);
      if (point.size() < 2)continue;
      float x = point.getFloat(0);
      float y = point.getFloat(1);
      fill(255);
      ellipse(x, y, 9, 9);
      count++;
    }
    println(count);
    delay(1000);
  }
  catch(RuntimeException e) {
  }
}