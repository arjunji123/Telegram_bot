import React from "react";
import { Link } from "react-router-dom";
import { IoHome, IoLogOutOutline } from "react-icons/io5";
import { BiSolidWallet } from "react-icons/bi";
import { TbUsersGroup } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { earn } from '../images';

function Footer() {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem("userData");
    // Redirect to the login page
    navigate("/login");
  };
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl bg-[#000000] flex justify-around items-center z-50 text-xs h-max">
      <div className="text-center text-[#ffffff] w-1/5">
        <Link className="mt-1" to="/home">
          <IoHome size={34} className=" mx-auto" />
          Home
        </Link>
      </div>
      <div className="text-center flex justify-center items-center text-[#ffffff] w-1/5">
        <Link className="mt-1" to="/tasks">
          <img src={earn} alt="" className="w-8 h-8 " />
          Earn
        </Link>
      </div>
      <div className="text-center text-[#ffffff] w-1/5">
        <Link className="mt-1" to="/friend">
          <TbUsersGroup size={34} className=" mx-auto" />
          Friends
        </Link>
      </div>
      <div className="text-center flex justify-center items-center text-[#ffffff] w-1/5">
        <Link className="mt-1" to="/withdrawal">
          <img src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ6nn3a5smm55h4gH0ppipz_I-UqR8e_dMoH1yE-SYZnx_DB-95" alt="" className="w-8 h-8  " /> Wallet
        </Link>
      </div>
      <div className="text-center text-[#ffffff] w-1/5">
        <div className="mt-1 cursor-pointer" onClick={handleLogout}>
          <IoLogOutOutline size={34} className=" mx-auto" />
          Logout
        </div>
      </div>
    </div>
  );
}

export default Footer;
