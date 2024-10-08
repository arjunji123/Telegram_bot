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
    <div className="bg-white flex justify-center">
      <div className="w-full max-w-lg bg-black text-white min-h-screen font-bold flex flex-col shadow-2xl overflow-hidden">
        {/* Toast Container for displaying toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />

        <div className="px-10 rounded-t-2xl shadow-lg relative">
          <div className="flex justify-center py-4 space-x-1">
            <h1 className="font-poppins text-2xl font-extrabold">UNITRADE</h1>
            <img src={logo} alt="logo" className="w-6 h-6 mt-0.5" />
          </div>
          <h2 className="text-3xl font-semibold text-[#e0e0e0] tracking-wide">
            Payment Details
          </h2>
        </div>
        <div className="px-8 flex-grow">
          <div className="bg-[#474237] rounded-lg p-3 my-3">
            <h3 className="text-lg font-semibold text-center text-[#ada5a5]">
              Admin's UPI ID: <span className="text-white">admin@upi</span>
            </h3>
          </div>
          <div className="flex justify-center mb-6">
            <div
              className="bg-white p-4 rounded-lg shadow-lg"
              style={{ width: "162px" }}
            >
              <h4 className="text-center font-semibold mb-2 text-black">
                Scan UPI QR Code
              </h4>
              <div className="w-30 h-30 bg-gray-200 rounded-lg flex items-center justify-center">
                <img src={scanner} alt="Scanner" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center mb-6">
            <label className="block mb-1 text-base font-semibold text-center text-gray-700">
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
        <div className="bg-[#111113] py-6 text-center rounded-b-2xl">
          <p className="text-[#909090]">
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
