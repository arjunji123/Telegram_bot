import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ loggedIn, toast }) {
  if (!loggedIn) {
    toast.info("Please log in to access this page.", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    return <Navigate to="/" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
