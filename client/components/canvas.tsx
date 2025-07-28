import { useEffect, useRef, useState, type FormEvent } from "react";
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
import { isDraggingAtom } from "./user-cursor-movement";

export const stickerDetails = atom<{
  sticketTextAtom: boolean;
  bgColor: string;
}>({
  sticketTextAtom: false,
  bgColor: "",
});
function Canvas() {
  const [isDragAtom] = useAtom(isDraggingAtom);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const name = searchParams.get("name");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const palleteRef = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [eraserPosition, setEraserPosition] = useState({ x: 0, y: 0 });
  const [showCanvasText, setShowCanvasText] = useState({ x: -100, y: -100 });
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasMap = useRef<{ [key: string]: any }>({});
  const [showStickerDetails, setShowStickerDetails] = useAtom(stickerDetails);
  const [canvasConf, setCanvasConf] = useState<{ textSize: string }>({
    textSize: "",
  });
  const isDrawing = useRef<boolean>(false);
  const { socketProvider } = useSocket();
  const toolsRef = useRef<{
    eraser: boolean;
    pickColor: boolean;
    showText: boolean;
    canvasText: boolean;
    moveSticker?: boolean;
  }>({
    eraser: false,
    pickColor: false,
    showText: false,
    canvasText: false,
    moveSticker: false,
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
    toolsRef.current.moveSticker = isDragAtom;
  }, [isDragAtom]);

  function sendDataToUser(
    name: string,
    type: "canvas",
    status: "draw" | "erase" | "stop" | "text",
    position?: { offsetX?: number; offsetY?: number },
    strokeStyle?: string,
    lineWidth?: number,
    textStyle?: string,
    fillText?: string
  ) {
    const data = {
      name,
      position,
      status,
      type: type,
      strokeStyle,
      lineWidth,
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
    // let lastSent = 0;

    setCtx(context);
    if (!ctx) return;
    let dpr;
    // const dpr = window.devicePixelRatio || 1;
    if (window.innerWidth < 1200) {
      dpr = 1;
    } else {
      dpr = window.devicePixelRatio || 1;
    }

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 5;
    ctx.fill();
    ctx.font = "20px Arial";

    const getMousePosition = (event: MouseEvent) => {
      const react = canvas.getBoundingClientRect();
      const offsetX = event.clientX - react.left;
      const offsetY = event.clientY - react.top;

      return { offsetX, offsetY };
    };

    function touchStart(event: TouchEvent) {
      let offSetX = 0;
      let offSetY = 0;
      isDrawing.current = true;
      if (event?.touches?.length > 0) {
        let touch = event?.touches[0];
        (offSetX = touch.clientX), (offSetY = touch.clientY);
        ctx?.beginPath();
        ctx?.moveTo(offSetX, offSetY);
      }
      const data = {
        name,
        steps: "start",
        position: { offSetX, offSetY },
        type: "canvas",
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      };
      socketProvider.get("message")?.send(JSON.stringify(data));
      return { offSetX, offSetY };
    }

    function touchMove(event: TouchEvent) {
      if (toolsRef.current.moveSticker) {
        return;
      }
      // const now = Date.now();
      // if (now - lastSent < 10) return;
      if (toolsRef.current.eraser) {
        const touch = event.touches[0];
        setEraserPosition({ x: touch.clientX, y: touch.clientY });
        drawCanvas(touch.clientX, touch.clientY);
      } else {
        const { offSetX, offSetY } = touchStart(event);

        drawCanvas(offSetX, offSetY);
      }
      // lastSent = now;
    }

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
    const drawCanvas = (offsetX: number, offsetY: number) => {
      if (toolsRef.current.eraser) {
        for (let con in canvasMap.current) {
          canvasMap.current[con]["ctxRemoteUser"].globalCompositeOperation =
            "destination-out";
          const size = 100;
          canvasMap.current[con]["ctxRemoteUser"].rect(
            offsetX - size / 2,
            offsetY - size / 2,
            size,
            size
          );
          canvasMap.current[con]["ctxRemoteUser"].fill();
          canvasMap.current[con]["ctxRemoteUser"].beginPath();
          canvasMap.current[con]["ctxRemoteUser"].moveTo(offsetX, offsetY);
        }
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
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
        // ctx.translate(offsetX, offsetY);
        // ctx.font = "20px Arial";
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
    };
    const draw = (event: MouseEvent) => {
      // const now = Date.now();
      // if (now - lastSent < 20) return;
      if (!isDrawing.current) return;

      const { offsetX, offsetY } = getMousePosition(event);

      drawCanvas(offsetX, offsetY);

      // lastSent = now;
    };

    function createCanvasForUser(userId: string) {
      if (canvasMap.current[userId]) return canvasMap.current[userId];

      const canvas = document.createElement("canvas");
      if (window.innerWidth < 1200) {
        dpr = 1;
      } else {
        dpr = window.devicePixelRatio || 1;
      }

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      canvas.style.backgroundColor = "transparent";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "99999";
      canvas.style.position = "absolute";
      // document.body.appendChild(canvas);
      document.getElementById("canvas-container")!.appendChild(canvas);

      const ctxRemoteUser = canvas!.getContext("2d");
      if (window.innerWidth < 1200) {
        dpr = 1;
      } else {
        dpr = window.devicePixelRatio || 1;
      }
      ctxRemoteUser!.scale(dpr, dpr);
      canvasMap.current[userId] = { canvas, ctxRemoteUser };
      return { canvas, ctxRemoteUser };
    }
    function handleCanvasPosition(e: MessageEvent) {
      const parsed = JSON.parse(e.data);

      const { ctxRemoteUser } = createCanvasForUser(parsed.name);

      // ctxRemoteUser!.lineWidth = 5;
      // ctxRemoteUser!.fill();

      // console.log(ctx);

      // ctx!.save();
      if (ctxRemoteUser) {
        ctxRemoteUser.strokeStyle = parsed?.strokeStyle;
        ctxRemoteUser.lineWidth = parsed?.lineWidth;

        ctxRemoteUser.fillStyle = parsed?.strokeStyle;
      }
      if (parsed.status === "erase") {
        for (let con in canvasMap.current) {
          canvasMap.current[con]["ctxRemoteUser"]!.globalCompositeOperation =
            "destination-out";
          const size = 100;
          canvasMap.current[con]["ctxRemoteUser"]!.rect(
            ((parsed.position?.offsetX - size / 2) / parsed.innerWidth) *
              window.innerWidth,
            ((parsed.position?.offsetY - size / 2) / parsed.innerHeight) *
              window.innerHeight,
            size,
            size
          );

          canvasMap.current[con]["ctxRemoteUser"]!.fill();
          canvasMap.current[con]["ctxRemoteUser"]!.beginPath();
          canvasMap.current[con]["ctxRemoteUser"]!.moveTo(
            (parsed?.position?.offsetX / parsed.innerWidth) * window.innerWidth,
            (parsed?.position?.offsetY / parsed.innerHeight) *
              window.innerHeight
          );
        }

        ctx!.globalCompositeOperation = "destination-out";
        const size = 100;
        ctx!.rect(
          ((parsed.position?.offsetX - size / 2) / parsed.innerWidth) *
            window.innerWidth,
          ((parsed.position?.offsetY - size / 2) / parsed.innerHeight) *
            window.innerHeight,
          size,
          size
        );
        ctx!.fill();
        ctx!.beginPath();
        ctx!.moveTo(
          (parsed?.position?.offsetX / parsed.innerWidth) * window.innerWidth,
          (parsed?.position?.offsetY / parsed.innerHeight) * window.innerHeight
        );

        // ctxRemoteUser!.save();

        // ctxRemoteUser!.restore();
      } else if (parsed?.status === "stop") {
        ctxRemoteUser!.beginPath();
      } else if (parsed.status === "text") {
        ctxRemoteUser!.font = "20px Arial";

        ctxRemoteUser!.fillText(
          parsed?.fillText ?? "",
          (parsed?.position?.offsetX / parsed.innerWidth) * window.innerWidth,
          (parsed?.position?.offsetY / parsed.innerHeight) * window.innerHeight
        );
      } else {
        ctxRemoteUser!.globalCompositeOperation = "source-over";
        // ctxRemoteUser!.strokeStyle = "red";
        // ctxRemoteUser!.lineWidth = 5;
        ctxRemoteUser!.lineCap = "round";
        ctxRemoteUser!.lineTo(
          (parsed?.position?.offsetX / parsed.innerWidth) * window.innerWidth,
          (parsed?.position?.offsetY / parsed.innerHeight) * window.innerHeight
        );
        ctxRemoteUser!.stroke();
      }
      // ctx!.restore();
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
        setShowStickerDetails((prev) => ({
          ...prev,
          sticketTextAtom: false,
        }));
      }
    }
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      //  Save the current drawing as an image
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // const dpr = window.devicePixelRatio || 1;
      let dpr;
      if (window.innerWidth < 1200) {
        dpr = 1;
      } else {
        dpr = window.devicePixelRatio || 1;
      }
      // dpr = window.devicePixelRatio || 1;

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.lineWidth = 5;

      ctx.scale(dpr, dpr);

      //  Restore the saved image
      ctx.putImageData(imageData, 0, 0);
    };

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
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("touchstart", touchStart);
    window.addEventListener("touchmove", touchMove);
    window.addEventListener("touchend", stopDrawing);

    return () => {
      window.removeEventListener("mousemove", handleEraser);
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
      window.removeEventListener("mousedown", showCanvasTextPosition);
      window.removeEventListener("keydown", closeAllTools);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", stopDrawing);
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
      className={` w-full h-full relative ${
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
        className="absolute  w-[50px] left-1  top-3 h-[250px] border-[1px] border-slate-400 rounded-md shadow-amber-300"
      >
        <ul className="flex flex-col items-center gap-y-4 p-1 w-full h-full">
          <li
            className={`relative cursor-pointer ${
              tools.pickColor
                ? " rounded-md border-slate-500 "
                : " border-transparent"
            } border-[1px] p-1`}
            onClick={() => {
              // toolsRef.current.pickColor = true;

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
                    setShowStickerDetails(() => ({
                      bgColor: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`,
                      sticketTextAtom: false,
                    }));
                  }}
                />
              )}
            </div>
          </li>
          <li
            className={`relative cursor-pointer ${
              tools.eraser
                ? " rounded-md border-slate-500 "
                : " border-transparent"
            } border-[1px] p-1`}
            onClick={() => {
              setShowStickerDetails((prev) => ({
                ...prev,
                sticketTextAtom: false,
              }));

              toolsRef.current.eraser = true;
              toolsRef.current.canvasText = false;
              toolsRef.current.pickColor = false;
              toolsRef.current.showText = false;
              setTools(() => ({
                penSize: false,
                pickColor: false,
                eraser: true,
                canvasText: false,
              }));
            }}
          >
            <Eraser className={`${tools.eraser ? "fill-slate-300" : ""}`} />
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
              setShowStickerDetails((prev) => ({
                ...prev,
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
              className={`absolute left-10 top-0 ${
                tools.penSize ? "visible" : "invisible"
              }`}
            >
              <div className="bg-slate-300 p-1 rounded-md">
                <label htmlFor="sketch-pen" className="text-xs">
                  Sketch Pen
                </label>
                <input
                  type="range"
                  id="sketch-pen"
                  max={40}
                  defaultValue={5}
                  onChange={(e) => (ctx!.lineWidth = Number(e.target.value))}
                />
                <label htmlFor="text-size" className="text-xs">
                  Text Size
                </label>
                <input
                  type="range"
                  id="text-size"
                  max={80}
                  defaultValue={5}
                  onChange={(e) => {
                    setCanvasConf({ textSize: e.target.value });
                  }}
                />
              </div>
            </div>
          </li>
          <li
            onClick={() => {
              toolsRef.current.canvasText = true;
              toolsRef.current.eraser = false;
              toolsRef.current.pickColor = false;
              toolsRef.current.showText = false;
              ctx!.globalCompositeOperation = "source-over";
              ctx!.fillStyle = ctx!.strokeStyle;
              setTools(() => ({
                penSize: false,
                eraser: false,
                pickColor: false,
                canvasText: true,
              }));
              setShowStickerDetails((prev) => ({
                ...prev,
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
                  // maxLength={30}
                  placeholder=""
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
                      // ctx.fillStyle = ctx.strokeStyle;
                      ctx!.font = `${canvasConf.textSize}px Arial`;
                      ctx.fillStyle = showStickerDetails.bgColor;
                      ctx.fillText(
                        e.target.value,
                        // showStickerDetails.bgColor,
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
                ...prev,
                sticketTextAtom: true,
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
      <div
        id="canvas-container"
        className=""
        style={{ pointerEvents: "none", position: "relative" }}
      ></div>

      <canvas
        // style={{ margin: 0, padding: 0 }}
        className=" bg-white "
        ref={canvasRef}
      />
    </div>
  );
}

export default Canvas;
