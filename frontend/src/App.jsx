import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "../store/store";
import { loadUserFromLocalStorage } from "../store/actions/authActions";

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

  // Prevent Telegram drag-to-close by managing scrolling behavior
  useEffect(() => {
    const content = document.getElementById("content");

    const handleTouchMove = (e) => {
      if (content) {
        const scrollTop = content.scrollTop;
        const scrollHeight = content.scrollHeight;
        const offsetHeight = content.offsetHeight;
        const deltaY = e.touches[0].clientY;

        // Prevent scrolling outside the content
        if (
          (scrollTop === 0 && deltaY > 0) || // At the top and trying to scroll up
          (scrollTop + offsetHeight >= scrollHeight && deltaY < 0) // At the bottom and trying to scroll down
        ) {
          e.preventDefault();
        }
      }
    };

    if (content) {
      content.addEventListener("touchmove", handleTouchMove, { passive: false });
    }

    return () => {
      if (content) {
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
        <div id="content" className="app-container">
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
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
