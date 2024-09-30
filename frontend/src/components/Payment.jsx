import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Tasks.css";
import logo from "../Img/logo.png";
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
    <div className="bg-black flex justify-center">
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
            <div className="flex flex-col items-center mb-6">
              <img
                src={logo}
                alt="Logo"
                className="h-32 mb-4"
                style={{ marginTop: "50px" }}
              />
              <h2 className="text-3xl font-bold mb-2">Payment Details</h2>
              <p className="text-lg text-gray-400">Hello, {firstName}!</p>
            </div>

            {/* Admin's UPI ID */}
            <div className="bg-[#474237] rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-center">
                Admin's UPI ID:{" "}
                <span className="text-[#f3ba2f]">admin@upi</span>
              </h3>
            </div>

            {/* QR Code Scanner Placeholder */}
            <div className="flex justify-center mb-6">
              <div
                className="bg-white p-4 rounded-lg shadow-lg"
                style={{ width: "162px" }}
              >
                <h4
                  className="text-center font-semibold mb-2"
                  style={{ color: "black" }}
                >
                  Scan UPI QR Code
                </h4>
                {/* Placeholder for QR code */}
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <img
                    src={scanner}
                    alt="Scanner"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Screenshot Upload Section */}
            <div className="flex flex-col items-center justify-center mb-6">
              <label className="block mb-4 text-xl font-semibold text-center text-gray-700">
                Upload Payment Proof
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full max-w-md text-sm text-gray-500
               file:mr-4 file:py-3 file:px-5
               file:rounded-lg file:border-0
               file:text-sm file:font-semibold
               file:bg-[#f3ba2f] file:text-white
               hover:file:bg-[#e3a32e] cursor-pointer mb-4"
              />
              <button
                onClick={handleUpload}
                className="w-full max-w-md bg-green-600 text-white py-3 rounded-lg shadow-lg transition-transform transform hover:bg-green-500 hover:scale-105"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>{" "}
    </div>
  );
}

export default Payment;
