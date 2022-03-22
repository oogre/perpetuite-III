using System;
using Ace.Core.Server;

namespace QuattroDriver
{
    class Request
    {
        public String Action { get; set; }
        public String Data { get; set; }
    }
    public struct Vector3
    {
        public float X { get; set; }
        public float Y { get; set; }
        public float Z { get; set; }

        public Vector3(float x, float y, float z)
        {
            this.X = x;
            this.Y = y;
            this.Z = z;
        }
        public override String ToString()
        {
            return "x : " + X + " y : " + Y + " z : " + Z;
        }
    };

    public class GoToData
    {
        public Vector3 Position { get; set; }
        public int Speed { get; set; }
        public int Acc { get; set; }//acceleration
        public int Dcc { get; set; }//decceleration
    };

    public class WalkData
    {
        public Vector3 [] Position { get; set; }
        public int Speed { get; set; }
        public int Acc { get; set; }//acceleration
        public int Dcc { get; set; }//decceleration
    };
}
