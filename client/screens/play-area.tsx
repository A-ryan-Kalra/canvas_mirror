import React, { useEffect, useRef, useState } from "react";

function PlayArea() {
  const [messages, setMessages] = useState("");
  const [input, setInput] = useState("");
  const [client, setInputsetCLient] = useState(0);
  const socketRef = useRef<WebSocket>(null);

  // const position = useCursorMovement({ date });

  useEffect(() => {
    let date = new Date().getMilliseconds();
    setInputsetCLient(date);
    console.log(date);
    socketRef.current = new WebSocket(`ws://localhost:8000/ws/${date}`);
    socketRef.current.onopen = () => {
      console.log("WebSocket connection established");
    };
    socketRef.current.onmessage = (event: MessageEvent<WebSocket>) => {
      console.log("event.data=>", event.data);

      setMessages(event.data as unknown as string);
    };

    socketRef.current.onclose = () => {
      console.log("Websocket closed");
    };

    // window.addEventListener("keydown", () => sendMessage(input));

    return () => {
      socketRef.current?.close();
      // window.removeEventListener("keydown", () => sendMessage(input));
    };
  }, []);

  useEffect(() => {
    const sendMessage = () => {
      console.log("input==", input);
      // if (now - lastSent < 500) return;
      if (socketRef.current && input.trim()) {
        socketRef.current.send(input);
        // setInput("");
      }
    };
    sendMessage();
  }, [input]);
  // let date = new Date().getMilliseconds();
  return (
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
          // onClick={() => socketRef.current?.close()}
          className="hover:bg-blue-600 cursor-pointer rounded-md w-fit p-2 text-black border-[1px] border-slate-400 hover:text-white"
        >
          Send
        </button>
      </div>
      <div>{messages}</div>
    </div>
  );
}

export default PlayArea;
