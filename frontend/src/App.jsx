import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "../store/store";
import { loadUserFromLocalStorage } from "../store/actions/authActions";
import desktopImage from './images/desktop3.png'; // Import the image

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
    const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("user");

   useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Strict mobile detection: Requires both a mobile user agent and touch capability
      const isTouchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;

      const isMobileUserAgent = /android|iPhone|iPad|iPod/i.test(userAgent);

      // Final condition for detecting real mobile devices
      const isMobileDevice = isTouchDevice && isMobileUserAgent;

      setIsMobile(isMobileDevice);
    };

    // Perform initial device check
    checkDevice();

    // Listen for screen resize events (for DevTools simulation toggling)
    const handleResize = () => checkDevice();
    window.addEventListener("resize", handleResize);

    // Telegram WebApp Initialization
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;

      // Only proceed if the device is detected as mobile
      if (isMobile) {
        tg.ready();
        tg.expand();
        tg.disableClosingConfirmation();
      }
    }

    // Remove loading state after setup
    setIsLoading(false);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);
    
  useEffect(() => {
    const preventTelegramClose = (e) => {
      // Block any touchmove event that might cause the bot to close
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    // Add event listener to prevent Telegram bot from closing
    document.addEventListener('touchmove', preventTelegramClose, { passive: false });

    // Remove the event listener on cleanup
    return () => {
      document.removeEventListener('touchmove', preventTelegramClose);
    };
  }, []);

  if (isLoading) {
    return <Preloader />;
  }
  if (!isMobile) {
    // If not on mobile (desktop or other platforms), show the message and image
    return (
        
      <div className="desktop-message">
        <img
                  src={desktopImage} 
       alt="Open on Mobile"
          style={{
            width: "100%",       // Adjust the width of the image as needed
            display: "block",   // Make sure it's displayed as a block element
          }}
        />
      </div>
    );
  }

  return (
      
    <Provider store={store}>
      <BrowserRouter>
        <AuthListener />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>          {/* Scrollable content */}
           {/* Scrollable content */}
           <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingBottom: '60px', // To ensure content is not hidden behind the fixed bot
            WebkitOverflowScrolling: 'touch', // Smooth scrolling for iOS
          }}>
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
            {/* Fixed Telegram Bot */}
            <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '10px',
              textAlign: 'center',
              zIndex: 9999, // Make sure bot stays above content

            }}
          >
     
          </div>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
