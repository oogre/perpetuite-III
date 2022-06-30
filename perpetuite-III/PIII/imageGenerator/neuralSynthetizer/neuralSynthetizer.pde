
final int CELL_COUNT = 13272;
final int PILL_PER_CHANNEL = 1000;//3318;
final int CELL_SIZE = 1; // centimetre
final float PILL_SIZE = 0.83;// centimetre
final int DIAMETER = 130; // centimetre
final color [] colors = {
  color(255, 216, 248), 
  color(216, 248, 255), 
  color(245, 255, 216)
}; 

Grid grid;

void setup() {
  size(1000, 1000);
  int cellPerLine = DIAMETER / CELL_SIZE;
  grid = new Grid(cellPerLine);

  for (color c : colors) {
    for (int i = 0; i < PILL_PER_CHANNEL; i++) {
      grid.getRandomEmptyCell().pill = new Pill(c);
    }
  }
}

void draw() {
  background(0);
  scale(width);
  grid.draw();
}
