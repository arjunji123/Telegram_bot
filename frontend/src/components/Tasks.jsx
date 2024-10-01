import React, { useState } from "react";
import rupees from "../Img/rupees.png";
import DailyRewards from "../components/DailyRewards";
import Youtube from "../Img/youtube.png";
import Telegram from "../Img/telegram.png";
import Instagram from "../Img/instagram.png";
import X from "../Img/x.png";
import tick from "../images/blue.png";
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
      img: Youtube,
      title: "YOUTUBE VIDEO - 1",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      taskKey: "task1",
    },
    {
      img: Youtube,
      title: "YOUTUBE VIDEO - 1",
      videoUrl: "https://www.youtube.com/watch?v=abcd1234",
      taskKey: "task2",
    },
    // Add more rows as needed
  ];

  const socials = [
    {
      img: Youtube,
      title: "SUBSCRIBE ON YOOUTUBE",
      socialUrl: "https://www.youtube.com/",
    },
    {
      img: Telegram,
      title: "Follow on Telegram",
      socialUrl: "https://web.telegram.org/k/",
    },
    {
      img: X,
      title: "Follow on X",
      socialUrl: "https://x.com/X",
    },
    {
      img: Instagram,
      title: "Follow on Instagram",
      socialUrl: "https://www.instagram.com/",
    },
  ];

  return (
    <div className="bg-white min-h-screen flex justify-center text-white">
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <div className="mt-4 bg-[#f3ba2f] rounded-t-[48px] relative">
          <div className="absolute inset-0 bg-[#1d2025] rounded-t-[46px]">
            <div className="px-6 py-4">
              <div className="flex justify-center py-4 ">
                <h1 className="font-poppins">UNITRADE</h1>
                <img src={tick} alt="" style={{ width: "20px" }} />
              </div>
              <p className="text-left mt-6 text-xl font-poppins">EARN</p>
              <h1 className="text-center text-3xl text-white shadow-lg font-bold font-poppins">
                COIN QUESTS 0/10
              </h1>

              <div className="space-y-4 mt-6">
                {rows.map((row, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-black p-4 rounded-lg shadow-lg font-poppins "
                  >
                    <div className="flex items-center font-poppins">
                      <img
                        src={row.img}
                        alt="youtube"
                        className="w-12 h-12 mr-4"
                      />
                      <h3 className="text-lg font-poppins">{row.title}</h3>
                    </div>
                    {!hasWatched[row.taskKey] &&
                      !isVideoWatched[row.taskKey] && (
                        <a
                          href={row.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleWatchButtonClick(row.taskKey)}
                          className="bg-white text-black px-4 py-2 rounded-lg font-poppins"
                        >
                          Watch
                        </a>
                      )}
                    {!hasWatched[row.taskKey] &&
                      isVideoWatched[row.taskKey] && (
                        <button
                          onClick={() => handleCheckButtonClick(row.taskKey)}
                          className="bg-blue-500 c px-4 py-2 rounded-lg font-poppins"
                        >
                          Check
                        </button>
                      )}
                    {hasWatched[row.taskKey] && (
                      <p className="text-green-500">Completed</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-4 mt-4">
                {socials.map((social, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-black-900 p-4 rounded-lg shadow-lg"
                  >
                    <div className="flex items-center">
                      <img
                        src={social.img}
                        alt={social.title}
                        className="w-12 h-12 mr-4"
                      />
                      <h3 className="text-lg">{social.title}</h3>
                    </div>
                    <a
                      href={social.socialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-black px-4 py-2 rounded-lg"
                    >
                      Follow
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tasks;
