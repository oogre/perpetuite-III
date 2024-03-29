
public interface Runner {
   public String run(String [] args);
}


class Server_Process{
	Server server;
	Map<String, Runner> actions = new HashMap<String, Runner>();
	Server_Process(PApplet parent){
		server = new Server(parent, 9090); 
			actions.put("Go", new Runner() {
				public String run(String [] args) {
					float x = float(args[1].substring(1));
					float y = float(args[2].substring(1));
					float z = float(args[3].substring(1));
					float w = float(args[4].substring(1));
					robot.setLocation(x, y, z, w);
					return "ok"; 
				}
			});
			actions.put("Gripper", new Runner() {
				public String run(String [] args) {
					int flag = int(args[1].substring(1));
					robot.gripper(flag);
					return "ok"; 
				}
			}); 
			actions.put("Snap", new Runner() {
				public String run(String [] args) {
					
					PGraphics pg = createGraphics(2592, 1944);
					pg.beginDraw();
					pg.background(0);
					for(Pill p : pills){
						if(robot.isInsideCamera(p)){
							// PVector loc = robot.worldToPix(p.location);
							pg.fill(p.col[0],p.col[1],p.col[2]);
							pg.ellipse(
								map(width/_width * (p.location.x + robot.camLeft) - width/_width * (robot.x ), 0, robot.cam_width/2, 0, 2592) ,
								map(height/_height *  (p.location.y + robot.camTop) - height/_height *  (robot.y ), 0, robot.cam_height/2 * 2592/1944.0, 0, 1944) ,
								75.611, 
								75.611
							);
						}
					}
					pg.endDraw();
					pg.save("/Users/ogre/works/2202/Felix/perpetuite-III/P-III/data/camera.sim.jpg");

					JSONArray json = new JSONArray();
					int i = 0 ; 
					for(Pill p : pills){
						if(robot.isInsideCamera(p)){
							json.setJSONObject(i++, p.toObj());
						}
					}
					println(i);
					return json.toString(); 
				}
			}); 
			actions.put("Follow", new Runner() {
				public String run(String [] args) {
					println("Follow");
					delay(500);
					println("YO");
					return "ok";
				}
			}); 
	}

	void update(){
		Client thisClient = server.available();
		// If the client is not null, and says something, display what it said
		if (thisClient !=null) {
			String request = thisClient.readString();
			if (request != null) {
				String [] req_ = request.split(" ");
				String actionName = req_[0];
				Runner action = actions.get(actionName);
				String [] params = RemoveItem(req_, 0);
				if(action!=null){
					server.write(action.run(params));
				}else{
					println(actionName);
					server.write("ok");
				}
			} 
		} 
	}
}