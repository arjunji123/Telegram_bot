import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams for retrieving URL params
import axios from "axios";
import "../Styles/Tasks.css";
import { logo } from '../images';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toast notifications
import "../Styles/LoginDesign.css";
import { BACKEND_URL } from "../config";
import { useDispatch, useSelector } from "react-redux";
import { fetchAPIData } from "../../store/actions/homeActions";
import { FaCopy } from 'react-icons/fa'; // Make sure to install react-icons
import QRCode from "qrcode";
import Loader from '../components/Loader';

function Payment() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data.apisettings);
  const apiSettings = apiData?.settings || [];
  const { id } = useParams(); // Extract userId from URL
  const [firstName, setFirstName] = useState("");
  const [screenshot, setScreenshot] = useState(null); // To store the selected file
  const [qrCodeUrl, setQrCodeUrl] = useState('');
console.log('apiSettings', apiSettings)
useEffect(() => {
  // Initialize Telegram WebApp
  const tg = window.Telegram.WebApp;

  // Extract user information
  const firstName = tg.initDataUnsafe?.user?.first_name;
  setFirstName(firstName);
  
  // Fetch additional API data
  dispatch(fetchAPIData("apiSettings"));
}, [dispatch]);
useEffect(() => {
  const generateQRCode = async () => {
    if (apiSettings && apiSettings.upi) {
      try {
        const upiString = apiSettings.upi;
        const url = await QRCode.toDataURL(upiString);
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Error generating QR Code:', err);
      }
    }
  };

  generateQRCode(); // Generate QR code when apiSettings is updated

}, [apiSettings]);


  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setScreenshot(selectedFile);
    console.log("Selected File:", selectedFile); // Log the selected file for debugging
  };

  const handleUpload = async () => {
    if (screenshot) {
      setLoading(true); // Show loader when upload starts
      try {
        const formData = new FormData();
        formData.append("pay_image", screenshot); // Append the screenshot
        formData.append("user_id", id); // Send the userId with the image

        const response = await axios.post(
          `${BACKEND_URL}/api/v1/upload-screenshot/${id}`, // Use the dynamic id in URL
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
        setLoading(false); // Hide loader after success
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
  const handleCopy = () => {
    const upiId = apiSettings && apiSettings.upi ? apiSettings.upi : "admin@upi";
    
    navigator.clipboard.writeText(upiId).then(() => {
      toast('UPI ID copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <div className="bg-white flex justify-center items-center min-h-screen ">
    <div className="w-full max-w-lg bg-black text-white  h-screen  shadow-lg overflow-hidden">

      {/* Toast Notification */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />

      {/* Header */}
      <div className="flex items-center justify-center py-5 border-b border-white">
        <img src={logo} alt="logo" className="w-8 h-8 mr-2" />
        <h1 className="text-2xl font-bold tracking-wide">UNITRADE</h1>
      </div>

      {/* Main Content */}
      <div className="px-5 py-6 space-y-8">
        {/* UPI ID Section */}
        <div className="flex items-center justify-between bg-black p-4 rounded-lg shadow-md border border-white">
          <span className="text-xs text-white">Admin's UPI ID:</span>
          <span className="font-semibold text-white">{apiSettings?.upi || "admin@upi"}</span>
          <button onClick={handleCopy}>
            <FaCopy className="text-white hover:text-black transition duration-150" title="Copy UPI ID" />
          </button>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center space-y-2">
          <h4 className="text-xs font-semibold text-white">Scan to Pay</h4>
          <div className="bg-white p-3 rounded-lg shadow-md w-32 h-32 flex items-center justify-center">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-black"></div>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div className="flex flex-col items-center">
          <label className="text-xs font-medium text-white mb-2">Upload Payment Proof</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-white file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-black file:text-white hover:file:bg-white hover:file:text-black cursor-pointer mb-3"
          />
          <button
            onClick={handleUpload}
            className="w-32 py-2 bg-white text-black font-semibold text-sm rounded-lg hover:bg-white hover:text-black transition duration-200"
          >
            Upload
          </button>
          
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black py-3 text-center text-white border-t border-white">
        <p className="text-xs">
          Need help?{" "}
          <a href="#" className="text-white font-medium hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  </div>
  
  
  );
}

export default Payment;
