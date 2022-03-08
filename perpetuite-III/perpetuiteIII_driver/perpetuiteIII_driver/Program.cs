using System;

namespace perpetuiteIII_driver
{
    class MainClass
    {
        private static WSServer wsServer;

        public static void Main(string[] args)
        {
            wsServer = new WSServer();
            /*
            omron.onError((error) => {
                killAll();
            });

            wsServer.OnError((error) => {
                killAll();
            });

            wsServer.OnNewTarget((session, position, speed) => {
                omron.goTo(position, speed, () => {
                    session.send("ok");
                });
            });
            */
            wsServer.run();
        }
    }
}
