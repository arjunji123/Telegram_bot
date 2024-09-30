import React from "react";
import "../Styles/Tasks.css";
import hero from "../Img/hero.jpg";
function Home() {
  return (
    <div className="bg-black flex justify-center">
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="absolute left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
            <div
              className="bg-black flex justify-center items-center h-screen rounded-t-[46px]" // Use flexbox to center content
              style={{
                backgroundImage: `url(${hero})`, // Full background image
                backgroundSize: "cover", // Cover the entire screen
                backgroundPosition: "center", // Center the image
                backgroundRepeat: "no-repeat", // No repetition
              }}
            >
              {/* Loader Div */}
              <div className="flex items-center justify-center">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
                <h1 style={{ position: "absolute" }}>Loading...</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
