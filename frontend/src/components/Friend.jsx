import React, { useState, useEffect } from "react";
import axios from "axios";
import Invite from "../Img/invite.webp";
import "../Styles/Friends.css";
import { MdGroups } from "react-icons/md";
import Logo from "../utils/Logo";
import Footer from "./Footer";

function Friend() {
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    const fetchReferralLink = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const { token } = userData;
        console.log(token);

        const response = await axios.get(
          "http://localhost:4000/api/v1/api-me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const referralCode = response.data.user.referral_code; // Adjust based on actual response
        console.log(referralCode);

        if (referralCode) {
          setReferralLink(
            `http://localhost:5173/referral?code=${referralCode}`
          );
        } else {
          console.error("Referral code not found");
        }
      } catch (error) {
        console.error("Failed to fetch referral link", error);
      }
    };

    fetchReferralLink();
  }, []);

  const handleShareClick = () => {
    if (referralLink) {
      window.open(
        `tg://msg?text=Join our app using this referral link: ${referralLink}`
      );
    } else {
      alert("Referral link is not available yet.");
    }
  };

  const handleCopyClick = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      alert("Referral link copied!");
    } else {
      alert("Referral link is not available yet.");
    }
  };

  return (
    <div className="bg-white flex justify-center min-h-screen">
    <div className="w-full bg-black text-white min-h-screen flex flex-col max-w-lg overflow-y-auto px-4">
      <div className="flex-grow relative z-0 py-6">
        <Logo />
        <div className="space-y-2 text-center">
          {/* Icon */}
          <div className="flex justify-center">
            <img
              src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRBmgzOP_BRigp_fok6RcoiBegiIttLQ8fFVaZ-Hbj3YWdrjJ24"
              alt=""
              className="w-22 h-20 md:w-32 md:h-32 rounded-full shadow-lg"
            />
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold font-poppins">
            Invite Frens
          </h2>
  
          {/* Placeholder for Invite section */}
          <div className="w-8/12 border-2 border-[#d4cbcb] rounded-3xl h-20 md:h-28 mx-auto mt-4"></div>
  
          {/* Description */}
          <p className="text-sm md:text-base text-[#d4cbcb] mx-4">
            Earn extra points by growing your network. The bigger your community, the higher your rewards.
          </p>
  
          {/* Divider */}
          <hr className="border-gray-300 my-4" />
  
          {/* Invite Button */}
          {/* <div className="flex justify-center px-4 py-2 mt-8">
            <button
              className="flex items-center justify-center bg-[#00ACDC] text-white py-3 px-6 rounded-xl w-3/4 md:w-2/3 shadow-md transition-transform transform hover:scale-105"
              onClick={handleShareClick}
            >
              <span className="text-base md:text-lg font-semibold">Invite a friend</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="ml-2 h-5 w-5 md:h-6 md:w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v7m0 0v7m0-7h7m-7 0H5"
                />
              </svg>
            </button>
          </div> */}
        </div>
      </div>
    </div>
    <Footer />
  </div>
  

  );
}

export default Friend;
