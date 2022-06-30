using System;
using Ace.Core.Server;

namespace QuattroDriver
{
    class Request
    {
        public String Action { get; set; }
        public String Data { get; set; }
    }

    public class MoveParam
    {
        public Vector3D Position { get; set; }
        public int Speed { get; set; }
        public int Acc { get; set; }//acceleration
        public int Dcc { get; set; }//decceleration
    };

    public class RouteParam
    {
        public Vector3D[] Position { get; set; }
        public int Speed { get; set; }
        public int Acc { get; set; }//acceleration
        public int Dcc { get; set; }//decceleration
    };
}
