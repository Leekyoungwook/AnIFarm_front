import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LuDot } from "react-icons/lu";
import { Link } from "react-router-dom";
import anifarmw from "../../assets/main/anifarmw.png";

const Home = () => {
  const [currentView, setCurrentView] = useState("home");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentView === "home") {
        setCurrentView("test6");
      } else if (currentView === "test6") {
        setCurrentView("test7");
      } else {
        setCurrentView("home");
      }
    }, 5000); // 5초 후 다음 화면으로 변경

    return () => clearTimeout(timer);
  }, [currentView]);

  const handleDotClick = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="w-full h-[700px] overflow-hidden relative">
      {currentView === "home" && (
        <motion.div
          className="relative h-[700px] bg-cover bg-center"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            scale: {
              duration: 1.8,
            },
          }}
          style={{
            backgroundImage: `url('https://cdn.pixabay.com/photo/2016/09/21/04/46/barley-field-1684052_1280.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
              <div className="text-white text-center">
                <img src={anifarmw} alt="AnI Farm" className="h-80 mx-auto mb-8" />
                <p className="text-xl mb-2">
                  AI로 심고, 데이터로 키우는 당신을 위한 smart한 농사의 시작
                </p>
                <p className="text-xl">
                  지혜가 모이고 소통하는 공간, 함께 키워가는 AI 농업 커뮤니티
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {currentView === "test6" && (
        <motion.div
          className="relative h-[700px] bg-cover bg-center"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            scale: {
              duration: 1.8,
            },
          }}
          style={{
            backgroundImage: `url('https://cdn.pixabay.com/photo/2021/10/19/09/42/field-6723115_1280.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
              <div className="text-white text-center">
                <h1 className="text-4xl font-bold mb-4">
                  <Link to="/culture" className="hover:text-gray-300 transition-colors duration-300">
                    재배하기
                  </Link>
                </h1>
                <div className="w-24 h-1 bg-white mx-auto rounded-full mb-8 opacity-80"></div>
                <p className="text-xl mb-2">
                  재배하기는 다양한 농업 정보를 제공합니다.
                </p>
                <p className="text-xl">
                  작물 육성법, 병충해 이미지 분석 , 날씨 정보, 그리고 농업 커뮤니티를 통해 함께 성장하세요.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {currentView === "test7" && (
        <motion.div
          className="relative h-[700px] bg-cover bg-center"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            scale: {
              duration: 1.8,
            },
          }}
          style={{
            backgroundImage: `url('https://cdn.pixabay.com/photo/2012/10/15/12/32/wicker-61260_1280.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
              <div className="text-white text-center">
                <h1 className="text-4xl font-bold mb-4">
                  <Link to="/sale" className="hover:text-gray-300 transition-colors duration-300">
                    판매하기
                  </Link>
                </h1>
                <div className="w-24 h-1 bg-white mx-auto rounded-full mb-8 opacity-80"></div>
                <p className="text-xl mb-2">
                  농산물 판매를 위한 데이터 분석과 AI 기반 가격 예측을 통해 최적의 판매 시기를 찾으세요.
                </p>
                <p className="text-xl">
                  실시간 소비자 트렌드와 선호도를 분석하고, 커뮤니티에서 직거래를 시작해보세요.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {/* z-0  */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-4 z-0">
        <div className="p-2 bg-transparent border-2 border-white rounded-full flex space-x-4">
          <button
            onClick={() => handleDotClick("home")}
            className={`text-3xl ${currentView === "home" ? "text-white" : "text-gray-400"}`}
          >
            <LuDot />
          </button>
          <button
            onClick={() => handleDotClick("test6")}
            className={`text-3xl ${currentView === "test6" ? "text-white" : "text-gray-400"}`}
          >
            <LuDot />
          </button>
          <button
            onClick={() => handleDotClick("test7")}
            className={`text-3xl ${currentView === "test7" ? "text-white" : "text-gray-400"}`}
          >
            <LuDot />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
