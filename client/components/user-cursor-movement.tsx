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

    // socket.readyState === WebSocket.OPEN;
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains("dynamic-input")) {
        return;
      }

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
  }, [socketProvider]);

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

    const inputEl = document.createElement("div");
    inputEl.textContent = input;

    inputEl.style.minWidth = "50px";
    inputEl.style.maxWidth = "100px";
    inputEl.style.resize = "both";
    inputEl.contentEditable = "true";
    inputEl.setAttribute("placeholder", "Max 30 words");
    inputEl.style.whiteSpace = "pre-wrap";
    inputEl.style.wordBreak = "break-word";
    inputEl.style.overflowWrap = "break-word";
    inputEl.style.border = "none";
    inputEl.style.borderRadius = "10px";
    inputEl.style.outline = "none";
    inputEl.style.padding = "0.55rem";

    inputEl.style.background = "rgba(37, 235, 221, 0.6)";
    inputEl.style.cursor = "grab";
    inputEl.style.position = "fixed";
    inputEl.style.left = `${userCursor.x}px`;
    inputEl.style.top = `${userCursor.y}px`;
    inputEl.className = "dynamic-input";
    document.body.appendChild(inputEl);
    // inputEl.focus();

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    inputEl.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - inputEl.offsetLeft;
      offsetY = e.clientY - inputEl.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        // console.log(e.clientX - offsetX);
        // console.log(e.clientY - offsetY);
        inputEl.style.left = `${e.clientX - offsetX}px`;
        inputEl.style.top = `${e.clientY - offsetY}px`;
      }
    });
    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Delete") {
        inputEl.remove();
      } else if (e.key === "Escape") {
        inputEl.blur();
      }
    });
  };

  return (
    show && (
      <form onSubmit={handleInput}>
        <input
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowInput(false);
              setInput("false");
            }
          }}
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
