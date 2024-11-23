import React, { useState , useEffect} from "react";
import { Link, useNavigate, useLocation  } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toast notifications
import "../Styles/LoginDesign.css";
import { logo } from '../images/index';
import { BACKEND_URL } from '../config';
import Loader from '../components/Loader';

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
  const navigate = useNavigate();
  const location = useLocation(); // Use location to access the URL parameters

  useEffect(() => {
    const getReferralCode = () => {
      let referralCode = null;

      try {
        // Check if we are inside the Telegram Web App (inside the browser)
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
          console.log("Inside Telegram Web App");

          // Decode Telegram WebApp initData (if available)
          const initDataDecoded = decodeURIComponent(window.Telegram.WebApp.initData);
          console.log("Decoded initData:", initDataDecoded);

          // Extract startapp parameter from initData
          const urlParams = new URLSearchParams(initDataDecoded);
          referralCode = urlParams.get("startapp");
          console.log("Referral Code from Telegram WebApp:", referralCode);
        }

        // Fallback for Web URL: when the app is accessed directly via URL
        if (!referralCode) {
          console.log("Using Web URL fallback");
          const currentUrlParams = new URLSearchParams(window.location.search);
          referralCode = currentUrlParams.get("startapp");
          console.log("Referral Code from Web URL:", referralCode);
        }

        // If referral code is found, set it in state
        if (referralCode) {
          setValues((prev) => ({
            ...prev,
            referral_by: referralCode,
          }));
          console.log("Referral code set to state:", referralCode);
        } else {
          console.log("No referral code found");
        }
      } catch (error) {
        console.error("Error extracting referral code:", error);
      }
    };

    getReferralCode();
  }, [location]); // Runs when the location (URL) changes

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
  
    if (!isValid) {
      toast.error("Please fill out the required fields correctly.");
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
  
      toast.success("Registration successful!");
  
      setTimeout(() => {
        // Redirect to the Payment page with the generated userId
        navigate(`/payment/${userId}`);
      }, 2000);
    } catch (err) {
      setLoading(false); // Make sure to hide the loader in case of error
  
      if (err.response) {
        // If the error is from the backend
        if (err.response.data && !err.response.data.success) {
          // Check if the error contains a specific message or an array of messages
          const errorMessages = err.response.data.error;
          
          if (typeof errorMessages === 'string') {
            // If the error is a string (e.g., "Mobile number already exists")
            toast.error(errorMessages);
          } else if (Array.isArray(errorMessages) && errorMessages.length > 0) {
            // If the error is an array of messages
            toast.error(errorMessages[0]);
          } else {
            toast.error("An unknown error occurred.");
          }
        } else if (err.response.status === 404) {
          // Handle 404 error (Not Found)
          toast.error("Requested resource not found.");
        } else if (err.response.status === 500) {
          // Handle 500 error (Server Error)
          toast.error("Server error occurred. Please try again later.");
        } else {
          // Handle other status codes (e.g., 401, 403)
          const errorMessage = err.response.data.message || 'An unknown error occurred.';
          toast.error(errorMessage);
        }
      } else {
        // Network or other errors (e.g., timeout, no internet)
        console.log("Axios Error:", err);
        toast.error("Network error. Please check your connection or try again later.");
      }
    } finally {
      setLoading(false); // Hide the loading spinner after the request completes
    }
  };
  
  

  return (
    <div className="bg-black flex justify-center items-center min-h-screen overflow-y-auto ">
    <div className="w-full max-w-lg bg-black text-white h-screen shadow-2xl ">
      
      {/* Logo and Welcome Section */}
      {/* <div className="px-6 sm:px-10 shadow-lg relative">
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme="dark" />
        <div className="flex justify-center py-4 space-x-1">
          <h1 className="font-poppins text-xl sm:text-2xl font-extrabold">UNITRADE</h1>
          <img src={logo} alt="logo" className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5" />
        </div>
      </div> */}

      {/* Form Section */}
      <div className="p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-6 tracking-tight text-[#eaeaea]">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 px-2 sm:px-4">

          {/* Name and Mobile Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="text"
                name="user_name"
                value={values.user_name}
                onChange={handleInput}
                required
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out text-sm sm:text-base"
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
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out text-sm sm:text-base"
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
              className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out text-sm sm:text-base"
              placeholder="Email"
            />
          </div>

          {/* Password and Confirm Password Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="password"
                name="password"
                value={values.password}
                onChange={handleInput}
                required
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out text-sm sm:text-base"
                placeholder="Password"
              />
            </div>
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleInput}
                required
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out text-sm sm:text-base"
                placeholder="Confirm Password"
              />
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
              className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out text-sm sm:text-base"
              placeholder="UPI ID"
            />
          </div>

          {/* Referral Input */}
          <div className="relative ">
            <input
              type="text"
              name="referral_by"
              value={values.referral_by}
              onChange={handleInput}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 uppercase bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out text-sm sm:text-base"
              placeholder="Referral By"
            />
          </div> 

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full py-3 sm:py-4 text-sm sm:text-base uppercase font-bold font-eina text-black bg-white rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 hover:shadow-lg"
              disabled={loading} // Disable the button when loading
            >
              
              {loading ? (
              <div className="flex justify-center items-center">
                <div className="spinner"></div> {/* Custom spinner */}
              </div>
            ) : (
              'Sign Up' // Normal button text
            )}
            </button>
          </div>

        </form>
       {/* CSS for Custom Spinner */}
       <style jsx>{`
        .spinner {
          border: 4px solid #f3f3f3; /* Light background */
          border-top: 4px solid #000000; /* Black color */
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>

      {/* Footer Section */}
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

export default Signup;
