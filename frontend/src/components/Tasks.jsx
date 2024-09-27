import React, { useState } from "react";
import "../Styles/Tasks.css";
import rupees from "../Img/rupees.png";
import DailyRewards from "../components/DailyRewards";
import "../Styles/DailyRewards.css";
import Youtube from "../Img/youtube.png";
import Telegram from "../Img/telegram.png";
import Instagram from "../Img/instagram.png";
import X from "../Img/x.png";

function Tasks() {
  const [showPopup, setShowPopup] = useState(false);
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

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

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
      title: "Youtube Video-1",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      taskKey: "task1",
    },
    {
      img: Youtube,
      title: "Youtube Video-2",
      videoUrl: "https://www.youtube.com/watch?v=abcd1234",
      taskKey: "task2",
    },
    // Add more rows as needed
  ];

  const socials = [
    {
      img: Youtube,
      title: "Subscribe on Youtube",
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
    <div className="bg-black flex justify-center">
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
            <div className="absolutepx-4 z-10">
              <div className=" top-[20px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
                <div className="px-4 py-2 items-center space-x-2">
                  <img src={rupees} alt="" className="mx-auto w-40 h-40" />
                </div>
                <div className="px-4 py-2 items-center space-x-2">
                  <h1
                    className="px-4 py-2 items-center space-x-2"
                    style={{
                      fontSize: 37,
                      textAlign: "center",
                      textShadow: "5px 6px 5px black",
                    }}
                  >
                    Earn more coins
                  </h1>
                </div>
                <div className="px-4 py-2 items-center space-x-2">
                  <p style={{ textAlign: "left" }}>Watch Video on Youtube</p>
                </div>
                <div className="tasks-container">
                  {rows.map((row, index) => (
                    <div key={index} className="task-row">
                      <div
                        className="task-info"
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <img
                          src={row.img}
                          alt="image"
                          style={{ marginRight: "10px", width: "71px" }}
                        />
                        <h3>{row.title}</h3>
                        <p>{row.description}</p>
                      </div>
                      {!hasWatched[row.taskKey] &&
                        !isVideoWatched[row.taskKey] && (
                          <a
                            href={row.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleWatchButtonClick(row.taskKey)}
                          >
                            <button className="task-button">Video Watch</button>
                          </a>
                        )}
                      {!hasWatched[row.taskKey] &&
                        isVideoWatched[row.taskKey] && (
                          <button
                            className="task-button"
                            onClick={() => handleCheckButtonClick(row.taskKey)}
                          >
                            Check
                          </button>
                        )}
                      {hasWatched[row.taskKey] && <p>Task Completed!</p>}
                    </div>
                  ))}
                </div>
                <div className="tasks">
                  <div className="px-4 mt-6 flex justify-between gap-2">
                    <div className="daily rounded-lg px-4 py-2 h-20 w-full relative flex justify-between items-center">
                      <span className="text-white">Daily Rewards</span>
                      <button className="btn" onClick={togglePopup}>
                        Show Rewards
                      </button>
                    </div>
                  </div>
                  {showPopup && <DailyRewards togglePopup={togglePopup} />}
                </div>
                <br />
                <div className="px-4 py-2 items-center space-x-2">
                  <p style={{ textAlign: "left" }}>Tasks List</p>
                </div>

                <div className="tasks-container">
                  {socials.map((social, index) => (
                    <div key={index} className="task-row">
                      <div
                        className="task-info"
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <img
                          src={social.img}
                          alt="image"
                          style={{ marginRight: "10px", width: "71px" }}
                        />
                        <div>
                          <h3 style={{ margin: 0 }}>{social.title}</h3>
                          <p style={{ margin: 0 }}>{social.description}</p>
                        </div>
                      </div>
                      <a
                        href={social.socialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="task-button">Follow</button>
                      </a>
                    </div>
                  ))}
                </div>
                <br />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tasks;
