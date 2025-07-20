import { useEffect } from "react";
import {
  useLocation,
  Navigate,
  useNavigationType,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useSocket } from "../services/use-socket-provider";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const { roomId: hasAccessId } = useParams();
  const { socketProvider } = useSocket();
  const userId = sessionStorage.getItem("room");

  const name = searchParams.get("name");

  useEffect(() => {
    if (navigationType === "POP") {
      sessionStorage.clear();
      navigate("/");
    }
  }, [navigationType]);

  if (hasAccessId === userId) {
    return children;
  }
  return <Navigate to={"/"} state={{ from: location }} replace />;
}

export default ProtectedRoute;
