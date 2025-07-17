import { useEffect, useRef, useState } from "react";

import CursorMovement from "../components/cursor-movement";

function App() {
  const socketRef = useRef<WebSocket>(null);
  const [messages, setMessages] = useState<Array<string | WebSocket>>([]);
  const [input, setInput] = useState("");
  let date = new Date().getMilliseconds();

  // const position = useCursorMovement({ date });
  let lastSent = 0;

  useEffect(() => {
    socketRef.current = new WebSocket(`ws://localhost:8000/ws/${date}`);
    socketRef.current.onopen = () => {
      console.log("WebSocket connection established");
    };
    socketRef.current.onmessage = (event: MessageEvent<WebSocket>) => {
      console.log("event.data=>", event.data);
      console.log("wowowo");

      setMessages((prev) => [...prev, event.data]);
    };

    socketRef.current.onclose = () => {
      console.log("Websocket closed");
    };

    window.addEventListener("keydown", sendMessage);

    return () => {
      socketRef.current?.close();
      window.removeEventListener("keydown", sendMessage);
    };
  }, []);

  const sendMessage = () => {
    // const now = Date.now();
    // if (now - lastSent < 500) return;
    if (socketRef.current && input.trim()) {
      socketRef.current.send(input);
      // setInput("");
    }
  };

  return (
    <div className="w-full h-dvh">
      <CursorMovement date={date} />
      <div className="p-2 flex flex-col ">
        <h1 className="text-2xl">Fast Api Websocket Chats</h1>
        <div className="flex flex-col gap-y-2">
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            value={input}
            className="border-[1px] w-1/2"
          />
          <button
            onClick={sendMessage}
            className="hover:bg-blue-600 cursor-pointer rounded-md w-fit p-2 text-black border-[1px] border-slate-400 hover:text-white"
          >
            Send
          </button>
        </div>
        <div>
          {messages?.map((message: string | any, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
