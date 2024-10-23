// Import Swiper React components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";

const CustomSwiper = () => {
  return (
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
          <h1 className="text-black text-base font-bold ">
            Subscribe to Blum Telegram{" "}
          </h1>
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
  );
};

export default CustomSwiper;
