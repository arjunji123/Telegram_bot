import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Tasks.css";
import rupees from "../Img/hero.png";

function Home() {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem("userData");

    // Redirect to the login page
    navigate("/login");
  };

  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = window.Telegram.WebApp;

    // Extract user information
    const firstName = tg.initDataUnsafe?.user?.first_name;

    setFirstName(firstName);
  }, []);

  return (
    <div className="bg-black flex justify-center">
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
            <div className="absolutepx-4 z-10">
              <div className="top-[20px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
                <div className="px-4 py-2 items-center space-x-2">
                  <img
                    src={rupees}
                    alt="Profile"
                    className="mx-auto w-40 h-40"
                  />
                </div>
                <div className="px-4 py-2 items-center space-x-2">
                  <h1
                    className="px-4 py-2 items-center space-x-2"
                    style={{ fontSize: 37, textAlign: "center" }}
                  >
                    Profile
                  </h1>
                </div>
                <div>
                  <h1>Welcome {firstName} </h1>
                </div>

                <div className="tasks">
                  <div className="px-4 mt-6 flex justify-between gap-2"></div>
                </div>

                {/* Logout Button */}
                <div className="px-4 mt-6 flex justify-center">
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Logout
                  </button>
                </div>

                <br />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
