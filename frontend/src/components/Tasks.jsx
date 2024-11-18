import React, { useState, useEffect } from "react";
import Logo from "../utils/Logo";
import Loader from '../components/Loader';
import { FaRegCheckCircle } from "react-icons/fa";
import Follow from "../utils/Follow";
import CustomSwiper from '../utils/CustomSwiper';
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import { fetchAPIData, fetchQuestHistory } from "../../store/actions/homeActions";
import { BACKEND_URL } from "../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the toastify CSS
import axios from "axios";

function Tasks() {
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data.apiquests);
  const apiQuests = apiData?.quests || [];
  const questHistory = useSelector((state) => state.apiData.data);
  const quest = questHistory?.quest?.quests
  // console.log(quest);
  const [loading, setLoading] = useState(true);
  const [watchTimes, setWatchTimes] = useState({});
  const [videoDurations, setVideoDurations] = useState({});
  const [hasWatched, setHasWatched] = useState({});
  const [isVideoWatched, setIsVideoWatched] = useState({});
  const [followed, setFollowed] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [activeTaskKey, setActiveTaskKey] = useState(null);
  const [activeQuestId, setActiveQuestId] = useState(null);
  const togglePopup = (taskKey, questId) => {
    setShowPopup(!showPopup);
    setActiveTaskKey(taskKey);
    setActiveQuestId(questId);
  };
  const handleFileChange = (e) => {
    setScreenshot(e.target.files[0]); // Capture screenshot
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchAPIData("apiQuests")); // Additional API call (if needed)
        await dispatch(fetchQuestHistory());

        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Set loading to false in case of an error
      }
    };

    fetchData();
  }, [dispatch]);
  const bannerQuests = quest && quest.filter(quest => quest.quest_type === "banner");
  const nonBannerQuests = quest && quest.filter(quest => quest.quest_type === "non-banner");
  console.log(nonBannerQuests, "nonBannerQuestsnonBannerQuests");

  const rows = nonBannerQuests && nonBannerQuests.filter((quest) => quest.activity === "watch").map((quest, index) => ({
    taskKey: `task${quest.quest_id}`, // Unique keys
    questId: quest.quest_id, // Add quest_id here
    title: quest.quest_name,
    icon: quest.image,
    videoUrl: quest.quest_url,
    coin: quest.coin_earn,
    status: quest.status
  }));
  const handleWatchButtonClick = async (task, videoUrl) => {

    try {
      setWatchTimes(prev => ({ ...prev, [task]: Date.now() }));
      setIsVideoWatched(prev => ({ ...prev, [task]: true }));
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
      const remainingTime = Math.max(requiredDuration - timeSpent, 0);
      // Convert remaining time to minutes and seconds
      const remainingMinutes = Math.floor(remainingTime / 60); // Get the minutes
      const remainingSeconds = Math.floor(remainingTime % 60); // Get the seconds

      // Format the time as 'minutes:seconds'
      const formattedTime = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      // console.log('formattedTime', formattedTime)
      toast(`You need to watch the video for ${formattedTime} minute more.`);
      setIsVideoWatched(prev => ({ ...prev, [task]: false }));
    }
  };

  const completeQuest = async (questId, task) => {
    // console.log("questIdquestId",questId);

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
      toast("Task Completed!");
    } catch (error) {
      toast.error(`Error completing task: ${error.message}`);
      console.error("Error completing quest:", error);
    }
  };
  const socials = nonBannerQuests && nonBannerQuests.filter((quest) => quest.activity === "follow").map((quest, index) => ({
    taskKey: `task${quest.quest_id}`, // Unique keys
    questId: quest.quest_id,
    title: quest.quest_name,
    icon: quest.image,
    socialUrl: quest.quest_url,
    coin: quest.coin_earn,
    status: quest.status
  }));

  const handleFollowButtonClick = (task) => {
    setFollowed({
      ...followed,
      [task]: Date.now(),
    });
  };
  const handleSubmit = async (task, questId) => {
    console.log("questIdquestId", questId);

    // Basic validations
    if (!screenshot) {
      toast('Please upload a screenshot!');
      return;
    }

    if (!questId) {
      toast('Quest ID is required!');
      return;
    }

    if (!task) {
      toast('Task ID is required!');
      return;
    }

    try {
      setIsUploading(true);

      // Retrieve the token from localStorage
      const tokenData = localStorage.getItem("user");
      if (!tokenData) {
        throw new Error("No token data found in localStorage");
      }

      const parsedTokenData = JSON.parse(tokenData);
      const token = parsedTokenData.token;

      if (!token) {
        throw new Error("Token not found");
      }

      // 1. Upload the screenshot
      const formData = new FormData();
      formData.append('screenshot', screenshot);

      await axios.post(
        `${BACKEND_URL}/api/v1/upload-quest-screenshot/${questId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token here
          },
        }
      );

      // 2. Complete the follow quest (your function logic)
      // const response = await fetch(`${BACKEND_URL}/api/v1/api-quests/complete-quest`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({ quest_id: questId }), // Pass questId for completing the quest
      // });

      // if (!response.ok) {
      //   throw new Error(`Error: ${response.status} ${response.statusText}`);
      // }

      // Mark as completed and update UI
      setFollowed(true);
      setShowPopup(false); // Close the pop-up
      toast("Follow Task Completed!");

    } catch (error) {
      console.error("Error completing follow quest:", error);
      toast.error("Error completing follow quest: " + error.message);
    } finally {
      setIsUploading(false); // Set uploading state to false
    }
  };

  // const handleSubmit = async (task, questId) => {
  //   console.log("questIdquestId", questId);

  //   // Basic validations
  //   if (!screenshot) {
  //     toast('Please upload a screenshot!');
  //     return;
  //   }

  //   if (!questId) {
  //     toast('Quest ID is required!');
  //     return;
  //   }

  //   if (!task) {
  //     toast('Task ID is required!');
  //     return;
  //   }

  //   try {
  //     setIsUploading(true);

  //     // 1. Upload the screenshot
  //     const formData = new FormData();
  //     formData.append('screenshot', screenshot);

  //     await axios.post(`${BACKEND_URL}/api/v1/upload-quest-screenshot/${questId}`, formData);

  //     // 2. Complete the follow quest (your function logic)
  //     const tokenData = localStorage.getItem("user");
  //     if (!tokenData) {
  //       throw new Error("No token data found in localStorage");
  //     }

  //     const parsedTokenData = JSON.parse(tokenData);
  //     const token = parsedTokenData.token;

  //     if (!token) {
  //       throw new Error("Token not found");
  //     }

  //     // Completing the quest API call
  //     const response = await fetch(`${BACKEND_URL}/api/v1/api-quests/complete-quest`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ quest_id: questId }), // Pass questId for completing the quest
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Error: ${response.status} ${response.statusText}`);
  //     }
  //     // Mark as completed and update UI
  //     setFollowed(true);
  //     setShowPopup(false); // Close the pop-up
  //     toast("Follow Task Completed!");

  //   } catch (error) {
  //     console.error("Error completing follow quest:", error);
  //     toast.error("Error completing follow quest: " + error.message);
  //   } finally {
  //     setIsUploading(false); // Set uploading state to false
  //   }
  // };


  // if (loading) {
  //   return <Loader />;
  // }
  return (
    <div className="bg-white flex justify-center min-h-screen font-poppins">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
      {loading && (
        <Loader />
      )
      }
      <div className="w-full bg-black text-white flex flex-col max-w-lg   ">
        <div className="flex-grow mb-4 relative z-0">
          <div className=" px-2 py-6 h-full z-10">
            <Logo />
            <p className="text-left mt-6 text-lg font-extrabold font-poppins ml-2">
              EARN
            </p>

            {bannerQuests && bannerQuests.length > 0 && <CustomSwiper banners={bannerQuests}
              isVideoWatched={isVideoWatched}
              handleWatchButtonClick={handleWatchButtonClick}
              handleCheckButtonClick={handleCheckButtonClick}
              handleFollowButtonClick={handleFollowButtonClick}
              followed={followed}
              togglePopup={togglePopup}
            />}
            <h1 className="text-center text-2xl text-white shadow-lg font-bold font-poppins mt-4">
              {" "}

              COIN QUESTS 0/10
            </h1>
            <div className="overflow-y-auto max-h-[70vh] mb-2">
              <div className="mt-4">
                {rows &&
                  rows.map((row, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-black py-2 px-4 font-poppins"
                    >
                      <div className="flex items-center">
                        <img className="w-8 h-8 mr-4" src={row.icon} alt="" />

                        <div>
                          <h3 className="text-sm capitalize  text-white font-bold">{row.title}</h3>
                          <p className="text-xs capitalize  text-white font-semibold">+ {parseInt(row.coin)} Coin</p>
                        </div>
                      </div>

                      {/* If task is completed, show 'Completed' message */}
                      {row.status === "completed" ? (
                        <p className="bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-xs font-bold">
                          <FaRegCheckCircle size={20} className="text-[#606060]" />
                        </p>
                      ) : (
                        <>
                          {/* Render Watch button if the user has not started watching yet */}
                          {!watchTimes[row.taskKey] && (
                            <a
                              href={row.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleWatchButtonClick(row.taskKey, row.videoUrl)}
                              className="bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-sm font-bold"
                            >
                              <span>Watch</span>
                            </a>
                          )}

                          {/* Show Verify button only if the user has watched enough time */}
                          {watchTimes[row.taskKey] && (
                            <button
                              onClick={() => handleCheckButtonClick(row.taskKey, row.questId)}
                              className="bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-sm font-bold"
                              disabled={false} // Make sure the button is not disabled until the time is complete
                            >
                              Verify
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
                          <img className="w-8 h-8 mr-4" src={social.icon} alt="" />
                          <div>
                            <h3 className="text-sm capitalize  text-white font-bold">{social.title}</h3>
                            <p className="text-xs capitalize  text-white font-semibold">+ {parseInt(social.coin)} Coin</p>
                          </div>

                        </div>
                        {social.status === "not_completed" && !followed[social.taskKey] && (
                          <a
                            href={social.socialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleFollowButtonClick(social.taskKey)}
                            className="bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-sm font-bold"
                          >
                            <span>Follow</span>
                          </a>
                        )}
                        {social.status === "not_completed" && followed[social.taskKey] && (
                          <button
                            onClick={() => togglePopup(social.taskKey, social.questId)}
                            className={`bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-sm font-bold ${social.status === "not_completed"[social.taskKey]
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-[#282828]"
                              }`}
                          >
                            Verify
                          </button>
                        )}
                        {/* Render 'Waiting' message */}
                        {social.status === "waiting" && (
                          <p className="bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-sm font-bold">
                            <span>Waiting</span>
                          </p>
                        )}
                        {social.status === "completed" && (
                          <p className="bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-xs font-bold">
                            <FaRegCheckCircle size={20} className="text-[#606060]" />
                          </p>
                        )}

                      </div>
                      <hr className="border-2 border-white w-2/3 mx-auto" />
                    </div>
                  ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
      {showPopup && (
        <Follow
          togglePopup={() => togglePopup(null, null)}  // Pass correct taskKey and questId here if necessary
          handleSubmit={handleSubmit}
          handleFileChange={handleFileChange}
          isUploading={isUploading}
          task={activeTaskKey} // Pass task to handleSubmit
          questId={activeQuestId} // Pass questId to handleSubmit
        />
      )}

    </div>
  );
}

export default Tasks;
