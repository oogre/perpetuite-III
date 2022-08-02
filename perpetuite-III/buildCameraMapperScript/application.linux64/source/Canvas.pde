class Canvas{
  private PImage img;
  private PVector imgSize;
  public PVector getImgSize(){ return imgSize ; };
  private PVector size;
  private PVector offset;
  private PVector pos;
  private PVector PNull = new PVector(0, 0);
  private PVector POne = new PVector(1, 1);
  private float scale = 1;
  private float _scale = 0;
  private ArrayList<Runnable> runDrawAfter;
  private ArrayList<Runnable> runDrawBefore;
  public float getScale(){ return scale; }
  public PVector getPos(){ return pos; }
  public PVector toContex(PVector pt){ return PVector.mult(pt, _scale).sub(PVector.mult(pos, _scale)); }
  private final float SCALE_FACTOR = 0.001;
  public Canvas(PImage img, PVector size){
    this.img = img;
    this.imgSize = new PVector(img.width, img.height);
    this.size = size;
    this.offset = new PVector(0,0);
    this.scale = 1.0;
    this.constrainScaleAndOffset();
    this.runDrawAfter = new ArrayList<Runnable>();
    this.runDrawBefore = new ArrayList<Runnable>();
  }

  public void draw(){
    pushMatrix();
    translate(pos.x, pos.y, pos.z);
    scale(scale);  
    for (Runnable before : this.runDrawBefore) before.run();
    image(img, 0, 0);
    for (Runnable after : this.runDrawAfter) after.run();
    popMatrix();
  }

  public void moveOffset(int x, int y){
    offset.set(
      offset.x - x * SCALE_FACTOR * _scale, 
      offset.y - y * SCALE_FACTOR * _scale
    );
    this.constrainScaleAndOffset();
  }

  public void moveScale(int x){
    scale += x * 0.01;
    this.constrainScaleAndOffset();
  }
  
  public void toDrawBefore(final Runnable runnable){
    this.runDrawBefore.add(runnable);
  }
  
  public void toDrawAfter(final Runnable runnable){
    this.runDrawAfter.add(runnable);
  }

  private void constrainScaleAndOffset(){
    scale = constrain(scale, 0.1, 100);
    _scale = 1 / scale;
    offset.set(this.PConstrain(offset, PNull, POne));
    this.computePosition();
  }

  private void computePosition(){
    PVector maxPos = PVector.sub(size, PVector.mult(this.imgSize, scale) );
    PVector minPos = PNull;
    pos = this.PLerp(PNull, maxPos, offset);
  }

  private PVector PConstrain(PVector a, PVector b, PVector c ){
    return new PVector(constrain(a.x, b.x, c.x), constrain(a.y, b.y, c.y), constrain(a.z, b.z, c.z));
  }

  private PVector PLerp(PVector a, PVector b, PVector c){
    return new PVector(lerp(a.x, b.x, c.x), lerp(a.y, b.y, c.y), lerp(a.z, b.z, c.z));
  }
}
