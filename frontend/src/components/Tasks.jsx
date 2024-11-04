import React, { useState, useEffect } from "react";
import Logo from "../utils/Logo";
import { FaXTwitter, FaInstagram } from "react-icons/fa6";
import { FaYoutube, FaTelegramPlane } from "react-icons/fa";
import { AiFillCaretRight } from "react-icons/ai";
import Follow from "../utils/Follow";
import CustomSwiper from '../utils/CustomSwiper';
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import { fetchAPIData } from "../../store/actions/homeActions";
import { BACKEND_URL } from "../config";
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; // Import the toastify CSS
import axios from "axios";

function Tasks() {
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data.apiquests);
  const apiQuests = apiData?.quests || [];
  const [completedTasks, setCompletedTasks] = useState({});
  const [watchTimes, setWatchTimes] = useState({});
  const [videoDurations, setVideoDurations] = useState({});
  const [hasWatched, setHasWatched] = useState({});
  const [isVideoWatched, setIsVideoWatched] = useState({});
  const [followed, setFollowed] = useState({});
  const [hasFollowed, setHasFollowed] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  const handleFileChange = (e) => {
    setScreenshot(e.target.files[0]); // Capture screenshot
  };

  useEffect(() => {
    const storedCompletedTasks = localStorage.getItem("completedTasks");
    if (storedCompletedTasks) {
      setCompletedTasks(JSON.parse(storedCompletedTasks));
    }
    dispatch(fetchAPIData("apiQuests"));
  }, [dispatch]);

  const videoQuests =
  apiQuests && apiQuests.filter((quest) => quest.activity === "watch");
