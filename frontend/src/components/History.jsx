import React, { useState, useEffect } from "react";
import { BsArrowLeft, BsCoin  } from 'react-icons/bs';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import {  fetchHistory  } from "../../store/actions/homeActions";
import { useDispatch, useSelector } from "react-redux";
import Loader from '../components/Loader';

const TransactionHistory = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
 // Retrieve history data and loading state from Redux store
 const historyData = useSelector((state) => state.apiData.data);
 const transactions = historyData && historyData.history && historyData.history.data 
console.log(transactions);

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

useEffect(() => {
  // Fetch user and coin data on component mount
  const fetchData = async () => {
    try {
      await dispatch(fetchHistory());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };
  fetchData();
}, [dispatch]);

// if (loading) {
//   return <Loader />;
// }

  return (
    <div className="bg-white min-h-screen flex justify-center font-poppins">
      <div className=" bg-black text-white w-full max-w-lg flex flex-col px-4">
        
      {loading && (
         <Loader />
    )
    }
        <div className="flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} className="text-2xl text-white">
            <BsArrowLeft />
          </button>
          <h2 className="text-xl font-semibold text-center flex-grow">Transaction History</h2>
        </div>
        
      
        <div className="flex-grow py-4 h-[400px] overflow-y-auto hide-scrollbar">
  {/* Sample Data by Date */}
  {Object.keys(groupedTransactions).length > 0 ? (
    Object.keys(groupedTransactions).map((date) => (
      <div key={date} className="mb-6">
        <p className="text-sm font-semibold text-gray-400 mb-3">
          {date}
        </p>
        {groupedTransactions[date]
          .filter((transaction) => transaction.pending_coin > 0) // Filter out transactions where pending_coin is 0
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
              <p className="text-sm font-medium text-green-400">
                + {transaction.pending_coin} Coins
              </p>
            </div>
          ))}
      </div>
    ))
  ) : (
    <p className="text-center text-gray-400">No transactions found.</p>
  )}
</div>

        
   
        <Footer />
      </div>
    </div>
  );
};

export default TransactionHistory;
