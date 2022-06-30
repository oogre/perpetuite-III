using System;
using SuperWebSocket;
using System.Text.Json;
using Ace.Core.Server;

namespace QuattroDriver
{
    public delegate void GetPositionHandler(string sessionId);
    public delegate void SetPositionHandler(MoveParam param, string sessionId);
    public delegate void GetToolOffsetHandler(string sessionId);
    public delegate void SetToolOffsetHandler(Vector3D offset, string sessionId);
    public delegate void GetToolPositionHandler(string sessionId);
    public delegate void SetToolPositionHandler(MoveParam param, string sessionId);
    public delegate void StopHandler(string sessionId);
    public delegate void GrabHandler(string sessionId);
    public delegate void ReleaseHandler(string sessionId);
    public delegate void HighPowerHandler(bool onOff, string sessionId);
    public delegate void RouteHandler(RouteParam param, string sessionId);
    public delegate void ErrorHandler(string request, string sessionId);

    class WSServer
    {
        private WebSocketServer wsServer;

        public event GetPositionHandler OnGetPosition;
        public event SetPositionHandler OnSetPosition;
        public event GetToolOffsetHandler OnGetToolOffset;
        public event SetToolOffsetHandler OnSetToolOffset;
        public event GetToolPositionHandler OnGetToolPosition;
        public event SetToolPositionHandler OnSetToolPosition;
        public event StopHandler OnStop;
        public event GrabHandler OnGrab;
        public event ReleaseHandler OnRelease;
        public event HighPowerHandler OnHighPower;
        public event RouteHandler OnRoute;
        public event ErrorHandler OnError;

        public WSServer(int port = 6969)
        {
            wsServer = new WebSocketServer();
            wsServer.Setup(port);
            wsServer.NewSessionConnected += WsServer_NewSession;
            wsServer.NewMessageReceived += WsServer_NewMessageRecieved;
            wsServer.SessionClosed += WsServer_SessionClosed;
        }

        public void run()
        {
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

        private void WsServer_SessionClosed(WebSocketSession session, SuperSocket.SocketBase.CloseReason value)
        {
            Console.WriteLine("Session closed");
        }

        private void WsServer_NewMessageRecieved(WebSocketSession session, string value)
        {
            Request m = JsonSerializer.Deserialize<Request>(value);
            switch (m.Action)
            {
                case "GetPosition":
                    OnGetPosition(session.SessionID);
                    break;
                case "SetPosition":
                    {
                        MoveParam param = JsonSerializer.Deserialize<MoveParam>(m.Data);
                        OnSetPosition(param, session.SessionID);
                    }
                    break;
                case "GetToolOffset":
                    OnGetToolOffset(session.SessionID);
                    break;
                case "SetToolOffset":
                    {
                        Vector3D param = JsonSerializer.Deserialize<Vector3D>(m.Data);
                        OnSetToolOffset(param, session.SessionID);
                    }
                    break;
                case "GetToolPosition":
                    OnGetToolPosition(session.SessionID);
                    break;
                case "SetToolPosition":
                    {
                        MoveParam param = JsonSerializer.Deserialize<MoveParam>(m.Data);
                        OnSetToolPosition(param, session.SessionID);
                    }
                    break;
                case "Stop":
                    OnStop(session.SessionID);
                    break;
                case "Grab":
                    OnGrab(session.SessionID);
                    break;
                case "Release":
                    OnRelease(session.SessionID);
                    break;
                case "HighPower":
                    {
                        bool param = JsonSerializer.Deserialize<bool>(m.Data);
                        OnHighPower(param, session.SessionID);
                    }
                    break;
                default:
                    OnError(value, session.SessionID);
                    break;
            }
        }

        public void SendTo(string sessionId, string message)
        {
            WebSocketSession session = wsServer.GetSessionByID(sessionId);
            if (null != session)
            {
                session.Send(message);
            }
        }
    }
}
