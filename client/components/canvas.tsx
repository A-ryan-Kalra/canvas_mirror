import { useEffect, useRef, useState } from "react";

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const isErasingRef = useRef<boolean>(false);
  const isDrawing = useRef<boolean>(false);

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
  }, []);

  return (
    <div>
      <button className="border-[1px] p-1">
        {isErasing ? "Switch to Draw" : "Switch to Erase"}
      </button>
      <canvas className="border-[1px] bg-white border-black" ref={canvasRef} />
    </div>
  );
}

export default Canvas;
