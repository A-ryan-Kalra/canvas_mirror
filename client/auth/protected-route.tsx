import { useEffect } from "react";
import {
  useLocation,
  Navigate,
  useNavigationType,
  useNavigate,
  useParams,
} from "react-router-dom";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  // const searchParams = new URLSearchParams(location.search);
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const { roomId: hasAccessId } = useParams();

  const userId = sessionStorage.getItem("room");

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
