JSONArray grid;

void setup() {
  grid = loadJSONArray("./../data/grid.json");

  size(1000, 1000);
  background(0);
  translate(width/2, height/2);
  scale(width/1300.0);
  
  noStroke();
  int count = 0;
  for (int i = 0; i < grid.size(); i++) {
    JSONArray line = grid.getJSONArray(i);
    for (int k = 0; k < line.size(); k++) {
      JSONArray point = line.getJSONArray(k);
      if(point.size() < 2)continue;
        float x = point.getFloat(0);
        float y = point.getFloat(1);
        fill(255);
        ellipse(x, y, 3, 3);
        count++;
     
    }
  }
  println((count/4) * 3);
}
