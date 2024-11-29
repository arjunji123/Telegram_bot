import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BsPencil, BsFillSaveFill } from "react-icons/bs";
import { FaChevronLeft } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import { fetchMeData } from "../../store/actions/homeActions";
import { updateUserProfile } from "../../store/actions/userActions";
import ToastNotification from "./Toast";
import Loader from '../components/Loader';

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data);
  const userData = apiData?.me?.data || null;
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    upi_id: "",
    user_photo: "",
  });


  useEffect(() => {
    //   //   // Fetch user and coin data on component mount
    const fetchData = async () => {
      try {
        await dispatch(fetchMeData());
        setLoader(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoader(false); // Set loading to false if there's an error
      }
    };
    fetchData();
  }, [dispatch]);
  useEffect(() => {
    if (userData) {
      setFormData({
        user_name: userData.user_name || "",
        email: userData.email || "",
        upi_id: userData.upi_id || "",
        user_photo: userData.user_photo || "",
      });
    }
  }, [userData]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
        console.log("Image selected:", file.name);
      } else {
        console.warn("No valid image file selected.");
      }
    },
  });

  const handleUpdateProfile = async () => {
    setLoading(true);
    const updatedFormData = new FormData();

    for (const key in formData) {
      if (formData[key] && key !== "user_photo") {
        updatedFormData.append(key, formData[key]);
      }
    }

    if (image && image instanceof File) {
      updatedFormData.append("user_photo", image);
    }

    // Check the contents of FormData before dispatching
    console.log("Final FormData to be sent:");
    for (let [key, value] of updatedFormData.entries()) {
      console.log(key, value);
    }

    try {
      // Await the async actions (API call)
      await dispatch(updateUserProfile(updatedFormData));
      dispatch(fetchMeData());

      setToastMessage("Profile updated successfully!");
      setShowToast(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      setShowToast(true);
      setToastMessage("There was an error updating your profile.");
    } finally {
      setLoading(false); // Hide loader after the request completes
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    console.log("Updated FormData", formData);
  };

  useEffect(() => {
    console.log("Updated FormData:", formData);
  }, [formData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const sparkles = [];
    const maxSparkles = 60;

    class Sparkle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 2 + 1;
        this.alpha = 1;
        this.speed = Math.random() * 1 + 0.5;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
      }

      update() {
        this.alpha -= 0.01;
        this.y -= this.speed;
      }
    }

    const addSparkle = () => {
      if (sparkles.length < maxSparkles) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        sparkles.push(new Sparkle(x, y));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparkles.forEach((sparkle, index) => {
        sparkle.update();
        sparkle.draw();
        if (sparkle.alpha <= 0) {
          sparkles.splice(index, 1);
        }
      });
      addSparkle();
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup on component unmount
    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(userData?.referral_code || '');
    setToastMessage('Referral code copied to clipboard!');
    setShowToast(true);
  };
  return (
    <div className="relative min-h-screen flex justify-center items-center bg-black overflow-auto">
      {/* Back Button at the top */}
      <div className="absolute top-4 left-4 z-10">
        <button onClick={() => navigate(-1)} className="text-2xl text-white cursor-pointer">
          <FaChevronLeft />
        </button>
      </div>

      {/* Toast Notification */}
      <ToastNotification message={toastMessage} show={showToast} setShow={setShowToast} />

      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Profile Section */}
      {loader ? (
        <Loader />
      ) : (
        <section className="relative z-10 w-full max-w-md bg-black text-white shadow-lg rounded-lg px-4 py-6 overflow-y-auto">
          <div className="flex flex-col items-center space-y-4">
            {/* Profile Picture */}
            <div className="relative">
              <div {...getRootProps()} className="cursor-pointer">
                <input {...getInputProps()} />
                <img
                  src={imagePreview || formData.user_photo || "/src/Img/images.png"}
                  alt="Profile"
                  className="w-24 h-24 object-cover rounded-full border-4 border-gray-600"
                />
                <div className="absolute bottom-1 right-1 bg-gray-800 rounded-full p-2">
                  <BsPencil className="text-white text-xs" />
                </div>
              </div>
              {image && (
                <div className="absolute bottom-1 left-1 bg-gray-800 rounded-full p-2">
                  <BsFillSaveFill className="text-white text-xs" />
                </div>
              )}
            </div>
            <div className="text-center mt-4">
              {/* User Name */}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                {userData?.user_name}
              </h1>

              {/* Referral Code */}
              <div className="flex items-center justify-center space-x-2 mt-2">
                <p className="text-sm font-semibold text-gray-300">Referral Code:</p>
                <div className="px-2 py-1 bg-gray-800 text-gray-100 rounded-lg shadow-md">
                  <span className="font-mono">{userData?.referral_code}</span>
                </div>
                <button
                  className="ml-2 p-1 bg-purple-600 text-white rounded-full shadow hover:bg-purple-700 transition"
                  title="Copy Referral Code"
                  onClick={handleCopyReferralCode} // Add a copy-to-clipboard function
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H4a2 2 0 01-2-2V4a2 2 0 012-2h10a2 2 0 012 2v4m-6 6h6a2 2 0 012 2v10m-10 0h10a2 2 0 002-2V10"
                    />
                  </svg>
                </button>
              </div>
            </div>

          </div>

          {/* Form Section */}
          <div className="space-y-4 mt-6">
            <h2 className="text-gray-300">Personal Info</h2>

            {/* Email Input */}
            <div className="flex items-center border border-gray-700 rounded p-2 bg-gray-800">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-transparent focus:outline-none text-white"
                placeholder="Enter Email Address"
              />
            </div>

            {/* Name Input */}
            <div className="flex items-center border border-gray-700 rounded p-2 bg-gray-800">
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleInputChange}
                className="w-full bg-transparent focus:outline-none text-white"
                placeholder="Enter Full Name"
              />
            </div>

            {/* UPI ID Input */}
            <div className="flex items-center border border-gray-700 rounded p-2 bg-gray-800">
              <input
                type="text"
                name="upi_id"
                onChange={handleInputChange}
                value={formData.upi_id}
                className="w-full bg-transparent focus:outline-none text-white"
                placeholder="Enter UPI ID"
              />
            </div>
          </div>

          {/* Update Button */}
          <div className="mt-6">
            <button
              onClick={handleUpdateProfile}
              className="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-600 transition flex items-center justify-center"
              disabled={loading} // Disable the button when loading
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v2m0 12v2m4-10h2m-12 0H4m6-6l1.5 1.5M9 5l1.5-1.5m6 6l1.5-1.5m-6 6l1.5 1.5"
                  />
                </svg>
              ) : (
                'Update'
              )}
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>


  );
}

export default Profile;
