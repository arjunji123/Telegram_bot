import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { BiSolidUpvote, BiHistory } from "react-icons/bi";
import { BsPersonFillCheck, BsCurrencyRupee } from "react-icons/bs";
import { IoMdThumbsUp } from "react-icons/io";
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
  const { success } = useSelector((state) => ({
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
  const { data, error } = useSelector((state) => state.moneyData);
  const apiCompanies = useSelector((state) => state.apiData.data.apicompanies);
  const apiData = useSelector((state) => state.apiData.data);
  const userData = apiData && apiData.me && apiData.me.data || null;
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
  const handleSendMoney = async () => {
    if (!sendData.amount || !sendData.recipientReferralCode) {
      toast.warn("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      await dispatch(shareCoins(sendData));
      // toast.success("Coins sent successfully!");
    } catch (error) {
      toast.error("Failed to send coins.");
    } finally {
      setLoading(false);
    }
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

      <div className="bg-white flex justify-center min-h-screen font-Inter overflow-hidden">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
        {loading ? (
          <Loader />
        ) :
          <div className="w-full bg-black text-white flex flex-col max-w-lg px-4 overflow-hidden">
            <div className="flex-grow relative z-0   top-10">
              {/* <Logo /> */}

              <div className="flex items-center justify-center font-Inter leading-3 text-[34px] font-extrabold mt-3 mb-4">
                <img src="src/assets/logo/U.png" alt="Logo" className="w-8 h-8 " />
                <p>{userData ? userData.coins : "0"}</p>
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
                  <span className="text-xs text-center font-Inter">Send</span>
                </div>

                {/* History Button */}
                <div
                  onClick={() => handleIconClick(2)}
                  className="text-white mx-auto cursor-pointer flex flex-col items-center transition duration-300 ease-in-out opacity-100"
                >
                  <div className="rounded-full w-8 h-8 bg-[#303030] flex justify-center items-center">
                    <BiHistory size={22} />
                  </div>
                  <span className="text-xs text-center font-Inter">History</span>
                </div>
              </div>

              <p className="text-center font-Inter text-xs text-[#f5eded] mb-4">
                Sell your points at your chosen price, anytime and anywhere. Get instant cash withdrawals with no delays!
              </p>

              <hr className="border-gray-300 mb-4 w-full mx-auto" />

              {/* Co-Companies List */}
              <div id="content" className="flex flex-col h-[400px] space-y-4 overflow-y-auto hide-scrollbar">
                {apiCompanies && apiCompanies.data && apiCompanies.data.length > 0 ? (
                  apiCompanies.data && apiCompanies.data.map((company, index) => (
                    <div key={index} className="py-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-sky-400 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold uppercase ">{company.company_name.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium capitalize">{company.company_name}</span>
                        </div>
                        <div className="text-sm font-medium text-[#5B5A5C]">123 Orders (30D) | 98%</div>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <p className="font-bold flex  font-Inter items-center  ">
                          <BsCurrencyRupee className="" />  <span className="text-[20px] ">{company.coin_rate}</span></p>
                        <div className="text-sm font-medium text-[#5B5A5C]">Online</div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="leading-4 ">
                          <p>
                            <span className="text-xs font-bold text-[#5B5A5C]">Quantity</span>
                            <span className="text-xs font-medium ml-2 text-[#B8B7BA]">300 USDT</span>
                          </p>
                          <p>
                            <span className="text-xs font-bold text-[#5B5A5C]">Limit</span>
                            <span className="text-xs font-medium ml-2 text-[#B8B7BA]">22,000 - 22,000 INR</span>
                          </p>
                        </div>
                        <p className="flex items-start text-green-500 gap-0.5 self-start"> {/* Added self-start */}
                          <IoMdThumbsUp size={24} className="pt-1" />
                          <span className="text-sm font-medium leading-loose">100%</span>
                        </p>
                      </div>
                      <div className="flex justify-between items-center py-1.5 ">
                        <div className="">

                        </div>
                        <button
                          className="leading-none px-3 py-1.5 text-sm rounded-full bg-red-600 flex text-white font-semibold hover:bg-red-500 transition duration-200 ease-in-out"
                          onClick={() => handleButtonClick(company.coin_rate, company.company_id)}
                        >Sell
                        </button>
                      </div>


                    </div>

                  )

                  )) : ""}
              </div>
            </div>


          </div>
        }
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
            toggleSharePopup={toggleSharePopup}
            handleSendInputChange={handleSendInputChange}
            handleSendMoney={handleSendMoney}
            sendData={sendData}
            setSendData={setSendData}
          />
        }
        {
          showHistoryPopup && <History closePopups={closePopups} />
        }
      </div>
    </>




  );
}

export default Withdrawal;
