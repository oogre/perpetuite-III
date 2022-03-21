using System;
using System.Threading.Tasks;

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
            /*
            omron.onError((error) => {
                killAll();
            });

            wsServer.OnError((error) => {
                killAll();
            });

            */

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

            wsServer.onMalformed += (String value, String sessionId) => {
                Console.WriteLine("ERROR with");
                Console.WriteLine(value);
                wsServer.SendTo(sessionId, "ko");
            };
            wsServer.run();
        }
    }
}
