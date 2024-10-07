import React from 'react';
import { logo } from '../images';
import { PiDotsThreeCircle } from "react-icons/pi";

function Logo() {
  return (

    <div className="relative flex items-center py-4">
    {/* First div with title and logo centered */}
    <div className="flex justify-center items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
      <h1 className="font-poppins text-xl font-extrabold">UNITRADE</h1>
      <img src={logo} alt="logo" className="w-6 h-6 mt-0.5" />
    </div>
  
    {/* Second div with the icon aligned to the right */}
    <div className="ml-auto cursor-pointer">
      <PiDotsThreeCircle size={38} />
    </div>
  </div>
  
  
  )
}

export default Logo