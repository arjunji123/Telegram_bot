import React from "react";
import { Link } from "react-router-dom";
import Home from "../Img/home.png";
import Tasks from "../Img/tasks.png";
import Invite from "../Img/invite.webp";
import Help from "../Img/help.png";

function Footer({ loggedIn }) {
  const handleClick = (e) => {
    if (!loggedIn) {
      e.preventDefault();
      alert("Please log in or sign up first.");
    }
  };
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl bg-[#272a2f] flex justify-around items-center z-50 text-xs h-max">
      <div className="text-center text-[#85827d] w-1/5">
        <Link className="mt-1" to="/home" onClick={handleClick}>
          <img src={Home} alt="" className="w-8 h-8 mx-auto" />
          Home
        </Link>
      </div>
      <div className="text-center text-[#85827d] w-1/5">
        <Link className="mt-1" to="/tasks" onClick={handleClick}>
          <img src={Tasks} alt="" className="w-8 h-8 mx-auto" />
          Tasks
        </Link>
      </div>
      <div className="text-center text-[#85827d] w-1/5">
        <Link className="mt-1" to="/friend" onClick={handleClick}>
          <img src={Invite} alt="" className="w-8 h-8 mx-auto" />
          Frends
        </Link>
      </div>
      <div className="text-center text-[#85827d] w-1/5">
        <Link className="mt-1" to="/help" onClick={handleClick}>
          <img src={Help} alt="" className="w-8 h-8 mx-auto" />
          Help
        </Link>
      </div>
    </div>
  );
}

export default Footer;
