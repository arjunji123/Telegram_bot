import React, { useState , useEffect} from "react";
import { Link, useNavigate, useLocation  } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toast notifications
import "../Styles/LoginDesign.css";
import { logo } from '../images';
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
    const params = new URLSearchParams(location.search);
    const referralCode = params.get('referral_code'); // Get the referral code from the URL
console.log("params", referralCode);

    if (referralCode) {
      setValues((prev) => ({
        ...prev,
        referral_by: referralCode, // Set the referral code into the state
      }));
    }
  }, [location]);
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
    } else if (values.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }

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
    
    const isValid = validateForm(values);
    console.log('values', values);
    if (!isValid) return; // Exit if validation fails
    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/api-register`,
        values
      );
      console.log("Server Response:", response);
      
      // Assuming the generated ID is in response.data.id
      const userId = response.data.user.id;
  console.log('userId', userId)
      toast.success("Registration successful!");
  
      setTimeout(() => {
        // Redirect to the Payment page with the generated userId
        navigate(`/payment/${userId}`);
      }, 2000);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        const backendError = err.response.data.error;
        toast.error(backendError); // Display the backend error message
      } else {
        console.log("Axios Error:", err);
        toast.error("An error occurred during registration. Please try again.");
      }
    }
  };
  if (loading) {
    return <Loader />;
  }


  return (
    <div className="bg-black flex justify-center items-center min-h-screen overflow-y-auto ">
    <div className="w-full max-w-lg bg-black text-white h-screen shadow-2xl ">
      
      {/* Logo and Welcome Section */}
      <div className="px-6 sm:px-10 shadow-lg relative">
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme="dark" />
        <div className="flex justify-center py-4 space-x-1">
          <h1 className="font-poppins text-xl sm:text-2xl font-extrabold">UNITRADE</h1>
          <img src={logo} alt="logo" className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5" />
        </div>
      </div>

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
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out text-sm sm:text-base"
              placeholder="Referral By"
            />
          </div> 

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full py-3 sm:py-4 text-sm sm:text-base font-semibold text-black bg-white rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 hover:shadow-lg"
            >
              Sign Up
            </button>
          </div>

        </form>
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
