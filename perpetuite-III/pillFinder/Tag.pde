public enum PILL_TYPE {
    BLUE_PILL(0xFF0000FF),
    RED_PILL (0xFFFF0000),
    YELLOW_PILL(0xFFFFFF00);


    public final int value;
    public int getValue(){
      return value;
    }
    private PILL_TYPE(int value) {
        this.value = value;
    }
  };

class Tag{
  public PILL_TYPE type = PILL_TYPE.BLUE_PILL;
  public PVector pos;
  public Tag(PILL_TYPE type, PVector pos){
    this.type = type;
    this.pos = pos;
  }
}