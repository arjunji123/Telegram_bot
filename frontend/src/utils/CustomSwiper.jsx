// Import Swiper React components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { FaRegCheckCircle } from "react-icons/fa";

const CustomSwiper = ({ banners, followed, togglePopup,
  isVideoWatched,
  handleWatchButtonClick,
  handleCheckButtonClick,
  handleFollowButtonClick,
}) => {
  console.log('banners', banners)
  return (
    <Swiper
      spaceBetween={20}
      slidesPerView={1}
      pagination={{ clickable: true }}
      className="rounded-lg shadow-lg overflow-hidden mb-4"
    >


{banners && banners.map((banner, index) => {
        // Dynamically assign taskKey to each banner
        const taskKey = `task${banner.quest_id}`;
const questId = banner.quest_id
        return (
        <SwiperSlide key={index}>

          <div className="bg-gradient-to-r from-[#c7c7c1] to-[#dbdbd1] w-full p-3 space-y-2 rounded-lg shadow-lg ">
            <div className="flex items-center">
              <img
                src={banner.image}// Replace with your logo path
                alt={banner.quest_name}
                className="h-8 w-8 rounded-full shadow-md" // Logo styling
              />
            </div>
            <div className="mt-4">
              <h1 className="text-black text-base font-bold ">
                {banner.quest_name}
              </h1>
              <p className="text-[#423d3d] text-xs font-bold">+ {parseInt(banner.coin_earn)} Coin</p>
            </div>
            <div className="flex justify-between">
              {banner.status === "completed" ?  (
                  <p className="bg-[#282828] text-white w-20 flex justify-center py-2  rounded-full text-xs font-bold">
                       <FaRegCheckCircle size={20} className="text-[#606060]"/>
                       </p>
              ) : (
                <>
                  {banner.activity === "watch" && !isVideoWatched[taskKey] && (
                    <a
                      href={banner.quest_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleWatchButtonClick(taskKey, banner.quest_url)}
                      className="bg-[#282828] text-white w-20 flex justify-center py-1.5  rounded-full text-sm font-bold"
                    >
                      <span className="">Watch</span>
                    </a>
                  )}

                  {banner.activity === "watch" && isVideoWatched[taskKey] && (
                    <button
                      onClick={() => handleCheckButtonClick(taskKey, banner.quest_id)}
                      className="bg-[#282828] text-white w-20 flex justify-center py-1.5  rounded-full text-sm font-bold"
                    >
                      Verify
                    </button>
                  )}

                  <div className="flex justify-between">
                    {banner.activity === "follow" && banner.status !== "completed" && !followed[taskKey] && (
                      <a
                        href={banner.quest_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleFollowButtonClick(taskKey)}
                        className="bg-[#282828] text-white w-20 flex justify-center py-1.5  rounded-full text-sm font-bold"
                      >
                        <span className="">Follow</span>
                      </a>
                    )}

                    {banner.activity === "follow" &&  banner.status !== "completed"  && followed[taskKey] && (
                      <button
                      onClick={() =>
                        togglePopup(
                          taskKey,
                          questId,                                   
                          )                                 
                        }// Or replace with handleCheckFollowButtonClick if needed
                        className={` text-white w-20 flex justify-center py-1.5  rounded-full text-sm font-bold ${banner.status !== "completed"[taskKey] ? "bg-gray-400 cursor-not-allowed" : "bg-[#282828]"
                          }`}
                        disabled={banner.status !== "completed"[taskKey]}
                      >
                        Verify
                      </button>
                    )}

                    {banner.activity === "follow" && banner.status === "completed" && (
                       <p className="bg-[#282828] text-white w-20 flex justify-center py-2  rounded-full text-xs font-bold">
                       <FaRegCheckCircle size={20} className="text-[#606060]"/>
                       </p>
                    )}
                  </div>


                </>
              )}
            </div>

          </div>
        </SwiperSlide>
       );
      })}
    </Swiper>
  );
};

export default CustomSwiper;
