import React, { useState, useEffect } from "react";
import "../Styles/Tasks.css";
import Logo from "../utils/Logo";
import Footer from "./Footer";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeData, fetchCoinData } from '../../store/actions/homeActions';
import { motion, AnimatePresence } from "framer-motion";

function Home() {
  const [firstName, setFirstName] = useState("");
  const [progress, setProgress] = useState(0);
  const [pendingCoins, setPendingCoins] = useState(0);
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data);
  const userData = apiData && apiData.me && apiData.me.data  || null;
  const pendingCoin = apiData && apiData.coin && apiData.coin.data  || null;
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    dispatch(fetchCoinData());
    dispatch(fetchMeData());
  }, [dispatch]);



  const handleClick = () => {
    const newCoins = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i, // Unique ID
      x: (Math.random() - 0.5) * 300, // Random x offset for movement
      y: (Math.random() - 0.5) * 300, // Random y offset for movement
    }));

    setCoins(newCoins);

    // Remove coins after animation
    setTimeout(() => setCoins([]), 2500);
  };

  return (
    <div className="bg-white flex justify-center">
      <div className="w-full bg-black text-white min-h-screen flex flex-col max-w-lg relative">
        <div className="flex-grow relative z-0">
          <div className="px-4 py-6 space-y-6">
            {/* Logo */}
            <Logo />
            {/* User Information */}
            {/* <div
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
            </div> */}

            <div className="flex justify-center space-x-1">
                  <BsPersonCircle size={28} className="mt-1" />
                  <p className="text-2xl font-extrabold capitalize">  {userData ? userData.user_name : "Neeraj Singh"}</p>
                </div>
            {/* User Balance */}
            <div className="flex justify-center space-x-1 text-3xl font-extrabold font-sans ">
              <p>U</p>
              <p>{userData ? userData.coins : "700,0000"}</p>
            </div>

            {/* Progress Bar */}
            {/* <div className="progress-container flex justify-center mt-4">
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
            </div> */}

      
     
    {/* Coin Button and Image */}
    <div className="coin-animation-container my-6 relative">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="coin-btn"
            onClick={handleClick}
          >
            <img
              src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSPzFN--8Y1W-1Yg9anA4ZXy-W18bIfJ-4RNZ8QWi6wPeGJUUoE"
              alt="Main Character"
              className="character-img"
            />
          </motion.div>

          {/* Hamster-style Coin Animation */}
          <div className="coins-container flex justify-center items-center">
            <AnimatePresence>
              {coins.map((coin) => (
                <motion.div
                  key={coin.id}
                  className="coin"
                  initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                  animate={{
                    opacity: 1,
                    x: coin.x, // Move randomly in the X direction
                    y: coin.y, // Move randomly in the Y direction
                    rotate: [0, 360],
                    scale: [1, 1.5, 1],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                >
                  <img src="src\images\dollar-coin.png" alt="Hamster Coin" className="coin-image w-6 h-6" /> {/* Replace with your hamster coin image */}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

         
          </div>

             <div  className="w-8/12 border-2 border-[#f5eded] rounded-xl h-16 mx-auto flex justify-center items-center cursor-pointer">
            <p className="text-xl font-extrabold font-poppins text-[#f5eded]">Pending Coin 
              <span className="pl-2 text-2xl">
              {pendingCoin ? pendingCoin.pending_coin : '700,0000'}
              </span>
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
