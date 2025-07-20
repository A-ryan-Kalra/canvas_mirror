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

    const devEl = document.createElement("div");
    devEl.textContent = input;

    devEl.style.minWidth = "50px";
    devEl.style.maxWidth = "100px";
    devEl.style.resize = "both";
    devEl.contentEditable = "true";
    devEl.setAttribute("placeholder", "Max 30 words");
    devEl.style.whiteSpace = "pre-wrap";
    devEl.style.wordBreak = "break-word";
    devEl.style.overflowWrap = "break-word";
    devEl.style.border = "none";
    devEl.style.borderRadius = "10px";
    devEl.style.outline = "none";
    devEl.style.padding = "0.55rem";
    devEl.spellcheck = false;

    devEl.style.background = "rgba(37, 235, 221, 0.6)";
    devEl.style.cursor = "grab";
    devEl.style.position = "fixed";
    devEl.style.left = `${userCursor.x}px`;
    devEl.style.top = `${userCursor.y}px`;
    devEl.className = "dynamic-input";
    document.body.appendChild(devEl);
    // inputEl.focus();

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const data = {
      x: userCursor.x,
      y: userCursor.y,
      width: window.innerWidth,
      height: window.innerHeight,
      name,
      message: input,
    };
    socketProvider.get("message")?.send(JSON.stringify(data));

    setInput("");
    setShowInput(false);
    devEl.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - devEl.offsetLeft;
      offsetY = e.clientY - devEl.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        // console.log(e.clientX - offsetX);
        // console.log(e.clientY - offsetY);
        devEl.style.left = `${e.clientX - offsetX}px`;
        devEl.style.top = `${e.clientY - offsetY}px`;
      }
    });
    devEl.addEventListener("touchstart", (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const react = devEl.getBoundingClientRect();
        offsetX = touch.clientX - react.left;
        offsetY = touch.clientY - react.top;
        isDragging = true;
      }
    });

    document.addEventListener("touchmove", (e) => {
      if (isDragging && e.touches.length > 0) {
        const touch = e.touches[0];
        devEl.style.left = `${touch.clientX - offsetX}px`;
        devEl.style.top = `${touch.clientY - offsetY}px`;
      }
    });
    document.addEventListener("touchend", () => {
      isDragging = false;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
    devEl.addEventListener("keydown", (e) => {
      if (e.key === "Delete") {
        devEl.remove();
      } else if (e.key === "Escape") {
        devEl.blur();
      }
      if (window.innerWidth < 1024) {
        if (e.key === "Backspace" && devEl.textContent?.trim() === "") {
          devEl.remove();
        }
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
