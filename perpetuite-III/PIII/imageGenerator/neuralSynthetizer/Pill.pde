class Pill {
  color c;
  Pill(color c) {
    this.c = c;
  }

  void draw() {
    fill(c);
    noStroke();
    scale(PILL_SIZE);
    ellipse(0, 0, 1, 1);
  }
}
