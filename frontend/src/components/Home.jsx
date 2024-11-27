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
  const handleNavigate = () => {
    navigate('/Profile');
  };
  const [isGifPlaying, setIsGifPlaying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchCoinData());
        await dispatch(fetchMeData());
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleClick = () => {
    if (pendingCoin?.pending_coin === 0) {
      toast.warn("You have no coins.");
      return;
    }

    setIsGifPlaying(true);
    setTimeout(() => setIsGifPlaying(false), 2000);

    dispatch(transferCoins())
      .then(() => {
        const newCoins = Array.from({ length: 10 }, (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 400 - 200,
          y: Math.random() * 400 - 200,
          rotate: Math.random() * 720,
        }));
        setCoins(newCoins);
        setTimeout(() => setCoins([]), 1000);
        dispatch(fetchCoinData());
        dispatch(fetchMeData());
      })
      .catch((error) => {
        toast.error("Coin transfer failed.");
      });
  };

  return (
    <div className="bg-white flex justify-center font-Inter h-screen w-full overflow-hidden relative">
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
        <div className="w-full bg-black text-white min-h-screen flex flex-col max-w-lg relative ">
          <div className="flex-grow relative z-0">
            <div className="px-4 py-6 space-y-6 ">
              <div onClick={handleNavigate} className="flex justify-center space-x-1 cursor-pointer">
                <BsPersonCircle size={28} className="mt-1" />
                <p className="text-2xl font-extrabold capitalize font-Inter">
                  {userData ? userData.user_name : ""}
                </p>
              </div>

              <div className="flex justify-center space-x-1 text-3xl font-extrabold font-Inter">
                <p>U</p>
                <p>{userData ? userData.coins : ""}</p>
              </div>

              <div className="coin-animation-container my-6 relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="coin-btn"
                  onClick={handleClick}
                >
                  <img
                    src={
                      isGifPlaying
                        ? "src/assets/icon/GIF/Untitled design.gif" // Replace with your hamster combat GIF URL
                        : "src/assets/icon/GIF/Untitled design.gif" // Replace with your static hamster image URL
                    }
                    alt="Hamster Character"
                    className="character-img"
                  />
                </motion.div>

                <div className="coins-container flex justify-center items-center">
                  <AnimatePresence>
                    {coins.map((coin) => (
                      <motion.div
                        key={coin.id}
                        className="coin"
                        initial={{ opacity: 0 , scale: 0.5, x: 0, y: 0 }}
                        animate={{
                          opacity: 1,
                          x: coin.x,
                          y: coin.y,
                          rotate: [coin.rotate, coin.rotate + 720],
                          scale: [1, 1.5, 1],
                          filter: "grayscale(100%)",
                        }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                      >
                        <BsCoin size={2} className="coin-image" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-20 w-full px-4">
            <div className="w-full py-3 sm:py-4 text-sm sm:text-base font-semibold text-black bg-white rounded-lg shadow-md mx-auto flex justify-center items-center cursor-pointer">
              <p className="text-xl font-extrabold font-Inter ">
                Claim Coin
                <span className="pl-2 text-xl font-extrabold">
                  {pendingCoin ? pendingCoin.pending_coin : ""}
                </span>
              </p>
            </div>
          </div>

          <Footer />
        </div>
      )}
    </div>
  );
}

export default Home;