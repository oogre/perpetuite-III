﻿//using System;
//using System.Text.Json;
//using Ace.Quattro.Adapter;
//using Ace.Core.Server;

using Ace.Core.Server;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using Ace.Adept.Server.Controls;
using Ace.Adept.Server.Motion;
using Ace.AdeptSight.Server;
using Ace.Core.Server.Motion;
using Ace.Core.Util;

using Ace.Core.Server;
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Globalization;
using System.Threading;

using Ace.Adept.Server.Motion.Robots;
using Ace.Adept.Server.Controls;
using Ace.Adept.Server.Motion;
using Ace.AdeptSight.Server;
using Ace.Core.Server.Device;
using Ace.Core.Server.Motion;
using Ace.Core.Util;

namespace QuattroDriver
{	
	public class TCPListener
	{
		TcpListener server;
		Int32 port = 9090;
		IPAddress localAddr = IPAddress.Parse("0.0.0.0");
		//Program parent;
		public TCPListener()
		{
			//this.parent = parent;
		}

		bool isRunning = false;

		public void Start()
		{
			try
			{
				server = new TcpListener(localAddr, port);
				server.Start();
				isRunning = true;
				while (isRunning) Run();
			}
			catch (SocketException e)
			{
				Trace.WriteLine("SocketException: {0}", e.ToString());
			}
			finally
			{
				if (server != default(TcpListener))
				{
					server.Stop();
				}
			}
		}

		public void Stop()
		{
			isRunning = false;
		}
		public void Run()
		{
			// Buffer for reading data
			Byte[] bytes = new Byte[256];
			String data = null;

			// Enter the listening loop.
			Trace.Write("Waiting for a connection... ");

			// Perform a blocking call to accept requests.
			// You could also use server.AcceptSocket() here.
			//server.AcceptTcpClientAsync
			while (!server.Pending())
			{
				Thread.Sleep(10);
				if (!isRunning) return;
			}
			if (!isRunning) return;
			TcpClient client = server.AcceptTcpClient();
			Trace.WriteLine("Connected!");

			data = null;

			// Get a stream object for reading and writing
			NetworkStream stream = client.GetStream();

			int i;

			// Loop to receive all the data sent by the client.
			while ((i = stream.Read(bytes, 0, bytes.Length)) != 0)
			{
				// Translate data bytes to a ASCII string.
				data = System.Text.Encoding.ASCII.GetString(bytes, 0, i);
				// Process the data sent by the client.
				Program.requests.Add(new Request(data));

				Request rep = Program.replies.Take();
				byte[] msg = System.Text.Encoding.ASCII.GetBytes(rep.ToString());
				// Send back a response.
				stream.Write(msg, 0, msg.Length);
			}

			// Shutdown and end connection
			client.Close();
		}
	}
	public class Request
	{
		public enum Type
		{
			ok,
			ko,
			Nothing,
			HighPower,  // param ON-OFF -- rep OK
			Break,      // param ON-OFF -- rep OK
			Speed,      // param 0 to 100 -- rep OK
			Acc,        // param 0 to 100 -- rep OK
			Go,         // param x y z w -- rep OK
			Follow,     // param x1 y1 z1 w1 x2 y2 z2 w2 x3 y3 z3 w3... xn yn zn wn -- rep OK
			Gripper,    // param ON-OFF -- rep ok
			GetZforXY,  // param x y -- rep ok z
			GetPosition,// param / rep ok x y z w
			GetSpeed,   // param / rep ok speed
			GetAcc,     // param / rep ok acc
		}

		private Type _type;
		public Type type
		{
			get
			{
				return this._type;
			}
		}

		private List<Parameter> _parameters = new List<Parameter>();
		public List<Parameter> parameters
		{
			get
			{
				return this._parameters;
			}
		}

