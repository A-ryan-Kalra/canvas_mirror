import type { StickerMovementProps, UserDetailsProps } from "../types";

function StickerMovement({ position }: StickerMovementProps) {
  // const [stickPos, setStickPos] = useState<{ x: number; y: number }>({
  //   x: 0,
  //   y: 0,
  // });
  // // useEffect(() => {
  //   setStickPos({
  //     x: (position.x / position.width) * window.innerWidth,
  //     y: (position.y / position.height) * window.innerWidth,
  //   });
  // }, [window.innerHeight]);
  return (
    <div
      contentEditable={true}
      spellCheck={false}
      style={{
        minWidth: "50px",
        maxWidth: "100px",
        resize: "both",
        // whiteSpace: "wrap",
        wordBreak: "break-word",
        border: "none",
        borderRadius: "10px",
        outline: "none",
        padding: "0.55rem",
        background: "rgba(37, 235, 221, 0.6)",
        cursor: "grab",
        position: "fixed",
        left: `${(position.x / position.width) * window.innerWidth}px`,
        top: `${(position.y / position.height) * window.innerHeight}px`,
      }}
      className="dynamic-input"
      dangerouslySetInnerHTML={{ __html: position.message as string }}
    >
      {/* {position.message} */}
    </div>
  );
}

export default StickerMovement;
