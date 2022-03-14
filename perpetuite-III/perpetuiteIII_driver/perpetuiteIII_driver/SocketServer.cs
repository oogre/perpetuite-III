using System;
using WebSocketSharp;

namespace perpetuiteIII_driver
{
    public class Incomming : WebSocketBehavior
    {
        public byte[] _rawData;

        public void CustomSend(byte[] buffer)
        {
            Send(buffer);
        }
        protected override void OnMessage(MessageEventArgs e)
        {
            Console.WriteLine(e.RawData);
        }
        protected override void OnOpen()
        {
            Console.WriteLine("WS OPEN");
        }
        protected override void OnClose(CloseEventArgs e)
        {
            Console.WriteLine("WS CLOSE");
        }

        protected override void OnError(WebSocketSharp.ErrorEventArgs e)
        {
            Console.WriteLine("WS ERROR");
        }

    }
}
