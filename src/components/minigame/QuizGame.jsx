import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import QuizGame from "../../assets/images/QuizGame.jpg"; // 기본 이미지 필요
import minigame from "../../assets/images/minigame.jpg"; // 소비트렌드 이미지
import CropQuiz from "../../assets/images/CropQuiz.jpg"; // 가격예측 이미지

const QuizGameMain = () => {
  const [hoveredContent, setHoveredContent] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const contentMap = useMemo(
    () => ({
      minigame: {
        image: minigame,
      },
      CropQuiz: {
        image: CropQuiz,
      },
    }),
    []
  );

  const handleMouseEnter = (content) => {
    setHoveredContent(content);
  };

  const handleTitleHover = () => {
    setHoveredContent(null);
  };

  // 이미지 프리로딩
  useEffect(() => {
    const preloadImages = () => {
      const imagePromises = Object.values(contentMap).map((content) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = content.image;
          img.onload = resolve;
          img.onerror = resolve;
        });
      });

      Promise.all(imagePromises).then(() => {
        setImagesLoaded(true);
      });
    };

    preloadImages();
  }, [contentMap]);

  return (
    <div className="w-full h-[700px] overflow-hidden relative">
      {/* 배경 이미지 */}
      <div className="relative h-[700px] bg-cover bg-center">
        {imagesLoaded ? (
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
          >
            <img
              src={hoveredContent ? contentMap[hoveredContent].image : QuizGame}
              alt={hoveredContent || "기본 이미지"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full bg-white">
            <h2 className="text-2xl text-gray-500">이미지 로딩 중...</h2>
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="absolute inset-0 flex flex-col">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
            <div className="text-center mt-60 md:mt-40">
              <h1
                className="text-4xl text-white mb-4 select-none tracking-widest drop-shadow-xl"
                onMouseEnter={handleTitleHover}
              >
                미니 게임
              </h1>
              <div className="w-24 h-1 bg-white mx-auto rounded-full mb-12 opacity-80"></div>
            </div>

            {/* 중앙 텍스트 */}
            <div className="text-center flex items-start justify-center mt-20 md:mt-0 absolute top-1/3 left-0 right-0">
              <h2 className="text-3xl text-white tracking-wider select-none max-w-4xl mx-auto px-4">
                {!hoveredContent
                  ? "재배 시뮬레이션과 퀴즈를 작물에 대한 견해를 늘려보세요."
                  : hoveredContent === "minigame"
                  ? "재배 시뮬레이션을 사용하여 직접 농부가 되어보세요."
                  : hoveredContent === "CropQuiz"
                  ? "작물 퀴즈를 통해 작물에 대한 지식을 시험해보세요."
                  : ""}
              </h2>
            </div>

            {/* 하단 버튼 그룹 컨테이너 */}
            <div className="absolute bottom-0 md:bottom-24 left-0 right-0 h-[300px]">
              <div className="grid grid-cols-2 gap-12 px-4 max-w-4x1 mx-auto w-full md:w-[600px] h-[10rem] mt-20">
                {/* 미니게임 카드 */}
                <Link to="/minigame">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onMouseEnter={() => handleMouseEnter("minigame")}
                    className="bg-white/90 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full h-full"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-2xl mb-2 text-center">🎮</div>
                      <h3 className="text-lg font-semibold text-gray-900 text-center">
                        재배 시뮬레이션
                      </h3>
                    </div>
                  </motion.div>
                </Link>

                {/* 퀴즈 카드 */}
                <Link to="/CropQuiz ">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onMouseEnter={() => handleMouseEnter("CropQuiz")}
                    className="bg-white/90 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full h-full"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-2xl mb-2 text-center">💡</div>
                      <h3 className="text-lg font-semibold text-gray-900 text-center">
                        작물 퀴즈
                      </h3>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGameMain;
