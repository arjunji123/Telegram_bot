import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Friend from "./components/Friend";
import { loadUserFromLocalStorage } from "../store/actions/authActions";
import Home from "./components/Home";
import Tasks from "./components/Tasks";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/Forgot";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Preloader from "./components/Preloader"; // Import the Preloader component
import Payment from "./components/Payment";
import Withdrawal from "./components/Withdrawal";
import History from "./components/History";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Provider } from "react-redux";
import store from "../store/store";
import Profile from "./components/Profile";
import AuthListener from "./components/AuthListener"; // Import AuthListener
import KeyboardFix from "./components/KeyboardFix"; // Import the KeyboardPaddingFix component


store.dispatch(loadUserFromLocalStorage());
function App({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("user");

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      // Prevent drag-to-close
      tg.disableClosingConfirmation();

    }
 
    const handleTouchMove = (e) => {
      if (!e.target.closest("#content")) {
        e.preventDefault(); // Block scrolling outside of #content
      }
    };


    document.addEventListener("touchmove", handleTouchMove, { passive: false });


    // Timer for preloader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);
  // Add this to your main component (e.g., App.js or a custom hook)




  if (isLoading) {
    return <Preloader />; // Show preloader while loading
  }
  return (
    <Provider store={store}>
      {" "}
      {/* <KeyboardFix /> */}
      <BrowserRouter>
        <AuthListener />
        <Routes>

          <Route
            path="/"
            element={token ? <Navigate to="/home" /> : <Signup />}
          />

          <Route element={<PublicRoute />}>
            {/* <Route path="/" element={<Signup />} /> */}
            <Route path="/login" element={<Login />} />
            {/* <Route path="/" element={token !== null? <Navigate to="/home" /> : <Signup />} /> */}
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/forgot" element={<ForgotPassword />} />
          </Route>

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
