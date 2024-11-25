import React, { useState, useEffect, useMemo } from "react";
import { BsArrowLeft, BsCoin } from 'react-icons/bs';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import { fetchHistory , fetchWithdrawal, userApprove} from "../../store/actions/homeActions";
import { useDispatch, useSelector } from "react-redux";
import Loader from '../components/Loader';
import Swal from "sweetalert2";

const TransactionHistory = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const historyData = useSelector((state) => state.apiData.data);
  const transactions = historyData && historyData.history && historyData.history.data
  const withdrawal = useSelector((state) => state.apiData.data.withdrawal?.data || []);
  const [activeTab, setActiveTab] = useState("History"); // Active tab state
// console.log('withdrawal', withdrawal)
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };
  useEffect(() => {
    // Fetch user and coin data on component mount
    const fetchData = async () => {
      try {
        await dispatch(fetchHistory());
        await dispatch(fetchWithdrawal());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };
    fetchData();
  }, [dispatch]);

  const groupTransactionsByDate = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return {}; // Return empty object if transactions is empty or undefined
    }
    return transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date_entered).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {});
  };
  const groupedTransactions = groupTransactionsByDate(transactions || []);


  const groupWithdrawalByDate = (withdrawal) => {
    if (!withdrawal || withdrawal.length === 0) {
      return {}; // Return empty object if withdrawal is empty or undefined
    }
    return withdrawal.reduce((acc, withdrawal) => {
      const date = new Date(withdrawal.date_entered).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(withdrawal);
      return acc;
    }, {});
  };
  const groupedWithdrawal = useMemo(() => groupWithdrawalByDate(withdrawal), [withdrawal]);


  const handleApprove = (transaction_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to approve this transaction?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Dispatch the approve action
          await dispatch(userApprove({ transaction_id }));
  
          // Fetch the updated withdrawal data
          await dispatch(fetchWithdrawal());
  
          // Show a success alert
          Swal.fire("Approved!", "The transaction has been approved.", "success");
        } catch (error) {
          // Show an error alert if the approval fails
          Swal.fire("Failed!", "The transaction could not be approved.", "error");
        }
      }
    });
  };
  
  return (
    <div className="bg-white min-h-screen flex justify-center">
      {loading ? (
        <Loader />
      ) :
        <div className=" bg-black text-white w-full max-w-lg flex flex-col px-4">

          <div className="flex items-center justify-between py-4">
            <button onClick={() => navigate(-1)} className="text-2xl text-white">
              <BsArrowLeft />
            </button>
            {/* <h2 className="text-xl font-semibold text-center flex-grow">Transaction History</h2> */}
          </div>
          {/* Tab Navigation */}
          <div className="flex items-center bg-[#1C1C1E] justify-between rounded-xl">
            <button
          className={`flex-1 py-2.5  text-center font-medium transition-all duration-200 ${
            activeTab === "History"
                ? "bg-[#282828] rounded-xl text-white"
              : " text-gray-100"
            }`}
              onClick={() => handleTabSwitch("History")}
            >
              History
            </button>
            <button
          className={`flex-1 py-2.5  text-center font-medium transition-all duration-200 ${
            activeTab === "Withdrawal"
             ? "bg-[#282828] rounded-xl text-white"
                    : " text-gray-100"
              }`}
              onClick={() => handleTabSwitch("Withdrawal")}
            >
              Withdrawal
            </button>
          </div>

          <div className="flex-grow py-4 h-[400px] overflow-y-auto hide-scrollbar">
            {activeTab === "History" ? (
              <>
                {Object.keys(groupedTransactions).length > 0 ? (
                  Object.keys(groupedTransactions).map((date) => (
                    <div key={date} className="mb-6">
                      <p className="text-sm font-semibold text-gray-400 mb-3">
                        {date}
                      </p>
                      {groupedTransactions[date]
                        // .filter((transaction) => transaction.pending_coin > 0) 
                        .map((transaction, index) => (
                          <div key={index} className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-3">
                              {/* <img
                  className="w-8 h-8"
                  src="/src/Img/rupees.png"
                  alt="Transaction icon"
                /> */}
                              <BsCoin size={30} className="text-white" />
                              <h3 className="text-sm font-semibold capitalize">
                                {transaction.title}
                              </h3>
                            </div>
                            <p className="text-sm font-medium">
  {transaction.pending_coin === 0 
    ? `${transaction.earn_coin > 0 ? '+' : ''}${transaction.earn_coin} Coins` 
    : `+ ${transaction.pending_coin} Coins`}
</p>
                          </div>
                        ))}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400">No transactions found.</p>
                )}</>) :
             ""
            }

{activeTab === "Withdrawal" ? (
              <>
                {Object.keys(groupedWithdrawal).length > 0 ? (
                  Object.keys(groupedWithdrawal).map((date) => (
                    <div key={date} className="mb-6">
                      <p className="text-sm font-semibold text-gray-400 mb-3">
                        {date}
                      </p>
                      {groupedWithdrawal[date]
                        // .filter((transaction) => transaction.pending_coin > 0) 
                        .map((transaction, index) => (
                          <div key={index} className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-3">
                              {/* <img
                  className="w-8 h-8"
                  src="/src/Img/rupees.png"
                  alt="Transaction icon"
                /> */}
                              <BsCoin size={30} className="text-white" />
                              <h3 className="text-sm font-semibold capitalize">
                                {transaction.title}
                              </h3>
                            </div>
                           <button    onClick={()=> handleApprove(transaction.transaction_id)}  className="leading-none capitalize px-4 py-2 text-[13px] rounded-full bg-[#282828] flex text-white font-semibold hover:bg-[#1C1C1E] transition duration-200 ease-in-out">
                           {transaction.status}
                           </button>
                          </div>
                        ))}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400">No transactions found.</p>
                )}</>) :
             ""
            }
          </div>
          




        </div>
      }
      <Footer />
    </div>
  );
};

export default TransactionHistory;
