import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { FaRegCheckCircle } from "react-icons/fa";

const CustomSwiper = ({
  banners,
  followed,
  togglePopup,
  isVideoWatched,
  handleWatchButtonClick,
  handleCheckButtonClick,
  handleFollowButtonClick,
}) => {
  return (
    <div className="flex justify-center items-center">
      {/* Container to center the Swiper */}
      <Swiper
        spaceBetween={14}
        slidesPerView={1.2} // Adjust to make slides not take full width
        pagination={{ clickable: true }}
        className="rounded-lg shadow-lg overflow-hidden mb-4"
      >
        {banners &&
          banners.map((banner, index) => {
            const taskKey = `task${banner.quest_id}`;
            const questId = banner.quest_id;

            // Background gradients for each slide (alternating colors)
            const gradientBackgrounds = [
              "from-gray-300 to-gray-400", // First slide
              "from-purple-400 to-purple-500", // Second slide
              "from-teal-400 to-teal-500", // Third slide
              "from-rose-400 to-rose-500", // Fourth slide
            ];
            const bgGradient =
              gradientBackgrounds[index % gradientBackgrounds.length];

            return (
              <SwiperSlide key={index}>
                <div
                  className={`bg-gradient-to-r ${bgGradient} p-4 rounded-lg shadow-lg max-w-[96%] mx-auto`}
                >
                  {/* Banner Header */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={banner.image}
                      alt={banner.quest_name}
                      className="h-10 w-10 rounded-full shadow-md"
                    />
                    <h1 className="text-black text-base font-bold">
                      {banner.quest_name}
                    </h1>
                  </div>

                  {/* Reward */}
                  <p className="text-gray-700 text-xs font-bold mt-2">
                    +{parseInt(banner.coin_earn)} Coins
                  </p>

                  {/* Actions */}
                  <div className="flex justify-between mt-4">
                    {banner.status === "completed" ? (
                          <p className="bg-[#282828] text-white w-20 flex justify-center py-2  rounded-full text-xs font-bold">
                          <FaRegCheckCircle size={20} className="text-[#606060]"/>
                          </p>
                    ) : (
                      <>
                        {/* Watch Task */}
                        {banner.activity === "watch" &&
                          !isVideoWatched[taskKey] && (
                            <a
                              href={banner.quest_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                handleWatchButtonClick(
                                  taskKey,
                                  banner.quest_url
                                )
                              }
                              className="bg-gray-900 text-white w-20 flex justify-center py-1.5 rounded-full text-sm font-bold"
                            >
                              Watch
                            </a>
                          )}

                        {banner.activity === "watch" &&
                          isVideoWatched[taskKey] && (
                            <button
                              onClick={() =>
                                handleCheckButtonClick(
                                  taskKey,
                                  banner.quest_id
                                )
                              }
                              className="bg-gray-900 text-white w-20 flex justify-center py-1.5 rounded-full text-sm font-bold"
                            >
                              Verify
                            </button>
                          )}

                        {/* Follow Task */}
                        {banner.activity === "follow" &&
                          !followed[taskKey] && (
                            <a
                              href={banner.quest_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                handleFollowButtonClick(taskKey)
                              }
                              className="bg-gray-900 text-white w-20 flex justify-center py-1.5 rounded-full text-sm font-bold"
                            >
                              Follow
                            </a>
                          )}

                        {banner.activity === "follow" &&
                          followed[taskKey] && (
                            <button
                              onClick={() => togglePopup(taskKey, questId)}
                              className="bg-gray-900 text-white w-20 flex justify-center py-1.5 rounded-full text-sm font-bold"
                            >
                              Verify
                            </button>
                          )}
                      </>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
      </Swiper>
    </div>
  );
};

export default CustomSwiper;
