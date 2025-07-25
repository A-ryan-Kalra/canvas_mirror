import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../services/use-socket-provider";
import type { StickerDetailProps } from "../types";
import { v4 as uuidv4 } from "uuid";
import { useAtom } from "jotai";
import { stickerDetails } from "./canvas";

function UserCursorMovement({
  name,
  divRefs,
}: {
  name: string;
  divRefs: HTMLDivElement[];
}) {
  const { roomId } = useParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState({ message: "", name: "" });
  const [stopMessageSocket, setStopMessageSocket] = useState(false);
  const { socketProvider } = useSocket();
  const [showInput, setShowInput] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showStickerDetails] = useAtom(stickerDetails);

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

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // if (showStickerDetails.sticketTextAtom)
      if (
        target.classList.contains("dynamic-input") ||
        !showStickerDetails.sticketTextAtom
      ) {
        setShowInput(false);
        return;
      }

      if (
        inputRef.current &&
        inputRef?.current!.contains(event.target as Node)
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
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [socketProvider, showStickerDetails.sticketTextAtom]);

  useEffect(() => {
    const sendMessage = () => {
      if (socketProvider.get("message")) {
        const data = { type: "message", name, message: input };

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

    const divEl = document.createElement("div");
    divEl.textContent = input;

    divEl.style.minWidth = "50px";
    divEl.style.maxWidth = "150px";
    // divEl.style.maxHeight = "100px";
    divEl.style.resize = "both";
    divEl.contentEditable = "true";
    divEl.setAttribute("placeholder", "Max 30 words");
    divEl.style.whiteSpace = "wrap";
    divEl.style.wordBreak = "break-word";
    divEl.style.overflowWrap = "break-word";
    divEl.style.border = "none";
    divEl.style.outline = "none";
    divEl.style.borderRadius = "10px";
    divEl.style.padding = "0.55rem";
    divEl.style.zIndex = "99999";
    divEl.spellcheck = false;

    divEl.style.background = "rgba(37, 235, 221, 0.6)";
    divEl.style.cursor = "grab";
    divEl.style.position = "fixed";
    divEl.style.left = `${userCursor.x}px`;
    divEl.style.top = `${userCursor.y}px`;
    divEl.className = "dynamic-input";

    divRefs.push(divEl);
    document.body.appendChild(divEl);
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
      message: divEl.textContent as string,
      stickerNo: id,
    };
    // socketProvider.get("message")?.send(JSON.stringify(data));

    handleStickerMovement(data);
    setInput("");
    setShowInput(false);
    let lastSent = 0;

    divEl.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - divEl.offsetLeft;
      offsetY = e.clientY - divEl.offsetTop;
    });
    let clearMessageSocketTimer: number = 0;

    divEl.addEventListener("keydown", (e) => {
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
      if (divEl.textContent && divEl.textContent.length > 29 && !allowed) {
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

      const react = divEl.getBoundingClientRect();
      const data = {
        x: react.left,
        y: react.top,
        width: window.innerWidth,
        height: window.innerHeight,
        name,
        type: "sticker",
        message: divEl?.textContent as string,
        stickerNo: id,
      };

      handleStickerMovement(data);
      lastSent = now;
    });

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        const now = Date.now();
        // if (now - lastSent < 20) return;
        divEl.style.left = `${event.clientX - offsetX}px`;
        divEl.style.top = `${event.clientY - offsetY}px`;

        const data = {
          x: event.clientX - offsetX,
          y: event.clientY - offsetY,
          width: window.innerWidth,
          height: window.innerHeight,
          name,
          type: "sticker",
          message: divEl.textContent as string,
          stickerNo: id,
        };

        handleStickerMovement(data);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    divEl.addEventListener("touchstart", (e: TouchEvent) => {
      if (e.touches.length > 0) {
        // const touch = e.touches[0];
        const react = divEl.getBoundingClientRect();

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
          message: divEl.textContent as string,
          stickerNo: id,
        };

        handleStickerMovement(data);
      }
    });

    document.addEventListener("touchmove", (e) => {
      if (isDragging && e.touches.length > 0) {
        const touch = e.touches[0];
        divEl.style.left = `${touch.clientX}px`;
        divEl.style.top = `${touch.clientY}px`;

        const data = {
          x: touch.clientX - offsetX,
          y: touch.clientY - offsetY,
          width: window.innerWidth,
          height: window.innerHeight,
          name,
          type: "sticker",
          message: divEl.textContent as string,
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

    divEl.addEventListener("keydown", (e) => {
      if (e.key === "Delete") {
        divEl.remove();
        const data = {
          name,
          type: "delete",
          message: divEl.textContent as string,
          stickerNo: id,
        };

        handleStickerMovement(data);
      } else if (e.key === "Escape" || e.key === "Enter") {
        divEl.blur();
        // divEl.appendChild(document.createElement("br"));
      }
      if (window.innerWidth < 1024) {
        if (e.key === "Backspace" && divEl.textContent?.trim() === "") {
          divEl.remove();
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
