import React from 'react';
import { ImCross } from "react-icons/im";

function ShareCoin({ toggleSharePopup, handleSendInputChange, handleSendMoney , sendData, loading }) {
  return (
    <div className="fixed inset-0 flex items-end justify-center bg-transparent bg-opacity-40 backdrop-blur-sm z-50" onClick={toggleSharePopup}>
    <div className="bg-[#1B1A1A] p-4 sm:p-6 rounded-t-3xl shadow-xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
        <button
            onClick={toggleSharePopup}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-200 focus:outline-none transition duration-300"
        >
            <ImCross size={20} />
        </button>

        <h2 className="text-lg sm:text-2xl font-semibold text-center mb-4 text-[#E0E0E0]">
            Share Coin with Your Frens
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-[#B0B0B0] text-center mb-6">
         Invite your friends to join and experience the benefits of our coin system together!
        </p>

            <input
                type="text"
                name="recipientReferralCode"
                value={sendData.recipientReferralCode}
                onChange={handleSendInputChange}
                placeholder="Referral Code"
                className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
            />
            <input
                 type="text"
                    name="amount"
                    value={sendData.amount}
                    onChange={handleSendInputChange}
                placeholder="Enter your amount"
                className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
            />

        <div className="flex justify-center items-center">
            <button onClick={handleSendMoney} className="btn bg-[#3A3A3A] text-white font-semibold hover:bg-[#505050] transition duration-300 ease-in-out w-full py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg"  >
            Submit
            </button>
        </div>
    </div>
</div>
  )
}

export default ShareCoin