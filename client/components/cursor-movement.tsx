import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSocket } from "../services/use-socket-provider";
import type { CursorMovementProps } from "../types";

function CursorMovement({ position }: CursorMovementProps) {
  // const socketRef = useRef<WebSocket>(null);
  // const { roomId } = useParams();
  // const [input, setInput] = useState("");
  const [messages, setMessages] = useState({ message: "", name: "" });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const name = searchParams.get("name");

  // const [userCursor, setUserCursor] = useState<{
  //   x: number;
  //   y: number;
  //   width: number;
  //   height: number;
  // }>({
  //   x: 0,
  //   y: 0,
  //   width: 0,
  //   height: 0,
  // });
  const { socketProvider } = useSocket();

  // useEffect(() => {
  //   const ws = new WebSocket(
  //     `wss://8f0nnzr5-5173.inc1.devtunnels.ms/ws/cursor/${roomId}?name=${position.name}`
  //   );
  //   socketProvider.set("cursor", ws);

  //   // return () => {};
  // }, [position.name]);

  useEffect(() => {
    // const ws = new WebSocket(
    //   `ws://localhost:8000/ws/message/${roomId}?name=${name}`
    // );
    // socketProvider.set(roomId ?? "", ws);
    const socket = socketProvider.get("message");

    if (socket) {
      socket!.onclose = () => {
        console.log(`${name} left the chat room.`);
      };

      socket!.onmessage = (event: MessageEvent) => {
        const parsed = JSON.parse(event.data);
        const message = parsed ?? {};

        if (message.name !== name && message.type === "message") {
          setMessages(JSON.parse(event.data));
        }
        // else {
        //   console.log(event.data);
        // }
      };
    }

    // window.addEventListener("keydown", () => sendMessage(input));

    // return () => {
    // socket?.close();
    // window.removeEventListener("keydown", () => sendMessage(input));
    // };
  }, []);

  return (
    <div
      style={{
        width: "50px",
        height: "50px",
        position: "fixed",
        borderRadius: "23px",
        pointerEvents: "none",
        zIndex: 99999,
        cursor: "none",
        // transition: "transform 0.04s ease-in-out",
        transform: `translate(${
          ((position.x - 25) / position.width) * window.innerWidth
        }px, ${((position.y - 25) / position.height) * window.innerHeight}px)`,
      }}
    >
      <div
        style={{
          width: "25px",
          height: "25px",
          color: "purple",
        }}
        className=" relative top-0 left-0 mx-auto"
      >
        {position.name}
        <div className="absolute -top-11 text-amber-400 min-w-[150px]">
          {messages.name !== name && messages.message}
        </div>
      </div>
      <div
        style={{
          WebkitMaskImage: "url('/pointer.svg')",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          WebkitMaskPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundColor: "purple",
          width: "25px",
          height: "25px",
        }}
        className="relative top-0 left-0 mx-auto"
      ></div>
    </div>
  );
}

export default CursorMovement;
