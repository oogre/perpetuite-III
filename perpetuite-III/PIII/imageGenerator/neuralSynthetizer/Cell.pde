class Cell {
  PVector pos;
  float diameter;
  Pill pill;
  Cell(float x, float y, float diameter) {
    this(new PVector(x, y), diameter);
  }
  Cell(PVector pos, float diameter) {
    this.pos = pos;
    this.diameter = diameter;
  }
  void draw() {
    pushMatrix();
    translate(this.pos.x, this.pos.y);
    scale(this.diameter);
    if (null != pill) {
      pill.draw();
    }
    popMatrix();
  }
}
