export interface CursorMovementProps {
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
  };
}

export interface UserDetailsProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  type: string;
  message?: string;
}
export interface StickerDetailProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  type: string;
  stickerNo: string;
  message?: string;
}

export interface StickerMovementProps {
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    type: string;
    stickerNo: string;
    message?: string;
  };
}
