import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Friend from "./components/Friend";
import { loadUserFromLocalStorage } from "../store/actions/authActions";
import Home from "./components/Home";
import Tasks from "./components/Tasks";
import Login from "./components/Login";
import Signup from "./components/Signup";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
// import Preloader from "./components/Preloader"; // Import the Preloader component
import Payment from "./components/Payment";
import Withdrawal from "./components/Withdrawal";
import History from "./components/History";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Provider } from "react-redux";
import store from "../store/store";
import Profile from "./components/Profile";
import AuthListener from "./components/AuthListener"; // Import AuthListener
import Preloader from "./components/Preloader";


store.dispatch(loadUserFromLocalStorage());
function App({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("user");



  useEffect(() => {
    // Force dark mode globally
    document.documentElement.classList.add("dark");

    // Check if Telegram WebApp is available
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
  
      tg.ready();
      tg.expand();
      const isDarkMode = tg.themeParams.bg_color === "#000000";
     // Apply dark theme settings
     if (isDarkMode) {
      document.documentElement.classList.add("dark");  // Add dark theme to root
      document.documentElement.style.setProperty('--bg-color', '#121212');
      document.documentElement.style.setProperty('--text-color', '#ffffff');
    } else {
      document.documentElement.classList.remove("dark");  // Remove dark theme if not dark mode
    }
      document.documentElement.style.setProperty("--tg-bg-color", tg.themeParams.bg_color);
      document.documentElement.style.setProperty("--tg-text-color", tg.themeParams.text_color);

    }

    // Simulate loading time for preloader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Adjust time as needed

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  if (isLoading) {
    return <Preloader />; // Show preloader while loading
  }
  return (
    <Provider store={store}>
      {" "}
      <BrowserRouter>
        <AuthListener />
        <Routes>
     
        <Route
    path="/"
    element={token ? <Navigate to="/home" /> : <Signup />}
  />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={token ? <Navigate to="/home" /> : <Signup />} />
            <Route path="/payment/:id" element={<Payment />} />
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
