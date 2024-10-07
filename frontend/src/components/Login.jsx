import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./LoginValidation";
import "../Styles/LoginDesign.css";
import {  logo } from '../images';
function Login({ setLoggedIn }) {
  const [values, setValues] = useState({
    emailOrMobile: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Check local storage for user data and auto-login
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      const { token, expiration } = userData;
      const currentTime = new Date().getTime();
      if (currentTime < expiration) {
        setLoggedIn(true);
        navigate("/home");
      } else {
        // If the token is expired, remove it from local storage
        localStorage.removeItem("userData");
      }
    }
  }, [navigate, setLoggedIn]);

  const handleInput = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // const validationErrors = Validation(values);
    // setErrors(validationErrors);

    // if (Object.keys(validationErrors).length === 0) {
    axios
      .post("http://localhost:4000/api/v1/api-login", values)
      .then((res) => {
        if (res.data.success === true) {
          const token_local = res.data.token; // Assume the backend returns a token
          const expirationTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000; // 7 days

          // Save token and expiration time in local storage
          localStorage.setItem(
            "userData",
            JSON.stringify({
              token_local: token_local,
              expiration: expirationTime,
            })
          );

          setLoggedIn(true); // Set the loggedIn state to true
          navigate("/home"); // Navigate to the home page
        } else {
          alert("No Record Exist"); // Display an alert if the user doesn't exist
        }
      })
      .catch((err) => {
        console.error("API Error:", err);
        // Handle specific errors, such as invalid credentials
        if (err.response && err.response.status === 400) {
          alert("Invalid email or password. Please try again.");
        } else {
          alert("An error occurred. Please try again later.");
        }
      });
    // }
  };
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = window.Telegram.WebApp;

    // Extract user information
    const firstName = tg.initDataUnsafe?.user?.first_name;

    setFirstName(firstName);
  }, []);

  return (
<div className="bg-white flex justify-center items-center min-h-screen">
  <div className="w-full max-w-lg bg-black text-white h-full md:h-screen shadow-2xl overflow-hidden">

    {/* Logo and Welcome Section */}
    <div className="p-10  rounded-t-2xl shadow-lg relative">
      <div className="absolute top-0 left-0 w-full h-1 "></div> {/* Classy glowing bar */}
      <div className="flex justify-center py-4 space-x-1 ">
                <h1 className="font-poppins text-2xl font-extrabold">UNITRADE</h1>
                <img src={logo} alt="logo" className="w-6 h-6 mt-0.5" />
              </div>
      <h1 className="mt-4 text-3xl font-semibold text-[#e0e0e0] tracking-wide">{firstName}</h1>
      <p className="text-[#b0b0b0] text-sm mt-2">Unitrade smart. Unitrade efficiently.</p>
    </div>

    {/* Form Section */}
    <div className="p-8 space-y-8">
      <h2 className="text-4xl font-bold text-center mb-6 tracking-tight text-[#eaeaea]">Log In</h2>

      <form onSubmit={handleSubmit} className="space-y-6 px-4 sm:px-8 max-w-md mx-auto">
  

  <div className="relative">
    <input
      type="text"
      name="emailOrMobile"
      onChange={handleInput}
      required
      className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out"
      placeholder="Email / Phone Number"
    />
  </div>

  <div className="relative">
    <input
      type="password"
      name="password"
      onChange={handleInput}
      required
      className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out"
      placeholder="Password"
    />
  </div>

  {/* Login Button */}
  <div className="flex justify-center">
    <button
      type="submit"
      className="w-full py-4 border-white border-2 text-white font-semibold rounded-xl shadow-md hover:opacity-90 transform transition-all duration-300 hover:scale-105"
    >
      Log In
    </button>
  </div>
  
</form>


      {/* Forgot Password */}
      <div className="text-center">
        <a href="#" className="text-sm text-[#b0b0b0] hover:text-white transition-all">Forgot Password?</a>
      </div>
    </div>

    {/* New Account or Signup */}
    <div className="bg-[#111113] py-6 text-center rounded-b-2xl">
      <p className="text-[#909090]">
        New to Unitrade? 
        <a href="/" className="text-white font-semibold hover:underline ml-1">Create an Account</a>
      </p>
    </div>
  </div>
</div>

  );
}

export default Login;
