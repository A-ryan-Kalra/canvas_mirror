import React, { useEffect, useRef, useState } from "react";
import CursorMovement from "../components/cursor-movement";
import UserCursorMovement from "../components/user-cursor-movement";
import { useSocket } from "../services/use-socket-provider";
import { useLocation, useParams } from "react-router-dom";

function PlayArea() {
  // const socketRef = useRef<WebSocket>(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { roomId } = useParams();
  const name = searchParams.get("name");
  const { socketProvider } = useSocket();

  useEffect(() => {
    const ws = new WebSocket(
      `ws://localhost:8000/ws/message/${roomId}?name=${name}`
    );
    socketProvider.set(roomId ?? "", ws);
    const socket = socketProvider.get(roomId ?? "");

    socket!.onopen = () => {
      console.log(`Successfully established the connection.`);
      const data = { name, message: `${name} entered the room.` };
      socket?.send(JSON.stringify(data));
    };
    // socket!.onclose = () => {
    //   console.log(`${name} left the chat room.`);
    // };

    // socket!.onmessage = (event: MessageEvent<WebSocket>) => {
    //   setMessages(event.data as unknown as string);
    // };
    // socket!.onopen = () => {
    //   console.log(`Successfully established the connection.`);
    //   socket?.send(`${name} entered the room.`);
    // };

    // window.addEventListener("keydown", () => sendMessage(input));

    // return () => {
    //   socket?.close();
    //   // window.removeEventListener("keydown", () => sendMessage(input));
    // };
  }, []);

  // let date = new Date().getMilliseconds();
  return (
    <div className="p-2 flex flex-col ">
      <CursorMovement name={name ?? ""} />
      <UserCursorMovement name={name ?? ""} />
      <h1 className="text-2xl">Fast Api Websocket Chats</h1>
      <div className="flex flex-col gap-y-2">
        <button
          // onClick={() => socketRef.current?.close()}
          className="hover:bg-blue-600 cursor-pointer rounded-md w-fit p-2 text-black border-[1px] border-slate-400 hover:text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default PlayArea;
