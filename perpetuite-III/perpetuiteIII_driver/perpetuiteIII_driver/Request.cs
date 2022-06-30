using System;
namespace perpetuiteIII_driver
{

    public class Request
    {
        public String Action { get; set; }
        public String Data { get; set; }
    };

    public class GoToData {
        public Vector3 Position { get; set; }
        public int Speed { get; set; }
        public int Acc { get; set; }//acceleration
        public int Dcc { get; set; }//decceleration
    };
    
}


