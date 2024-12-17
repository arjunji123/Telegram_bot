import React, { useState, useEffect , useRef } from "react";
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
  const scrollContainerRef = useRef();
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
    // Function to prevent Telegram from closing on drag
    const preventTelegramClose = (e) => {
      if (e.cancelable) {
        e.preventDefault(); // Prevent closing the bot when dragging the screen
      }
    };

    // Add the touchmove event listener globally to prevent bot close
    document.addEventListener('touchmove', preventTelegramClose, { passive: false });

    // Allow scroll only on the content
    const handleTouchMove = (e) => {
      const scrollable = scrollContainerRef.current;
      if (scrollable && scrollable.contains(e.target)) {
        e.stopPropagation(); // Allow scrolling within the container
      } else {
        e.preventDefault(); // Prevent the event from closing Telegram if not in the container
      }
    };

    // Add touchmove event listener to handle scrolling behavior
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Cleanup the event listeners on component unmount
    return () => {
      document.removeEventListener('touchmove', preventTelegramClose);
      document.removeEventListener('touchmove', handleTouchMove);
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
        <div style={{ height: '100vh', overflow: 'hidden' }}>
          {/* Scrollable content */}
         {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
      className="scrollable-content"
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
