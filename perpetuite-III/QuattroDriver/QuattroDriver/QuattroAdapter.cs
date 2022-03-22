using System;
using Ace.Adept.Server.Controls;
using Ace.Adept.Server.Motion;
using Ace.Core.Server;
using Ace.Core.Server.Motion;
using Ace.Core.Util;

namespace QuattroDriver
{
	public delegate void CallbackHandler();
	public delegate void ErrorHandler(String message);

	class QuattroAdapter
    {

        private const string RemotingName = "ace";
        private const int CallbackPort = 43431;
        private const int RemotingPort = 43434;

		private IAceServer ace;
		private IAdeptRobot robot;

		public QuattroAdapter()
        {
			// Initialize remoting infrastructure
			RemotingUtil.InitializeRemotingSubsystem(true, CallbackPort);
			// Connect to ACE.
			ace = (IAceServer)RemotingUtil.GetRemoteServerObject(typeof(IAceServer), RemotingName, "localhost", RemotingPort);

            // Get a list of all the controllers in the system, and enable power on all of them.
            foreach (IAdeptController controller in ace.Root.Filter(new ObjectTypeFilter(typeof(IAdeptController)), true))
			{
				Console.WriteLine("Found controller '{0}'", controller);
				controller.HighPower = true;
				controller.Calibrate();
			}

			var robots = ace.Root.Filter(new ObjectTypeFilter(typeof(IAdeptRobot)), true);
			robot = robots[0] as IAdeptRobot;
			// If not calibrated, calibrate the robot
			try
			{
				if (robot.IsCalibrated == false)
				{
					robot.Power = true;
					robot.Calibrate();
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine(ex.Message);
			}
		}

        public void Walk(Vector3 [] path, int Speed, int Acc, int Dcc, CallbackHandler cb, ErrorHandler errorCb) {
            CartesianMove cartesianMove = ace.CreateObject(typeof(CartesianMove)) as CartesianMove;

            try
            {
                foreach (Vector3 Position in path)
                {
                    cartesianMove.WorldLocation = (new Transform3D(Position.X, Position.Y, Position.Z + 504, 0, 180, -180));
                    cartesianMove.Param.Accel = Acc;
                    cartesianMove.Param.Decel = Dcc;
                    cartesianMove.Param.Speed = Speed;
                    cartesianMove.Param.SCurveProfile = 0;
                    cartesianMove.Param.MotionEnd = MotionEnd.Blend;
                    cartesianMove.Param.Straight = false;
                    robot.Move(cartesianMove);
                }
                robot.WaitMoveDone();
                cb();
                // Force the robot to issue a DETACH
                robot.AutomaticControlActive = false;
            }
            catch (Exception ex)
            {
                errorCb(ex.Message);
            }

        }

        public void GoTo(Vector3 Position, int Speed, CallbackHandler cb, ErrorHandler errorCb)
		{
			// Check if the current location is inrange            
			Transform3D currentPosition = robot.WorldLocationWithTool;
			int inRange = robot.InRange(currentPosition);
			Console.WriteLine(currentPosition + " inrange check = " + inRange);

			//double[] jointPositions = robot.JointPosition;
			// Get the current robot configuration
			//IMoveConfiguration moveConfig = robot.GetMoveConfiguration(jointPositions);

			// Create a motion object and command the robot to move
			CartesianMove cartesianMove = ace.CreateObject(typeof(CartesianMove)) as CartesianMove;
			//cartesianMove.MoveConfiguration = moveConfig;
			//Transform3D loc = robot.JointToWorld(jointPositions);

			//cartesianMove.WorldLocation = Position;
			cartesianMove.WorldLocation = (new Transform3D(Position.X, Position.Y, Position.Z+504, 0, 180, -180));
			Console.WriteLine(cartesianMove.WorldLocation);
			cartesianMove.Param.Accel = 2;
			cartesianMove.Param.Decel = 2;
			cartesianMove.Param.Speed = Speed;
			cartesianMove.Param.SCurveProfile = 0;
			cartesianMove.Param.MotionEnd = MotionEnd.Blend;
			cartesianMove.Param.Straight = true;
			try
			{
				// Issue the move and wait until it is done
				robot.Move(cartesianMove);
				robot.WaitMoveDone();
				cb();
				// Force the robot to issue a DETACH
				robot.AutomaticControlActive = false;
			}
			catch (Exception ex)
			{
				//Console.WriteLine(ex.Message);
				errorCb(ex.Message);
			}
		}


	}
}
