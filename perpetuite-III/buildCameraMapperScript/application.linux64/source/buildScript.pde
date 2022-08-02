void buildScript() {

  String command = "convert camera.jpg -matte -verbose -virtual-pixel transparent -distort Perspective 'TL.x,TL.y 1000,600   BL.x,BL.y 1000,2100   BR.x, BR.y 2500,2100   TR.x,TR.y 2500,600' tmp.png ; convert tmp.png -crop 2650x2650+450+50 out.png ; rm tmp.png"; 

  command = command
    .replace("TL.x", ""+round(tags.get(0).pos.x))
    .replace("TL.y", ""+round(tags.get(0).pos.y))
    .replace("BL.x", ""+round(tags.get(1).pos.x))
    .replace("BL.y", ""+round(tags.get(1).pos.y))
    .replace("BR.x", ""+round(tags.get(2).pos.x))
    .replace("BR.y", ""+round(tags.get(2).pos.y))
    .replace("TR.x", ""+round(tags.get(3).pos.x))
    .replace("TR.y", ""+round(tags.get(3).pos.y));


  String[] list = {command};
  saveStrings("data/convert.sh", list);
  exec("bash", "chmod", "777", "data/convert.sh");
  println(list);
  println("DONE");
}
