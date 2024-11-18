import React, { useState, useEffect } from "react";
import "../Styles/Tasks.css";
import Logo from "../utils/Logo";
import Footer from "./Footer";
import { BsPersonCircle, BsCoin  } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { fetchMeData, fetchCoinData, transferCoins, fetchReffralData } from "../../store/actions/homeActions";
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
  const handleNavigate = () => {
    navigate('/Profile');
  };
useEffect(() => {
  //   // Fetch user and coin data on component mount
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
          x: (Math.random() - 0.5) * 500,
          y: (Math.random() - 0.5) * 500,
          rotate: Math.random() * 360, 
        }));
        setCoins(newCoins);
        // Remove coins after animation
        setTimeout(() => setCoins([]), 2500);
              // Re-fetch data to update userData and pendingCoin without hard refresh
      dispatch(fetchCoinData());
      dispatch(fetchMeData());
      })
      .catch((error) => {
        // Show error message if transfer fails
        toast.error("Coin transfer failed.");
      });
  };
  // Show loader until loading state is false
  // if (loading) {
  //   return <Loader />;
  // }
  return (
    <div className="bg-white flex justify-center">
    <ToastContainer
      position="top-right"
      autoClose={500}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      draggable
      theme="dark"
    />
    {loading && (
         <Loader />
    )
    }

    <div className="w-full bg-black text-white min-h-screen flex flex-col max-w-lg relative">
      <div className="flex-grow relative z-0">
        <div className="px-4 py-6 space-y-6">
          <Logo />
          <div onClick={handleNavigate} className="flex justify-center space-x-1 cursor-pointer">
            <BsPersonCircle size={28} className="mt-1" />
            <p className="text-2xl font-extrabold capitalize">
              {userData ? userData.user_name : ""}
            </p>
          </div>
  
          {/* User Balance */}
          <div className="flex justify-center space-x-1 text-3xl font-extrabold font-sans">
            <p>U</p>
            <p>{userData ? userData.coins : ""}</p>
          </div>
  
          {/* Coin Button and Image */}
          <div className="coin-animation-container my-6 relative">
            <motion.div
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}

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
                        rotate: [coin.rotate, coin.rotate + 360],
                        scale: [1, 1.3, 1],
                        filter: "grayscale(100%)", // Grayscale for black-and-white effect
                      }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    >
                    {/* <img
                      src="src/images/dollar-coin.png"
                      alt="Hamster Coin"
                      className="coin-image w-6 h-6"
                    /> */}
                    <BsCoin size={2} className="coin-image" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
  
      {/* Pending Coin Display - Updated Style */}
      <div className="absolute bottom-20  w-full px-4">
           {/* Pending Coin Display */}
           <div className="w-10/12 py-3 sm:py-4 text-sm sm:text-base font-semibold text-black bg-white rounded-lg shadow-md  mx-auto flex justify-center items-center cursor-pointer">
              <p className="text-xl font-extrabold font-poppins ">
                Pending Coin
                <span className="pl-2 text-xl  font-extrabold">
                  {pendingCoin ? pendingCoin.pending_coin : ""}
                </span>
              </p>
            </div>
      </div>
    
      {/* Footer */}
      <Footer />
    </div>
  </div>
  
  );
}

export default Home;
