// Login.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/LoginDesign.css";
import { useDispatch } from "react-redux";
import { login } from "../../store/actions/authActions";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons for the eye button
import ToastNotification from "./Toast";
import { logo } from "../images/index";
import Loader from '../components/Loader';

function Login() {
  const dispatch = useDispatch();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setErrors(''); // Clear previous error message
  //   // setLoading(true); // Show loader when upload starts
  //   try {
  //     await dispatch(login({ mobile, password }));
  //     setToastMessage("Login successful!");
  //     setShowToast(true);
  //     setTimeout(() => {
  //       // setLoading(false); // Hide loader after success
  //       navigate("/home");
  //     }, 2000);
  //   } catch (error) {
  //     const backendError = error.error || "Your account is deactivated. Please contact support.";
  //     setErrors(backendError); // Set error message from backend response
  //     setToastMessage(backendError);
  //     setShowToast(true);
  //   }
  // };


  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors(""); // Clear previous error message

    try {
      await dispatch(login({ mobile, password }));
      setToastMessage("Login successful!");
      setShowToast(true);
      navigate("/home");
      // setTimeout(() => {
      // }, 2000);
    } catch (error) {
      const errorMessage = error.message || "An unknown error occurred."; // Get the error message from the thrown error

      console.error("Caught error:", errorMessage); // Log error for debugging
      setErrors(errorMessage); // Display error message in the UI
      setToastMessage(errorMessage); // Show error message in toast
      setShowToast(true);
    }
  };

  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    const firstName = tg.initDataUnsafe?.user?.first_name;
    setFirstName(firstName);
  }, []);

  return (
    <div className="bg-white flex justify-center items-center min-h-screen ">
      <ToastNotification message={toastMessage} show={showToast} setShow={setShowToast} />
      <div className="w-full max-w-lg bg-black text-white h-screen shadow-2xl overflow-hidden ">
        <div className="p-6 sm:p-10  shadow-lg relative">
          <div className="absolute top-0 left-0 w-full h-1 "></div>
          {/* <div className="flex justify-center py-4 space-x-1">
            <h1 className="font-poppins text-xl sm:text-2xl font-extrabold">
              UNITRADE
            </h1>
            <img
              src={logo}
              alt="logo"
              className="w-5 sm:w-6 h-5 sm:h-6 mt-0.5"
            />
          </div> */}
          <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-[#e0e0e0] tracking-wide text-center">
            {firstName}
          </h1>
          <p className="text-[#b0b0b0] text-xs sm:text-sm mt-2 text-center">
            Unitrade smart. Unitrade efficiently.
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-6 tracking-tight text-[#eaeaea]">
            Log In
          </h2>

          <form onSubmit={handleLogin}
            className="space-y-4 sm:space-y-6 px-2 sm:px-4" >
            <div className="relative">
              <input
                type="text"
                name="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out text-sm sm:text-base"
                placeholder="Phone Number"
              />
            </div>

            {/* <div className="relative">
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out text-sm sm:text-base"
                placeholder="Password"
              />
            </div> */}

<div className="relative">
      {/* Password Input */}
      <input
        type={showPassword ? "text" : "password"} // Toggle input type
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out text-sm sm:text-base"
        placeholder="Password"
      />

      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)} // Toggle password visibility
        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-[#00c6ff] transition duration-300"
      >
        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
      </button>
    </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full py-3 sm:py-4 text-sm sm:text-base font-Inter uppercase font-bold text-black bg-white rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 hover:shadow-lg"
              >
                Log In
              </button>
            </div>
          </form>

          <div className="text-center">
            <Link
             to="/forgot"
              className="text-xs sm:text-sm text-[#b0b0b0] hover:text-white transition-all"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-[#111113] py-4 sm:py-6 text-center rounded-b-2xl">
          <p className="text-xs sm:text-sm text-[#909090]">
            New to Unitrade?
            <Link to="/" className="text-white font-semibold hover:underline ml-1">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
