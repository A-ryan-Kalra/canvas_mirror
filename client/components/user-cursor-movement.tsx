import { useEffect, useRef, useState, type FormEvent } from "react";
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
    var clear: number;
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
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowInput(false);
        return;
      } else {
        setInput("");
        setShowInput(true);

        // clearTimeout(clear);

        clear = setTimeout(() => {
          inputRef?.current?.focus();
        }, 0);
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

  const handleInput = (event: FormEvent) => {
    event.preventDefault();
    setInput("");
    setShowInput(false);
    const inputEl = document.createElement("input");
    inputEl.value = input;
    inputEl.style.position = "fixed";

    // inputEl.style.transform = `translate(${userCursor.x}px, ${userCursor.y}px)`;
    inputEl.style.left = `${userCursor.x - 25}px`;
    inputEl.style.top = `${userCursor.y + 18}px`;
    inputEl.style.zIndex = "999999";
    inputEl.type = "text";
    inputEl.maxLength = 30;
    inputEl.placeholder = "Max 30 words";
    inputEl.style.border = "none";
    inputEl.style.outline = "none";
    inputEl.style.outline = "none";
    inputEl.style.padding = "0.25rem";
    inputEl.style.background = "rgba(37, 235, 221, 0.6)";
    inputEl.style.width = "150px";
    inputEl.style.height = "30px";
    inputEl.style.transition = "transform 0.02s ease-in-out";

    // Style settings
    // inputEl.style.position = "fixed";
    // inputEl.style.left = `${userCursor.x}px`;
    // inputEl.style.top = `${userCursor.y}px`;
    inputEl.style.borderRadius = "3px";
    // inputEl.style.zIndex = "99999";

    document.body.appendChild(inputEl);
    inputEl.focus();
  };

  return (
    show && (
      <form onSubmit={handleInput}>
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
          className="  border-none outline-none text-sm p-1 left-12 bg-black/10"
        />
      </form>
    )
  );
}

export default UserCursorMovement;
