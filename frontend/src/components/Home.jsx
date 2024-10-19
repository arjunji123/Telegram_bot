import React, { useState, useEffect } from "react";
import "../Styles/Tasks.css";
import { BsPersonCircle } from "react-icons/bs";
import Logo from "../utils/Logo";
import Footer from "./Footer";
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeData, fetchCoinData } from '../../store/actions/homeActions';



function Home() {
  const [firstName, setFirstName] = useState("");
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data);
  const userData = apiData && apiData.me && apiData.me.data  || null;
  const pendingCoin = apiData && apiData.coin && apiData.coin.data  || null;

  useEffect(() => {
  dispatch(fetchCoinData());
    dispatch(fetchMeData());
  }, [dispatch]);

  useEffect(() => {
    // Initialize Telegram WebApp if available
    const tg = window.Telegram?.WebApp;
    if (tg) {
      const firstName = tg.initDataUnsafe?.user?.first_name;
      setFirstName(firstName);
    }
  }, []);
 


  return (
    <div className="bg-white flex justify-center">
      <div className="w-full bg-black text-white min-h-screen flex flex-col max-w-lg">
        <div className="flex-grow relative z-0">
          <div className="px-4 py-6 space-y-6">
            {/* Logo */}
            <Logo />



            {/* User Information */}
            <div className="flex justify-center space-x-1">
              <BsPersonCircle size={24} className="mt-1" />
              <p className="text-2xl font-extrabold capitalize">
              {userData ? userData.user_name : 'Neeraj Singh'}
              </p>
            </div>

            {/* User Balance */}
            <div className="flex justify-center space-x-1 text-4xl font-extrabold font-sans">
              <p>U</p>
              <p>
              {userData ? userData.coins : '700,0000'}
              </p>
            </div>

            {/* Profile Picture */}
            <div className="px-4 my-6 cursor-pointer flex justify-center">
              <img
                src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSPzFN--8Y1W-1Yg9anA4ZXy-W18bIfJ-4RNZ8QWi6wPeGJUUoE"
                alt="Main Character"
                className="rounded-full w-56 h-56 object-cover"
              />
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
