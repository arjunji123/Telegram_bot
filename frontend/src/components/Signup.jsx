import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Validation from "./LoginValidation";
import "../Styles/LoginDesign.css";
import login from "../Img/logo.png";

function Signup() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    role: "user",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInput = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = Validation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post(
          "http://localhost:4000/api/v1/api-register",
          values
        );
        console.log("Server Response:", response);
        navigate("/payment"); // Redirect to the Payment page upon successful signup
      } catch (err) {
        if (err.response && err.response.status === 400) {
          const backendError = err.response.data.error;
          if (backendError.includes("Email")) {
            setErrors({
              ...errors,
              email: backendError, // Display the backend error message for email
            });
          } else if (backendError.includes("Mobile")) {
            setErrors({
              ...errors,
              mobile: backendError, // Display the backend error message for mobile
            });
          }
        } else {
          console.log("Axios Error:", err);
          setErrors({
            ...errors,
            general: "An unexpected error occurred. Please try again later.",
          });
        }
      }
    }
  };

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
                <div style={{ marginLeft: "110px", marginBottom: "-31px" }}>
                  <img
                    src={login}
                    alt=""
                    className="mx-auto h-40 px-4 py-2 items-center space-x-2"
                  />
                </div>
                <br />
                <div className="signin">
                  <div className="content">
                    <h2>Sign Up</h2>

                    <form onSubmit={handleSubmit}>
                      <div className="form">
                        {/* <div className="inputBox">
                          <input
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={handleInput}
                            required
                          />
                          <i>Name</i>
                          {errors.name && (
                            <span className="text-danger"> {errors.name}</span>
                          )}
                        </div> */}
                        <div className="inputBox">
                          <input
                            type="tel"
                            name="mobile"
                            value={values.mobile}
                            onChange={handleInput}
                            required
                          />
                          <i>Mobile No.</i>
                          {errors.mobile && (
                            <span className="text-danger">{errors.mobile}</span>
                          )}
                        </div>
                        <div className="inputBox">
                          <input
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleInput}
                            required
                          />
                          <i>Email</i>
                          {errors.email && (
                            <span className="text-danger"> {errors.email}</span>
                          )}
                        </div>
                        <div className="inputBox">
                          <input
                            type="password"
                            name="password"
                            value={values.password}
                            onChange={handleInput}
                            required
                          />
                          <i>Password</i>
                        </div>
                        <div className="inputBox">
                          <input
                            type="tel"
                            name="name"
                            value={values.name}
                            onChange={handleInput}
                            required
                          />
                          <i>UPI id</i>
                          {errors.name && (
                            <span className="text-danger"> {errors.name}</span>
                          )}
                        </div>
                        <div className="inputBox">
                          <button type="submit">Signup</button>
                        </div>
                        {/* <div className="inputBox">
                          <Link to="/">Login</Link>
                        </div> */}
                      </div>
                    </form>
                    {errors.general && (
                      <span className="text-danger">{errors.general}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
