using System;
using SuperWebSocket;
using System.Text.Json;

namespace perpetuiteIII_driver
{
    public delegate void MalformedHandler(string request, string sessionId);
    public delegate void GotoHandler(GoToData param, string sessionId);

    public class WSServer
    {
        private WebSocketServer wsServer;


        public event MalformedHandler onMalformed;
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
            Console.WriteLine(session.SessionID);
        }

        private void WsServer_NewMessageRecieved(WebSocketSession session, string value)
        {
            Request m = JsonSerializer.Deserialize<Request>(value);
            switch (m.Action)
            {
                case "Goto":
                    GoToData param = JsonSerializer.Deserialize<GoToData>(m.Data);
                    onGoto(param, session.SessionID);
                   return;
                default:
                    onMalformed(value, session.SessionID);
                    break;
            }
        }   

        private void WsServer_SessionClosed(WebSocketSession session, SuperSocket.SocketBase.CloseReason value)
        {
            Console.WriteLine("Session closed");
        }

        public void SendTo(string sessionId, string message)
        {
            WebSocketSession session = wsServer.GetAppSessionByID(sessionId);
            if (null != session)
            {
                wsServer.GetAppSessionByID(sessionId).Send(message);
            }
            
        }
    }
}
