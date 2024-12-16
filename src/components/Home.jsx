import React, { useState, useEffect } from "react";
import "../Styles/Tasks.css";
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompanyData,  } from "../../store/actions/homeActions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Loader from '../components/Loader';




function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data);
  const userData = apiData?.me?.data || null;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user and coin data on component mount
    const fetchData = async () => {
      try {
        await dispatch(fetchCompanyData());
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Set loading to false if there's an error
      }
    };
    fetchData();
  }, [dispatch]);




  return (
<div className="bg-black min-h-screen flex justify-center items-center font-Inter text-white">
  <ToastContainer
    position="top-right"
    autoClose={500}
    hideProgressBar={false}
    closeOnClick
    pauseOnHover
    draggable
    theme="dark"
  />
  {loading ? (
    <Loader />
  ) : (
    <div className="w-full max-w-sm bg-black text-white rounded-lg shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-black text-center py-4 border-b border-white">
        <p className="text-2xl font-semibold">◥𝐔ɴɪᴛᴇᴅ々◤</p>
      </div>

      {/* Profile Section */}
      <div className="px-6 py-6">
        {/* Profile Picture */}
        <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-white text-4xl font-bold mb-4 mx-auto">
          {/* Display initial of the company name */}
          {userData?.user_name
                    ? userData.user_name
                      .split(" ") // Split the name into words
                      .map(word => word[0]) // Get the first letter of each word
                      .join("") // Join the initials
                      .toUpperCase() // Ensure uppercase
                    : "UN"}
        </div>

        {/* User Info */}
        <div className="text-center mb-6">
          <p className="text-xl font-semibold">{userData ? userData.user_name : "User Name"}</p>
          <p className="text-sm text-gray-400">{userData ? userData.email : "Email"}</p>
        </div>

        {/* Stats Section */}
        <div className="space-y-4">
          <div className="bg-[#1B1A1A] shadow-xl p-2 rounded-lg">
            <div className="text-lg font-semibold">{userData ? userData.mobile : "Mobile"}</div>
            <p className="text-sm text-gray-400">Mobile</p>
          </div>
          <div className="bg-[#1B1A1A] shadow-xl p-2 rounded-lg">
            <div className="text-lg font-semibold">{userData?.company_coin ? userData.company_coin : "0"}</div>
            <p className="text-sm text-gray-400">Company Coin</p>
          </div>
          <div className="bg-[#1B1A1A] shadow-xl p-2 rounded-lg relative">
    {/* Coin Rate Display */}
    <div className="text-lg font-semibold">
        {userData ? `${userData.coin_rate} INR` : "N/A"}
    </div>
    <p className="text-sm text-gray-400">Coin Rate</p>

    {/* Tooltip and Update Button */}
    <div className="absolute top-0 right-0 mt-1 mr-2">
        <div className="group relative">
           {/* Tooltip */}
           <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 transform -translate-x-1/2 text-[10px] text-white bg-black p-2 rounded">
                  Upadate Coin Rate
                </div>

            {/* Update Button */}
            <button
                className="text-gray-400 hover:text-gray-200 transition"
                onClick={() => navigate('/profile')}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                    />
                </svg>
            </button>
        </div>
    </div>
</div>

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )}
</div>

  
  );
}

export default Home;
