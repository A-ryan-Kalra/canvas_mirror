import React, { useEffect, useRef, useState } from "react";
import CursorMovement from "../components/cursor-movement";
import UserCursorMovement from "../components/user-cursor-movement";
import { useSocket } from "../services/use-socket-provider";
import { useLocation, useParams } from "react-router-dom";

export interface UserDetailsProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
}

function PlayArea() {
  // const socketRef = useRef<WebSocket>(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { roomId } = useParams();
  const name = searchParams.get("name");
  const { socketProvider } = useSocket();
  const [show, setShowInput] = useState<boolean>(false);

  const [userData, setUserData] = useState<UserDetailsProps[]>([
    {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      name: name ?? "",
    },
  ]);

  useEffect(() => {
    // --- CONNECTION SOCKET ---
    const connectSocket = new WebSocket(
      `ws://localhost:8000/ws/${roomId}?name=${name}`
    );
    socketProvider.set("connect", connectSocket);
    const connectSocketProvider = socketProvider.get("connect");

    if (connectSocketProvider) {
      connectSocketProvider.onopen = () => {
        console.log("Connect socket opened.");
        connectSocketProvider.send(
          JSON.stringify({ name, message: `${name} entered the room.` })
        );
      };

      connectSocketProvider.onmessage = (event: MessageEvent) => {
        const parsed = JSON.parse(event.data);
        console.log("Connect socket message:", parsed);
      };

      connectSocketProvider.onclose = () => {
        console.log("Connect socket closed.");
      };

      connectSocketProvider.onerror = (err) => {
        console.error("Connect socket error:", err);
      };
    }

    // ---MESSAGE SOCKET ---
    const messageSocket = new WebSocket(
      `ws://localhost:8000/ws/message/${roomId}/messageRoom?name=${name}`
    );
    socketProvider.set("message", messageSocket);

    messageSocket.onopen = () => {
      console.log("Message socket opened.");
      setShowInput(true);
      messageSocket.send(
        JSON.stringify({ name, message: `${name} entered the room.` })
      );
    };

    messageSocket.onmessage = (event: MessageEvent) => {
      const parsed = JSON.parse(event.data);
      console.log("Message socket message:", parsed);
    };

    messageSocket.onclose = () => {
      console.log("Message socket closed.");
    };

    messageSocket.onerror = (err) => {
      console.error("Message socket error:", err);
    };

    // ---CURSOR SOCKET---

    let lastSent = 0;
    const cursorSocket = new WebSocket(
      `ws://localhost:8000/ws/cursor/${roomId}/cursorRoom?name=${name}`
    );
    // `wss://8f0nnzr5-5173.inc1.devtunnels.ms/ws/cursor/${roomId}?name=${name}`
    socketProvider.set("cursor", cursorSocket);

    cursorSocket.onopen = () => {
      console.log("Cursor socket opened.");
    };

    cursorSocket.onmessage = (event: MessageEvent) => {
      const incoming: UserDetailsProps = JSON.parse(event.data);

      setUserData((prev) => {
        const existingIndex = prev.findIndex(
          (user) => user.name === incoming.name
        );
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = incoming;
          return updated;
        }
        return [...prev, incoming];
      });
    };

    cursorSocket.onclose = () => {
      console.log("Cursor socket closed.");
    };

    cursorSocket.onerror = (err) => {
      console.error("Cursor socket error:", err);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const now = Date.now();
      if (now - lastSent < 20) return;

      const cursorData = {
        x: event.clientX,
        y: event.clientY,
        width: window.innerWidth,
        height: window.innerHeight,
        name,
      };

      if (cursorSocket.readyState === WebSocket.OPEN) {
        cursorSocket.send(JSON.stringify(cursorData));
        lastSent = now;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      connectSocket.close();
      messageSocket.close();
      cursorSocket.close();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [roomId, name]);

  // let date = new Date().getMilliseconds();
  return (
    <div className="p-2 flex flex-col ">
      {userData.length > 0 &&
        userData.map((data: UserDetailsProps, index) => (
          <CursorMovement position={{ ...data }} key={index} />
        ))}
      {show && <UserCursorMovement name={name ?? ""} />}
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
