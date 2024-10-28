import React, { useState, useEffect } from "react";
import axios from "axios";
import Invite from "../Img/invite.webp";
import "../Styles/Friends.css";
import { MdGroups } from "react-icons/md";
import Logo from "../utils/Logo";

function Friend() {
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    const fetchReferralLink = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const { token_local } = userData;
        console.log(token_local);

        const response = await axios.get(
          "http://localhost:4000/api/v1/api-me",
          {
            headers: {
              Authorization: `Bearer ${token_local}`,
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
      <div className="w-full bg-black text-white min-h-screen flex flex-col max-w-xl overflow-y-auto">
        <div className="flex-grow relative z-0">
          <div className="px-4 py-6 z-10">
            <Logo />
            <div className="space-y-1">
              {/* Icon */}
              <div className="flex justify-center" role="img" aria-label="friends">
                <img src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRBmgzOP_BRigp_fok6RcoiBegiIttLQ8fFVaZ-Hbj3YWdrjJ24" alt="" className="w-32 h-30" />
              </div>
              <h2 className="text-center text-3xl md:text-5xl font-extrabold font-poppins">
                Invite Frens
              </h2>
             
              {/* Placeholder for Invite section */}
              <div className="w-2/3 border-2 border-[#d4cbcb] rounded-3xl h-28 md:h-36  mx-auto"></div>

              {/* Description */}
              <p className="text-center text-sm text-[#d4cbcb] ">
                Earn extra points by growing your network. The bigger your community, the higher your rewards.
              </p>

              {/* Divider */}
              <hr className="border-gray-300 my-4" />

              {/* Invite Button */}
              {/* <div className="flex justify-center px-4 py-2 mt-8">
                <button
                  className="flex items-center justify-center bg-[#00ACDC] text-white py-4 px-4 rounded-xl w-full md:w-2/3"
                  onClick={handleShareClick}
                  style={{ fontSize: "16px" }}
                >
                  <span>Invite a friend</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="ml-2 h-6 w-6"
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
      </div>
    </div>


  );
}

export default Friend;
