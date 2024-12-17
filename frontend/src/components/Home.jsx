import React, { useState, useEffect } from "react";
import "../Styles/Tasks.css";
import Logo from "../utils/Logo";
import Footer from "./Footer";
import { BsPersonCircle, BsCoin } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { fetchMeData, fetchCoinData, transferCoins } from "../../store/actions/homeActions";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Loader from '../components/Loader';




function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data);
  const userData = apiData?.me?.data || null;
  const pendingCoin = apiData?.coin?.data || null;
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNavigate = () => {
    navigate('/Profile');
  };

  useEffect(() => {
    // Fetch user and coin data on component mount
    const fetchData = async () => {
      try {
        await dispatch(fetchCoinData());
        await dispatch(fetchMeData());
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Set loading to false if there's an error
      }
    };
    fetchData();
  }, [dispatch]);

  const handleClick = () => {
    if (pendingCoin?.pending_coin === 0) {
      toast.warn("You have no coins.");
      return;
    }

    // Trigger animation effect and sound/vibration
    setIsAnimating(true);

    // Play sound for 0.5 seconds
    const vibrationSound = new Audio('src/assets/sound/mobile-phone-vibration-77849.mp3');
    vibrationSound.play();
    vibrationSound.currentTime = 0; // Reset to start
    setTimeout(() => vibrationSound.pause(), 500); // Stop sound after 0.5s

    // Trigger phone vibration (vibrate for 500ms)
    if (navigator.vibrate) {
      navigator.vibrate(500); // Vibrate for 500ms
    }

    // Dispatch coin transfer action
    dispatch(transferCoins())
      .then(() => {
        // Animate coins on successful transfer
        const newCoins = Array.from({ length: 10 }, (_, i) => ({
          id: Date.now() + i,
          x: (Math.random() - 0.5) * 500,
          y: (Math.random() - 0.5) * 500,
          rotate: Math.random() * 360,
        }));
        setCoins(newCoins);

        // Remove coins after animation
        setTimeout(() => setCoins([]), 1000);

        // Re-fetch data to update userData and pendingCoin without hard refresh
        dispatch(fetchCoinData());
        dispatch(fetchMeData());
      })
      .catch((error) => {
        // Show error message if transfer fails
        toast.error("Coin transfer failed.");
      })
      .finally(() => {
        // Reset animation after it's completed
        setTimeout(() => setIsAnimating(false), 1000); // Duration of the animation
      });
  };


  return (
    <div className="bg-black flex justify-center items-center font-Inter min-h-screen w-full overflow-hidden relative">
      <ToastContainer
        position="top-right"
        autoClose={500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
      {loading ? (
        <Loader />
      ) : (
        <div className="w-full bg-black text-white min-h-screen flex flex-col max-w-lg relative">
          {/* Header Section */}
          <div className="flex justify-between items-center px-4 py-2 bg-black border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <p className="text-xl font-bold font-Inter">
                <span className="pl-2 text-xl bold"></span>
              </p>
            </div>
          </div>

          {/* User Info Section */}
          <div className="flex flex-col items-center mt-6 space-y-4">
            <div
              onClick={handleNavigate}
              className="bg-blue-600 text-white h-20 w-20 flex justify-center items-center rounded-full"
            >
              {userData?.user_photo ? (
                <img
                  src={userData.user_photo}
                  alt="Profile"
                  className="w-20 h-20 object-cover rounded-full border-4 border-gray-600"
                />
              ) : (
                <span className="text-2xl font-bold">
                  {userData?.user_name
                    ? userData.user_name
                      .split(" ") // Split the name into words
                      .map(word => word[0]) // Get the first letter of each word
                      .join("") // Join the initials
                      .toUpperCase() // Ensure uppercase
                    : "UN"}
                </span>)}
            </div>

            <p className="text-2xl font-extrabold capitalize font-Inter">{userData ? userData.user_name : "User Name"}</p>
            <p className="text-5xl font-extrabold flex ">
              {/* 𝕌  */}
              <span><img src="src\assets\logo\U.png" alt="" className="w-11 h-11 mt-1" /></span>
              <span>  {userData ? userData.coins : "0"}</span>
            </p>
          </div>



          {/* The button */}
          <div className="absolute bottom-20 w-full px-4 space-y-5">
            {/* Game Section */}
            <div className="flex justify-center items-center mt-6">
              <div className="bg-gray-800 rounded-lg overflow-hidden w-full shadow-md">
                <img
                  src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSPzFN--8Y1W-1Yg9anA4ZXy-W18bIfJ-4RNZ8QWi6wPeGJUUoE" // Replace with actual game thumbnail
                  alt="Game Thumbnail"
                  className="w-full h-40 object-cover"
                />
                <div className="flex space-x-2 items-center px-3 py-2 bg-gray-900">
                  <p className="text-white text-sm font-semibold">Claim Coin</p>
                  <span className="text-red-400 text-sm font-bold">
                    {pendingCoin ? pendingCoin.pending_coin : "0"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClick}
              className="party-cracker-btn w-full bg-white text-black py-3 text-lg font-bold rounded-lg shadow-md hover:bg-gray-200 relative overflow-hidden"
            >
              Tap Coin
            </button>
          </div>
          {/* Full-page animation when animating */}
          {isAnimating && (
            <div className="absolute top-0 left-0 w-full h-full z-50 flex justify-center items-center">
              <div
                className="absolute top-10 left-0 animate-explode flex justify-center items-center w-full"
                style={{
                   background: 'url("src/assets/gif/e4d2c1d0da356797359acd9270bcdd77.gif") no-repeat center center',
                  //background: 'url("https://img1.picmix.com/output/stamp/normal/4/6/5/0/1320564_76c71.gif") no-repeat center center',
                  backgroundSize: 'cover',
                  width: '100%', // Takes up 70% of the page width
                  height: '60%', // Takes up the full page height
                  opacity: 1,
                  animation: 'backgroundAnimation 2.5s forwards',
                  zIndex: 1000,
                }}
              ></div>
            </div>
          )} <style>
            {`
        @keyframes explodeAnimation {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
          100% {
            opacity: 0;
            transform: scale(2);
          }
        }

        .animate-explode {
          border-radius: 50%;
          background: rgba(255, 165, 0, 0.5);
          animation: explodeAnimation 2.5s forwards;
        }
      `}
          </style>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default Home;
