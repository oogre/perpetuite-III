using System;

using System.Threading.Tasks;

namespace perpetuiteIII_driver
{
    class MainClass
    {
        private static WSServer wsServer;

        public static void Main(string[] args)
        {
            wsServer = new WSServer(6969);
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

                Task.Delay(1000).Wait();

                Console.WriteLine("Done");
                wsServer.SendTo(sessionId, "ok");
                //aceServer.goTo(param.Position, param.speed, () => {
                //    wsServer.SendTo(sessionId, "ok");
                //});
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
