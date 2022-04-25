using System;
using Ace.Adept.Server.Controls;
using Ace.Adept.Server.Motion;
using Ace.AdeptSight.Server;
using Ace.Core.Server;
using Ace.Core.Util;
using QuattroDriver;

namespace Ace.Quattro.Adapter
{
	public delegate void CallbackHandler(String error);

	public delegate void CbHandler();

	public delegate void ErrorHandler(String error);

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
			ace.Clear();
			ace.LoadLocalWorkspace("C:/Users/vince/felix/test.awp", true);

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
		public Vector3D GetPosition()
		{
			return robot.WorldLocation.Offset;
		}
		public void SetPosition(MoveParam param, CallbackHandler callback)
		{
			CartesianMove cartesianMove = ace.CreateObject(typeof(CartesianMove)) as CartesianMove;
			cartesianMove.WorldLocation = (new Transform3D(param.Position.DX, param.Position.DY, param.Position.DZ + 504, 0, 180, -180));
			cartesianMove.Param.Accel = param.Acc;
			cartesianMove.Param.Decel = param.Dcc;
			cartesianMove.Param.Speed = param.Speed;
			cartesianMove.Param.SCurveProfile = 0;
			cartesianMove.Param.MotionEnd = MotionEnd.SettleFine;
			cartesianMove.Param.Straight = true;
			try
			{
				robot.Move(cartesianMove);
				robot.WaitMoveDone();
				callback(null);
			}
			catch (Exception ex)
			{
				callback(ex.Message);
			}
		}
		public Vector3D GetToolOffset()
		{
			return robot.OffsetToTip.Offset;
		}
		public void SetToolOffset(Vector3D position, CallbackHandler callback)
		{

			var offsetTables = ace.Root.Filter(new ObjectTypeFilter(typeof(IGripperOffsetTable)), true);
			IGripperOffsetTable offsetTable = offsetTables[0] as IGripperOffsetTable;
		
			if(offsetTables.Count == 0)
			{

			}

			Console.WriteLine(position.ToString());
			// Create a gripper offset table and associate it with the robot
			IGripperOffsetTable offsetTables = ace.Root.AddObjectOfType(typeof(IGripperOffsetTable), "Gripper Offset Table") as IGripperOffsetTable;
			offsetTable.Robot = robot;

			// Create an offset and add it to the table
			GripperOffset offset1 = ace.CreateObject(typeof(GripperOffset)) as GripperOffset;
			offset1.Index = 2;
			offset1.Offset = new Transform3D(position.DX, position.DY, position.DZ, 0, 0, 0);
			offset1.Description = "This is a gripper offset";
			offsetTable.AddOffset(offset1);
		}
		public Vector3D GetToolPosition()
		{
			return robot.WorldLocationWithTool.Offset;
		}


		public void Walk(Vector3D [] path, int Speed, int Acc, int Dcc, CbHandler cb, ErrorHandler errorCb) {
            CartesianMove cartesianMove = ace.CreateObject(typeof(CartesianMove)) as CartesianMove;

            try
            {
                foreach (Vector3D Position in path)
                {
                    cartesianMove.WorldLocation = (new Transform3D(Position.DX, Position.DY, Position.DZ + 504, 0, 180, -180));
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




        public void GoTo(Vector3D Position, int Speed, CbHandler cb, ErrorHandler errorCb)
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
			cartesianMove.WorldLocation = (new Transform3D(Position.DX, Position.DY, Position.DZ+504, 0, 180, -180));
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
