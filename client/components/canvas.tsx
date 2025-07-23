import { useEffect, useRef, useState } from "react";

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const isErasingRef = useRef<boolean>(false);
  const isDrawing = useRef<boolean>(false);

  useEffect(() => {
    isErasingRef.current = isErasing;
  }, [isErasing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = 800 * dpr;
    canvas.height = 600 * dpr;
    canvas.style.width = "800px";
    canvas.style.height = "600px";
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
    };
    const stopDrawing = () => {
      isDrawing.current = false;
      ctx.beginPath();
    };

    const draw = (event: MouseEvent) => {
      if (!isDrawing.current) return;

      const { offsetX, offsetY } = getMousePosition(event);

      if (isErasingRef.current) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.arc(offsetX, offsetY, 10, 10, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "red";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
      }
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);
  }, []);

  return (
    <div>
      <button
        onClick={() => setIsErasing((prev) => !prev)}
        className="border-[1px] p-1"
      >
        {isErasing ? "Switch to Draw" : "Switch to Erase"}
      </button>
      <canvas className="border-[1px] bg-white border-black" ref={canvasRef} />
    </div>
  );
}

export default Canvas;
