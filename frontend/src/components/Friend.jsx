import React, { useState, useEffect } from "react";
import "../Styles/Friends.css";
import { ImCross } from "react-icons/im";
import Logo from "../utils/Logo";
import Footer from "./Footer";
import QRCode from "qrcode";
import {  fetchReffralData  } from "../../store/actions/homeActions";
// import { shareCoins } from "../../store/actions/coinActions";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
// import { FaShare } from "react-icons/fa6";
// import ShareCoin from "../utils/ShareCoin";
import { FRONTEND_URL } from '../config';

function Friend() {
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data);
 const refferalData = apiData?.reffral?.data || null;
 const referral_code = refferalData?.referral_code
 const [sendData, setSendData] = useState({
  recipientReferralCode: '',
  amount: ''
});
const { success, error, loading } = useSelector((state) => ({
  success: state.coinData.success,
  error: state.coinData.error,
  loading: state.coinData.loading,
}));


  const [showPopup, setShowPopup] = useState(false);
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  const [sharePopup, setSharePopup] = useState(false);
  const toggleSharePopup = () => {
    setSharePopup(!sharePopup);
  };
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  useEffect(() => {
    // Fetch user and coin data on component mount
    dispatch(fetchReffralData());
  }, [dispatch]);
  const signupLink = `${FRONTEND_URL}/signup?referral_code=${refferalData?.referral_code}`;

  useEffect(() => {
    if (refferalData?.referral_code && showPopup) {
      setTimeout(() => {
        generateQRCode(signupLink); // Use the signupLink
      }, 100);
    }
  }, [refferalData?.referral_code, showPopup]);

  const generateQRCode = async (link) => {
    try {
      const qrCode = await QRCode.toDataURL(link);
      // console.log('QR Code generated:', qrCode); // Debugging
      setQrCodeUrl(qrCode); // Set the QR code image URL to state
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };


  
  const handleShareClick = () => {
    if (referral_code) {
      // Generate the signup link with the referral code
      const signupLink = `${FRONTEND_URL}/signup?referral_code=${referral_code}`; // Replace with your actual signup page URL
  
      // Create the message to share
      const message = `Join our app using this referral link: ${signupLink}`;
      const encodedMessage = encodeURIComponent(message);
      
      // Create the Telegram link
      const telegramAppLink = `tg://msg?text=${encodedMessage}`;
      // Fallback link for Telegram web
      const telegramWebLink = `https://telegram.me/share/url?url=${encodedMessage}`;
  
      // Attempt to open the app link first
      const opened = window.open(telegramAppLink, '_blank');
  
      // If the app link fails to open (opened is null), try the web link
      if (!opened) {
        window.open(telegramWebLink, '_blank');
      }
    } else {
      toast.error("Referral link is not available yet."); // Use toast.error for better UX
    }
  };
  
  
  const handleCopyClick = () => {
    // const referralCode = refferalData && refferalData.referral_code
    if (signupLink) {
      navigator.clipboard.writeText(signupLink);
      toast("Referral link copied!");
    } else {
      toast("Referral link is not available yet.");
    }
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
          <div onClick={togglePopup} className="w-8/12 border-2 border-[#d4cbcb] rounded-3xl h-20 md:h-28 mx-auto mt-4"></div>
  
          {/* Description */}
          <p className="text-sm md:text-base text-[#d4cbcb] mx-4">
            Earn extra points by growing your network. The bigger your community, the higher your rewards.
          </p>
  
          {/* Divider */}
          <hr className="border-gray-300 my-4" />
  
          {/* Invite Button */}
          {/* <div className="flex items-end justify-center px-4 py-2 mt-8">
            <button
              className="flex items-center justify-center bg-white text-black py-3 px-6 rounded-xl w-10/12 shadow-md transition-transform transform hover:scale-105"
              onClick={toggleSharePopup}
            >
              <span className="text-sm md:text-lg font-semibold uppercase">Share Coin with Frens</span>
              <FaShare className="ml-5" size={18}/>

            </button>
          </div> */}
        </div>
      </div>
    </div>
    <Footer />
    {showPopup && (
        <div className="fixed inset-0 flex items-end justify-center bg-transparent bg-opacity-40 backdrop-blur-sm z-50" onClick={togglePopup}>
          <div className="bg-[#1B1A1A] p-4 sm:p-6 rounded-t-3xl shadow-xl min-w-[420px] max-w-lg relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={togglePopup} className="absolute top-5 right-5 text-gray-400 hover:text-gray-200 focus:outline-none transition duration-300">
              <ImCross size={20} />
            </button>

            <h2 className="text-lg sm:text-2xl font-semibold text-center mb-4 text-[#E0E0E0]">Invite a Fren</h2>


            <div className="flex justify-center items-center  p-2 sm:p-3 rounded-lg mb-4 shadow-sm">
              {/* <canvas width={100} height={100} id="qrcode" ref={qrRef} className="rounded-lg "></canvas> */}
              <img src={qrCodeUrl} alt="Signup QR Code" />
            </div>
            
            {/* <input
              type="text"
              id="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter refferal link for QR code"
              className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
            /> */}


            <div    onClick={handleShareClick} className="flex justify-center items-center mb-2">
              <button className="btn bg-[#3A3A3A] text-white font-semibold hover:bg-[#505050] transition duration-300 ease-in-out w-full py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg">
              Share on Telegram 
              </button>
            </div>

            <div    onClick={handleCopyClick} className="flex justify-center items-center">
              <button className="btn bg-[#3A3A3A] text-white font-semibold hover:bg-[#505050] transition duration-300 ease-in-out w-full py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg">
                Copy
              </button>
            </div>
          </div>
        </div>

      )}
      {/* {
        sharePopup && <ShareCoin
        toggleSharePopup= {toggleSharePopup}
        handleSendInputChange={handleSendInputChange}
        handleSendMoney={handleSendMoney}
        sendData={sendData}
        setSendData={setSendData}
        />
      } */}
  </div>
  

  );
}

export default Friend;
