import React, { useState } from "react";
import Logo from "../utils/Logo";
import { FaXTwitter, FaInstagram  } from "react-icons/fa6";
import { FaYoutube , FaTelegramPlane } from "react-icons/fa";
import { AiFillCaretRight  } from "react-icons/ai";
import Footer from "./Footer";

function Tasks() {
  const [watchTimes, setWatchTimes] = useState({
    task1: null,
    task2: null,
  });
  const [hasWatched, setHasWatched] = useState({
    task1: false,
    task2: false,
  });
  const [isVideoWatched, setIsVideoWatched] = useState({
    task1: false,
    task2: false,
  });

  const handleWatchButtonClick = (task) => {
    setWatchTimes({
      ...watchTimes,
      [task]: Date.now(),
    });
    setIsVideoWatched({
      ...isVideoWatched,
      [task]: true,
    });
  };

  const handleCheckButtonClick = (task) => {
    const currentTime = Date.now();
    const watchStartTime = watchTimes[task];
    const timeSpent = (currentTime - watchStartTime) / 1000; // Time spent in seconds

    if (timeSpent >= 10) {
      setHasWatched({
        ...hasWatched,
        [task]: true,
      });
      alert("Task Completed!");
    } else {
      alert("You have not watched the video for at least 10 seconds.");
      setIsVideoWatched({
        ...isVideoWatched,
        [task]: false,
      });
    }
  };

  const rows = [
    {
       icon: <FaYoutube size={40} color="white" className="mr-4" />,
      title: "YOUTUBE VIDEO - 1",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      taskKey: "task1",
    },
    {
       icon: <FaYoutube size={40} color="white" className="mr-4" />,
      title: "YOUTUBE VIDEO - 1",
      videoUrl: "https://www.youtube.com/watch?v=abcd1234",
      taskKey: "task2",
    },
    // Add more rows as needed
  ];

  const socials = [
    {
      icon: <FaYoutube size={40} color="white" className="mr-4" />,
      title: "SUBSCRIBE ON YOUTUBE",
      socialUrl: "https://www.youtube.com/",
    },
    {
      icon: <FaTelegramPlane  size={40} color="white" className="mr-4" />,
      title: "Follow on Telegram",
      socialUrl: "https://web.telegram.org/k/",
    },
    {
      icon: <FaXTwitter size={40} color="white" className="mr-4" />,
      title: "Follow on X",
      socialUrl: "https://x.com/X",
    },
    {
      icon: <FaInstagram  size={40} color="white" className="mr-4" />,
      title: "Follow on Instagram",
      socialUrl: "https://www.instagram.com/",
    },
  ];

  return (
    <div className="bg-white flex justify-center min-h-screen">
    <div className="w-full bg-black text-white h-screen  flex flex-col max-w-xl  ">
      <div className="flex-grow mb-4 relative z-0">
        <div className=" px-2 py-6 h-full z-10">
          <Logo/>
          <p className="text-left mt-6 text-lg font-poppins ml-2">EARN</p>
          <h1 className="text-center text-3xl text-white shadow-lg font-bold font-poppins">
            COIN QUESTS 0/10
          </h1>
  
          <div className="mt-4 ">
            {rows.map((row, index) => (
              <>
              <div
                key={index}
                className="flex items-center justify-between bg-black py-3 px-4  font-poppins"
              >
                <div className="flex items-center ">
                {row.icon}
                  <h3 className="text-base uppercase ">{row.title}</h3>
                </div>
                {!hasWatched[row.taskKey] && !isVideoWatched[row.taskKey] && (
                  <a
                    href={row.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleWatchButtonClick(row.taskKey)}
                    className="bg-white text-black w-24 flex justify-center py-1 font-mono rounded-full  text-sm font-bold"
                  >
                     <span>  <AiFillCaretRight  size={22} /> </span>
                     <span className=" uppercase"> Watch</span> 
                  </a>
                )}
                {!hasWatched[row.taskKey] && isVideoWatched[row.taskKey] && (
                  <button
                    onClick={() => handleCheckButtonClick(row.taskKey)}
                    className="bg-blue-500 px-4 py-2 rounded-lg"
                  >
                    Check
                  </button>
                )}
                {hasWatched[row.taskKey] && (
                  <p className="text-green-500">Completed</p>
                )}
              </div>
                  <hr className="border-2 border-gray-50 w-[260px] mx-auto "/></>
            ))}
          </div>
  
          <div className=" mt-4 ">
            {socials.map((social, index) => (
              <>
                  <div
                key={index}
                className="flex items-center justify-between bg-black py-3 px-4 rounded-lg shadow-lg  "
              >
                <div className="flex items-center">
                {social.icon}
                  <h3 className="text-base uppercase">{social.title}</h3>
                </div>
                <a
                  href={social.socialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-black px-2 py-1 font-mono rounded-full w-24 flex justify-center text-sm font-bold"
                >
                   <span>  <AiFillCaretRight  size={22} /> </span>
                   <span className=" uppercase"> Follow</span> 
                </a>
              </div>
                  <hr className="border-2 border-white w-[260px] mx-auto "/></>
          
            ))}
                        

          </div>
        </div>
      </div>
    </div>
    <Footer/>
  </div>
  
  );
}

export default Tasks;
