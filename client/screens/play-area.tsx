import React, { useEffect, useRef, useState } from "react";
import CursorMovement from "../components/cursor-movement";
import UserCursorMovement from "../components/user-cursor-movement";
import { useSocket } from "../services/use-socket-provider";
import { useLocation, useParams } from "react-router-dom";
import StickerMovement from "../components/sticker-movement";
import type {
  StickerDetailProps,
  StickerMovementProps,
  UserDetailsProps,
} from "../types";

function PlayArea() {
  // const socketRef = useRef<WebSocket>(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { roomId } = useParams();
  const name = searchParams.get("name");
  const { socketProvider } = useSocket();
  const [show, setShowInput] = useState<boolean>(false);

  const [userData, setUserData] = useState<UserDetailsProps[]>([]);
  const [stickerMovement, setStickerMovement] = useState<StickerDetailProps[]>(
    []
  );

  useEffect(() => {
    const ws = new WebSocket(
      `ws://localhost:8000/ws/message/${roomId}?name=${name}`
    );
    // const ws = new WebSocket(
    //   `wss://8f0nnzr5-5173.inc1.devtunnels.ms/ws/message/${roomId}?name=${name}`
    // );
    socketProvider.set("message", ws);
    const socket = socketProvider.get("message");

    if (socket) {
      socket!.onopen = () => {
        setShowInput(true);
        console.log(`Successfully established the connection.`);
        const data = { name, message: `${name} entered the room.` };
        socket?.send(JSON.stringify(data));
      };
      socket!.onclose = () => {
        console.log(`${name} left the chat room.`);
      };
    }

    let lastSent = 0;
    // const ws1 = new WebSocket(
    //   `wss://8f0nnzr5-5173.inc1.devtunnels.ms/ws/cursor/${roomId}?name=${name}`
    // );
    const ws1 = new WebSocket(
      `ws://localhost:8000/ws/cursor/${roomId}?name=${name}`
    );

    socketProvider.set("cursor", ws1);
    const socketCursor = socketProvider.get("cursor");

    if (socketCursor) {
      socketCursor.onclose = () => {
        console.log("SocketRef.current closed.");
        // Optionally: attempt reconnect
      };

      socketCursor.onerror = (err) => {
        console.error("SocketRef.current error:", err);
      };

      socketCursor.onopen = () => {
        console.log("Socket opened.");
      };

      socketCursor.onmessage = (event: MessageEvent) => {
        const incomming = JSON.parse(event.data);

        if (incomming.name === name) {
          return;
        }
        if (incomming.type === "delete") {
          console.log("incomming", incomming);
          setStickerMovement((prev) =>
            prev.filter((user) => user.stickerNo !== incomming.stickerNo)
          );

          return;
        }

        if (incomming.type === "sticker") {
          setStickerMovement((prev: StickerDetailProps[]) => {
            const existingIndex = prev.findIndex(
              (user) =>
                user.name === incomming.name &&
                user.stickerNo === incomming.stickerNo
            );

            if (existingIndex !== -1) {
              const updated = [...prev];
              updated[existingIndex] = incomming;
              return updated;
            } else {
              return [...prev, incomming];
            }
          });
        } else {
          setUserData((prev: UserDetailsProps[]) => {
            const existingIndex = prev.findIndex(
              (user) => user.name == incomming.name
            );

            if (existingIndex !== -1) {
              const updated = [...prev];
              updated[existingIndex] = incomming;
              return updated;
            } else {
              return [...prev, incomming];
            }
          });
        }
      };
    }

    const handleMouseMove = (event: MouseEvent) => {
      const now = Date.now();
      if (now - lastSent < 10) return;

      const data = {
        x: event.clientX,
        y: event.clientY,
        width: window.innerWidth,
        height: window.innerHeight,
        name,
        type: "cursor",
      };
      //  setUserCursor(data);

      if (socketCursor && socketCursor.readyState === WebSocket.OPEN) {
        // console.log(data);

        socketCursor.send(JSON.stringify(data));
        lastSent = now;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      socketCursor?.close();
      socket?.close();
    };
  }, []);

  // useEffect(() => {
  //   const stickerSocket = socketProvider.get("sticker");
  //   console.log("stickerSocket", stickerSocket);
  // }, [socketProvider.get("sticker")]);

  // let date = new Date().getMilliseconds();
  console.log("stickerMovement=", stickerMovement);

  return (
    <div className="p-2 flex flex-col ">
      {userData.length > 0 &&
        userData.map((data: UserDetailsProps, index) => (
          <CursorMovement position={{ ...data }} key={index} />
        ))}
      {stickerMovement.length > 0 &&
        stickerMovement.map((data: StickerDetailProps, index) => (
          <StickerMovement position={{ ...data }} key={index} />
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
