import React, { useEffect, useRef, useState } from "react";
import "../Styles/Tasks.css";
import Logo from "../utils/Logo";
import QRCode from "qrcode";
import { BiSolidDownvote , BiSolidUpvote , BiHistory } from "react-icons/bi";
import { BsStars, BsPersonFillCheck, BsCurrencyRupee  } from "react-icons/bs";
import { AiFillCaretDown } from "react-icons/ai";
import { RiVerifiedBadgeLine } from "react-icons/ri";


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
    <div className="bg-white flex justify-center  overflow-y-auto">
      <div className="w-full bg-black text-white  flex flex-col max-w-xl ">
        <div className="flex-grow  relative z-0 ">
          <div className="px-4  space-y-4 z-10">
            <Logo />
            <div className="flex pb-8 justify-center font-poppins leading-3 space-x-1 text-5xl font-extrabold">
              <p>U</p>
              <p className="">700,00000</p>
            </div>
            <div className="grid grid-cols-4   ">
              <div className="text-white  mx-auto cursor-pointer">
                <div className="rounded-full w-10 h-10 bg-[#303030] flex justify-center items-center">
                <BiSolidDownvote  size={26} />
                </div>
                <span className="text-xs text-center ">Receive</span>
              </div>
              <div className="text-white mx-auto cursor-pointer">
              <div className="rounded-full w-10 h-10 bg-[#303030] flex justify-center items-center">
                <BiSolidUpvote size={26} />
                    </div>
                <span className="text-xs text-center">Send</span>
              </div>
              <div className="text-white  mx-auto cursor-pointer">
              <div className="rounded-full w-10 h-10 bg-[#303030] flex justify-center items-center">
                <BiHistory size={30}  /> </div>
                <span className="text-xs text-center ">History</span> 
              </div>
              <div className="text-white  mx-auto cursor-pointer">
              <div className="rounded-full w-10 h-10 bg-[#303030] flex justify-center items-center">
                <BsStars size={22}  /></div>
                <span className="text-xs text-center ">Points</span>  
              </div>
            </div>
            <div className="w-2/3 border-1 border-[#f5eded] rounded-3xl h-28 md:h-36 mx-auto flex justify-center items-center">
              <span className="text-3xl font-extrabold font-poppins text-[#f5eded]">WITHDRAW</span>
            </div>

            <p className="text-center text-sm text-[#f5eded] ">
              Sell your points at your chosen price, anytime and anywhere. Get instant cash withdrawals with no delays!
            </p>

            {/* Divider */}
            <hr className="border-gray-300 mb-4 w-11/12 mx-auto" />

            {/* Co-Companies List */}
            <div className="pb-16 flex flex-col space-y-4">
              {[
                { name: 'Jems Henary', rate: '85.1' },
                { name: 'Kevin Potter', rate: '94.5' },
                { name: 'Harry Gill', rate: '99.45' },
                { name: 'Rosh Richard', rate: '90.4' },

              ].map((company, index) => (
                <div key={index} className=" rounded-lg  p-3 h-20 w-full relative flex justify-between items-center  transition duration-200 ease-in-out">
                  <div className="flex">
                    <BsPersonFillCheck size={28}/>
                    <div class=" ml-1 space-y-1 ">
                    <span className=" text-sm uppercase">{company.name}</span> 
                    <p class=" font-bold leading-none font-sans flex text-lg"><BsCurrencyRupee />
                   <span>{company.rate}</span> </p>
                    <h3 class="text-xs uppercase text-[#d3cece]">limit 20k-80k uni coin</h3>
                  </div>
                  <RiVerifiedBadgeLine size={24} className="text-green-500"/>
                  </div>
                  

                  {/* <span className="text-white">{company.rate}</span> */}
                  <button
                    className="leading-none px-1 text-sm text-center rounded-md bg-red-600 flex text-white font-semibold hover:bg-red-500 transition duration-200 ease-in-out"
                    onClick={togglePopup} > 
                    <span>  <AiFillCaretDown size={24} /> </span>
                   <span className="m-1"> Sell</span> 
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50" onClick={togglePopup}>
            <div
              className="bg-gray-800 p-8 rounded-lg shadow-lg w-11/12 max-w-md relative"
              onClick={(e) => e.stopPropagation()} // Prevents closing the popup when clicking inside
            >
              <button
                onClick={togglePopup}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 focus:outline-none"
              >
                &#x2715;
              </button>
              <h2 className="text-xl font-semibold mx-auto mb-4 text-white">Withdrawal Money</h2>
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
                <button className="btn bg-slate-600 text-white font-semibold hover:border-gray-100 transition duration-200 ease-in-out">
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
