import React, { useState, useEffect } from "react";
import axios from "axios";
import Invite from "../Img/invite.webp";
import "../Styles/Friends.css";

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
    <div className="bg-black flex justify-center">
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
            <div className="px-4 z-10">
              <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
                <div className="px-4 py-2 items-center space-x-2">
                  <h1
                    className="px-4 py-2 items-center space-x-2"
                    style={{ fontSize: 40, textAlign: "center" }}
                  >
                    Invite friends!
                  </h1>
                </div>
                <div className="px-4 py-2 items-center space-x-2">
                  <p style={{ textAlign: "center" }}>
                    You and your friend will receive bonuses
                  </p>
                </div>
                <hr />
                <div className="invite-container">
                  <div className="invite-header">
                    <h1>App Name</h1>
                    <div role="img" aria-label="friends">
                      <img src={Invite} alt="" style={{ width: 227 }} />
                    </div>
                    <h2>Invite friends. Earn Money</h2>
                  </div>
                  <div className="invite-steps">
                    <p>Share your invitation link</p>
                    <p>Your friends join the app</p>
                    <p>And start earning points</p>
                    <p>Earn 10% from buddies' earnings</p>
                    <p>Plus an extra 2.5% from their referrals</p>
                  </div>
                  {/* Updated buttons for styling */}
                  <div className="flex justify-between items-center px-4 py-2 mt-8">
                    <button
                      className="flex items-center justify-center bg-[#4a5df0] text-white py-2 px-4 rounded-full"
                      onClick={handleShareClick}
                      style={{ width: "80%", fontSize: "16px" }}
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
                    <button
                      className="flex items-center justify-center bg-[#4a5df0] text-white p-2 rounded-full ml-2"
                      onClick={handleCopyClick}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 9h12M8 13h12m-7 4h7M5 9h.01M5 13h.01M5 17h.01"
                        />
                      </svg>
                    </button>
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

export default Friend;
