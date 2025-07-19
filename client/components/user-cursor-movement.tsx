import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../services/use-socket-provider";

function UserCursorMovement({ name }: { name: string }) {
  const { roomId } = useParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState({ message: "", name: "" });
  const { socketProvider } = useSocket();

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

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const data = {
        x: event.clientX,
        y: event.clientY,
        width: window.innerWidth,
        height: window.innerHeight,
      };
      setUserCursor(data);
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const sendMessage = () => {
      if (socketProvider.get("message") && input.trim()) {
        const data = { name, message: input };
        // console.log("data====", data);
        socketProvider.get("message")!.send(JSON.stringify(data));

        // setInput("");
      }
    };
    sendMessage();
  }, [input]);

  return (
    <input
      style={{
        width: "150px",
        height: "30px",
        position: "fixed",
        borderRadius: "3px",
        // pointerEvents: "none",
        zIndex: 99999,
        transition: "transform 0.02s ease-in-out",
        transform: `translate(${
          ((userCursor.x - 75) / userCursor.width) * window.innerWidth
        }px, ${
          ((userCursor.y - 25) / userCursor.height) * window.innerHeight
        }px)`,
      }}
      onChange={(e) => setInput(e.target.value)}
      type="text"
      value={input}
      className="border-[1px]  left-12 bg-black/10"
    />
  );
}

export default UserCursorMovement;
