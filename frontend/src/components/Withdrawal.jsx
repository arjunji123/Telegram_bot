import React, { useEffect, useRef, useState } from "react";
import "../Styles/Tasks.css";
import rupees from "../Img/rupees.png";
import QRCode from "qrcode";


function Withdrawal() {
  const [showPopup, setShowPopup] = useState(false);
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  const [inputValue, setInputValue] = useState("");
  const qrRef = useRef(null);

  useEffect(() => {
    if (qrRef.current) {
      generateQRCode(inputValue);
    }
  }, [inputValue]);

  const generateQRCode = (text) => {
    QRCode.toCanvas(qrRef.current, text, (error) => {
      if (error) {
        console.error(error);
      }
    });
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value.trim());
  };
  return (
    <div className="bg-black flex justify-center">
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
            <div className="px-4 z-10">
              <div className=" top-[20px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
                <div className="px-4 py-2 items-center space-x-2">
                  <img src={rupees} alt="" className="mx-auto w-40 h-40" />
                </div>
                <div className="px-4 py-2 items-center space-x-2">
                  <h1
                    className="px-4 py-2 items-center space-x-2"
                    style={{
                      fontSize: 37,
                      textAlign: "center",
                      textShadow: "5px 6px 5px black",
                    }}
                  >
                    Withdrawal coins
                  </h1>
                </div>
              </div>
              <div className="px-4 py-2 items-center space-x-2">
                <p style={{ textAlign: "left" }}>Co-companies List</p>
              </div>
              <div className="tasks">
                <div className="px-4 mt-6 flex justify-between gap-2">
                  <div className="daily rounded-lg px-4 py-2 h-20 w-full relative flex justify-between items-center">
                    <span className="text-white">Jems Henary</span>
                    <span className="text-white">0.80rs/coin</span>
                    <button className="btn bg-blue-500 text-white font-semibold hover:bg-green-500" onClick={togglePopup} >
                      Withdrawal
                    </button>
                  </div>
                </div>
              </div>
              <div className="tasks">
                <div className="px-4 mt-6 flex justify-between gap-2">
                  <div className="daily rounded-lg px-4 py-2 h-20 w-full relative flex justify-between items-center">
                    <span className="text-white">Kevin potter</span>
                    <span className="text-white">0.90rs/coin</span>
                    <button className="btn bg-blue-500 text-white font-semibold hover:bg-green-500" onClick={togglePopup}>
                      Withdrawal
                    </button>
                  </div>
                </div>
              </div>
              <div className="tasks">
                <div className="px-4 mt-6 flex justify-between gap-2">
                  <div className="daily rounded-lg px-4 py-2 h-20 w-full relative flex justify-between items-center">
                    <span className="text-white">Harry gill</span>
                    <span className="text-white">0.89rs/coin</span>
                    <button className="btn bg-blue-500 text-white font-semibold hover:bg-green-500" onClick={togglePopup}>
                      Withdrawal
                    </button>
                  </div>
                </div>
              </div>
              <div className="tasks">
                <div className="px-4 mt-6 flex justify-between gap-2">
                  <div className="daily rounded-lg px-4 py-2 h-20 w-full relative flex justify-between items-center">
                    <span className="text-white">Davis rosh</span>
                    <span className="text-white">1.5rs/coin</span>
                    <button className="btn bg-blue-500 text-white font-semibold hover:bg-green-500" onClick={togglePopup}>
                      Withdrawal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showPopup && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
            onClick={togglePopup}
          >
            <div
              className="bg-gray-800 p-8 rounded-lg shadow-lg w-11/12 max-w-md relative"
              onClick={(e) => e.stopPropagation()}  // Prevents closing the popup when clicking inside
            >
              <button
                onClick={togglePopup}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 focus:outline-none"
              >
                &#x2715;
              </button>
              <h2 className="text-xl font-semibold text-center mb-4 text-white">Withdrawal Money</h2>
              <input
                type="text"
                id="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter UPI ID for QR code"
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-center items-center bg-gray-700 p-4 rounded-lg">
                <canvas id="qrcode" ref={qrRef}></canvas>
              </div>
              <div className="flex justify-center items-center py-3">
              <button className="btn bg-slate-600 text-white font-semibold hover:border-gray-100 " >
                      Submit
                    </button>
              </div>
          
            </div>
          </div>
        )}


      </div>
    </div>
  );
}

export default Withdrawal;
