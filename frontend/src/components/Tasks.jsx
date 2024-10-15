import React, { useState, useEffect } from "react";
import Logo from "../utils/Logo";
import { FaXTwitter, FaInstagram } from "react-icons/fa6";
import { FaYoutube, FaTelegramPlane } from "react-icons/fa";
import { AiFillCaretRight } from "react-icons/ai";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import Footer from "./Footer";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAPIData } from '../../store/actions/homeActions';
import { BACKEND_URL } from '../config';

function Tasks() {
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data.apiquests);
  const apiQuests = apiData?.quests || []; 
  useEffect(() => {
    dispatch(fetchAPIData('apiQuests'));
  }, [dispatch]);


   // Filter the quests based on type (Watch and Follow)
   const videoQuests = apiQuests && apiQuests.filter((quest) => quest.quest_type === "Watch");
   const socialQuests = apiQuests && apiQuests.filter((quest) => quest.quest_type === "Follow");



  // Mapping API Data to rows (video quests)
  const rows = videoQuests && videoQuests.map((quest, index) => ({
    icon: <FaYoutube size={24} color="white" className="mr-4" />,
    title: quest.quest_name,
    videoUrl: quest.quest_url,
    taskKey: `task${index + 1}`, // Unique keys
    questId: quest.quest_id, // Add quest_id here
  }));

  // Mapping API Data to socials (follow quests)
  const socials = socialQuests && socialQuests.map((quest, index) => {
    let icon = null;
    if (quest.quest_name.toLowerCase().includes("youtube")) {
      icon = <FaYoutube size={24} color="white" className="mr-4" />;
    } else if (quest.quest_name.toLowerCase().includes("telegram")) {
      icon = <FaTelegramPlane size={24} color="white" className="mr-4" />;
    } else if (quest.quest_name.toLowerCase().includes("x")) {
      icon = <FaXTwitter size={24} color="white" className="mr-4" />;
    } else if (quest.quest_name.toLowerCase().includes("instagram")) {
      icon = <FaInstagram size={24} color="white" className="mr-4" />;
    }

    return {
      icon,
      title: quest.quest_name,
      socialUrl: quest.quest_url,
    };
  });
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
  // const handleCheckButtonClick = async (task, questId) => {
  //   const currentTime = Date.now();
  //   const watchStartTime = watchTimes[task];
  //   const timeSpent = (currentTime - watchStartTime) / 1000; // Time spent in seconds
  
  //   if (timeSpent >= 10) {
  //     try {
  //       const token = localStorage.getItem('token_local'); // Adjust this based on your actual token storage
  //       const response = await fetch('http://localhost:4000/api/v1/api-quests/complete-quest', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${token}`, // Include the token in the headers if required
  //         },
  //         body: JSON.stringify({ quest_id: questId }),
  //       });
  
  //       if (!response.ok) {
  //         const errorText = await response.text();
  //         throw new Error(`Error: ${response.status} - ${response.statusText}\nDetails: ${errorText}`);
  //       }
  
  //       const contentType = response.headers.get('content-type');
  //       if (contentType && contentType.includes('application/json')) {
  //         const data = await response.json();
  //         setHasWatched({
  //           ...hasWatched,
  //           [task]: true,
  //         });
  //         alert("Task Completed!");
  //       } else {
  //         const text = await response.text();
  //         throw new Error(`Expected JSON but received non-JSON response. Here is the response: ${text}`);
  //       }
  //     } catch (err) {
  //       alert(`Error completing task: ${err.message}`);
  //       console.error('Error completing quest:', err);
  //     }
  //   } else {
  //     alert("You have not watched the video for at least 10 seconds.");
  //     setIsVideoWatched({
  //       ...isVideoWatched,
  //       [task]: false,
  //     });
  //   }
  // };
  


  const handleCheckButtonClick = async (task, questId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/api-quests/complete-quest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          "quest_id": questId,
        }),
      });
  
      // Check if the response is OK (status in the range 200-299)
      if (!response.ok) {
        // Attempt to read the response as text for better error reporting
        const errorText = await response.text();
        console.error('Network response was not ok:', errorText);
        throw new Error('Failed to complete quest: ' + errorText);
      }
  
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Quest completed successfully:', data);
        // Handle success - Update UI or display success message
      } else {
        console.error('Expected JSON response, but got:', contentType);
        throw new Error('Response is not JSON: ' + contentType);
      }
    } catch (error) {
      console.error('Error completing quest:', error);
      // Show error message to the user (alert or toast)
      alert('Error: ' + error.message); // Or use a toast notification
    }
  };
  

  return (
    <div className="bg-white flex justify-center min-h-screen">
      <div className="w-full bg-black text-white flex flex-col max-w-lg  overflow-y-auto ">
        <div className="flex-grow mb-4 relative z-0">
          <div className=" px-2 py-6 h-full z-10">
            <Logo />
            <p className="text-left mt-6 text-lg font-extrabold font-poppins ml-2">EARN</p>
              {/* Sliding Banner */}
              <Swiper
              spaceBetween={20}
              slidesPerView={1}
              pagination={{ clickable: true }}
              className="rounded-lg shadow-lg overflow-hidden mb-4"
            >
              <SwiperSlide>
            <div className="bg-gradient-to-r from-[#c7c7c1] to-[#dbdbd1] w-full p-3 space-y-2 rounded-lg shadow-lg ">
              <div className="flex items-center">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlrWcBG3SebWTLiMtYf1YBzrZ-dyD9B2LHqiJScut64HP7qbEj0oAJw-JHiCkf9HD2NHI&usqp=CAU" // Replace with your logo path
                  alt="Logo"
                  className="h-10 w-10 rounded-full shadow-md" // Logo styling
                />
              </div>
              <div className="mt-4">
                <h1 className="text-black text-base font-bold ">MemeFi Quest Round 1</h1>
                <p className="text-[#423d3d] text-xs font-bold">+999 BP</p>
              </div>
              <div className="flex justify-between">
                <button className="bg-black text-white py-1 px-[10px] rounded-full text-[13px] font-semibold shadow-lg active:border-white border transition duration-300">
                  Open
                </button>
                <button className=" bg-transparent  border-[#665f5f] text-[#2b2727] py-1 px-[25px] rounded-full text-[13px] font-bold shadow-lg border-2 transition duration-300">
                  0/3
                </button>
              </div>

            </div>
            </SwiperSlide>
            <SwiperSlide>
            <div className="bg-gradient-to-r from-[#d4afd1] to-[#f3d6f1] w-full p-3 space-y-2 rounded-lg shadow-lg ">
              <div className="flex items-center">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv1DD_viUEoD_ag_IWy3twGYvW18quZRC8sA&s" // Replace with your logo path
                  alt="Logo"
                  className="h-10 w-10 rounded-full shadow-md" // Logo styling
                />
              </div>
              <div className="mt-4">
                <h1 className="text-black text-base font-bold ">Subscribe to Blum Telegram </h1>
                <p className="text-[#423d3d] text-xs font-bold">+90 BP</p>
              </div>
              <div className="flex justify-between">
                <button className="bg-black text-white py-1 px-[10px] rounded-full text-[13px] font-semibold shadow-lg active:border-white border transition duration-300">
                  Start
                </button>
                {/* <button className=" bg-transparent  border-[#665f5f] text-[#2b2727] py-1 px-[25px] rounded-full text-[13px] font-bold shadow-lg border-2 transition duration-300">
                  0/3
                </button> */}
              </div>

            </div>
            </SwiperSlide>
            </Swiper>
            <h1 className="text-center text-2xl text-white shadow-lg font-bold font-poppins mt-4"> {/* Reduced heading size */}
            COIN QUESTS 0/10
          </h1>

            <div className="mt-4 ">
              {rows && rows.map((row, index) => (
                <>
                  <div
                    key={index}
                    className="flex items-center justify-between bg-black py-3 px-4  font-poppins"
                  >
                    <div className="flex items-center ">
                      {row.icon}
                      <h3 className="text-sm uppercase ">{row.title}</h3>
                    </div>
                    {!hasWatched[row.taskKey] && !isVideoWatched[row.taskKey] && (
                  <a
                  href={row.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleWatchButtonClick(row.taskKey)}
                  className="bg-white text-black w-20 flex justify-center py-1 font-mono rounded-full text-xs font-bold"
                >
                  <span><AiFillCaretRight size={18} /></span> {/* Adjusted icon size */}
                  <span className="uppercase">Watch</span>
                </a>
                    )}
                    {!hasWatched[row.taskKey] && isVideoWatched[row.taskKey] && (
                      <button
                      onClick={() => handleCheckButtonClick(row.taskKey, row.questId)}
                      className="bg-blue-500 w-20 flex justify-center py-1 font-mono rounded-full text-sm uppercase font-bold"
                  >
                      Check
                  </button>
                    )}
                    {hasWatched[row.taskKey] && (
                      <p className="text-green-500 w-20 flex justify-center py-1 font-mono rounded-full text-sm uppercase font-bold">Completed</p>
                    )}
                  </div>
                  <hr className="border-2 border-gray-50  w-2/3 mx-auto " /></>
              ))}
            </div>

            <div className=" mt-4 ">
              {socials && socials.map((social, index) => (
                <>
                  <div
                    key={index}
                    className="flex items-center justify-between bg-black py-3 px-4 rounded-lg shadow-lg  "
                  >
                    <div className="flex items-center">
                      {social.icon}
                      <h3 className="text-sm uppercase">{social.title}</h3>
                    </div>
                    <a
                    href={social.socialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-black px-2 py-1 font-mono rounded-full w-20 flex justify-center text-xs font-bold"
                  >
                    <span><AiFillCaretRight size={18} /></span> {/* Adjusted icon size */}
                    <span className="uppercase">Follow</span>
                  </a>
                  </div>
                  <hr className="border-2 border-white w-2/3 mx-auto " /></>

              ))}


            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>

  );
}

export default Tasks;
