import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Tasks.css";
// import rupees from "../Img/hero.png";
import {
  binanceLogo,
  dailyCipher,
  dailyCombo,
  dailyReward,
  dollarCoin,
  hamsterCoin,
  mainCharacter,
} from "../images";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoSettingsSharp } from "react-icons/io5";
//  import { BiSolidDollarCircle } from "react-icons/bi";
import { PiDogFill } from "react-icons/pi";

function Home() {
  const navigate = useNavigate();
  const [coinCount, setCoinCount] = useState(22879727);
  const [showCoins, setShowCoins] = useState(false); // Initial coin count
  const [firstName, setFirstName] = useState("");
  const levelNames = [
    "Bronze", // From 0 to 4999 coins
    "Silver", // From 5000 coins to 24,999 coins
    "Gold", // From 25,000 coins to 99,999 coins
    "Platinum", // From 100,000 coins to 999,999 coins
    "Diamond", // From 1,000,000 coins to 2,000,000 coins
    "Epic", // From 2,000,000 coins to 10,000,000 coins
    "Legendary", // From 10,000,000 coins to 50,000,000 coins
    "Master", // From 50,000,000 coins to 100,000,000 coins
    "GrandMaster", // From 100,000,000 coins to 1,000,000,000 coins
    "Lord", // From 1,000,000,000 coins to ∞
  ];
  const [levelIndex, setLevelIndex] = useState(6);
  const calculateProgress = () => {
    if (levelIndex >= levelNames.length - 1) {
      return 100;
    }
    const currentLevelMin = levelMinPoints[levelIndex];
    const nextLevelMin = levelMinPoints[levelIndex + 1];
    const progress =
      ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
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
    <div className="bg-black flex justify-center">
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <div className="px-4 z-10">
          <div className="flex items-center space-x-2 pt-4">
            <div className="p-1 rounded-lg bg-[#1d2025]">
              <PiDogFill className="text-[#d4d4d4]" size={24} />
            </div>
            <div>
              <p className="text-sm">Nikandr (CEO)</p>
            </div>
          </div>
          <div className="flex items-center justify-between space-x-4 mt-1">
            <div className="flex items-center w-1/3">
              <div className="w-full">
                <div className="flex justify-between">
                  {/* <p className="text-sm">Progress bar</p>
                  <p className="text-sm">
                    7 <span className="text-[#95908a]">
                      /10
                    </span>
                  </p> */}
                </div>
                <div className="flex items-center mt-1 border-2 border-[#43433b] rounded-full">
                  <div className="w-full h-2 bg-[#43433b]/[0.6] rounded-full">
                    <div
                      className="bg-gradient-to-r from-[#90ef89] via-[#d692dd] to-blue-500 h-2 rounded-full"
                      style={{ width: 50 }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center w-2/3 border-2 border-[#43433b] rounded-full px-4 py-[2px] bg-[#43433b]/[0.6] max-w-64">
              <div className="flex-1 text-center">
                <p className="text-sm text-[#85827d] font-medium">Total Coin</p>
                <div className="flex items-center justify-center space-x-1">
                  <img
                    src={dollarCoin}
                    alt="Dollar Coin"
                    className="w-[18px] h-[18px]"
                  />
                  <p className="text-sm">+126.42K</p>
                  <IoIosInformationCircleOutline
                    size={20}
                    className="text-[#43433b]"
                  />
                </div>
              </div>
              <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
              <IoSettingsSharp className="text-white" size={24} />
            </div>
          </div>
        </div>
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
            <div>
              {/* Coin Display */}
              <div className="px-4 mt-4 flex justify-center">
                <div className="px-4 py-2 flex items-center space-x-2">
                  <img
                    src={dollarCoin}
                    alt="Dollar Coin"
                    className="w-10 h-10"
                  />
                  <p className="text-4xl text-white">
                    {coinCount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* {/ Main Character and Coin Clicker /} */}
              <div className="px-4 mt-4 flex justify-center cursor-pointer">
                <div
                  className="w-80 h-80 p-4 rounded-full circle-outer"
                  onClick={handleCardClick}
                >
                  <div className="w-full h-full rounded-full circle-inner relative">
                    <img
                      src={mainCharacter}
                      alt="Main Character"
                      className="w-full h-full"
                    />

                    {/* {/ Coins animation /} */}
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
    </div>
  );
}

export default Home;
