import React, { useState, useEffect } from "react";
import "../Styles/Tasks.css";
import Logo from "../utils/Logo";
import Footer from "./Footer";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { fetchMeData, fetchCoinData, transferCoins } from "../../store/actions/homeActions";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

function Home() {
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data);
  const userData = apiData?.me?.data || null;
  const pendingCoin = apiData?.coin?.data || null;
  
  const [coins, setCoins] = useState([]);
  
  useEffect(() => {
    // Fetch user and coin data on component mount
    dispatch(fetchCoinData());
    dispatch(fetchMeData());
  }, [dispatch]);
  
  const handleClick = () => {
    if (pendingCoin?.pending_coin === 0) {
      // Show message if there are no coins to transfer
      toast.warn("You have no coins.");
      return;
    }
    
    // Dispatch coin transfer action
    dispatch(transferCoins())
      .then(() => {
        // Animate coins on successful transfer
        const newCoins = Array.from({ length: 10 }, (_, i) => ({
          id: Date.now() + i,
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300,
        }));
        setCoins(newCoins);
        // Remove coins after animation
        setTimeout(() => setCoins([]), 2500);
      })
      .catch((error) => {
        // Show error message if transfer fails
        toast.error("Coin transfer failed.");
      });
  };

  return (
    <div className="bg-white flex justify-center">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="w-full bg-black text-white min-h-screen flex flex-col max-w-lg relative">
        <div className="flex-grow relative z-0">
          <div className="px-4 py-6 space-y-6">
            <Logo />
            <div className="flex justify-center space-x-1">
              <BsPersonCircle size={28} className="mt-1" />
              <p className="text-2xl font-extrabold capitalize">
                {userData ? userData.user_name : "Loading..."}
              </p>
            </div>

            {/* User Balance */}
            <div className="flex justify-center space-x-1 text-3xl font-extrabold font-sans">
              <p>U</p>
              <p>{userData ? userData.coins : "Loading..."}</p>
            </div>

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
                        x: coin.x,
                        y: coin.y,
                        rotate: [0, 360],
                        scale: [1, 1.5, 1],
                      }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    >
                      <img
                        src="src/images/dollar-coin.png"
                        alt="Hamster Coin"
                        className="coin-image w-6 h-6"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Pending Coin Display */}
            <div className="w-8/12 border-2 border-[#f5eded] rounded-xl h-16 mx-auto flex justify-center items-center cursor-pointer">
              <p className="text-xl font-extrabold font-poppins text-[#f5eded]">
                Pending Coin
                <span className="pl-2 text-2xl">
                  {pendingCoin ? pendingCoin.pending_coin : "Loading..."}
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
