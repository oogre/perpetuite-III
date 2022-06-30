using System;
using System.Text.Json;
using Ace.Quattro.Adapter;
using Ace.Core.Server;

namespace QuattroDriver
{
    class Program
    {
        private static WSServer wsServer;
        private static QuattroAdapter quattro;
        static void Main(string[] args)
        {
            wsServer = new WSServer(6969);
            quattro = new QuattroAdapter();
 
            wsServer.OnGetPosition += (string sessionId) => {
                wsServer.SendTo(sessionId, JsonSerializer.Serialize<Vector3D>(quattro.GetPosition()));
            };

            wsServer.OnSetPosition += (MoveParam param, string sessionId) => {
                quattro.SetPosition(param, (String error) => {
                    wsServer.SendTo(sessionId, "ok");
                });
            };
            wsServer.OnGetToolOffset += (string sessionId) => {
                wsServer.SendTo(sessionId, JsonSerializer.Serialize<Vector3D>(quattro.GetToolOffset()));
            };

            wsServer.OnSetToolOffset += (Vector3D pos, string sessionId) => {
                quattro.SetToolOffset(pos, (String error) => {
                    wsServer.SendTo(sessionId, "ok");
                });
            };
            wsServer.OnGetToolPosition += (string sessionId) => {
                wsServer.SendTo(sessionId, JsonSerializer.Serialize<Vector3D>(quattro.GetToolPosition()));
            };

            wsServer.OnSetToolPosition += (MoveParam param, string sessionId) => { };
            wsServer.OnStop += (string sessionId) => { };
            wsServer.OnGrab += (string sessionId) => { };
            wsServer.OnRelease += (string sessionId) => { };
            wsServer.OnHighPower += (bool isOn, string sessionId) => { };
            wsServer.OnRoute += (RouteParam param, string sessionId) => { };
            wsServer.OnError += (string error, string sessionId) => {
                Console.WriteLine("ERROR");
                Console.WriteLine(error);
                wsServer.SendTo(sessionId, error);
            };

            /*
            wsServer.onGoto += (GoToData param, string sessionId) => {
                Console.WriteLine("GOTO :");
                Console.WriteLine("\t X : " + param.Position.X);
                Console.WriteLine("\t Y : " + param.Position.Y);
                Console.WriteLine("\t Z : " + param.Position.Z);
                Console.WriteLine("\t Speed : " + param.Speed);
                Console.WriteLine("\t Acc : " + param.Acc);
                Console.WriteLine("\t Dcc : " + param.Dcc);


                quattro.GoTo(param.Position, param.Speed, () => {
                    Console.WriteLine("Done");
                    wsServer.SendTo(sessionId, "ok");
                }, (String message) => {
                    Console.WriteLine(message);
                    wsServer.SendTo(sessionId, message);
                });
            };

            wsServer.onGetPosition+= (string sessionId) => {
                Vector3 position = new Vector3 (quattro.getPosition());
                wsServer.SendTo(sessionId, JsonSerializer.Serialize<Vector3>(position));
            };

            wsServer.onMalformed += (String value, String sessionId) => {
                Console.WriteLine("ERROR with");
                Console.WriteLine(value);
                wsServer.SendTo(sessionId, "ko");
            };
            */
            wsServer.run();
        }
    }
}
