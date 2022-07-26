class Tag {
  int id; 
  PVector TL;
  PVector TR;
  PVector BL;
  PVector BR;
  Tag(int id) {
    this(id, 0, 0, 0, 0, 0, 0, 0, 0);
  }
  Tag(int id, int TLx, int TLy, int TRx, int TRy, int BRx, int BRy, int BLx, int BLy) {
    this.id = id;
    TL = new PVector (TLx, TLy);
    BL = new PVector (BLx, BLy);
    TR = new PVector (TRx, TRy);
    BR = new PVector (BRx, BRy);
  }

  void draw() {
    beginShape();
    vertex(BL.x, BL.y);
    vertex(BR.x, BR.y);
    vertex(TR.x, TR.y);
    vertex(TL.x, TL.y);
    endShape();
  }
  void drawId() {
    fill(255, 0, 0);
    textSize(64);
    text(id+"", TL.x, TL.y);
  }
}


class Corner extends Tag {
  Corner(int id) {
    super(id);
  }
  Corner(int id, int TLx, int TLy, int TRx, int TRy, int BRx, int BRy, int BLx, int BLy) {
    super(id, TLx, TLy, TRx, TRy, BRx, BRy, BLx, BLy);
  }
  void draw() {
    stroke(255, 0, 0);
    noFill();
    super.draw();
  }
}
