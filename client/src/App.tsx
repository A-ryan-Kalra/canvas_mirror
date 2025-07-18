import { useEffect, useRef, useState } from "react";

import CursorMovement from "../components/cursor-movement";
import { Route, Routes } from "react-router-dom";
import Lobby from "../screens/lobby";
import PlayArea from "../screens/play-area";

function App() {
  const socketRef = useRef<WebSocket>(null);

  return (
    <div className="w-full h-dvh">
      {/* <CursorMovement date={client} /> */}

      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<PlayArea />} />
      </Routes>
    </div>
  );
}

export default App;
