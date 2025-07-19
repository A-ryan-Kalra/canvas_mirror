import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../services/use-socket-provider";

function UserCursorMovement({ name }: { name: string }) {
  const { roomId } = useParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState({ message: "", name: "" });
  const { socketProvider } = useSocket();
  const [show, setShowInput] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    // const handleMouseMove = (event: MouseEvent) => {
    //   const data = {
    //     x: event.clientX,
    //     y: event.clientY,
    //     width: window.innerWidth,
    //     height: window.innerHeight,
    //   };
    //   setUserCursor(data);

    // };
    // window.addEventListener("mousemove", handleMouseMove);

    const handleMouseDown = (event: MouseEvent) => {
      console.log("userCursor.x", userCursor.x);
      console.log("userCursor.y", userCursor.y);

      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        // setShowInput(true);
        setShowInput(false);
      } else {
        setShowInput(true);
      }

      const data = {
        x: event.clientX,
        y: event.clientY,
        width: window.innerWidth,
        height: window.innerHeight,
      };
      console.log(data);
      setUserCursor(data);

      // else if (currentXPosition === Number.NEGATIVE_INFINITY) {
      //   setShowInput(true);
      // }
    };

    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      // window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  useEffect(() => {
    const sendMessage = () => {
      if (socketProvider.get("message")) {
        const data = { name, message: input };

        socketProvider.get("message")!.send(JSON.stringify(data));

        // setInput("");
      }
    };
    sendMessage();
  }, [input]);

  return (
    show && (
      <input
        maxLength={30}
        placeholder="Max 30 words"
        ref={inputRef}
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
    )
  );
}

export default UserCursorMovement;
