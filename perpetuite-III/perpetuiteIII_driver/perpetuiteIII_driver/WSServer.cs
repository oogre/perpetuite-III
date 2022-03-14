using System;
using SuperWebSocket;
using System.Text.Json;

namespace perpetuiteIII_driver
{
    public delegate void GotoHandler(Vector3 pos);

    public class WSServer
    {
        private WebSocketServer wsServer;

        
        public event GotoHandler onGoto;


        public WSServer(int port = 6969)
        {
            wsServer = new WebSocketServer();
            wsServer.Setup(port);
            wsServer.NewSessionConnected += WsServer_NewSession;
            wsServer.NewMessageReceived += WsServer_NewMessageRecieved;
            wsServer.SessionClosed += WsServer_SessionClosed;
        }

        public void run() {
            wsServer.Start();
            Console.WriteLine("WS Server is running at : ws://localhost:6969");
            Console.WriteLine("Press any to stop");
            Console.ReadKey();
            wsServer.Stop();
            Console.WriteLine("WS Server is stopped");
        }

        private void WsServer_NewSession(WebSocketSession session)
        {
            Console.WriteLine("New Connection");
        }

        private void WsServer_NewMessageRecieved(WebSocketSession session, string value)
        {
            Console.WriteLine("New Message : " + value);

            Request m = JsonSerializer.Deserialize<Request>(value);

            switch (m.Action)
            {
                case "Goto":
                    Vector3 pos = JsonSerializer.Deserialize<Vector3>(m.Data);
                    onGoto(pos);
                   break;   
            }
            session.Send("ok");
        }   

        private void WsServer_SessionClosed(WebSocketSession session, SuperSocket.SocketBase.CloseReason value)
        {
            Console.WriteLine("Session closed");
        }
    }
}
