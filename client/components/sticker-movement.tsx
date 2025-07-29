import { useRef } from "react";
import type { StickerMovementProps } from "../types";

function StickerMovement({ position }: StickerMovementProps) {
  const stickerRef = useRef<HTMLDivElement>(null);
  // const [moveStickerPos,setMoveStickerPos]=useState<{x:number,y:number}>({})

  return (
    <div
      ref={stickerRef}
      data-name={position.name}
      // contentEditable={true}
      spellCheck={false}
      style={{
        minWidth: "50px",
        maxWidth: "150px",
        // maxHeight: "100px",
        // resize: "both",
        whiteSpace: "wrap",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        border: "none",
        borderRadius: "10px",
        outline: "none",
        padding: "0.55rem",
        background: "rgba(37, 235, 221, 0.6)",
        cursor: "default",
        position: "fixed",
        zIndex: 99999,
        left: `${(position.x / position.width) * window.innerWidth}px`,
        top: `${(position.y / position.height) * window.innerHeight}px`,
      }}
      className="dynamic-input before:content-[attr(data-name)] before:absolute before:max-w-[100px] before:h-fit before:bg-purple-500 before:font-semibold before:text-white before:font-mono before:-top-6 before:left-0.5 before:rounded-sm before:p-1 before:z-0 before:text-[10px] before:tracking-wide before:truncate"
      // dangerouslySetInnerHTML={{ __html: position.message as string }}
    >
      {position.message}
    </div>
  );
}

export default StickerMovement;
