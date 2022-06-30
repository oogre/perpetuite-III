

import java.util.UUID;
import websockets.*;
import org.json.simple.JSONObject;


class WebsocketServerWrapper extends WebsocketClient {
  public WebsocketServerWrapper(PApplet root, int port, String address) {
    super(root, address);
  }

  @Override
  void sendMessage(String msg)  {
    JSONObject request = new JSONObject();
    request.put("msg", msg);
    request.put("ID", UUID.randomUUID().toString());
    try {
      super.sendMessage(Tools.toJsonString(request));
    }
    catch(IOException e) {
    }
  }
}
