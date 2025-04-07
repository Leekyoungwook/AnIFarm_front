import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import sales from "../../assets/images/sales.jpg"; // 기본 이미지 필요
import trend from "../../assets/images/trend.jpg"; // 소비트렌드 이미지
import prediction from "../../assets/images/prediction.jpg"; // 가격예측 이미지
import community from "../../assets/images/community.png"; // 커뮤니티 이미지
import market from "../../assets/images/market.jpg"; // 오늘의 가격 이미지 추가
import business from "../../assets/images/Business.jpg"; // 경영모의계산 이미지 추가해야함
import support from "../../assets/images/support.png"; // 교육&지원 이미지

const Sale = () => {
  const [hoveredContent, setHoveredContent] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const contentMap = useMemo(
    () => ({
      market: {
        image: market,
      },
      trend: {
        image: trend,
      },
      prediction: {
        image: prediction,
      },
      community: {
        image: community,
      },
      business: {
        image: business,
      },
      support: {
        image: support,
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
              src={hoveredContent ? contentMap[hoveredContent].image : sales}
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
            {/* 상단 제목 */}
            <div className="text-center mt-48 md:mt-48 mt-8">
              <h1
                className="text-4xl md:text-4xl text-2xl text-white mb-4 select-none tracking-widest drop-shadow-xl"
                onMouseEnter={handleTitleHover}
              >
                판매하기
              </h1>
              <div className="w-24 h-1 bg-white mx-auto rounded-full mb-12 opacity-80"></div>
            </div>

            {/* 중앙 텍스트 */}
            <div className="text-center flex items-start justify-center mt-4 md:mt-16 md:absolute md:top-1/3 relative left-0 right-0">
              <h2 className="text-xl md:text-3xl text-white tracking-wider select-none max-w-4xl mx-auto px-4">
                {!hoveredContent
                  ? "농산물 판매를 위한 데이터 분석"
                  : hoveredContent === "market"
                  ? "실시간으로 업데이트되는 오늘의 농산물 가격을 확인하세요"
                  : hoveredContent === "trend"
                  ? "실시간 소비자 트렌드와 선호도를 분석해보세요"
                  : hoveredContent === "prediction"
                  ? "AI 기반 농산물 가격 예측으로 최적의 판매 시기를 찾아보세요"
                  : hoveredContent === "community"
                  ? "농산물 판매 커뮤니티에서 직거래를 시작해보세요"
                  : hoveredContent === "business"
                  ? "경영 모의계산을 통해 최적의 경영 방법을 찾아보세요"
                  : hoveredContent === "support"
                  ? "농업인을 위한 교육 및 지원 프로그램을 확인해보세요"
                  : "판매하기에 관한 내용"}
              </h2>
            </div>

            {/* 하단 버튼 그룹 */}
            <div className="relative md:absolute bottom-0 md:bottom-24 left-0 right-0 mt-8 md:mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4 max-w-4xl mx-auto">
                {/* 오늘의 가격 카드 */}
                <Link to="/Today">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onMouseEnter={() => handleMouseEnter("market")}
                    className="bg-white/90 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full"
                  >
                    <div className="p-4">
                      <div className="text-2xl mb-2 text-center">💹</div>
                      <h3 className="text-lg font-semibold text-gray-900 text-center">
                        오늘의 가격
                      </h3>
                    </div>
                  </motion.div>
                </Link>

                {/* 소비트렌드 카드 */}
                <Link to="/pricingInformation">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onMouseEnter={() => handleMouseEnter("trend")}
                    className="bg-white/90 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full"
                  >
                    <div className="p-4">
                      <div className="text-2xl mb-2 text-center">📊</div>
                      <h3 className="text-lg font-semibold text-gray-900 text-center">
                        소비트렌드
                      </h3>
                    </div>
                  </motion.div>
                </Link>

                {/* 가격예측 카드 */}
                <Link to="/SalsesInformation">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onMouseEnter={() => handleMouseEnter("prediction")}
                    className="bg-white/90 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full"
                  >
                    <div className="p-4">
                      <div className="text-2xl mb-2 text-center">💰</div>
                      <h3 className="text-lg font-semibold text-gray-900 text-center">
                        가격예측
                      </h3>
                    </div>
                  </motion.div>
                </Link>

                {/* 경영모의계산 카드 */}
                <Link to="/business-simulation">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onMouseEnter={() => handleMouseEnter("business")}
                    className="bg-white/90 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full"
                  >
                    <div className="p-4">
                      <div className="text-2xl mb-2 text-center">💼</div>
                      <h3 className="text-lg font-semibold text-gray-900 text-center">
                        경영 모의계산
                      </h3>
                    </div>
                  </motion.div>
                </Link>
                
                {/* 교육&지원 카드 */}
                <Link to="/support">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onMouseEnter={() => handleMouseEnter("support")}
                    className="bg-white/90 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full"
                  >
                    <div className="p-4">
                      <div className="text-2xl mb-2 text-center">🎓</div>
                      <h3 className="text-lg font-semibold text-gray-900 text-center">
                        교육&지원
                      </h3>
                    </div>
                  </motion.div>
                </Link>

                {/* 커뮤니티 카드 */}
                <Link to="/community/marketplace">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onMouseEnter={() => handleMouseEnter("community")}
                    className="bg-white/90 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full"
                  >
                    <div className="p-4">
                      <div className="text-2xl mb-2 text-center">👥</div>
                      <h3 className="text-lg font-semibold text-gray-900 text-center">
                        커뮤니티
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

export default Sale;
