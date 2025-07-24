import { useEffect, useRef, useState } from "react";
import { useSocket } from "../services/use-socket-provider";
import { useLocation } from "react-router-dom";
import { Eraser, PawPrint } from "lucide-react";
import PickColor from "./pick-color";

function Canvas() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const name = searchParams.get("name");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [isErasing, setIsErasing] = useState<boolean>(false);
  // const []
  const isErasingRef = useRef<boolean>(false);
  const isDrawing = useRef<boolean>(false);
  const { socketProvider } = useSocket();
  const toolTip = useRef<{ eraser: boolean; pickColor: boolean }>({
    eraser: false,
    pickColor: false,
  });
  const [tools, setTools] = useState<{ eraser: boolean; pickColor: boolean }>({
    eraser: false,
    pickColor: false,
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
        ctx.save();

        ctx.globalCompositeOperation = "destination-out";
        ctx.rect(offsetX, offsetY, 100, 100);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        ctx.restore();
        sendDataToUser(name as string, "canvas", "erase", { offsetX, offsetY });
      } else {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.lineTo(offsetX, offsetY);
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

    socketProvider
      .get("message")
      ?.addEventListener("message", handleCanvasPosition);
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    return () => {
      socketProvider
        .get("message")
        ?.addEventListener("message", handleCanvasPosition);
    };
  }, [socketProvider.get("message")]);

  return (
    <div className=" w-full h-dvh relative">
      <div className="absolute w-[50px] right-4  top-3 h-[300px] border-[1px] border-slate-400 rounded-md shadow-amber-300">
        <ul className="flex flex-col items-center gap-y-2 p-1 w-full h-full">
          <li
            className="cursor-pointer"
            onClick={() => {
              toolTip.current.eraser = !toolTip.current.eraser;
              setTools((prev) => ({ ...prev, eraser: !prev.eraser }));
            }}
          >
            <Eraser className={`${tools.eraser ? "fill-slate-300" : ""}`} />
          </li>
          <li
            className="relative cursor-pointer"
            onClick={() => {
              toolTip.current.pickColor = !toolTip.current.pickColor;
              setTools((prev) => ({ ...prev, pickColor: !prev.pickColor }));
            }}
          >
            <PawPrint
              className={`${tools.pickColor ? "fill-purple-300" : ""}`}
            />
            <div onClick={(e) => e.stopPropagation()}>
              {tools.pickColor && (
                <PickColor
                  pick={(color: string) => {
                    // console.log(ctx!.strokeStyle);
                    ctx!.strokeStyle = color;
                  }}
                />
              )}
            </div>
          </li>
          <li>
            <Eraser />
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
