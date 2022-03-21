import org.json.simple.JSONObject;

static class Requests {
  public static int DEFAULT_SPEED = 50;
  public static int DEFAULT_ACC = 50;
  public static int DEFAULT_DCC = 50;
  
  public static String goTo(PVector dest) throws IOException {
    return goTo(dest, DEFAULT_SPEED);
  }
  public static String goTo(PVector dest, int speed) throws IOException {
    return goTo(dest, speed, DEFAULT_ACC);
  }
  public static String goTo(PVector dest, int speed, int acc) throws IOException {
    return goTo(dest, speed, acc, DEFAULT_DCC);
  }
  public static String goTo(PVector dest, int speed, int acc, int dcc) throws IOException {
    JSONObject Position = new JSONObject();
    Position.put("X", dest.x);
    Position.put("Y", dest.y);
    Position.put("Z", dest.z);
    JSONObject Data = new JSONObject();
    Data.put("Speed", speed);
    Data.put("Acc", acc);
    Data.put("Dcc", dcc);
    Data.put("Position", Position);
    return build("Goto", Data);
  }
  
  private static String build(String Action, JSONObject Data) throws IOException {
    JSONObject Request = new JSONObject();
    Request.put("Action", Action);
    Request.put("Data", Tools.toJsonString(Data));
    return Tools.toJsonString(Request);
  }
}
