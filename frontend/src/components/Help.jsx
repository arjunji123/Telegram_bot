import React, { useState } from "react";
import Accordion from "./Accordian";
import help from "../Img/help.png";
function Help() {
  return (
    <div className="bg-black flex justify-center">
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
            <div className="absolutepx-4 z-10">
              <div className=" top-[20px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
                <div className="px-4 py-2 items-center space-x-2">
                  <img src={help} alt="" className="mx-auto w-40 h-40" />
                </div>
                {/* <div className="px-4 py-2 items-center space-x-2">
                  <h1
                    className="px-4 py-2 items-center space-x-2"
                    style={{ fontSize: 37, textAlign: "center" }}
                  >
                    Help
                  </h1>
                </div> */}

                {/* <div className="px-4 mt-6 flex justify-between gap-2">
                  <div className="daily rounded-lg px-4 py-2 h-20 w-full relative flex justify-between items-center">
                    <span className="text-white">Delete my Account</span>
                    <button className="btn">Delete</button>
                  </div>
                </div> */}
              </div>
            </div>

            <Accordion />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;
