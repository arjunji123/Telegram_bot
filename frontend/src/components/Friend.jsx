import React, { useState, useEffect } from "react";
import "../Styles/Friends.css";
import { ImCross } from "react-icons/im";
import Logo from "../utils/Logo";
import Footer from "./Footer";
import QRCode from "qrcode";
import {  fetchReffralData  } from "../../store/actions/homeActions";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import { FRONTEND_URL } from '../config';
import Loader from '../components/Loader';

function Friend() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const apiData = useSelector((state) => state.apiData.data);
 const refferalData = apiData?.reffral?.data || null;
 const referral_code = refferalData?.referral_code
 const [sendData, setSendData] = useState({
  recipientReferralCode: '',
  amount: ''
});
const { success, error } = useSelector((state) => ({
  success: state.coinData.success,
  error: state.coinData.error,
  loading: state.coinData.loading,
}));

  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  useEffect(() => {
    // Fetch user and coin data on component mount
    const fetchData = async () => {
      try {
        await dispatch(fetchReffralData());
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Set loading to false if there's an error
      }
    };
    fetchData();
  }, [dispatch]);
  const signupLink = `${FRONTEND_URL}/signup?referral_code=${refferalData?.referral_code}`;

  useEffect(() => {
    if (refferalData?.referral_code ) {
      setTimeout(() => {
        generateQRCode(signupLink); // Use the signupLink
      }, 100);
    }
  }, [refferalData?.referral_code]);

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
      // toast("Referral link copied!");
    } else {
      // toast("Referral link is not available yet.");
    }
  };


  // if (loading) {
  //   return <Loader />;
  // }

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
{loading && (
         <Loader />
    )
    }
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
   <h2 className="text-center text-3xl font-bold bg-clip-text text-transparent bg-white">
            Invite Friends
          </h2>

   <div className="flex justify-center items-center  p-2 sm:p-3 rounded-lg mb-4 shadow-sm">
       {/* <canvas width={100} height={100} id="qrcode" ref={qrRef} className="rounded-lg "></canvas> */}
       <img className="rounded-lg" src={qrCodeUrl} alt="Signup QR Code" />
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
</div>
<Footer />

</div>

  );
}

export default Friend;