		public Request() : this("") { }
		public Request(string rawRequest)
		{ // name 3 i123 f0.1 d0.123 bfalse sString
			string[] parts = rawRequest.Split(' ');
			if (parts.Length <= 0) return;
			switch (parts[0])
			{
				case "ok":
					_type = Type.ok;
					break;
				case "ko":
					_type = Type.ko;
					break;
				case "HighPower":
					_type = Type.HighPower;
					break;
				case "Break":
					_type = Type.Break;
					break;
				case "Speed":
					_type = Type.Speed;
					break;
				case "Acc":
					_type = Type.Acc;
					break;
				case "Go":
					_type = Type.Go;
					break;
				case "Follow":
					_type = Type.Follow;
					break;
				case "Gripper":
					_type = Type.Gripper;
					break;
				case "GetZforXY":
					_type = Type.GetZforXY;
					break;
				default:
					_type = Type.Nothing;
					break;
			}
			if (parts.Length <= 1) return;
			int length = Int32.Parse(parts[1]);
			for (int i = 0; i < length; i++)
			{
				string rawParam = parts[i + 2];
				_parameters.Add(new Parameter(rawParam[0], rawParam.Substring(1)));
			}
		}

		public override string ToString()
		{
			string res = _type.ToString() + " " + _parameters.Count + " ";
			foreach (Parameter p in _parameters)
			{
				res += p.ToString() + " ";
			}
			return res;
		}
	}
	public class Parameter
	{
		private int _iValue;
		public int iValue
		{
			get
			{
				return this._iValue;
			}
		}
		private float _fValue;
		public float fValue
		{
			get
			{
				return this._fValue;
			}
		}
		private double _dValue;
		public double dValue
		{
			get
			{
				return this._dValue;
			}
		}
		private bool _bValue;
		public bool bValue
		{
			get
			{
				return this._bValue;
			}
		}
		private string _sValue;
		public string sValue
		{
			get
			{
				return this._sValue;
			}
		}


		public enum Type
		{
			Integer,
			Float,
			Double,
			Boolean,
			String
		}
		private Type _type;
		public Type type
		{
			get
			{
				return this._type;
			}
		}

		public Parameter(int value)
		{
			_type = Type.Integer;
			_iValue = value;
		}
		public Parameter(float value)
		{
			_type = Type.Float;
			_fValue = value;
		}
		public Parameter(double value)
		{
			_type = Type.Double;
			_dValue = value;
		}
		public Parameter(bool value)
		{
			_type = Type.Boolean;
			_bValue = value;
		}
		public Parameter(string value)
		{
			_type = Type.String;
			_sValue = value;
		}
		public Parameter(char type, string value)
		{
			switch (type)
			{
				case 'i':
					_type = Type.Integer;
					_iValue = (Int32.Parse(value));
					break;
				case 'f':
					_type = Type.Float;
					_fValue = (float.Parse(value, CultureInfo.InvariantCulture.NumberFormat));
					break;
				case 'd':
					_type = Type.Double;
					_dValue = (double.Parse(value, CultureInfo.InvariantCulture.NumberFormat));
					break;
				case 'b':
					_type = Type.Boolean;
					_bValue = (Convert.ToBoolean(value));
					break;
				case 's':
					_type = Type.String;
					_sValue = (value);
					break;
			}
		}

		public override string ToString()
		{
			string res = "";
			switch (type)
			{
				case Type.Integer:
					res += "i" + _iValue.ToString();
					break;
				case Type.Float:
					res += "f" + _fValue.ToString();
					break;
				case Type.Double:
					res += "d" + _dValue.ToString();
					break;
				case Type.Boolean:
					res += "b" + _bValue.ToString();
					break;
				case Type.String:
					res += "s" + _sValue.ToString();
					break;
			}
			return res;
		}
	}
	public static class MyMath
	{
		public static double Lerp(double a, double b, double c)
		{
			return a * (1 - c) + b * c;
		}
	}
	public class RobotController
	{
		private IAceServer ace;
		public IQuattro650 robot;
		private int _speed = 50;
		public int speed
		{
			set
			{
				_speed = value;
			}
			get
			{
				return _speed;
			}
		}
		private int _acc = 50;
		public int acc
		{
			set
			{
				_acc = value;
			}
			get
			{
				return _acc;
			}
		}

		public RobotController(IAceServer ace)
		{
			this.ace = ace;
			robot = (IQuattro650)ace["/SmartController 101/R1 Quattro650"];
			// Make sure the robot controller communications is enabled
			if (robot.IsAlive == false)
				throw new InvalidOperationException();
		}

