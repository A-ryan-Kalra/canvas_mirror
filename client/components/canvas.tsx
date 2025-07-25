import {
  createElement,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useSocket } from "../services/use-socket-provider";
import { useLocation } from "react-router-dom";
import {
  ALargeSmallIcon,
  Eraser,
  PaletteIcon,
  PenLine,
  StickerIcon,
} from "lucide-react";
import PickColor from "./pick-color";
import { atom, useAtom } from "jotai";

export const stickerDetails = atom<{
  sticketTextAtom: boolean;
  bgColor: string;
}>({
  sticketTextAtom: false,
  bgColor: "",
});
function Canvas() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const name = searchParams.get("name");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const palleteRef = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [eraserPosition, setEraserPosition] = useState({ x: 0, y: 0 });
  const [showCanvasText, setShowCanvasText] = useState({ x: -100, y: -100 });
  const inputRef = useRef<HTMLInputElement>(null);
  const [showStickerDetails, setShowStickerDetails] = useAtom(stickerDetails);

  const isDrawing = useRef<boolean>(false);
  const { socketProvider } = useSocket();
  const toolsRef = useRef<{
    eraser: boolean;
    pickColor: boolean;
    showText: boolean;
    canvasText: boolean;
  }>({
    eraser: false,
    pickColor: false,
    showText: false,
    canvasText: false,
  });
  const [tools, setTools] = useState<{
    eraser: boolean;
    pickColor: boolean;
    penSize: boolean;
    canvasText: boolean;
  }>({
    eraser: false,
    pickColor: false,
    penSize: false,
    canvasText: false,
  });

  useEffect(() => {
    const socket = socketProvider.get("message");

    socket?.addEventListener("message", (event: MessageEvent) => {
      console.log(event.data);
    });
  }, []);
  function sendDataToUser(
    name: string,
    type: "canvas",
    status: "draw" | "erase" | "stop" | "text",
    position?: { offsetX?: number; offsetY?: number },
    strokeStyle?: string,
    strokeSize?: number,
    textStyle?: string,
    fillText?: string
  ) {
    const data = {
      name,
      position,
      status,
      type: type,
      strokeStyle,
      strokeSize,
      textStyle,
      fillText,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    };
    socketProvider.get("message")?.send(JSON.stringify(data));
  }
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let lastSent = 0;

    setCtx(context);
    if (!ctx) return;

    // const dpr = window.devicePixelRatio || 1;
    const dpr = 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 5;
    ctx.fill();

    const getMousePosition = (event: MouseEvent) => {
      const react = canvas.getBoundingClientRect();
      const offsetX = event.clientX - react.left;
      const offsetY = event.clientY - react.top;

      return { offsetX, offsetY };
    };

    const startDrawing = (event: MouseEvent) => {
      isDrawing.current = true;
      const { offsetX, offsetY } = getMousePosition(event);
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);

      const data = {
        name,
        steps: "start",
        position: { offsetX, offsetY },
        type: "canvas",
      };
      socketProvider.get("message")?.send(JSON.stringify(data));
    };
    const stopDrawing = () => {
      isDrawing.current = false;
      ctx.beginPath();
      sendDataToUser(name as string, "canvas", "stop");
    };

    const draw = (event: MouseEvent) => {
      const now = Date.now();
      if (now - lastSent < 20) return;
      if (!isDrawing.current) return;

      const { offsetX, offsetY } = getMousePosition(event);

      if (toolsRef.current.eraser) {
        ctx.globalCompositeOperation = "destination-out";
        const size = 100;
        ctx.rect(offsetX - size / 2, offsetY - size / 2, size, size);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);

        sendDataToUser(name as string, "canvas", "erase", { offsetX, offsetY });
      } else if (toolsRef.current.showText) {
        // ctx.strokeStyle = "red";
        // ctx.lineWidth = 1;
        // ctx.strokeText("Hello, Canvas!", offsetX, offsetY);
        ctx.font = "20px Arial";
        ctx.fillStyle = "#000"; // text color
        // ctx.fillText("Hello, Canvas!", offsetX, offsetY);
      } else {
        ctx.globalCompositeOperation = "source-over";
        // ctx.lineWidth = 1;

        ctx.lineCap = "round";
        ctx.lineTo(offsetX, offsetY);
        // ctx.translate(offsetX, offsetY);
        ctx.font = "20px Arial";
        // console.log(ctx.lineWidth);
        //Draw Reactangle
        // ctx.stroke();
        // ctx!.fillStyle = "blue"; // fill color
        // ctx!.strokeRect(offsetX, offsetY, 200, 150);

        //Draw Circle
        // ctx.beginPath();
        // ctx.arc(offsetX, offsetY, Math.PI, 0, Math.PI * 2); // full circle
        // ctx.fill(); // for filled
        // or
        ctx.stroke();
        sendDataToUser(
          name as string,
          "canvas",
          "draw",
          { offsetX, offsetY },
          ctx?.strokeStyle as unknown as string,
          ctx?.lineWidth,
          ctx?.fillStyle as unknown as string
        );
      }
      lastSent = now;
    };

    function handleCanvasPosition(e: MessageEvent) {
      const parsed = JSON.parse(e.data);
      console.log(parsed);
      ctx!.save();
      if (ctx) {
        ctx.strokeStyle = parsed?.strokeStyle;
        ctx.lineWidth = parsed?.lineWidth;
        ctx.fillStyle = parsed?.strokeStyle;
      }
      if (parsed.status === "erase") {
        ctx!.globalCompositeOperation = "destination-out";
        const size = 100;
        ctx!.rect(
          (parsed.position?.offsetX / parsed.innerWidth - size / 2) *
            window.innerWidth,
          (parsed.position?.offsetY / parsed.innterHeight - size / 2) *
            window.innerHeight,
          size,
          size
        );

        ctx!.fill();
        ctx!.beginPath();
        ctx!.moveTo(parsed?.position?.offsetX, parsed?.position?.offsetY);
      } else if (parsed?.status === "stop") {
        ctx!.beginPath();
      } else if (parsed.status === "text") {
        ctx!.font = "20px Arial";

        ctx!.fillText(
          parsed?.fillText ?? "",
          (parsed?.position?.offsetX / parsed.innerWidth) * window.innerWidth,
          (parsed?.position?.offsetY / parsed.innerHeight) * window.innerHeight
        );
      } else {
        ctx!.globalCompositeOperation = "source-over";
        // ctx!.strokeStyle = "red";
        // ctx!.lineWidth = 5;
        ctx!.lineCap = "round";
        ctx!.lineTo(
          (parsed?.position?.offsetX / parsed.innerWidth) * window.innerWidth,
          (parsed?.position?.offsetY / parsed.innerHeight) * window.innerHeight
        );
        ctx!.stroke();
      }
      ctx!.restore();
      // ctx?.lineTo(parsed.position?.offsetX, parsed?.position?.offsetY);
    }

    function handleEraser(event: MouseEvent) {
      if (toolsRef.current.eraser) {
        setEraserPosition({ x: event.clientX, y: event.clientY });
      }
    }
    function showCanvasTextPosition(event: MouseEvent) {
      if (palleteRef.current?.contains(event.target as Node)) {
        setShowCanvasText({ x: -100, y: -100 });
        return;
      }

      if (toolsRef.current.canvasText) {
        if (!inputRef.current?.contains(event.target as Node)) {
          setShowCanvasText({ x: event.clientX, y: event.clientY });
        }
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    }
    function closeAllTools(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setTools({
          canvasText: false,
          eraser: false,
          penSize: false,
          pickColor: false,
        });
        toolsRef.current.canvasText = false;
        toolsRef.current.eraser = false;
        toolsRef.current.pickColor = false;
        toolsRef.current.showText = false;
        toolsRef.current.showText = false;
        setShowStickerDetails({
          bgColor: "",
          sticketTextAtom: false,
        });
      }
    }

    socketProvider
      .get("message")
      ?.addEventListener("message", handleCanvasPosition);
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);
    window.addEventListener("mousemove", handleEraser);
    window.addEventListener("mousedown", showCanvasTextPosition);
    window.addEventListener("keydown", closeAllTools);

    return () => {
      window.removeEventListener("mousemove", handleEraser);
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
      window.removeEventListener("mousemove", handleEraser);
      window.removeEventListener("mousedown", showCanvasTextPosition);
      window.removeEventListener("keydown", closeAllTools);
    };
  }, [socketProvider.get("message")]);

  function handleInput(e: FormEvent) {
    e.preventDefault();
    toolsRef.current.canvasText = !toolsRef.current.canvasText;

    setTools(() => ({
      penSize: false,
      eraser: false,
      pickColor: false,
      canvasText: false,
    }));
  }

  return (
    <div
      className={` w-full h-dvh relative ${
        tools.canvasText ? "cursor-text" : ""
      }`}
    >
      {tools.eraser && (
        <div
          style={{
            position: "fixed",
            border: "1px solid black",
            cursor: "grab",
            borderRadius: "10px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
            transform: `translate(${eraserPosition.x - 100 / 2}px, ${
              eraserPosition.y - 100 / 2
            }px)`,
            width: "100px",
            height: "100px",
            pointerEvents: "none",
          }}
        />
      )}

      <div
        ref={palleteRef}
        style={{ zIndex: 999999 }}
        className="absolute  w-[50px] right-4  top-3 h-[250px] border-[1px] border-slate-400 rounded-md shadow-amber-300"
      >
        <ul className="flex flex-col items-center gap-y-4 p-1 w-full h-full">
          <li
            className={`relative cursor-pointer ${
              tools.eraser
                ? " rounded-md border-slate-500 "
                : " border-transparent"
            } border-[1px] p-1`}
            onClick={() => {
              setShowStickerDetails(() => ({
                bgColor: (ctx?.strokeStyle as unknown as string) ?? "",
                sticketTextAtom: false,
              }));
              setShowStickerDetails(() => ({
                bgColor: (ctx?.strokeStyle as unknown as string) ?? "",
                sticketTextAtom: false,
              }));
              toolsRef.current.eraser = !toolsRef.current.eraser;
              toolsRef.current.canvasText = false;
              toolsRef.current.pickColor = false;
              toolsRef.current.showText = false;
              setTools((prev) => ({
                penSize: false,
                pickColor: false,
                eraser: !prev.eraser,
                canvasText: false,
              }));
            }}
          >
            <Eraser className={`${tools.eraser ? "fill-slate-300" : ""}`} />
          </li>
          <li
            className={`relative cursor-pointer ${
              tools.pickColor
                ? " rounded-md border-slate-500 "
                : " border-transparent"
            } border-[1px] p-1`}
            onClick={() => {
              // toolsRef.current.pickColor = !toolsRef.current.pickColor;
              setShowStickerDetails(() => ({
                bgColor: (ctx?.strokeStyle as unknown as string) ?? "",
                sticketTextAtom: false,
              }));
              toolsRef.current.canvasText = false;
              toolsRef.current.eraser = false;
              toolsRef.current.pickColor = false;
              toolsRef.current.showText = false;
              setTools((prev) => ({
                eraser: false,
                penSize: false,
                pickColor: !prev.pickColor,
                canvasText: false,
              }));
            }}
          >
            <PaletteIcon
              className={`${tools.pickColor ? "fill-purple-300" : ""}`}
            />
            <div onClick={(e) => e.stopPropagation()}>
              {tools.pickColor && (
                <PickColor
                  pick={(rgba: {
                    r: number;
                    g: number;
                    b: number;
                    a: number;
                  }) => {
                    ctx!.strokeStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
                  }}
                />
              )}
            </div>
          </li>
          <li
            onClick={() => {
              toolsRef.current.canvasText = false;
              toolsRef.current.eraser = false;
              toolsRef.current.pickColor = false;
              toolsRef.current.showText = false;
              setTools((prev) => ({
                penSize: !prev.penSize,
                eraser: false,
                pickColor: false,
                canvasText: false,
              }));
              setShowStickerDetails(() => ({
                bgColor: (ctx?.strokeStyle as unknown as string) ?? "",
                sticketTextAtom: false,
              }));
            }}
            className={`relative cursor-pointer ${
              tools.penSize
                ? " rounded-md border-slate-500 "
                : " border-transparent"
            } border-[1px] p-1`}
          >
            <PenLine className={`${tools.penSize ? "fill-purple-300" : ""}`} />
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute right-10 top-0 ${
                tools.penSize ? "visible" : "invisible"
              }`}
            >
              <input
                type="range"
                max={40}
                defaultValue={5}
                onChange={(e) => (ctx!.lineWidth = Number(e.target.value))}
              />
            </div>
          </li>
          <li
            onClick={() => {
              toolsRef.current.canvasText = !toolsRef.current.canvasText;
              toolsRef.current.eraser = false;
              toolsRef.current.pickColor = false;
              toolsRef.current.showText = false;
              setTools((prev) => ({
                penSize: false,
                eraser: false,
                pickColor: false,
                canvasText: !prev.canvasText,
              }));
              setShowStickerDetails(() => ({
                bgColor: (ctx?.strokeStyle as unknown as string) ?? "",
                sticketTextAtom: false,
              }));
            }}
            className={`relative cursor-pointer ${
              tools.canvasText
                ? " rounded-md border-slate-500 "
                : " border-transparent"
            } border-[1px] p-1`}
          >
            <ALargeSmallIcon />
            {tools.canvasText && (
              <form
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleInput}
                className=""
              >
                <input
                  ref={inputRef}
                  maxLength={30}
                  placeholder="Max 30 words"
                  style={{
                    width: "150px",
                    height: "30px",
                    position: "fixed",
                    borderRadius: "3px",
                    // pointerEvents: "none",
                    zIndex: 99999,

                    left: `${showCanvasText.x}px`,
                    top: `${showCanvasText.y}px`,
                  }}
                  onChange={(e) => {
                    if (ctx) {
                      ctx.font = "20px Arial";
                      ctx.fillStyle = ctx.strokeStyle; // text color
                      ctx.fillText(
                        e.target.value,
                        showCanvasText.x,
                        showCanvasText.y
                      );
                      sendDataToUser(
                        name as string,
                        "canvas",
                        "text",
                        {
                          offsetX: showCanvasText.x,
                          offsetY: showCanvasText.y,
                        },
                        ctx?.strokeStyle as unknown as string,
                        ctx?.lineWidth,
                        ctx?.fillStyle as unknown as string,
                        e.target.value
                      );
                    }
                  }}
                  type="text"
                  className="  border-none outline-none text-sm p-1 left-12 bg-black/10"
                />
              </form>
            )}
          </li>
          <li
            onClick={() => {
              toolsRef.current.canvasText = false;
              toolsRef.current.eraser = false;
              toolsRef.current.pickColor = false;
              toolsRef.current.showText = false;
              setShowStickerDetails((prev) => ({
                bgColor: (ctx?.strokeStyle as unknown as string) ?? "",
                sticketTextAtom: !prev.sticketTextAtom,
              }));
              setTools(() => ({
                penSize: false,
                eraser: false,
                pickColor: false,
                canvasText: false,
              }));
            }}
            className={`relative cursor-pointer ${
              showStickerDetails.sticketTextAtom
                ? " rounded-md border-slate-500 "
                : " border-transparent"
            } border-[1px] p-1`}
          >
            <StickerIcon />
          </li>
        </ul>
      </div>

      <canvas
        // style={{ margin: 0, padding: 0 }}
        className="border-[1px] bg-white border-black"
        ref={canvasRef}
      />
    </div>
  );
}

export default Canvas;
