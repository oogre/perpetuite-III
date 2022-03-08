using System;
using SuperWebSocket;

namespace perpetuiteIII_driver
{
    public class WSServer
    {
        private WebSocketServer wsServer;
        
        public WSServer()
        {
            wsServer = new WebSocketServer();
            int port = 6969;
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
            session.Send(value);
            foreach (WebSocketSession s in wsServer.GetAllSessions())
            {
                s.Send(value);
            }
        }

        private void WsServer_SessionClosed(WebSocketSession session, SuperSocket.SocketBase.CloseReason value)
        {
            Console.WriteLine("Session closed");
        }
    }
}
