import React, { useState, useEffect } from "react";
import "../Styles/Friends.css";
import { ImCross } from "react-icons/im";
import Logo from "../utils/Logo";
import Footer from "./Footer";
import QRCode from "qrcode";
import { fetchReffralData } from "../../store/actions/homeActions";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ToastNotification from "./Toast";
import { FRONTEND_URL } from "../config";
import Loader from "../components/Loader";

function Friend() {
  const dispatch = useDispatch();

  // State management
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Redux data
  const apiData = useSelector((state) => state.apiData.data);
  const referralData = apiData?.reffral?.data || null;
  const referralCode = referralData?.referral_code;

  // Replace with your actual bot username
  const botUsername = "TheUnitadeHub_bot";

  // Derived data
  const signupLink = `${FRONTEND_URL}/?referral_code=${referralCode}`;
  const telegramDeepLink = `https://t.me/${botUsername}?startapp=${referralCode}`;

  // Fetch referral data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchReffralData());
      } catch (error) {
        console.error("Error fetching referral data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  // Generate QR code when referral code is available
  useEffect(() => {
    if (referralCode) {
      generateQRCode(signupLink);
    }
  }, [referralCode]);

  const generateQRCode = async (link) => {
    try {
      const qrCode = await QRCode.toDataURL(link);
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

 const handleShareClick = () => {
  if (referralCode) {
    try {
      // Construct a more engaging message with emojis
      const message = encodeURIComponent(`
🌟 Welcome to *UnitradeHub*! 🚀

🔹 How it works:
1️⃣ Join the community by paying just ₹300 and instantly get 100 coins! 💰  
2️⃣ Complete simple tasks and refer your friends to earn even more coins. ✅👥  
3️⃣ Earn rewards for every task completed and every friend you bring in! 🏆  
4️⃣ Share coins with others to boost your earnings! 🔄  
5️⃣ Sell your earned coins to companies at their designated rates! 💸💼

📲 Use my referral link to get started:  
${telegramDeepLink}

🎯 Don't miss this exciting opportunity to grow your earnings effortlessly! 🎉
      `);

      // Construct the Telegram deep link
      const telegramLink = `https://t.me/share/url?url=${encodeURIComponent(
        telegramDeepLink
      )}&text=${message}`;

      // Open the Telegram link
      const opened = window.open(telegramLink, "_blank");

      if (!opened) {
        console.error("Failed to open Telegram link.");
        toast.error("Failed to open Telegram. Make sure Telegram is installed.");
      } else {
        console.log("Telegram link opened successfully.");
      }
    } catch (error) {
      console.error("Error sharing via Telegram:", error);
      toast.error("There was an error opening the Telegram link.");
    }
  } else {
    toast.error("Referral link is not available yet.");
  }
};


  // Copy referral link to clipboard
  const handleCopyClick = () => {
    if (referralCode) {
      navigator.clipboard.writeText(telegramDeepLink);
      setToastMessage("Referral deep link copied!");
      setShowToast(true);
    } else {
      toast.error("Referral link is not available yet.");
    }
  };

  // Display loader while data is loading
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bg-white flex justify-center min-h-screen">
      <ToastNotification
        message={toastMessage}
        show={showToast}
        setShow={setShowToast}
      />
      <div className="w-full bg-black text-white min-h-screen flex flex-col max-w-lg overflow-y-auto px-4">
        <div className="flex-grow relative z-0 py-6">
          <Logo />
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <img
                src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRBmgzOP_BRigp_fok6RcoiBegiIttLQ8fFVaZ-Hbj3YWdrjJ24"
                alt="User Avatar"
                className="w-22 h-20 md:w-32 md:h-32 rounded-full shadow-lg"
              />
            </div>
            <h2 className="text-center text-3xl font-bold text-white">
              Invite Friends
            </h2>
            <div className="flex justify-center items-center p-2 sm:p-3 rounded-lg mb-4 shadow-sm">
              {qrCodeUrl ? (
                <img
                  className="rounded-lg"
                  src={qrCodeUrl}
                  alt="Signup QR Code"
                />
              ) : (
                <p>Loading QR Code...</p>
              )}
            </div>
            <div onClick={handleShareClick} className="flex justify-center items-center mb-4">
              <button className="w-10/12 py-3 sm:py-4 text-sm sm:text-base font-semibold text-black bg-white rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 hover:shadow-lg">
                Share on Telegram
              </button>
            </div>
            <div onClick={handleCopyClick} className="flex justify-center items-center">
              <button className="w-10/12 py-3 sm:py-4 text-sm sm:text-base font-semibold text-black bg-white rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 hover:shadow-lg">
                Copy Link
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Friend;
