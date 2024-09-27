import React, { useState, useEffect } from "react";

const rewards = [
  { day: 1, amount: "5 Rs." },
  { day: 2, amount: "5 Rs." },
  { day: 3, amount: "5 Rs." },
  { day: 4, amount: "5 Rs." },
  { day: 5, amount: "5 Rs." },
  { day: 6, amount: "5 Rs." },
  { day: 7, amount: "5 Rs." },
  { day: 8, amount: "5 Rs." },
  { day: 9, amount: "5 Rs." },
  { day: 10, amount: "5 Rs." },
];

const DailyRewards = ({ togglePopup }) => {
  const [currentDay, setCurrentDay] = useState(1);
  const [claimed, setClaimed] = useState(Array(10).fill(false));
  const [lastClaimTime, setLastClaimTime] = useState(null);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const storedDay = parseInt(localStorage.getItem("currentDay"), 10);
    const storedClaimed = JSON.parse(localStorage.getItem("claimed"));
    const storedLastClaimTime = localStorage.getItem("lastClaimTime");

    if (storedDay && storedClaimed) {
      setCurrentDay(storedDay);
      setClaimed(storedClaimed);
      setLastClaimTime(
        storedLastClaimTime ? new Date(storedLastClaimTime) : null
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("currentDay", currentDay);
    localStorage.setItem("claimed", JSON.stringify(claimed));
    if (lastClaimTime) {
      localStorage.setItem("lastClaimTime", lastClaimTime.toISOString());
    }
  }, [currentDay, claimed, lastClaimTime]);

  const handleClaim = (day) => {
    const now = new Date();
    if (day <= currentDay && !claimed[day - 1]) {
      if (day === 1 || canClaimReward()) {
        setClaimed((prev) => {
          const newClaimed = [...prev];
          newClaimed[day - 1] = true;
          return newClaimed;
        });
        setCurrentDay((prev) => prev + 1);
        setLastClaimTime(now);
        alert(`${rewards[day - 1].amount} coins added`);
        updateNotification();
      }
    }
  };

  const canClaimReward = () => {
    if (!lastClaimTime) return true;
    const now = new Date();
    const timeDifference = now - new Date(lastClaimTime);
    return timeDifference >= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  };

  const updateNotification = () => {
    const nextDay = currentDay + 1;

    // Notification for the next claimable day
    if (nextDay <= rewards.length) {
      if (!claimed[nextDay - 1]) {
        if (canClaimReward()) {
          setNotification(`You can claim Day ${nextDay} reward now.`);
        } else {
          setNotification(
            `You can claim Day ${nextDay} reward after 24 hours.`
          );
        }
      }
    }

    // Future days notifications
    // for (let day = nextDay + 1; day <= rewards.length; day++) {
    //   if (!claimed[day - 1]) {
    //     setNotification(`Day ${day} reward can be claimed in the future.`);
    //   }
    // }
  };

  const handleClick = (day) => {
    if (day <= currentDay) {
      if (claimed[day - 1]) {
        alert("Reward already claimed.");
      } else {
        handleClaim(day);
      }
    } else {
      setNotification("This reward can be claimed in the future.");
    }
  };

  const getItemClassName = (day) => {
    if (claimed[day - 1]) return "reward-item claimed";
    if (day === currentDay) return "reward-item current";
    return "reward-item";
  };

  useEffect(() => {
    updateNotification();
  }, [currentDay, claimed]);

  return (
    <div className="daily-rewards-popup">
      <div className="daily-rewards-content">
        <button className="close-btn" onClick={togglePopup}>
          X
        </button>
        <h2>Daily Rewards</h2>
        <div className="rewards-list">
          {rewards.map((reward) => (
            <div
              key={reward.day}
              className={getItemClassName(reward.day)}
              onClick={() => handleClick(reward.day)}
            >
              <span>Day {reward.day}</span>
              <span>{reward.amount}</span>
            </div>
          ))}
        </div>
        <div className="notification">{notification}</div>
        <button
          className="claim-btn"
          onClick={() => handleClaim(currentDay)}
          disabled={!canClaimReward() && currentDay !== 1}
        >
          Claim Reward
        </button>
      </div>
    </div>
  );
};

export default DailyRewards;
