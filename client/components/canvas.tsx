import { createElement, useEffect, useRef, useState } from "react";
import { useSocket } from "../services/use-socket-provider";
import { useLocation } from "react-router-dom";
import { Eraser, PaletteIcon, PawPrint, PenLine } from "lucide-react";
import PickColor from "./pick-color";

function Canvas() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const name = searchParams.get("name");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [eraserPosition, setEraserPosition] = useState({ x: 0, y: 0 });

  const isDrawing = useRef<boolean>(false);
  const { socketProvider } = useSocket();
  const toolTip = useRef<{
    eraser: boolean;
    pickColor: boolean;
    showText: boolean;
  }>({
    eraser: false,
    pickColor: false,
    showText: false,
  });
  const [tools, setTools] = useState<{
    eraser: boolean;
    pickColor: boolean;
    penSize: boolean;
  }>({
    eraser: false,
    pickColor: false,
    penSize: false,
  });

  useEffect(() => {
    const socket = socketProvider.get("message");

    socket?.addEventListener("message", (event: MessageEvent) => {
      console.log(event.data);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    setCtx(context);
    if (!ctx) return;
    // const dpr = window.devicePixelRatio || 1;
    const dpr = 1;
    console.log(dpr);
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

    function sendDataToUser(
      name: string,
      type: "canvas",
      status: "draw" | "erase" | "stop",
      position?: { offsetX?: number; offsetY?: number }
    ) {
      const data = {
        name,
        position,
        status,
        type: type,
      };
      socketProvider.get("message")?.send(JSON.stringify(data));
    }

    const draw = (event: MouseEvent) => {
      if (!isDrawing.current) return;

      const { offsetX, offsetY } = getMousePosition(event);

      if (toolTip.current.eraser) {
        ctx.globalCompositeOperation = "destination-out";
        const size = 100;
        ctx.rect(offsetX - size / 2, offsetY - size / 2, size, size);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);

        sendDataToUser(name as string, "canvas", "erase", { offsetX, offsetY });
      } else if (toolTip.current.showText) {
        // ctx.strokeStyle = "red";
        // ctx.lineWidth = 1;
        // ctx.strokeText("Hello, Canvas!", offsetX, offsetY);
        ctx.font = "20px Arial";
        ctx.fillStyle = "#000"; // text color
        ctx.fillText("Hello, Canvas!", offsetX, offsetY);
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
        sendDataToUser(name as string, "canvas", "draw", { offsetX, offsetY });
      }
    };

    function handleCanvasPosition(e: MessageEvent) {
      const parsed = JSON.parse(e.data);
      console.log(parsed);

      if (parsed.status === "erase") {
        ctx!.globalCompositeOperation = "destination-out";
        ctx!.arc(
          parsed?.position?.offsetX,
          parsed?.position?.offsetY,
          10,
          10,
          Math.PI * 2
        );
        ctx!.fill();
        ctx!.beginPath();
        ctx!.moveTo(parsed?.position?.offsetX, parsed?.position?.offsetY);
      } else if (parsed?.status === "stop") {
        ctx!.beginPath();
      } else {
        ctx!.globalCompositeOperation = "source-over";
        ctx!.strokeStyle = "red";
        ctx!.lineWidth = 5;
        ctx!.lineCap = "round";
        ctx!.lineTo(parsed?.position?.offsetX, parsed?.position?.offsetY);
        ctx!.stroke();
      }

      // ctx?.lineTo(parsed.position?.offsetX, parsed?.position?.offsetY);
    }

    function handleEraser(event: MouseEvent) {
      if (toolTip.current.eraser) {
        setEraserPosition({ x: event.clientX, y: event.clientY });
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

    return () => {
      window.removeEventListener("mousemove", handleEraser);
    };
  }, [socketProvider.get("message")]);
  return (
    <div className=" w-full h-dvh relative">
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
        style={{ zIndex: 999999 }}
        className="absolute  w-[50px] right-4  top-3 h-[300px] border-[1px] border-slate-400 rounded-md shadow-amber-300"
      >
        <ul className="flex flex-col items-center gap-y-4 p-1 w-full h-full">
          <li
            className="cursor-pointer"
            onClick={() => {
              toolTip.current.eraser = !toolTip.current.eraser;
              setTools((prev) => ({
                penSize: false,
                pickColor: false,
                eraser: !prev.eraser,
              }));
            }}
          >
            <Eraser className={`${tools.eraser ? "fill-slate-300" : ""}`} />
          </li>
          <li
            className="relative cursor-pointer"
            onClick={() => {
              // toolTip.current.pickColor = !toolTip.current.pickColor;
              toolTip.current.eraser = false;

              setTools((prev) => ({
                eraser: false,
                penSize: false,
                pickColor: !prev.pickColor,
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
              toolTip.current.eraser = false;

              setTools((prev) => ({
                penSize: !prev.penSize,
                eraser: false,
                pickColor: false,
              }));
            }}
            className="relative cursor-pointer"
          >
            <PenLine className={`${tools.penSize ? "fill-purple-300" : ""}`} />
            {/* {tools.penSize && ( */}
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
            {/* )} */}
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
