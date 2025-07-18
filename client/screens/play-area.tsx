import React, { useEffect, useRef, useState } from "react";
import CursorMovement from "../components/cursor-movement";
import { useSocket } from "../services/use-socket-provider";
import { useLocation, useParams, useSearchParams } from "react-router-dom";

function PlayArea() {
  const [messages, setMessages] = useState("");
  const [input, setInput] = useState("");

  const socketRef = useRef<WebSocket>(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { roomId } = useParams();
  const name = searchParams.get("name");
  const { socketProvider } = useSocket();
  const socket = socketProvider.get(roomId ?? "");
  console.log(socket);

  // const position = useCursorMovement({ date });

  useEffect(() => {
    // socketRef.current = new WebSocket(`ws://localhost:8000/ws/${date}`);
    if (socket) {
      socket.onmessage = (event: MessageEvent<WebSocket>) => {
        console.log(event.data);
      };
      socket.onopen = () => {
        console.log(`Successfully established the connection.`);
        socket.send(`${name} entered the room.`);
      };

      socket.onclose = () => {
        console.log("Websocket closed");
      };
    }

    // window.addEventListener("keydown", () => sendMessage(input));

    return () => {
      socketRef.current?.close();
      // window.removeEventListener("keydown", () => sendMessage(input));
    };
  }, []);

  useEffect(() => {
    // socket?.close();
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
      <CursorMovement name={name ?? ""} />

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
