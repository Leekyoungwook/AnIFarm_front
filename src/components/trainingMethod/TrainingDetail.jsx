import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { cropData } from "./TrainData";

const TrainingDetail = () => {
  const location = useLocation();
  // URL에서 cropId 파라미터 추출
  const searchParams = new URLSearchParams(location.search);
  const cropId = searchParams.get("cropId");

  // 스크롤 초기화: 컴포넌트가 마운트될 때 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
    // 또는 부드러운 스크롤 효과를 원하면 아래와 같이 사용:
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Memoize the sorted crop entries to ensure stable reference
  const sortedCropEntries = useMemo(() => {
    return Object.entries(cropData).sort((a, b) =>
      a[1].name.localeCompare(b[1].name, "ko")
    );
  }, [cropData]);

  // cropId에 해당하는 인덱스 찾기
  const initialIndex = sortedCropEntries.findIndex(([key]) => key === cropId);
  const [currentIndex, setCurrentIndex] = useState(
    initialIndex !== -1 ? initialIndex : 0
  );
  const [isVisible, setIsVisible] = useState(true);

  // 현재 선택된 작물이 유효한지 확인하는 함수
  const getCurrentCrop = () => {
    if (currentIndex >= 0 && currentIndex < sortedCropEntries.length) {
      return sortedCropEntries[currentIndex];
    }
    return sortedCropEntries[0]; // 기본값으로 첫 번째 작물 반환
  };

  // Responsive 상태: 창 너비가 768px 미만이면 반응형 환경으로 간주
  const [isResponsive, setIsResponsive] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsResponsive(window.innerWidth < 768);
    };

    // 초기 상태 설정
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 모바일 환경에서 전체 작물 목록을 보여줄지 여부를 결정할 상태
  const [showAll, setShowAll] = useState(false);

  // 반응형 환경일 경우, showAll이 false이면 작물 카드 8개만, true이면 전체를 보여줌
  const displayedCropEntries =
    isResponsive && !showAll
      ? sortedCropEntries.slice(0, 8)
      : sortedCropEntries;

  // URL이 변경될 때마다 currentIndex 업데이트
  useEffect(() => {
    // console.log("Current cropId:", cropId);
    const newIndex = sortedCropEntries.findIndex(([key]) => key === cropId);
    // console.log("New index:", newIndex);
    setCurrentIndex(newIndex !== -1 ? newIndex : 0);
  }, [cropId, sortedCropEntries]);

  const handleCropChange = (index) => {
    setIsVisible(false);

    // URL 업데이트
    const newCropId = sortedCropEntries[index][0];
    const newUrl = `${window.location.pathname}?cropId=${newCropId}`;
    window.history.pushState({}, "", newUrl);

    // 애니메이션 완료 후 상태 업데이트
    setTimeout(() => {
      setCurrentIndex(index);
      setIsVisible(true);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          작물 육성 가이드
        </h1>

        {/* 작물 선택 영역 */}
        <div className="mb-8">
          <div className="grid grid-cols-4 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {displayedCropEntries.map(([cropKey, crop]) => {
              const isSelected = cropKey === getCurrentCrop()[0];
              return (
                <button
                  key={cropKey}
                  className={`w-full px-4 py-3 rounded-lg text-base sm:text-lg font-semibold 
                  ${
                    isSelected
                      ? "bg-green-600 text-white"
                      : "bg-white text-green-600 border border-green-200"
                  } 
                  cursor-pointer hover:bg-green-700 hover:text-white 
                  transition-colors duration-200 shadow-md
                  flex items-center justify-center text-center min-h-[48px]`}
                  onClick={() =>
                    handleCropChange(
                      sortedCropEntries.findIndex(([key]) => key === cropKey)
                    )
                  }
                >
                  {crop.name}
                </button>
              );
            })}
          </div>
          {/* 모바일 환경에서 추가 작물 보기 토글 버튼 */}
          {isResponsive && sortedCropEntries.length > 8 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                {showAll ? "접기" : "더보기"}
              </button>
            </div>
          )}
        </div>

        {/* 선택된 작물 정보 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div
            className={`transition-all duration-300 ease-in-out ${
              isVisible
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform translate-y-4"
            }`}
          >
            <h2 className="text-2xl font-bold text-green-800 mb-6">
              {getCurrentCrop()[1].name} 재배법
            </h2>

            <div className="space-y-8">
              {getCurrentCrop()[1].content.map((section, index) => (
                <div
                  key={index}
                  className="border-l-4 border-green-500 pl-6 py-2"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{section.description}</p>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-green-700 font-medium">
                      💡 Tip: {section.tips}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDetail;
