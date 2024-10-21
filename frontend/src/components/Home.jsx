import React, { useState, useEffect } from "react";
import "../Styles/Tasks.css";
import Logo from "../utils/Logo";
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import { fetchMeData, fetchCoinData } from "../../store/actions/homeActions";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

function Home() {
  const [firstName, setFirstName] = useState("");
  const [progress, setProgress] = useState(0);
  const [pendingCoins, setPendingCoins] = useState(0);
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data);
  const userData = (apiData && apiData.me && apiData.me.data) || null;
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCoinData());
    dispatch(fetchMeData());
  }, [dispatch]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      const firstName = tg.initDataUnsafe?.user?.first_name;
      setFirstName(firstName);
    }
  }, []);

  useEffect(() => {
    if (userData) {
      setPendingCoins(userData.pending_coin); // Initialize pending coins from user data
    }
  }, [userData]);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleImageClick = async () => {
    if (progress < 100 && pendingCoins >= 5) {
      setProgress((prev) => prev + 20);
      const updatedPendingCoins = pendingCoins - 5; // Deduct coins to be transferred

      try {
        const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
        const response = await fetch(`${BACKEND_URL}/api/v1/transfer-coins`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include token in Authorization header
          },
          body: JSON.stringify({ coinsToTransfer: 5 }), // Sending amount of coins
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setPendingCoins(updatedPendingCoins); // Update pending coins state after successful transfer
        } else {
          console.error(
            "Failed to transfer coins:",
            data.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error transferring coins:", error);
      }
    } else {
      console.log("Insufficient coins or maximum progress reached.");
    }

    // Trigger vibration effect for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50); // Vibrate for 50 milliseconds
    }
  };

  return (
    <div className="bg-white flex justify-center">
      <div className="w-full bg-black text-white min-h-screen flex flex-col max-w-lg relative">
        <div className="flex-grow relative z-0">
          <div className="px-4 py-6 space-y-6">
            {/* Logo */}
            <Logo />
            {/* User Information */}
            <div
              className="absolute top-0 left-4 flex items-center space-x-2 cursor-pointer"
              onClick={handleProfileClick}
            >
              <img
                src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSPzFN--8Y1W-1Yg9anA4ZXy-W18bIfJ-4RNZ8QWi6wPeGJUUoE"
                alt="User Avatar"
                className="rounded-full w-8 h-8 object-cover"
              />
              <p className="text-sm font-bold capitalize">
                {userData ? userData.user_name : "Neeraj Singh"}
              </p>
            </div>

            {/* User Balance */}
            <div className="flex justify-center space-x-1 text-4xl font-extrabold font-sans mt-8">
              <p>U</p>
              <p>{userData ? userData.coins : "700,0000"}</p>
            </div>

            {/* Progress Bar */}
            <div className="progress-container flex justify-center mt-4">
              <div
                className="progress-bar-container w-full h-4 bg-gray-700 rounded-full"
                style={{ maxWidth: "80%" }}
              >
                <div
                  className="progress-bar h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #FF9F43, #FFC107)",
                    transition: "width 0.5s ease-in-out",
                  }}
                />
              </div>
            </div>

            {/* Profile Picture */}
            <div
              className="px-4 my-6 cursor-pointer flex justify-center"
              onClick={handleImageClick}
            >
              <img
                src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSPzFN--8Y1W-1Yg9anA4ZXy-W18bIfJ-4RNZ8QWi6wPeGJUUoE"
                alt="Main Character"
                className="rounded-full w-56 h-56 object-cover"
              />
            </div>

            {/* Pending Coins */}
            <div className="w-8/12 border-2 border-[#f5eded] rounded-xl h-16 mx-auto flex justify-center items-center cursor-pointer">
              <p className="text-xl font-extrabold font-poppins text-[#f5eded]">
                Pending Coin
                <span className="pl-2 text-2xl">{pendingCoins}</span>
              </p>
            </div>
          </div>
        </div>
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default Home;
