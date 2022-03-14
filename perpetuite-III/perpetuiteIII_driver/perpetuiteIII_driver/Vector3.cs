﻿using System;
namespace perpetuiteIII_driver
{
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
}
