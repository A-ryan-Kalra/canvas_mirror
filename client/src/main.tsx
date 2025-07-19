import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import SocketProvider from "../services/use-socket-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <CursorMovement/> */}
    <BrowserRouter>
      <SocketProvider>
        <App />
      </SocketProvider>
    </BrowserRouter>
  </StrictMode>
);
