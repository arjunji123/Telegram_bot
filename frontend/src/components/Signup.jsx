import React, { useState , useEffect} from "react";
import { Link, useNavigate, useLocation  } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons for the eye button
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toast notifications
import "../Styles/LoginDesign.css";
import ToastNotification from "./Toast";
import { BACKEND_URL } from '../config';
import Loader from '../components/Loader';
// Custom Hook for Referral Code

function Signup() {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    user_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    upi_id: "",
    referral_by: "",
    user_type: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); 
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");// Use location to access the URL parameters
  const [keyboardHeight, setKeyboardHeight] = useState(0);
useEffect(() => {
  const getReferralCode = () => {
    let referralCode = null;

    // Check if we are inside the Telegram Web App
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
      console.log("Inside Telegram Web App");

      // Decode initData
      const initDataDecoded = decodeURIComponent(window.Telegram.WebApp.initData);
      console.log("Decoded initData:", initDataDecoded);

      // Parse initData to extract start_param
      const urlParams = new URLSearchParams(initDataDecoded);
      referralCode = urlParams.get("start_param"); // Use 'start_param' instead of 'startapp'
      console.log("Referral Code from Telegram WebApp:", referralCode);
    }

    // Fallback to URL parameters if not in WebApp
    if (!referralCode) {
      const currentUrlParams = new URLSearchParams(window.location.search);
      referralCode = currentUrlParams.get("start_param"); // Check for 'start_param' in URL
      console.log("Referral Code from URL:", referralCode);
    }

    if (referralCode) {
      setValues((prev) => ({
        ...prev,
        referral_by: referralCode,
      }));
      console.log("Referral code set to state:", referralCode);
    } else {
      console.log("No referral code found");
    }
  };

  getReferralCode();
}, [location]); // Run this effect when location changes

  const handleInput = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  // Form validation logic
  const validateForm = (values) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email) {
      toast.error("Email is required");
      return false;
    } else if (!emailRegex.test(values.email)) {
      toast.error("Invalid email format");
      return false;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!values.mobile) {
      toast.error("Mobile number is required");
      return false;
    } else if (!mobileRegex.test(values.mobile)) {
      toast.error("Invalid mobile number. Must be 10 digits.");
      return false;
    }

    if (!values.password) {
      toast.error("Password is required");
      return false;
    } 
    // else if (values.password.length < 8) {
    //   toast.error("Password must be at least 8 characters");
    //   return false;
    // }

    if (!values.confirmPassword) {
      toast.error("Confirm password is required");
      return false;
    } else if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true; // Return true if all validations pass
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const isValid = validateForm(values); // Assuming this is your form validation logic
    console.log('values', values);
      setShowToast(true);
    if (!isValid) {
      setToastMessage("Please fill out the required fields correctly.");
      return; // Exit if validation fails
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/api-register`,
        values
      );
  
      console.log("Server Response:", response);
  
      const userId = response.data.user.id; // Assuming the user ID is in the response
      console.log('userId', userId);
  
      setToastMessage("Registration successful!");
      setShowToast(true);
      setTimeout(() => {
        // Redirect to the Payment page with the generated userId
        navigate(`/payment/${userId}`);
      }, 500);
    } catch (err) {
      setLoading(false); // Make sure to hide the loader in case of error
  
      if (err.response) {
        // If the error is from the backend
        if (err.response.data && !err.response.data.success) {
          // Check if the error contains a specific message or an array of messages
          const errorMessages = err.response.data.error;
          
          if (typeof errorMessages === 'string') {
            // If the error is a string (e.g., "Mobile number already exists")
            setToastMessage(errorMessages);
            setShowToast(true);
          } else if (Array.isArray(errorMessages) && errorMessages.length > 0) {
            // If the error is an array of messages
            setToastMessage(errorMessages[0]);
            setShowToast(true);
          } else {
            setToastMessage("An unknown error occurred.");
            setShowToast(true);
          }
        } else if (err.response.status === 404) {
          // Handle 404 error (Not Found)
          setToastMessage("Requested resource not found.");
          setShowToast(true);
        } else if (err.response.status === 500) {
          // Handle 500 error (Server Error)
          setToastMessage("Server error occurred. Please try again later.");
          setShowToast(true);
        } else {
          // Handle other status codes (e.g., 401, 403)
          const errorMessage = err.response.data.message || 'An unknown error occurred.';
          setToastMessage(errorMessage);
          setShowToast(true);
        }
      } else {
        // Network or other errors (e.g., timeout, no internet)
        console.log("Axios Error:", err);
        setToastMessage("Network error. Please check your connection or try again later.");
        setShowToast(true);
      }
    } finally {
      setLoading(false); // Hide the loading spinner after the request completes
    }
  };
  
  useEffect(() => {
    const onResize = () => {
      if (window.visualViewport) {
        setKeyboardHeight(window.innerHeight - window.visualViewport.height);
      }
    };

    window.visualViewport.addEventListener("resize", onResize);
    return () => {
      window.visualViewport.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="bg-black flex justify-center items-center min-h-screen overflow-hidden">
    <ToastNotification message={toastMessage} show={showToast} setShow={setShowToast} />
    <div
      className={`w-full max-w-lg bg-black text-white h-auto sm:h-screen shadow-2xl pt-safe pb-safe ${
        keyboardHeight ? `pb-[${keyboardHeight}px]` : ""
      }`}
    >
      <div id="content" className="p-4 sm:p-6 space-y-6 h-full overflow-y-auto touch-auto">
        <h2 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-6 tracking-tight text-[#eaeaea]">
          Sign Up
        </h2>
  
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
  
          {/* Name and Mobile Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="text"
                name="user_name"
                value={values.user_name}
                onChange={handleInput}
                required
                aria-label="Name"
                className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-400 text-sm sm:text-base"
                placeholder="Name"
              />
            </div>
            <div className="relative">
              <input
                type="tel"
                name="mobile"
                value={values.mobile}
                onChange={handleInput}
                required
                aria-label="Mobile No."
                className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-400 text-sm sm:text-base"
                placeholder="Mobile No."
              />
            </div>
          </div>
  
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleInput}
              required
              aria-label="Email"
              className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-400 text-sm sm:text-base"
              placeholder="Email"
            />
          </div>
  
          {/* Password and Confirm Password Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={values.password}
                onChange={handleInput}
                required
                aria-label="Password"
                className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-400 text-sm sm:text-base"
                placeholder="Password"
              />
              <button
                type="button"
                aria-label="Toggle Password Visibility"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-[#00c6ff] transition"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
  
            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleInput}
                required
                aria-label="Confirm Password"
                className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-400 text-sm sm:text-base"
                placeholder="Confirm Password"
              />
              <button
                type="button"
                aria-label="Toggle Confirm Password Visibility"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-[#00c6ff] transition"
              >
                {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>
  
          {/* UPI ID Input */}
          <div className="relative">
            <input
              type="text"
              name="upi_id"
              value={values.upi_id}
              onChange={handleInput}
              required
              aria-label="UPI ID"
              className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-400 text-sm sm:text-base"
              placeholder="UPI ID"
            />
          </div>
  
          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full py-3 sm:py-4 text-sm sm:text-base uppercase font-bold text-black bg-white rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-transform"
              disabled={loading}
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="spinner"></div>
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
        </form>
  
        {/* Spinner Styles */}
        <style jsx>{`
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #000000;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
          }
  
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
  
      {/* Footer */}
      <div className="bg-[#111113] py-4 sm:py-6 text-center">
        <p className="text-xs sm:text-sm text-[#909090]">
          Already have an account?
          <Link to="/login" className="text-white font-semibold hover:underline ml-1">
            Login
          </Link>
        </p>
      </div>
    </div>
  </div>
  
  );
}
const styles = {
  content: {
    // height: '100%', // Full viewport height
    // overflowY: 'auto', // Enable vertical scrolling
    WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
  },
};

export default Signup;
