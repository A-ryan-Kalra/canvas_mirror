import { Sketch } from "@uiw/react-color";

interface PickColorProps {
  pick: (color: string) => void;
}
export default function PickColor({ pick }: PickColorProps) {
  return (
    <Sketch
      className="absolute top-0 right-10"
      style={{ marginLeft: 20 }}
      onChange={(color) => {
        pick(color.hex);
      }}
    />
  );
}
