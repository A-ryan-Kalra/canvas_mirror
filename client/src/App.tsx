import { Route, Routes } from "react-router-dom";
import Lobby from "../screens/lobby";
import PlayArea from "../screens/play-area";
// import ProtectedRoute from "../auth/protected-route";

function App() {
  return (
    <div className="w-full h-dvh">
      {/* <CursorMovement date={client} /> */}

      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route
          path="/room/:roomId"
          element={
            // <ProtectedRoute>
            <PlayArea />
            // </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
