import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./LoginValidation";
import "../Styles/LoginDesign.css";
import login from "../Img/logo.png";
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
    <div className="bg-black flex justify-center">
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div
            className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]"
            style={{ padding: "65px" }}
          >
            <div
              className="absolute px-4 z-10"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className="top-[20px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
                <div style={{ marginLeft: "110px", marginBottom: "-6px" }}>
                  <img
                    src={login}
                    alt=""
                    className="mx-auto h-40 px-4 py-2 items-center space-x-2"
                  />
                </div>
                <h1> {firstName}</h1>
                <div className="signin">
                  <div className="content">
                    <h2>Sign In</h2>
                    <form onSubmit={handleSubmit}>
                      <div className="form">
                        <div className="inputBox">
                          <input
                            type="tel"
                            name="emailOrMobile"
                            onChange={handleInput}
                            required
                          />
                          <i>Email / Phone No.</i>
                        </div>

                        <div className="inputBox">
                          <input
                            type="password"
                            name="password"
                            onChange={handleInput}
                            required
                          />
                          <i>Password</i>
                        </div>
                        <div className="inputBox">
                          <button type="submit">Login</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <br />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
