import React from "react";
import { Link } from "react-router-dom";
import Home from "../Img/home.png";
import Tasks from "../Img/tasks.png";
import Invite from "../Img/invite.webp";
import logo from "../images/logo.png";

function Footer() {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl bg-[#000000] flex justify-around items-center z-50 text-xs h-max">
      <div className="text-center text-[#ffffff] w-1/5">
        <Link className="mt-1" to="/home">
          <img src={Home} alt="" className="w-8 h-8 mx-auto" />
          Home
        </Link>
      </div>
      <div className="text-center text-[#ffffff] w-1/5">
        <Link className="mt-1" to="/tasks">
          <img src={Tasks} alt="" className="w-8 h-8 mx-auto" />
          Tasks
        </Link>
      </div>
      <div className="text-center text-[#ffffff] w-1/5">
        <Link className="mt-1" to="/friend">
          <img src={Invite} alt="" className="w-8 h-8 mx-auto" />
          Friends
        </Link>
      </div>
      <div className="text-center text-[#ffffff] w-1/5">
        <Link className="mt-1" to="/withdrawal">
          <img src={logo} alt="" className="w-8 h-8 mx-auto" />
          Withdrawal
        </Link>
      </div>
    </div>
  );
}

export default Footer;
