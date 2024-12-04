import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "../store/store";
import {
  loadUserFromLocalStorage,
} from "../store/actions/authActions";

// Component Imports
import Friend from "./components/Friend";
import Home from "./components/Home";
import Tasks from "./components/Tasks";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/Forgot";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Preloader from "./components/Preloader";
import Payment from "./components/Payment";
import Withdrawal from "./components/Withdrawal";
import History from "./components/History";
import Profile from "./components/Profile";
import AuthListener from "./components/AuthListener";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Dispatch initial load action
store.dispatch(loadUserFromLocalStorage());

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("user");

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.disableClosingConfirmation(); // Prevent drag-to-close behavior
    }

    // Timer for preloader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Add touchmove behavior for scrollable container
  const handleTouchStart = (e) => {
    const content = document.getElementById("content");
    if (content) {
      content.dataset.scrollTop = content.scrollTop || 0;
      content.dataset.startY = e.touches[0].clientY || 0;
    }
  };

  const handleTouchMove = (e) => {
    const content = document.getElementById("content");
    if (content) {
      const deltaY = e.touches[0].clientY - content.dataset.startY;
      const scrollTop = parseInt(content.dataset.scrollTop, 10);

      if (
        (scrollTop <= 0 && deltaY > 0) || // Prevent dragging down at the top
        (scrollTop >= content.scrollHeight - content.offsetHeight && deltaY < 0) // Prevent dragging up at the bottom
      ) {
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    const content = document.getElementById("content");

    if (content) {
      content.addEventListener("touchstart", handleTouchStart);
      content.addEventListener("touchmove", handleTouchMove, { passive: false });
    }

    return () => {
      if (content) {
        content.removeEventListener("touchstart", handleTouchStart);
        content.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, []);

  // Show Preloader while loading
  if (isLoading) {
    return <Preloader />;
  }

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthListener />
        <Routes>
          {/* Redirect based on token existence */}
          <Route
            path="/"
            element={token ? <Navigate to="/home" /> : <Signup />}
          />

          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/forgot" element={<ForgotPassword />} />
          </Route>

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/friend" element={<Friend />} />
            <Route path="/withdrawal" element={<Withdrawal />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
