
void buildXml(){
  XML xml = parseXML("<annotation verified=\"yes\"></annotation>");
  XML folder = xml.addChild("folder");
  folder.setContent("pillFinder");

  XML filename = xml.addChild("filename");
  filename.setContent(sourceFile.getName());

  XML path = xml.addChild("path");
  path.setContent(sourceFile.getAbsolutePath());

  XML source = xml.addChild("source");
  XML database = source.addChild("database");
  database.setContent("Unknown");
  
  XML size = xml.addChild("size");
  XML width = size.addChild("width");
  width.setContent(""+canvas.getImgSize().x);
  XML height = size.addChild("height");
  height.setContent(""+canvas.getImgSize().y);
  XML depth = size.addChild("depth");
  depth.setContent("3");

  XML segmented = xml.addChild("segmented");
  segmented.setContent("0");
  
  for(Tag tag : tags){
    XML object = xml.addChild("object");

    XML name = object.addChild("name");
    name.setContent("0x"+hex(tag.type.getValue()));

    XML pose = object.addChild("pose");
    pose.setContent("Unspecified");

    XML truncated = object.addChild("truncated");
    truncated.setContent("0");

    XML difficult = object.addChild("difficult");
    difficult.setContent("0");

    XML bndbox = object.addChild("bndbox");

    XML xmin = bndbox.addChild("xmin");
    xmin.setContent(""+(tag.pos.x - PILL_SIZE ));

    XML ymin = bndbox.addChild("ymin");
    ymin.setContent(""+(tag.pos.y - PILL_SIZE ));

    XML xmax = bndbox.addChild("xmax");
    xmax.setContent(""+(tag.pos.x + PILL_SIZE ));

    XML ymax = bndbox.addChild("ymax");
    ymax.setContent(""+(tag.pos.y + PILL_SIZE ));
    
  }
  saveXML(xml, "/"+FilenameUtils.getPath(dataPath(FILE_PATH))+"labels.xml");
}