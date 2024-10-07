import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Tasks.css";
import {  logo } from '../images';
import scanner from "../Img/scanner.png";

function Payment() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [screenshot, setScreenshot] = useState(null); // State for screenshot

  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = window.Telegram.WebApp;

    // Extract user information
    const firstName = tg.initDataUnsafe?.user?.first_name;
    setFirstName(firstName);
  }, []);

  const handleFileChange = (event) => {
    setScreenshot(event.target.files[0]);
  };

  const handleUpload = () => {
    if (screenshot) {
      // Logic for uploading the screenshot (API call, etc.)
      console.log("Screenshot uploaded:", screenshot);

      // Show success message
      alert("Screenshot uploaded successfully!");

      // Redirect to the login page
      navigate("/login");
    } else {
      alert("Please select a screenshot to upload.");
    }
  };

  return (
<div className="bg-white flex justify-center">
  <div className="w-full max-w-lg bg-black text-white min-h-screen font-bold flex flex-col shadow-2xl overflow-hidden">

    {/* Header Section */}
    <div className="px-10 rounded-t-2xl shadow-lg relative">
      <div className="flex justify-center py-4 space-x-1 ">
                <h1 className="font-poppins text-2xl font-extrabold">UNITRADE</h1>
                <img src={logo} alt="logo" className="w-6 h-6 mt-0.5" />
              </div>
      <h2 className="text-3xl font-semibold text-[#e0e0e0] tracking-wide">Payment Details</h2>
      {/* <p className="text-[#b0b0b0] text-sm mt-2">Hello, {firstName}!</p> */}
    </div>

    {/* Main Content Section */}
    <div className="px-8  flex-grow">
      
      {/* Admin's UPI ID */}
      <div className="bg-[#474237] rounded-lg p-3 my-3">
        <h3 className="text-lg font-semibold text-center text-[#ada5a5]">
          Admin's UPI ID: <span className="text-white">admin@upi</span>
        </h3>
      </div>

      {/* QR Code Scanner Placeholder */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-4 rounded-lg shadow-lg" style={{ width: "162px" }}>
          <h4 className="text-center font-semibold mb-2 text-black">Scan UPI QR Code</h4>
          <div className="w-30 h-30 bg-gray-200 rounded-lg flex items-center justify-center">
            <img src={scanner} alt="Scanner" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Screenshot Upload Section */}
      <div className="flex flex-col items-center justify-center mb-6">
        <label className="block mb-1 text-base font-semibold text-center text-gray-700">Upload Payment Proof</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full max-w-md text-sm text-gray-500
            file:mr-4 file:py-3 file:px-5
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-[#00c6ff] file:text-white
            hover:file:bg-[#53bedb] cursor-pointer mb-4"
        />
        <button
          onClick={handleUpload}
          className="w-full max-w-md border-white border-2 text-white py-3 rounded-lg shadow-lg transition-transform transform hover:bg-opacity-90 hover:scale-105"
        >
          Upload
        </button>
      </div>
    </div>

    {/* Footer Section */}
    <div className="bg-[#111113] py-6 text-center rounded-b-2xl">
      <p className="text-[#909090]">
        Need help? <a href="#" className="text-white font-semibold hover:underline">Contact Support</a>
      </p>
    </div>
  </div>
</div>

  );
}

export default Payment;
