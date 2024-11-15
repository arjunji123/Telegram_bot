import React, { useState, useEffect, useRef  } from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft, BsPencil, BsFillSaveFill } from "react-icons/bs";
import { useDropzone } from "react-dropzone";
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import { fetchMeData } from "../../store/actions/homeActions";
 import { updateUserProfile  } from "../../store/actions/userActions";

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data);
  const userData = apiData?.me?.data || null;
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const canvasRef = useRef(null);
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    upi_id: '',
    user_photo: null, // Store the file in state
  });
  useEffect(() => {
    dispatch(fetchMeData());
  }, [dispatch]);

  useEffect(() => {
    if (userData) {
      setFormData({
        user_name: userData.user_name || '',
        email: userData.email || '',
        upi_id: userData.upi_id || '',
        user_photo: userData.user_photo || '',
      });
    }
  }, [userData]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif"] },
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
    const updatedFormData = new FormData();
  
    for (const key in formData) {
      if (formData[key] && key !== 'user_photo') {
        updatedFormData.append(key, formData[key]);
      }
    }
  
    if (image && image instanceof File) {
      updatedFormData.append('user_photo', image);
    }
  
    // Check the contents of FormData before dispatching
    console.log("Final FormData to be sent:");
    for (let [key, value] of updatedFormData.entries()) {
      console.log(key, value);
    }
  
    // Wait for the profile update to complete before fetching data
    await dispatch(updateUserProfile(updatedFormData));
    dispatch(fetchMeData());
  };
  
  
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,  // This should be formData, not setFormData
      [name]: value,
    });
    console.log('Updated FormData', formData);  // This should reflect the updated state
  };
  useEffect(() => {
    console.log('Updated FormData:', formData);
  }, [formData]); 



  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const sparkles = [];
    const maxSparkles = 100;

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
  return (
    <div className="relative min-h-screen flex justify-center items-center font-poppins bg-black overflow-hidden">
    {/* Sparkling Background */}
    <canvas ref={canvasRef} className="absolute inset-0 z-0" />

    {/* Profile Section */}
    <section className="relative z-10 w-full max-w-sm bg-black text-white shadow-lg rounded-lg">
      <div className="p-4 border-b border-gray-700">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div    {...getRootProps()} className="cursor-pointer">
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
          <h1 className="text-lg font-semibold mt-4">{userData?.user_name}</h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="p-4 space-y-4">
        <h2 className="text-gray-300">Personal Info</h2>

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

        <button
          onClick={handleUpdateProfile}
          className="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-600 transition"
        >
          Update
        </button>
      </div>
    </section>
    <Footer />
  </div>
  
  );
}

export default Profile;
