import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../services/use-socket-provider";
import type { StickerDetailProps } from "../types";
import { v4 as uuidv4 } from "uuid";
function UserCursorMovement({ name }: { name: string }) {
  const { roomId } = useParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState({ message: "", name: "" });
  const [stopMessageSocket, setStopMessageSocket] = useState(false);
  const { socketProvider } = useSocket();
  const [showInput, setShowInput] = useState<boolean>(false);
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
    // socket.readyState === WebSocket.OPEN;

    const stickerSocket = new WebSocket(
      `ws://localhost:8000/ws/sticker/${roomId}?name=${name}`
    );

    console.log(socketProvider.get("sticker"));
    stickerSocket.onclose = () => {
      console.log("Sticker Move Socket connection closed");
    };
    stickerSocket.onerror = (err) => {
      console.error("Sticker Socket error:", err);
    };
    stickerSocket.onmessage = (event: MessageEvent) => {
      const parsed = JSON.parse(event.data);
      console.log("Sticker Move Data", parsed);
    };
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains("dynamic-input")) {
        setShowInput(false);
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

        setTimeout(() => {
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
      stickerSocket.close();

      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [socketProvider]);

  useEffect(() => {
    const sendMessage = () => {
      if (socketProvider.get("message")) {
        const data = { name, message: input };

        socketProvider.get("message")!.send(JSON.stringify(data));
      }
    };
    sendMessage();
  }, [input]);
  function handleStickerMovement(data: StickerDetailProps | {}) {
    //  setUserCursor(data);
    const stickerMovement = socketProvider.get("cursor");
    if (stickerMovement && stickerMovement.readyState === WebSocket.OPEN) {
      stickerMovement.send(JSON.stringify(data));
      //  lastSent = now;
    }
  }
  const handleInput = (event: FormEvent) => {
    event.preventDefault();
    const id = uuidv4();

    const devEl = document.createElement("div");
    devEl.textContent = input;

    devEl.style.minWidth = "50px";
    devEl.style.maxWidth = "150px";
    // devEl.style.maxHeight = "100px";
    devEl.style.resize = "both";
    devEl.contentEditable = "true";
    devEl.setAttribute("placeholder", "Max 30 words");
    devEl.style.whiteSpace = "wrap";
    devEl.style.wordBreak = "break-word";
    devEl.style.overflowWrap = "break-word";
    devEl.style.border = "none";
    devEl.style.outline = "none";
    devEl.style.borderRadius = "10px";
    devEl.style.padding = "0.55rem";
    devEl.style.zIndex = "99999";
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
      type: "sticker",
      message: devEl.textContent as string,
      stickerNo: id,
    };
    // socketProvider.get("message")?.send(JSON.stringify(data));

    handleStickerMovement(data);
    setInput("");
    setShowInput(false);
    let lastSent = 0;

    devEl.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - devEl.offsetLeft;
      offsetY = e.clientY - devEl.offsetTop;
    });
    let clearMessageSocketTimer: number = 0;

    devEl.addEventListener("keydown", (e) => {
      setStopMessageSocket(true);
      const allowedKeys = [
        "Backspace",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ];
      const shortcuts =
        (e.metaKey || e.ctrlKey) &&
        ["a", "c", "v"].includes(e.key.toLowerCase());

      const allowed = allowedKeys.includes(e.key) || shortcuts;
      if (devEl.textContent && devEl.textContent.length > 29 && !allowed) {
        if (clearMessageSocketTimer) {
          clearTimeout(clearMessageSocketTimer);
        }
        clearMessageSocketTimer = setTimeout(() => {
          setStopMessageSocket(false);
        }, 500);

        e.preventDefault();
        return;
      }

      const now = Date.now();
      if (now - lastSent < 20) return;
      if (clearMessageSocketTimer) {
        clearTimeout(clearMessageSocketTimer);
      }
      clearMessageSocketTimer = setTimeout(() => {
        setStopMessageSocket(false);
      }, 500);

      const react = devEl.getBoundingClientRect();
      const data = {
        x: react.left,
        y: react.top,
        width: window.innerWidth,
        height: window.innerHeight,
        name,
        type: "sticker",
        message: devEl?.textContent as string,
        stickerNo: id,
      };

      handleStickerMovement(data);
      lastSent = now;
    });

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        const now = Date.now();
        // if (now - lastSent < 20) return;
        devEl.style.left = `${event.clientX - offsetX}px`;
        devEl.style.top = `${event.clientY - offsetY}px`;

        const data = {
          x: event.clientX - offsetX,
          y: event.clientY - offsetY,
          width: window.innerWidth,
          height: window.innerHeight,
          name,
          type: "sticker",
          message: devEl.textContent as string,
          stickerNo: id,
        };

        handleStickerMovement(data);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    devEl.addEventListener("touchstart", (e: TouchEvent) => {
      if (e.touches.length > 0) {
        // const touch = e.touches[0];
        const react = devEl.getBoundingClientRect();

        // offsetX = touch.clientX - react.left;
        // offsetY = touch.clientY - react.top;
        isDragging = true;
        const data = {
          x: react.left,
          y: react.top,
          width: window.innerWidth,
          height: window.innerHeight,
          name,
          type: "sticker",
          message: devEl.textContent as string,
          stickerNo: id,
        };

        handleStickerMovement(data);
      }
    });

    document.addEventListener("touchmove", (e) => {
      if (isDragging && e.touches.length > 0) {
        const touch = e.touches[0];
        devEl.style.left = `${touch.clientX}px`;
        devEl.style.top = `${touch.clientY}px`;

        const data = {
          x: touch.clientX - offsetX,
          y: touch.clientY - offsetY,
          width: window.innerWidth,
          height: window.innerHeight,
          name,
          type: "sticker",
          message: devEl.textContent as string,
          stickerNo: id,
        };

        handleStickerMovement(data);
        const now = Date.now();
        if (now - lastSent < 10) return;
        const cursorData = {
          x: touch.clientX + 10 - offsetX,
          y: touch.clientY - offsetY,
          width: window.innerWidth,
          height: window.innerHeight,
          name,
          type: "cursor",
        };
        const socketCursor = socketProvider.get("cursor");
        if (socketCursor && socketCursor.readyState === WebSocket.OPEN) {
          // console.log(data);

          socketCursor.send(JSON.stringify(cursorData));
          lastSent = now;
        }
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
        const data = {
          name,
          type: "delete",
          message: devEl.textContent as string,
          stickerNo: id,
        };

        handleStickerMovement(data);
      } else if (e.key === "Escape" || e.key === "Enter") {
        devEl.blur();
        // devEl.appendChild(document.createElement("br"));
      }
      if (window.innerWidth < 1024) {
        if (e.key === "Backspace" && devEl.textContent?.trim() === "") {
          devEl.remove();
        }
      }
    });
  };

  return (
    showInput && (
      <form onSubmit={handleInput}>
        <input
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowInput(false);
              setInput("");
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
          onChange={(e) => {
            if (!stopMessageSocket) {
              setInput(e.target.value);
            }
          }}
          type="text"
          value={input}
          className="  border-none outline-none text-sm p-1 left-12 bg-black/10"
        />
      </form>
    )
  );
}

export default UserCursorMovement;
