class WorkingArea {
  ArrayList<Corner> corners;

  WorkingArea(int tagIdTopRight, int tagIdTopLeft, int tagIdBottomLeft, int tagIdBottomRight) {
    corners = new ArrayList<Corner>();
    corners.add(new Corner(tagIdTopRight));
    corners.add(new Corner(tagIdTopLeft));
    corners.add(new Corner(tagIdBottomLeft));
    corners.add(new Corner(tagIdBottomRight));
  }
  
  Corner setCornerPosition(int id, PVector TR, PVector TL, PVector BL, PVector BR){
    for (Corner current : corners) {
      if (current.id == id) {
        return current;
      }
    }
    return null;
  }
}
