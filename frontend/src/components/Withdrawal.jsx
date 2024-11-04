import React, { useEffect, useRef, useState } from "react";
import Logo from "../utils/Logo";
import QRCode from "qrcode";
import { BiSolidDownvote, BiSolidUpvote, BiHistory } from "react-icons/bi";
import { BsStars, BsPersonFillCheck, BsCurrencyRupee } from "react-icons/bs";
import { AiFillCaretDown } from "react-icons/ai";
import { RiVerifiedBadgeLine } from "react-icons/ri";
import { ImCross } from "react-icons/im";
import Receive from "../utils/Receive";
import Footer from "./Footer";
import Send from "../utils/Send";
import History from "../utils/History";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAPIData, fetchMeData } from '../../store/actions/homeActions';
import { receiveMoney, sendMoney, sellMoney } from '../../store/actions/withdrawalActions';
import { shareCoins } from "../../store/actions/coinActions";
import ShareCoin from "../utils/ShareCoin";
import { toast, ToastContainer } from "react-toastify"; 

function Withdrawal() {
  const [showPopup, setShowPopup] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [showReceivePopup, setShowReceivePopup] = useState(false);
  const [showSendPopup, setShowSendPopup] = useState(false);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const [sharePopup, setSharePopup] = useState(false);
  const toggleSharePopup = () => {
    setSharePopup(!sharePopup);
  };
  const [sendData, setSendData] = useState({
    recipientReferralCode: '',
    amount: ''
  });
  const { success} = useSelector((state) => ({
    success: state.coinData.success,

  }));
  const [receiveData, setReceiveData] = useState({
    toAddress: '',
    fromAddress: '',
    amount: '',
});
const [sellData, setSellData] = useState({
  user_id: "",
  company_id: "",
  address: "",
  amount: "",
  coin_rate: "",
});
  const dispatch = useDispatch();
  const { loading, data, error } = useSelector((state) => state.moneyData);
  const apiCompanies = useSelector((state) => state.apiData.data.apicompanies);
  const apiData = useSelector((state) => state.apiData.data);
  const userData = apiData && apiData.me && apiData.me.data  || null;
// console.log('apiCompanies', apiCompanies)
  useEffect(() => {
    dispatch(fetchAPIData('apiCompanies'));
    dispatch(fetchMeData());
  }, [dispatch]);

  const handleIconClick = (index) => {
    setActiveIndex(index);
    // Close all pop-ups when clicking a different icon
    if (index === 0) {
      setShowReceivePopup(true);
      setShowSendPopup(false);
      setShowHistoryPopup(false);
      setShowPointsPopup(false);
    } else if (index === 1) {
      setShowReceivePopup(false);
      setShowSendPopup(true);
      setShowHistoryPopup(false);
      setShowPointsPopup(false);
    } else if (index === 2) {
      setShowReceivePopup(false);
      setShowSendPopup(false);
      setShowHistoryPopup(true);
      setShowPointsPopup(false);
    } else if (index === 3) {
      setShowReceivePopup(false);
      setShowSendPopup(false);
      setShowHistoryPopup(false);
      setShowPointsPopup(true);
    }
  };

  const closePopups = () => {
    setShowReceivePopup(false);
    setShowSendPopup(false);
    setShowHistoryPopup(false);
    setShowPointsPopup(false);
  };
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
  const handleReceiveMoney = () => {
    const id = 1; // Replace with the actual id logic as needed
    const { toAddress, fromAddress, amount } = receiveData;
    dispatch(receiveMoney(id, toAddress, fromAddress, amount));
    closePopups(); // Close popup after dispatching the action
};
const handleReceiveInputChange = (e) => {
  const { name, value } = e.target;
  setReceiveData((prevState) => ({
      ...prevState,
      [name]: value,
  }));
};

const handleSendInputChange = (e) => {
  const { name, value } = e.target;
  setSendData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};
const handleSendMoney = () => {
  if (!sendData.amount || !sendData.recipientReferralCode) {
    toast.warn("Please fill in all fields.");
    return;
  }
  dispatch(shareCoins(sendData));
};

useEffect(() => {
  // console.log('Success:', success);
  // console.log('Error:', error);
  
  if (success) {
    setSharePopup(false); // Close the popup on success

    // Reset the form state if needed
    setSendData({
      amount: '',
      recipientReferralCode: '',
    });
  } else if (error) {
  }
}, [success, error]);
const handleSellChange = (e) => {
  const { name, value } = e.target;
  setSellData((prev) => ({ ...prev, [name]: value }));
};

const handleSellSubmit = (e) => {
  e.preventDefault();

  const user_id = "your_user_id"; // Replace with actual user_id
  const company_id = "your_company_id"; // Replace with actual company_id
  
  dispatch(sellMoney(user_id, company_id, sellData));
};

  return (
    <div className="bg-white flex justify-center min-h-screen">
            <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
      <div className="w-full bg-black text-white flex flex-col max-w-lg px-4 ">
        <div className="flex-grow relative z-0 pt-6  pb-16">
          <Logo />
          <div className="flex justify-center font-poppins leading-3 space-x-1 text-[34px] font-extrabold mt-3 mb-4">
            <p>U</p>
            <p className="">{userData ? userData.coins : "700,0000"}</p>
          </div>

          {/* <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { icon: <BiSolidDownvote size={22} />, label: "Receive" },
              { icon: <BiSolidUpvote size={22} />, label: "Send" },
              { icon: <BiHistory size={22} />, label: "History" },
              { icon: <BsStars size={22} />, label: "Points" },
            ].map((item, index) => (
              <div
                key={index}
                onClick={() => handleIconClick(index)}
                className={`text-white mx-auto cursor-pointer flex flex-col items-center transition duration-300 ease-in-out ${activeIndex === index ? "opacity-100" : "opacity-50"
                  }`}
              >
                <div className="rounded-full w-8 h-8 bg-[#303030] flex justify-center items-center">
                  {item.icon}
                </div>
                <span className="text-xs text-center">{item.label}</span>
              </div>
            ))}
          </div> */}
           <div className="grid grid-cols-2 gap-2 mb-4">
      {/* Send Button */}
      <div
        onClick={() => toggleSharePopup()}
        className={`text-white mx-auto cursor-pointer flex flex-col items-center transition duration-300 ease-in-out ${activeIndex === 0 ? "opacity-100" : "opacity-50"}`}
      >
        <div className="rounded-full w-8 h-8 bg-[#303030] flex justify-center items-center">
          <BiSolidUpvote size={22} />
        </div>
        <span className="text-xs text-center">Send</span>
      </div>

      {/* History Button */}
      <div
        onClick={() => handleIconClick(2)}
        className={`text-white mx-auto cursor-pointer flex flex-col items-center transition duration-300 ease-in-out ${activeIndex === 1 ? "opacity-100" : "opacity-50"}`}
      >
        <div className="rounded-full w-8 h-8 bg-[#303030] flex justify-center items-center">
          <BiHistory size={22} />
        </div>
        <span className="text-xs text-center">History</span>
      </div>
    </div>

          <div  onClick={togglePopup} className="w-8/12 border-2 border-[#f5eded] rounded-3xl h-20 mx-auto flex justify-center items-center mb-4 cursor-pointer">
            <span className="text-xl font-extrabold font-poppins text-[#f5eded]">WITHDRAW</span>
          </div>

          <p className="text-center text-xs text-[#f5eded] mb-4">
            Sell your points at your chosen price, anytime and anywhere. Get instant cash withdrawals with no delays!
          </p>

          <hr className="border-gray-300 mb-4 w-full mx-auto" />

          {/* Co-Companies List */}
          <div className="flex flex-col space-y-2 ">
            {apiCompanies && apiCompanies.data && apiCompanies.data.length > 0 ? (
                 apiCompanies.data && apiCompanies.data.map((company, index) => (
                  <div key={index} className="rounded-lg p-2 w-full  relative flex justify-between items-center bg-[#1b1a1a] transition duration-200 ease-in-out shadow-md">
                    <div className="flex ">
                      <BsPersonFillCheck size={18} />
                      <div className="ml-1"> 
                        <span className="text-[12px] font-semibold uppercase">{company.company_name}</span> {/* Adjusted name size */}
                        <p className="font-bold flex items-center text-[17px] "> 
                          <BsCurrencyRupee className="" />
                          <span>{company.coin_rate}</span>
                        </p>
                        <h3 className="text-[10px] uppercase text-[#d3cece] ">limit 20k-80k uni coin</h3>
                      </div>
                      <RiVerifiedBadgeLine size={16} className="text-green-500 " /> {/* Reduced icon size */}
                    </div>
    
                    <button
                      className="leading-none px-2 py-1 text-xs rounded-md bg-red-600 flex text-white font-semibold hover:bg-red-500 transition duration-200 ease-in-out"
                      onClick={togglePopup}
                    >
                      <AiFillCaretDown size={16} /> {/* Reduced icon size */}
                      <span className="ml-1">Sell</span>
                    </button>
                  </div>
            )
         
            )): ""}
          </div>




        </div>


      </div>
      <Footer />
      {/* Popup Modal */}
      {showPopup && (
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
              type="text"
              name="amount"
              onChange={handleSellChange}
              placeholder="Enter Amount"
              className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
            />
            <input
              type="text"
              name="coin_rate"
              onChange={handleSellChange}
              placeholder="Coin Rate"
              className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
            />

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

      )}
      {
        showReceivePopup && <Receive closePopups={closePopups} handleReceiveMoney={handleReceiveMoney} handleReceiveInputChange={handleReceiveInputChange} 
          receiveData={receiveData} />
      }
      {
        showSendPopup && <Send closePopups={closePopups} handleSendInputChange={handleSendInputChange} handleSendMoney={handleSendMoney}
          sendData={sendData} />
      }
       {
        sharePopup && <ShareCoin
        toggleSharePopup= {toggleSharePopup}
        handleSendInputChange={handleSendInputChange}
        handleSendMoney={handleSendMoney}
        sendData={sendData}
        setSendData={setSendData}
        />
      }
      {
        showHistoryPopup && <History closePopups={closePopups}  />
      }
    </div>



  );
}

export default Withdrawal;
