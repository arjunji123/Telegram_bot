import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams for retrieving URL params
import axios from "axios";
import "../Styles/Tasks.css";
import { logo } from '../images';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toast notifications
import "../Styles/LoginDesign.css";
import scanner from "../Img/scanner.png";

function Payment() {
  const navigate = useNavigate();
  const { id } = useParams(); // Extract userId from URL

  const [firstName, setFirstName] = useState("");
  const [screenshot, setScreenshot] = useState(null); // To store the selected file

  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = window.Telegram.WebApp;

    // Extract user information
    const firstName = tg.initDataUnsafe?.user?.first_name;
    setFirstName(firstName);

    // Log the userId passed via URL for debugging
    console.log("Received userId:", id);

  }, [id]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setScreenshot(selectedFile);
    console.log("Selected File:", selectedFile); // Log the selected file for debugging
  };

  const handleUpload = async () => {
    if (screenshot) {
      try {
        const formData = new FormData();
        formData.append("pay_image", screenshot); // Append the screenshot
        formData.append("user_id", id); // Send the userId with the image

        const response = await axios.post(
          `http://localhost:4000/api/v1/upload-screenshot/${id}`, // Use the dynamic id in URL
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Server Response:", response);
        toast.success("Screenshot uploaded successfully!"); 
        
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      } catch (err) {
        console.error("Error uploading screenshot:", err); // Log detailed error for debugging
        if (err.response) {
          console.error("Response Error:", err.response.data); // Handle specific response errors
          toast.error(err.response.data.error || "An error occurred during the upload."); // Show error toast
        } else {
          toast.error("An error occurred while uploading. Please try again."); // Fallback error toast
        }
      }
    } else {
      toast.warn("Please select a screenshot to upload."); // Show warning if no file is selected
    }
  };

  return (
    <div className="bg-white flex justify-center min-h-screen overflow-y-auto">
    <div className="w-full max-w-lg bg-black text-white min-h-screen font-bold flex flex-col shadow-lg ">
  
      {/* Toast Notification */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
  
      {/* Header */}
      <div className="px-6 py-4 shadow-md">
        <div className="flex justify-center items-center space-x-2">
          <h1 className="text-xl font-extrabold">UNITRADE</h1>
          <img src={logo} alt="logo" className="w-5 h-5" />
        </div>
        <h2 className="text-xl text-center font-semibold mt-2">Payment Details</h2>
      </div>
  
      {/* Main Content */}
      <div className="px-4 py-6 flex-grow">
        {/* UPI ID */}
        <div className="bg-[#474237] rounded-md p-3 mb-4 text-center">
          <h3 className="text-sm text-[#ada5a5]">
            Admin's UPI ID: <span className="text-white">admin@upi</span>
          </h3>
        </div>
  
        {/* QR Code Section */}
        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-md shadow-lg w-36">
            <h4 className="text-sm font-semibold text-black text-center mb-2">
              Scan UPI QR Code
            </h4>
            <div className="w-28 h-28 bg-gray-200 rounded-md flex items-center justify-center">
              <img src={scanner} alt="QR Code" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
  
        {/* Upload Section */}
        <div className="flex flex-col items-center mb-4">
          <label className="text-sm font-semibold mb-2 text-gray-500">
            Upload Payment Proof
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#00c6ff] file:text-white hover:file:bg-[#53bedb] cursor-pointer mb-3"
          />
          <button
            onClick={handleUpload}
            className="w-2/3 py-3 border border-white text-white rounded-xl shadow-lg text-sm transition-transform hover:scale-105"
          >
            Upload
          </button>
        </div>
      </div>
  
      {/* Footer */}
      <div className="bg-[#111113] py-4 text-center rounded-b-lg">
        <p className="text-sm text-[#909090]">
          Need help?{" "}
          <a href="#" className="text-white font-semibold hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  </div>
  
  
  );
}

export default Payment;
