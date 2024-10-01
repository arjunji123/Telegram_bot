import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Tasks.css";
// import rupees from "../Img/hero.png";
import { dollarCoin, logo, mainCharacter } from '../images';
import { IoIosInformationCircleOutline } from "react-icons/io";
import { FaHeadphones } from "react-icons/fa6";
//  import { BiSolidDollarCircle } from "react-icons/bi";
import { PiDotsThreeCircle } from "react-icons/pi";



function Home() {
  const navigate = useNavigate();
  const [coinCount, setCoinCount] = useState(22879727);
  const [showCoins, setShowCoins] = useState(false);  // Initial coin count
  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem("userData");

    // Redirect to the login page
    navigate("/login");
  };

  const [firstName, setFirstName] = useState("");
  const levelNames = [
    "Bronze",    // From 0 to 4999 coins
    "Silver",    // From 5000 coins to 24,999 coins
    "Gold",      // From 25,000 coins to 99,999 coins
    "Platinum",  // From 100,000 coins to 999,999 coins
    "Diamond",   // From 1,000,000 coins to 2,000,000 coins
    "Epic",      // From 2,000,000 coins to 10,000,000 coins
    "Legendary", // From 10,000,000 coins to 50,000,000 coins
    "Master",    // From 50,000,000 coins to 100,000,000 coins
    "GrandMaster", // From 100,000,000 coins to 1,000,000,000 coins
    "Lord"       // From 1,000,000,000 coins to ∞
  ];
  const [levelIndex, setLevelIndex] = useState(6);
  const calculateProgress = () => {
    if (levelIndex >= levelNames.length - 1) {
      return 100;
    }
    const currentLevelMin = levelMinPoints[levelIndex];
    const nextLevelMin = levelMinPoints[levelIndex + 1];
    const progress = ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
    return Math.min(progress, 100);
  };
  const formatProfitPerHour = (profit) => {
    if (profit >= 1000000000) return `+${(profit / 1000000000).toFixed(2)}B`;
    if (profit >= 1000000) return `+${(profit / 1000000).toFixed(2)}M`;
    if (profit >= 1000) return `+${(profit / 1000).toFixed(2)}K`;
    return `+${profit}`;
  };
  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = window.Telegram.WebApp;

    // Extract user information
    const firstName = tg.initDataUnsafe?.user?.first_name;

    setFirstName(firstName);
  }, []);
  const handleCardClick = () => {
    // Show the +10 coins animation
    setShowCoins(true);
    // Increment the coin count
    setCoinCount(coinCount + 10);

    // Hide the animation after 2 seconds
    setTimeout(() => {
      setShowCoins(false);
    }, 2000);
  };

  return (
    <div className="bg-white flex justify-center">
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">

        <div className="flex-grow mt-4 relative  z-0">
          <div className="absolute top-[2px] left-0 right-0 bottom-0">
            <div className="px-4 mt-4 space-y-6">
              <div className="flex justify-between ">
                <div></div>
                <div className="flex  space-x-2">
                  <h1 className="text-xl font-extrabold ">UNITRADE</h1>
                  <img src={logo} alt="logo" className="w-6 h-6" />
                </div>
                <div className=" flex justify-end items-center cursor-pointer">
                  <PiDotsThreeCircle size={38} />
                </div>
              </div>
              <div className="flex justify-between text-3xl font-extrabold">
                <div className="flex space-x-3">
                  <FaHeadphones size={30} />
                  <p className="">Neeraj Singh</p>
                </div>
                <div className=" space-x-1  flex ">
                  <span>U</span>
                  <p className="">700,0000</p>
                </div>
              </div>
              <div className="pt-14 w-5/6 mx-auto">
              <div className="w-full  rounded-full h-11 border-white border-2">
                <div
                  className="bg-white h-10 w-3/6 rounded-full"                 
                ></div>
              </div>
              <p className="text-end text-xl">+2200</p>
              </div>
             
            </div>

            {/* Main Character and Coin Clicker */}
            <div className="px-4 mt-4 flex justify-center cursor-pointer">
              <div
                className="w-96 h-96 p-4 rounded-full "
                onClick={handleCardClick}
              >
                <div className="w-full h-full rounded-full circle-inner relative">
                  <img src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTpCvO76_wx9RGJr00jQ9I5kiVtXmL8wbvlnxk7fJXzfuK1Atsb" alt="Main Character" className="w-full h-full rounded-full" />

                  {/* Coins animation */}
                  {showCoins && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="animate-bounce text-yellow-400 text-3xl font-bold coin-animation">
                        +10 Coins
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
