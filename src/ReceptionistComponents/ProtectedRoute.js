import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const isLoggedIn = !!role && !!name;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
