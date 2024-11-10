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

store.dispatch(loadUserFromLocalStorage());
function App({ Component, pageProps }) {

  return (
    <Provider store={store}>
      {" "}
      <BrowserRouter>
        <AuthListener /> {/* Listen for localStorage changes */}
        <Routes>
          {/* Redirect root path ("/") to login */}
          <Route path="/" element={<Navigate to="/signup" />} />
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/payment/:id" element={<Payment />} />
          </Route>
          {/* Protected Routes */}
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
