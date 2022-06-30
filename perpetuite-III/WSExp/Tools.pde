import org.json.simple.JSONObject;
import java.io.StringWriter;

static class Tools {
  static String toJsonString(JSONObject obj) throws IOException {
    StringWriter out = new StringWriter();
    obj.writeJSONString(out);
    return out.toString();
  }
}
