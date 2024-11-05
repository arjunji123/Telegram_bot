import React, {useState, useEffect  } from 'react';
import { ImCross } from "react-icons/im";

function Send({ togglePopup, handleSellChange, handleSellSubmit , coinRate}) {
    const [coinAmount, setCoinAmount] = useState(0);
    const [rupeeValue, setRupeeValue] = useState(0);
  console.log(coinRate);
  
    useEffect(() => {
        const rupeesPerCoin = 0.85; // 1 coin = 0.85 rupees
        const totalRupees = coinAmount * rupeesPerCoin;
        setRupeeValue(totalRupees.toFixed(2)); // Set rupee value with 2 decimal points
      }, [coinAmount]); // Run the effect whenever coinAmount changes

  return (
    <div className="fixed inset-0 flex items-end justify-center bg-transparent bg-opacity-40 backdrop-blur-sm z-50" onClick={togglePopup}>
    <div className="bg-[#1B1A1A] p-4 sm:p-6 rounded-t-3xl shadow-xl max-w-lg relative" onClick={(e) => e.stopPropagation()}>
      <button onClick={togglePopup} className="absolute top-5 right-5 text-gray-400 hover:text-gray-200 focus:outline-none transition duration-300">
        <ImCross size={20} />
      </button>

      <h2 className="text-lg sm:text-2xl font-semibold text-center mb-4 text-[#E0E0E0]">Sell Coin</h2>

      {/* Description */}
      <p className="text-sm sm:text-base text-[#B0B0B0] text-center mb-6">
        Please enter the amount and your UPI ID to generate the QR code for Sell your coin.
      </p>

      <input
         type="number"
         value={coinAmount}
         onChange={(e) => setCoinAmount(e.target.value)}
         placeholder="Enter coin amount"
        className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
      />
      
      {/* <p className="text-sm sm:text-base text-[#B0B0B0] text-center mb-6">Rupee Value: ₹{rupeeValue}</p> */}
      
<div className='flex justify-between items-center w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3  transition duration-300 text-sm sm:text-base'>
    <div>Coin Rate: ₹{coinRate}</div>
   <div>= ₹<span className='' > {rupeeValue}</span></div> 
</div>
      <input
        type="text"
        name="address"
        // value={address}
        onChange={handleSellChange}
        placeholder="Enter UPI ID for QR code"
        className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
      />

      {/* <div className="flex justify-center items-center bg-[#2C2C2C] p-2 sm:p-3 rounded-lg mb-4 shadow-sm">
        <canvas id="qrcode" ref={qrRef} className="rounded-lg"></canvas>
      </div> */}

      <div className="flex justify-center items-center">
        <button  onClick={handleSellSubmit} className="btn bg-[#3A3A3A] text-white font-semibold hover:bg-[#505050] transition duration-300 ease-in-out w-full py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg">
          Submit
        </button>
      </div>
    </div>
  </div>

  )
}

export default Send