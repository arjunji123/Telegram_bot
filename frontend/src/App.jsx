import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Friend from "./components/Friend";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Tasks from "./components/Tasks";
import Help from "./components/Help";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute"; // Import the ProtectedRoute component
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login setLoggedIn={setLoggedIn} />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute loggedIn={loggedIn} />}>
            <Route path="/home" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/friend" element={<Friend />} />
            <Route path="/help" element={<Help />} />
          </Route>
        </Routes>

        <Footer loggedIn={loggedIn} />
      </BrowserRouter>
    </>
  );
}

export default App;
