import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Tasks.css";
// import { dollarCoin, mainCharacter } from '../images'; // Ensure correct image paths
import { BsPersonCircle } from "react-icons/bs";
import Logo from "../utils/Logo";
import Footer from "./Footer";

function Home() {
 const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    // Initialize Telegram WebApp if available
    const tg = window.Telegram?.WebApp;
    if (tg) {
      const firstName = tg.initDataUnsafe?.user?.first_name;
      setFirstName(firstName);
    }
  }, []);





  return (
    <div className="bg-white flex justify-center min-h-screen">
      <div className="w-full bg-black text-white min-h-screen flex flex-col max-w-xl ">
        <div className="flex-grow  relative  z-0">
          <div className="  left-0 right-0 bottom-0">
            <div className="px-4 py-6 space-y-6">
              <Logo/>
                <div className="flex justify-center space-x-1">
                  <BsPersonCircle size={28} className="mt-1" />
                  <p className="text-3xl font-extrabold">NeerajSingh</p>
                </div>
                <div className="flex justify-center space-x-1 text-5xl font-extrabold font-sense">
                  <p>U</p>
                  <p >700,0000</p>
                </div>
              {/* <div className="px-10 pt-5 mx-auto">
                <div class="w-full h-10 border-2 border-white  rounded-full ">
                  <div class="h-9 w-2/5 bg-white rounded-full dark:bg-blue-500" ></div>
                </div>
                <span className="flex justify-end text-xl">+2200</span>
              </div> */}
              <div className="px-4 my-6  pb-14 cursor-pointer">
                  <div className="w-full h-full flex justify-center relative">
                    <img src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSPzFN--8Y1W-1Yg9anA4ZXy-W18bIfJ-4RNZ8QWi6wPeGJUUoE" alt="Main Character" className=" rounded-full w-80 h-80 object-cover" />
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
