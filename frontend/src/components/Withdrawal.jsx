import React, { useEffect, useRef, useState } from "react";
import Logo from "../utils/Logo";
import QRCode from "qrcode";
import {  BiSolidUpvote, BiHistory } from "react-icons/bi";
import { BsPersonFillCheck, BsCurrencyRupee } from "react-icons/bs";
import { AiFillCaretDown } from "react-icons/ai";
import { RiVerifiedBadgeLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import WithdrawCoin from "../utils/WithdrawCoin";
import Footer from "./Footer";
import Sell from "../utils/Sell";
import History from "../utils/History";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAPIData, fetchMeData } from '../../store/actions/homeActions';
import { shareCoins } from "../../store/actions/coinActions";
import ShareCoin from "../utils/ShareCoin";
import { toast, ToastContainer } from "react-toastify"; 
import Loader from '../components/Loader';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

function Withdrawal() {
  const MySwal = withReactContent(Swal);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [showReceivePopup, setShowReceivePopup] = useState(false);
  const [showSendPopup, setShowSendPopup] = useState(false);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [showWithdrawal, setShowWithdrawalPopup] = useState(false);
  const [sharePopup, setSharePopup] = useState(false);
  const [selectedCoinRate, setSelectedCoinRate] = useState(null); 
  const [company_id, setCompany_id] = useState(null); 
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
  const {  data, error } = useSelector((state) => state.moneyData);
  const apiCompanies = useSelector((state) => state.apiData.data.apicompanies);
  const apiData = useSelector((state) => state.apiData.data);
  const userData = apiData && apiData.me && apiData.me.data  || null;
// console.log('apiCompanies', apiCompanies)
 useEffect(() => {
   const fetchData = async () => {
     try {
       await dispatch(fetchAPIData('apiCompanies'));
       await dispatch(fetchMeData());
       setLoading(false); 
     } catch (error) {
       setLoading(false);   
       console.error("Error fetching data", error);
     }
   };
   fetchData();
 }, [dispatch]);

  const handleIconClick = (index) => {
    setActiveIndex(index);
    // Close all pop-ups when clicking a different icon
    if (index === 0) {
      setShowReceivePopup(true);
      setShowSendPopup(false);
      setShowHistoryPopup(false);
    } else if (index === 1) {
      setShowReceivePopup(false);
      setShowSendPopup(true);
      setShowHistoryPopup(false);
    } else if (index === 2) {
      setShowReceivePopup(false);
      setShowSendPopup(false);
      // setShowHistoryPopup(true);
      navigate('/history')
    } 
  };

  const closePopups = () => {
    setShowReceivePopup(false);
    setShowSendPopup(false);
    setShowHistoryPopup(false);
  };
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  const handleSellClick = (coinRate, company_id) => {
    setSelectedCoinRate(coinRate); // Set the selected coin rate
    setCompany_id(company_id); // Set the selected coin rate
    togglePopup(); // Open the popup
  };
  const toggleWithdrawalPopup = () => {
    setShowWithdrawalPopup(!showWithdrawal);
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

  // SweetAlert function for attractive alert
  const showAlert = () => {
    MySwal.fire({
      title: "Insufficient Referrals!",
      text: "You need to connect with at least 2 people to sell coins.",
      icon: "warning",
      confirmButtonText: "Okay",
      buttonsStyling: true,
      customClass: {
        popup: "bg-gray-800 text-white rounded-lg shadow-lg w-[90%] sm:w-[400px]", // Adjust width for mobile
        title: "text-white text-sm sm:text-base font-bold", // Smaller text for mobile, larger for larger screens
        content: "text-gray-300 text-xs sm:text-sm", // Adjust description size for mobile
        confirmButton: "bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs sm:text-sm", // Button size adjustment
      },
    });
  };
  

  // Handle Button Click
  const handleButtonClick = (coinRate, companyId) => {
    if (userData && userData.referral_count >= 2) {
      // Open popup or perform the Sell action
      handleSellClick(coinRate, companyId);
    } else {
      // Show SweetAlert
      showAlert();
    }
  };
  return (

    <>

      <div className="bg-white flex justify-center min-h-screen font-eina">
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
      <div className="w-full bg-black text-white flex flex-col max-w-lg px-4 ">
        <div className="flex-grow relative z-0 pt-6  pb-16">
          <Logo />
          <div className="flex justify-center font-eina  leading-3 space-x-1 text-[34px] font-extrabold mt-3 mb-4">
            <p>U</p>
            <p className="">{userData ? userData.coins : "700,0000"}</p>
          </div>

           <div className="grid grid-cols-2 gap-2 mb-4">
      {/* Send Button */}
      <div
        onClick={() => toggleSharePopup()}
        className="text-white mx-auto cursor-pointer flex flex-col items-center transition duration-300 ease-in-out opacity-100"
      >
        <div className="rounded-full w-8 h-8 bg-[#303030] flex justify-center items-center">
          <BiSolidUpvote size={22} />
        </div>
        <span className="text-xs text-center font-eina">Send</span>
      </div>

      {/* History Button */}
      <div
        onClick={() => handleIconClick(2)}
        className="text-white mx-auto cursor-pointer flex flex-col items-center transition duration-300 ease-in-out opacity-100"
      >
        <div className="rounded-full w-8 h-8 bg-[#303030] flex justify-center items-center">
          <BiHistory size={22} />
        </div>
        <span className="text-xs text-center font-eina">History</span>
      </div>
    </div>

          <p className="text-center font-eina text-xs text-[#f5eded] mb-4">
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
                        <p className="font-bold flex  font-eina items-center text-[17px] "> 
                          <BsCurrencyRupee className="" />
                          <span>{company.coin_rate}</span>
                        </p>
                        <h3 className="text-[10px] uppercase text-[#d3cece] ">limit 20k-80k uni coin</h3>
                      </div>
                      <RiVerifiedBadgeLine size={16} className="text-green-500 " /> {/* Reduced icon size */}
                    </div>
    
                    <button
                      className="leading-none px-2 py-1 text-xs rounded-md bg-red-600 flex text-white font-semibold hover:bg-red-500 transition duration-200 ease-in-out"
                      onClick={() => handleButtonClick (company.coin_rate, company.company_id)}
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
    
      {
        showWithdrawal && <WithdrawCoin toggleWithdrawalPopup={toggleWithdrawalPopup} handleReceiveMoney={handleReceiveMoney} handleReceiveInputChange={handleReceiveInputChange} 
          receiveData={receiveData} />
      }
      {
        showPopup && <Sell togglePopup={togglePopup} handleSellChange={handleSellChange} handleSellSubmit={handleSellSubmit}
        coinRate={selectedCoinRate} userData={userData} company_id={company_id} />
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
    </>
  



  );
}

export default Withdrawal;
