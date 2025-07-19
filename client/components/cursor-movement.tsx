import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../services/use-socket-provider";

function CursorMovement({ name }: { name: string }) {
  const socketRef = useRef<WebSocket>(null);
  const { roomId } = useParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState({ message: "", name: "" });
  const [position, setPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [userCursor, setUserCursor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const { socketProvider } = useSocket();

  useEffect(() => {
    const ws = new WebSocket(
      `ws://localhost:8000/ws/cursor/${roomId}?name=${name}`
    );
    socketProvider.set("cursor", ws);
    const socket = socketProvider.get("cursor");

    let lastSent = 0;

    if (socket) {
      socket.onclose = () => {
        console.log("SocketRef.current closed.");
        // Optionally: attempt reconnect
      };

      socket.onerror = (err) => {
        console.error("SocketRef.current error:", err);
      };

      socket.onopen = () => {
        console.log("Socket opened.");
      };

      socket.onmessage = (event: MessageEvent) => {
        const parse = JSON.parse(event.data);
        // console.log("Received cursor data:", parse);
        setPosition({
          x: parse.x,
          y: parse.y,
          width: parse.width,
          height: parse.height,
        });
      };
    }

    const handleMouseMove = (event: MouseEvent) => {
      const now = Date.now();
      if (now - lastSent < 20) return;

      const data = {
        x: event.clientX,
        y: event.clientY,
        width: window.innerWidth,
        height: window.innerHeight,
        name,
      };
      setUserCursor(data);

      if (socket && socket.readyState === WebSocket.OPEN) {
        // console.log(data);
        socket.send(JSON.stringify(data));
        lastSent = now;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      socket?.close();
    };
  }, [name]);

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
        if (message.name !== name) setMessages(JSON.parse(event.data));
      };
    }

    // window.addEventListener("keydown", () => sendMessage(input));

    return () => {
      socket?.close();
      // window.removeEventListener("keydown", () => sendMessage(input));
    };
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
        transition: "transform 0.02s ease-in-out",
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
        {name}
      </div>
      <div>{messages.name !== name && messages.message}</div>
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