const socialQuests =
  apiQuests && apiQuests.filter((quest) => quest.activity === "follow");

  const rows = videoQuests.map((quest, index) => ({
    icon: quest.image,
    title: quest.quest_name,
    videoUrl: quest.quest_url,
    taskKey: `task${index + 1}`,
    questId: quest.quest_id,
  }));
  const handleWatchButtonClick = async (task, videoUrl) => {
    try {
      setWatchTimes(prev => ({ ...prev, [task]: Date.now() }));
      setIsVideoWatched(prev => ({ ...prev, [task]: true }));
      console.log("videoUrl:", videoUrl); 
      // Ensure the videoUrl is valid
      const url = new URL(videoUrl); 
      const videoId = url.searchParams.get("v");
      
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }
  
      // Fetch the duration from YouTube API
      const duration = await fetchVideoDuration(videoId);
      setVideoDurations(prev => ({ ...prev, [task]: duration }));
    } catch (error) {
      console.error("Error handling video URL:", error);
      // Optional: Show an error message to the user
    }
  };
  
  const API_KEY = 'AIzaSyCNdfiNQIQ2H_-BN4vvddtlHBAbjsAwRTU'; 
  const fetchVideoDuration = async (videoId) => {

    
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${API_KEY}`);
      const data = await response.json();
      if (data.items.length > 0) {
        const duration = data.items[0].contentDetails.duration;
        return convertDurationToSeconds(duration);
      }
      throw new Error("Video not found");
    } catch (error) {
      toast(`Error fetching video duration: ${error.message}`);
      return 0; // Default duration to 0 on error
    }
  };
  

  const convertDurationToSeconds = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (parseInt(match[1]) || 0) * 3600;
    const minutes = (parseInt(match[2]) || 0) * 60;
    const seconds = parseInt(match[3]) || 0;
    return hours + minutes + seconds;
  };
  
  const handleCheckButtonClick = (task, questId) => {
    const currentTime = Date.now();
    const watchStartTime = watchTimes[task];
    const timeSpent = (currentTime - watchStartTime) / 1000;
  
    // Check against the video duration
    const requiredDuration = videoDurations[task] || 0;
  
    if (timeSpent >= requiredDuration) {
      completeQuest(questId, task);
    } else {
      const remainingTime = requiredDuration - timeSpent;
      toast(`You need to watch the video for ${remainingTime.toFixed(2)} more seconds.`);
      setIsVideoWatched(prev => ({ ...prev, [task]: false }));
    }
  };

  const completeQuest = async (questId, task) => {
    try {
      const tokenData = localStorage.getItem("user");
      if (!tokenData) throw new Error("No token data found in localStorage");
  
      const parsedTokenData = JSON.parse(tokenData);
      const token = parsedTokenData.token;
  
      const response = await fetch(`${BACKEND_URL}/api/v1/api-quests/complete-quest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quest_id: questId }),
      });
  
      if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
  
      setHasWatched(prev => ({ ...prev, [task]: true }));
      setCompletedTasks(prev => ({ ...prev, [task]: true }));
      localStorage.setItem("completedTasks", JSON.stringify({ ...completedTasks, [task]: true }));
  
      toast("Task Completed!");
    } catch (error) {
      toast.error(`Error completing task: ${error.message}`);
      console.error("Error completing quest:", error);
    }
  };
  const socials =
  socialQuests &&
  socialQuests.map((quest, index) => {
    return {
      icon: quest.image,
      title: quest.quest_name,
      socialUrl: quest.quest_url,
      taskKey: `task${index + 1}`, // Unique keys
      questId: quest.quest_id, // Add quest_id here
    };
  });
  const handleFollowButtonClick = (task) => {
    setFollowed({
      ...followed,
      [task]: Date.now(),
    });
  };
  // const handleCheckFollowButtonClick = async (task, questId) => {
  //   try {
  //     const tokenData = localStorage.getItem("user");
  //     if (!tokenData) {
  //       throw new Error("No token data found in localStorage");
  //     }

  //     const parsedTokenData = JSON.parse(tokenData);
  //     const token = parsedTokenData.token;

  //     if (!token) {
  //       throw new Error("Token not found");
  //     }

  //     const response = await fetch(
  //       `${BACKEND_URL}/api/v1/api-quests/complete-quest`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ quest_id: questId }),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`Error: ${response.status} ${response.statusText}`);
  //     }

  //     // Mark the task as completed and save the state in localStorage
  //     setHasFollowed((prev) => {
  //       const updatedState = {
  //         ...prev,
  //         [task]: true,
  //       };
  //       localStorage.setItem("hasFollowed", JSON.stringify(updatedState));
  //       return updatedState;
  //     });

  //     alert("Follow Task Completed!");
  //   } catch (error) {
  //     console.error("Error completing follow quest:", error);
  //     alert("Error completing follow quest: " + error.message);
  //   }
  // };

    // Handle submit click
    const handleSubmit = async (task, questId) => {
      if (!screenshot) {
        toast('Please upload a screenshot!');
        return;
      }
  
      try {
        setIsUploading(true);
  
        // 1. Upload the screenshot
        const formData = new FormData();
        formData.append('screenshot', screenshot);
        formData.append('taskId', task); // Pass the task ID to the API
  
        await axios.post('/api/upload-screenshot', formData);
  
        // 2. Complete the follow quest (your function logic)
        const tokenData = localStorage.getItem("user");
        if (!tokenData) {
          throw new Error("No token data found in localStorage");
        }
  
        const parsedTokenData = JSON.parse(tokenData);
        const token = parsedTokenData.token;
  
        if (!token) {
          throw new Error("Token not found");
        }
  
        const response = await fetch(
          `${BACKEND_URL}/api/v1/api-quests/complete-quest`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quest_id: questId }), // Complete the quest with questId
          }
        );
  
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
  
        // Mark the task as completed and save the state in localStorage
        setHasFollowed((prev) => {
          const updatedState = {
            ...prev,
            [task]: true, // Save follow status per task
          };
          localStorage.setItem("hasFollowed", JSON.stringify(updatedState));
          return updatedState;
        });
  
        // Mark as completed and update UI
        setFollowed(true); 
        setShowPopup(false); // Close the pop-up
        toast("Follow Task Completed!");
  
      } catch (error) {
        console.error("Error completing follow quest:", error);
        toast.error("Error completing follow quest: " + error.message);
      } finally {
        setIsUploading(false);
      }
    };
  
  
  return (
    <div className="bg-white flex justify-center min-h-screen">
          <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />      <div className="w-full bg-black text-white flex flex-col max-w-lg  overflow-y-auto ">
        <div className="flex-grow mb-4 relative z-0">
          <div className=" px-2 py-6 h-full z-10">
            <Logo />
            <p className="text-left mt-6 text-lg font-extrabold font-poppins ml-2">
              EARN
            </p>
            {/* Sliding Banner */}
            <CustomSwiper />
            <h1 className="text-center text-2xl text-white shadow-lg font-bold font-poppins mt-4">
              {" "}
              {/* Reduced heading size */}
              COIN QUESTS 0/10
            </h1>

            <div className="mt-4">
              {rows &&
                rows.map((row, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-black py-2 px-4 font-poppins"
                  >
                    <div className="flex items-center">
                      <img className="w-12 h-12 mr-4" src= {row.icon} alt="" />
                     
                      <h3 className="text-sm uppercase">{row.title}</h3>
                    </div>

                    {/* If task is completed, show 'Completed' message */}
                    {completedTasks[row.taskKey] ? (
                      <p className="bg-green-500 text-black w-20 flex justify-center py-1 font-mono rounded-full text-xs uppercase font-bold">
                        Completed
                      </p>
                    ) : (
                      <>
                        {/* Render Watch and Check buttons based on task status */}
                        {!isVideoWatched[row.taskKey] && (
                          <a href={row.videoUrl}  target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleWatchButtonClick(row.taskKey, row.videoUrl)}
                            className="bg-white text-black w-20 flex justify-center py-1 font-mono rounded-full text-xs font-bold" >
                            <span>
                              <AiFillCaretRight size={18} />
                            </span>
                            <span className="uppercase">Watch</span>
                          </a>
                        )}

                        {isVideoWatched[row.taskKey] && (
                          <button
                            onClick={() =>
                              handleCheckButtonClick(row.taskKey, row.questId)
                            }
                            className="bg-blue-500 w-20 flex justify-center py-1 font-mono rounded-full text-sm uppercase font-bold"
                          >
                            Check
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              <hr className="border-2 border-gray-50 w-2/3 mx-auto " />
            </div>
            <div className="mt-4">
              {socials &&
                socials.map((social, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between bg-black py-2 px-4 rounded-lg shadow-lg">
                      <div className="flex items-center">
                      <img className="w-12 h-12 mr-4" src= {social.icon} alt="" />
                        <h3 className="text-sm uppercase">{social.title}</h3>
                      </div>
                      {/* Conditional rendering based on follow status */}
                      {!hasFollowed[social.taskKey] &&
                        !followed[social.taskKey] && (
                          <a
                            href={social.socialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              handleFollowButtonClick(social.taskKey)
                            }
                            className="bg-white text-black px-2 py-1 font-mono rounded-full w-20 flex justify-center text-xs font-bold"
                          >
                            <span>
                              <AiFillCaretRight size={18} />
                            </span>
                            <span className="uppercase">Follow</span>
                          </a>
                        )}
                      {!hasFollowed[social.taskKey] &&
                        followed[social.taskKey] && (
                          <button
                            // onClick={() =>
                            //   handleCheckFollowButtonClick(
                            //     social.taskKey,
                            //     social.questId
                            //   )
                            // }
                            onClick={togglePopup}
                            className={`w-20 flex justify-center py-1 font-mono rounded-full text-sm uppercase font-bold ${
                              hasFollowed[social.taskKey]
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-500"
                            }`}
                            disabled={hasFollowed[social.taskKey]}
                          >
                            Check
                          </button>
                        )}
                      {hasFollowed[social.taskKey] && (
                        <span className="bg-green-500 text-black w-20 flex justify-center py-1 font-mono rounded-full text-xs font-bold" disabled>
                          Completed
                        </span>
                      )}
                    </div>
                    <hr className="border-2 border-white w-2/3 mx-auto" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {showPopup && <Follow
      togglePopup={togglePopup}
       handleSubmit={handleSubmit} 
       handleFileChange={handleFileChange}
       isUploading={isUploading}
       />}
    </div>
  );
}

export default Tasks;
