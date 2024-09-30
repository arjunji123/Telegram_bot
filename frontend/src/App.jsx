import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Friend from "./components/Friend";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Tasks from "./components/Tasks";
import Help from "./components/Help";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
// import Preloader from "./components/Preloader"; // Import the Preloader component
// import Payment from "./components/Payment";
import Withdrawal from "./components/Withdrawal";
import './App.css'

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay (2 seconds)
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  // if (loading) {
  //   return <Preloader />; // Show preloader while loading
  // }

  return (
    <>
      <BrowserRouter>
        <Routes>
        
          <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
          <Route path="/" element={<Signup />} />
          {/* <Route path="/payment" element={<Payment />} /> */}

      
          <Route element={<ProtectedRoute loggedIn={loggedIn} />}>
            <Route path="/home" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/friend" element={<Friend />} />
            <Route path="/help" element={<Help />} />
            <Route path="/withdrawal" element={<Withdrawal />} />
          </Route>
        </Routes>


        {loggedIn && <Footer />}
      </BrowserRouter>
    </>
  );
}

export default App;
