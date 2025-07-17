import { useEffect, useRef, useState } from "react";

function CursorMovement({ date }: { date: number }) {
  const socketRef = useRef<WebSocket>(null);

  const [position, setPosition] = useState<{
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
  const [reciever, setReciever] = useState<{
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
    socketRef.current = new WebSocket(`ws://localhost:8000/ws/cursor/${date}`);
    //  socketRef.current = new WebSocket(
    //    `wss://8f0nnzr5-5173.inc1.devtunnels.ms/ws/cursor/${date}`
    //  );
    let lastSent = 0;

    socketRef.current.onclose = () => {
      console.log("SocketRef.current closed.");
      // Optionally: attempt reconnect
    };

    socketRef.current.onerror = (err) => {
      console.error("SocketRef.current error:", err);
    };

    socketRef.current.onopen = () => {
      console.log("Socket opened.");
    };
    const handleMouseMove = (event: MouseEvent) => {
      const now = Date.now();
      if (now - lastSent < 20) return;

      const data = {
        x: event.clientX,
        y: event.clientY,
        width: window.innerWidth,
        height: window.innerHeight,
        date,
      };

      setPosition(data); // optional: keep if you use position for rendering

      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        // console.log(data);
        socketRef.current.send(JSON.stringify(data));
        lastSent = now;
      }
    };

    socketRef.current.onmessage = (event: MessageEvent) => {
      const parse = JSON.parse(event.data);
      // console.log("Received cursor data:", parse);
      setReciever({
        x: parse.x,
        y: parse.y,
        width: parse.width,
        height: parse.height,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      socketRef.current?.close();
    };
  }, []);

  return (
    <div
      style={{
        width: "50px",
        height: "50px",
        position: "fixed",
        borderRadius: "23px",
        pointerEvents: "none",
        zIndex: 99999,
        transition: "transform 0.02s ease-in-out",
        transform: `translate(${
          ((reciever.x - 25) / reciever.width) * window.innerWidth
        }px, ${((reciever.y - 25) / reciever.height) * window.innerHeight}px)`,
      }}
    >
      <div
        style={{
          width: "25px",
          height: "25px",
          color: "purple",
        }}
        className=" relative top-0 left-0 mx-auto"
      >
        {date}
      </div>
      <div
        style={{
          WebkitMaskImage: "url('/pointer.svg')",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          WebkitMaskPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundColor: "purple",
          width: "25px",
          height: "25px",
        }}
        className="relative top-0 left-0 mx-auto"
      ></div>
    </div>
  );
}

export default CursorMovement;
