import React, { useState, useEffect } from "react";
import axios from "axios";
import Invite from "../Img/invite.webp";
import "../Styles/Friends.css";

function Friend(){
  const [showPopup, setShowPopup] = useState(false);
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

  const handleInviteClick = () => {
    setShowPopup(true);
  };

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

  const closePopup = () => {
    setShowPopup(false);
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
                  <button className="invite-button" onClick={handleInviteClick}>
                    Invite Friends
                  </button>

                  {showPopup && (
                    <div className="popup">
                      <div className="popup-content">
                        <button
                          className="share-button"
                          onClick={handleShareClick}
                        >
                          Share
                        </button>
                        <button
                          className="copy-button"
                          onClick={handleCopyClick}
                        >
                          Copy Link
                        </button>
                        <button className="close-popup" onClick={closePopup}>
                          Close
                        </button>
                      </div>
                    </div>
                  )}
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
