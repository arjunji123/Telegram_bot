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
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready(); // Initialize Telegram WebApp
      tg.expand(); // Expand WebApp interface
      tg.disableClosingConfirmation(); // Disable drag-to-close gestures
    }

    // Timer for preloader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

 

 // Prevent Telegram drag-to-close by managing scroll and touch events
 useEffect(() => {
  const scrollableContent = document.getElementById("scrollable-content");

  // Prevent scroll propagation to Telegram's drag-to-close
  const preventDefaultScroll = (e) => {
    e.stopPropagation(); // Stop the event from bubbling to Telegram WebApp
  };


    if (scrollableContent) {
      scrollableContent.addEventListener("touchmove", preventDefaultScroll, {
        passive: false,
      });
      scrollableContent.addEventListener("wheel", preventDefaultScroll, {
        passive: false,
      });
    }

    return () => {
      if (scrollableContent) {
        scrollableContent.removeEventListener(
          "touchmove",
          preventDefaultScroll
        );
        scrollableContent.removeEventListener("wheel", preventDefaultScroll);
      }
    };
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthListener />
        <div id="app-container" className="relative h-screen overflow-hidden bg-black">
          {/* Scrollable content */}
          <div
            id="scrollable-content"
            className="overflow-y-auto h-full px-2 py-4"
          >
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
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
