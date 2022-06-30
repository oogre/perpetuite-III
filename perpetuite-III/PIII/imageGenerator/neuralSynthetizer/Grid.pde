class Grid {
  ArrayList<Cell> cells;
  Grid(int cellPerLine) {
    cells = new ArrayList<Cell>();
    float cellDiameter = 1.0/ cellPerLine;
    for (int y = 0; y < cellPerLine; y ++) {
      for (int x = 0; x < cellPerLine+1; x ++) {
        float _x = x+(y%2==1?-0.5:0);
        float _y = y;
        _x = ((_x + 0.5)/(float)cellPerLine);
        _y = ((_y + 0.5)/(float)cellPerLine);
        float dX = _x - 0.5;
        float dY = _y - 0.5;
        float d = sqrt(dX * dX + dY * dY);
        if (d <= 0.5) {
          cells.add(new Cell(_x, _y, cellDiameter));
        }
      }
    }
  }
  
  void draw(){
    for(Cell cell : cells){
      cell.draw();
    }
  }
  
  Cell getRandomCell(){
    return cells.get((int)random(cells.size()));
  }
  
  Cell getRandomCell(color c){
    Cell cell;
    do{
      cell = getRandomCell();
    }while(cell == null || cell.pill.c != c);
    return cell;
  }
  
  Cell getRandomEmptyCell(){
    Cell cell;
    do{
      cell = getRandomCell();
    }while(cell == null || cell.pill != null);
    return cell;
  }
}