		public void HighPower(bool value)
		{
			robot.Power = value;
			if (value && robot.IsCalibrated == false)
				robot.Calibrate();
		}

		public void Break(bool value)
		{
			foreach (IMotor motor in robot.Motors)
			{
				motor.BrakeReleased = value;
			}
		}

		public void Gripper(bool value)
		{
			System.Threading.Thread.Sleep(250);
			robot.SetDigitalIO(value ? 1 : -1);
			System.Threading.Thread.Sleep(500);
		}

		public void Go(double x, double y, double z, double w)
		{
			CartesianMove cartesianMove = ace.CreateObject(typeof(CartesianMove)) as CartesianMove;
			cartesianMove.Robot = robot;
			cartesianMove.WorldLocation = new Transform3D(x, y, z, 0, 180, w);
			cartesianMove.Param.Accel = _acc;
			cartesianMove.Param.Decel = _acc;
			cartesianMove.Param.Speed = _speed;
			cartesianMove.Param.Straight = true;
			cartesianMove.Param.MotionEnd = MotionEnd.Blend;
			cartesianMove.Param.SCurveProfile = 0;
			robot.Move(cartesianMove);
			Trace.WriteLine(cartesianMove.WorldLocation);
		}
		public void Stop()
		{
			robot.Power = false;
		}
	}

	public class Program
	{
		static string RemotingName = "ace";
		static int CallbackPort = 43431;
		static int RemotingPort = 43434;
		static IAceServer ace;
		//public AceServer ace;

		public static BlockingCollection<Request> requests = new BlockingCollection<Request>();
		public static BlockingCollection<Request> replies = new BlockingCollection<Request>();
		public static void Main()
		{
			// Initialize remoting infrastructure
			RemotingUtil.InitializeRemotingSubsystem(true, CallbackPort);
			// Connect to ACE.
			ace = (IAceServer)RemotingUtil.GetRemoteServerObject(typeof(IAceServer), RemotingName, "localhost", RemotingPort);
			//ace.Clear();
			//ace.LoadLocalWorkspace("C:/Users/felix/Desktop/perpetuité III/ACE.3.8/driver.perpetuite3.ace.awp", true);


			IQuattro650 r = ace.CreateObject(typeof(IQuattro650)) as IQuattro650;


			RobotController robotController = new RobotController(ace);

			TCPListener server = new TCPListener();
			Thread serverThread = new Thread(new ThreadStart(server.Start));
			serverThread.Start();

			var robots = ace.Root.Filter(new ObjectTypeFilter(typeof(IAdeptRobot)), true);
			IAdeptRobot robot = robots[0] as IAdeptRobot;
			robot.SetDigitalIO(2001);// say the server thread has to run
			while (robot.GetDigitalIO(2001))
			{ // has to run the server thread
				Request req;
				if (requests.TryTake(out req, TimeSpan.FromMilliseconds(10)))
				{
					try
					{
						switch (req.type)
						{
							case Request.Type.HighPower:
								robotController.HighPower(req.parameters[0].bValue);
								break;
							case Request.Type.Break:
								robotController.Break(req.parameters[0].bValue);
								break;
							case Request.Type.Gripper:
								robotController.Gripper(req.parameters[0].bValue);
								break;
							case Request.Type.Speed:
								robotController.speed = req.parameters[0].iValue;
								break;
							case Request.Type.Acc:
								robotController.acc = req.parameters[0].iValue;
								break;
							case Request.Type.Go:
								robotController.Go(req.parameters[0].dValue, req.parameters[1].dValue, req.parameters[2].dValue, req.parameters[3].dValue);
								robot.WaitMoveDone();
								break;
							case Request.Type.Follow:
								robotController.Go(req.parameters[0].dValue, req.parameters[1].dValue, req.parameters[2].dValue, req.parameters[3].dValue);
								break;
						}
						replies.Add(new Request("ok"));
					}
					catch (Exception e)
					{
						Request res = new Request("ko");
						res.parameters.Add(new Parameter(e.ToString()));
						replies.Add(res);
					}

				}
			}
			server.Stop();
			robotController.Stop();
		}
	}
}
