import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft, BsPencil, BsFillSaveFill } from "react-icons/bs";
import { useDropzone } from "react-dropzone";
import Footer from "./Footer";
import { useDispatch } from "react-redux";
// Uncomment this when you have the action defined
// import { updateProfileData } from "../../store/actions/homeActions";

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const tokenData = localStorage.getItem("user");
        if (!tokenData) {
          throw new Error("No token data found in localStorage");
        }

        const parsedTokenData = JSON.parse(tokenData);
        const token = parsedTokenData.token;

        if (!token) {
          throw new Error("Token not found");
        }

        const response = await axios.get(
          "http://localhost:4000/api/v1/api-me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserData(response.data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    },
  });

  const handleSaveChanges = async () => {
    const formData = new FormData();
    if (image) {
      formData.append("profile_image", image);
    }

    // Uncomment this when the update API is ready
    /*
    try {
      const tokenData = localStorage.getItem("user");
      const parsedTokenData = JSON.parse(tokenData);
      const token = parsedTokenData.token;

      await axios.post("http://localhost:4000/api/v1/updateProfile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Profile updated successfully");
      navigate("/home");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    */
  };

  if (!userData) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="bg-black flex justify-center">
      <div className="w-full bg-black-900 text-white min-h-screen flex flex-col max-w-lg relative">
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <button onClick={() => navigate(-1)}>
            <BsArrowLeft className="text-white text-3xl" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="flex-grow px-4 pt-16 pb-6 space-y-6 flex flex-col items-center">
          {/* Profile Image */}
          <div className="relative">
            <div
              {...getRootProps()}
              className="cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <input {...getInputProps()} />
              <img
                src={
                  imagePreview ||
                  userData.profile_image ||
                  "https://default-avatar-url.com"
                }
                alt="Profile"
                className="rounded-full w-24 h-24 object-cover border-4 border-gray-600"
              />
              <div className="absolute bottom-2 right-2 bg-gray-800 rounded-full p-1 transition-transform duration-200 hover:scale-110">
                <BsPencil className="text-white text-sm" />
              </div>
            </div>
            {image && (
              <div
                className="absolute bottom-2 left-2 bg-gray-800 rounded-full p-1 transition-transform duration-200 hover:scale-110"
                onClick={handleSaveChanges}
              >
                <BsFillSaveFill className="text-white text-sm" />
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold">{userData.user_name}</h1>
            <p className="text-sm text-gray-400">{userData.email}</p>
            <p className="text-sm text-gray-400">{userData.mobile}</p>
          </div>

          {/* User Coins Information */}
          <div className="w-full space-y-4 text-center">
            <div className="flex justify-between w-10/12 mx-auto bg-gray-800 rounded-lg p-2 transition-transform duration-200 hover:scale-105">
              <span className="text-md font-semibold">Coins:</span>
              <span className="text-lg">{userData.coins}</span>
            </div>
            <div className="flex justify-between w-10/12 mx-auto bg-gray-800 rounded-lg p-2 transition-transform duration-200 hover:scale-105">
              <span className="text-md font-semibold">Pending Coins:</span>
              <span className="text-lg">{userData.pending_coin}</span>
            </div>
            <div className="flex justify-between w-10/12 mx-auto bg-gray-800 rounded-lg p-2 transition-transform duration-200 hover:scale-105">
              <span className="text-md font-semibold">UPI ID:</span>
              <span className="text-lg">
                {userData.upi_id || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default Profile;
