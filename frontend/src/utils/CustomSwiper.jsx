// Import Swiper React components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { AiFillCaretRight } from "react-icons/ai";

const CustomSwiper = ({ banners, followed, togglePopup,
  completedTasks,
  isVideoWatched,
  hasFollowed,
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
      {/* <SwiperSlide>
      <div className="bg-gradient-to-r from-[#c7c7c1] to-[#dbdbd1] w-full p-3 space-y-2 rounded-lg shadow-lg ">
        <div className="flex items-center">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlrWcBG3SebWTLiMtYf1YBzrZ-dyD9B2LHqiJScut64HP7qbEj0oAJw-JHiCkf9HD2NHI&usqp=CAU" // Replace with your logo path
            alt="Logo"
            className="h-10 w-10 rounded-full shadow-md" // Logo styling
          />
        </div>
        <div className="mt-4">
          <h1 className="text-black text-base font-bold ">
            MemeFi Quest Round 1
          </h1>
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
    </SwiperSlide> */}

      {banners && banners.map((banner, index) => (
        <SwiperSlide key={index}>

          <div className="bg-gradient-to-r from-[#c7c7c1] to-[#dbdbd1] w-full p-3 space-y-2 rounded-lg shadow-lg ">
            <div className="flex items-center">
              <img
                src={banner.image}// Replace with your logo path
                alt={banner.quest_name}
                className="h-10 w-10 rounded-full shadow-md" // Logo styling
              />
            </div>
            <div className="mt-4">
              <h1 className="text-black text-base font-bold ">
                {banner.quest_name}
              </h1>
              <p className="text-[#423d3d] text-xs font-bold">+{banner.points} BP</p>
            </div>
            <div className="flex justify-between">
              {completedTasks[banner.taskKey] ? (
                <span className="bg-green-500 text-black w-20 flex justify-center py-1 font-mono rounded-full text-xs font-bold">
                  Completed
                </span>
              ) : (
                <>
                  {banner.activity === "watch" && !isVideoWatched[banner.taskKey] && (
                    <a
                      href={banner.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleWatchButtonClick(banner.taskKey, banner.videoUrl)}
                      className="bg-black text-white w-20 flex justify-center py-1 font-mono rounded-full text-xs font-bold"
                    >
                      <span className="uppercase">Watch</span>
                    </a>
                  )}

                  {banner.activity === "watch" && isVideoWatched[banner.taskKey] && (
                    <button
                      onClick={() => handleCheckButtonClick(banner.taskKey, banner.quest_id)}
                      className="bg-blue-500 w-20 flex justify-center py-1 font-mono rounded-full text-xs font-bold"
                    >
                      Check
                    </button>
                  )}

                  <div className="flex justify-between">
                    {banner.activity === "follow" && !hasFollowed[banner.taskKey] && !followed[banner.taskKey] && (
                      <a
                        href={banner.quest_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleFollowButtonClick(banner.taskKey)}
                        className="bg-black text-white px-2 py-1 font-mono rounded-full w-20 flex justify-center text-xs font-bold"
                      >
                        <span className="uppercase">Follow</span>
                      </a>
                    )}

                    {banner.activity === "follow" && !hasFollowed[banner.taskKey] && followed[banner.taskKey] && (
                      <button
                        onClick={togglePopup} // Or replace with handleCheckFollowButtonClick if needed
                        className={`w-20 flex justify-center py-1 font-mono rounded-full text-sm uppercase font-bold ${hasFollowed[banner.taskKey] ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
                          }`}
                        disabled={hasFollowed[banner.taskKey]}
                      >
                        Check
                      </button>
                    )}

                    {banner.activity === "follow" && hasFollowed[banner.taskKey] && (
                      <span className="bg-green-500 text-black w-20 flex justify-center py-1 font-mono rounded-full text-xs font-bold" disabled>
                        Completed
                      </span>
                    )}
                  </div>




                </>
              )}
            </div>

          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CustomSwiper;
