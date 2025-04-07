import React, { useState } from "react";
import AnalysisMethodSelector from "./AnalysisMethodSelector";
import AgricultureGoalSetting from "./AgricultureGoalSetting";
import AnalysisReport from "./AnalysisReport";
import { FaRegCheckCircle } from "react-icons/fa";
import { GiStairsGoal } from "react-icons/gi";
import { TbDeviceAnalytics } from "react-icons/tb";

const BusinessSimulation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [analysisData, setAnalysisData] = useState(null);

  const handleGoalSetting = (goals) => {
    setAnalysisData({ ...analysisData, goals });
    setCurrentStep(2);
    // 페이지 상단으로 부드럽게 스크롤
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // 단계 이동 처리 함수
  const handleStepClick = (step) => {
    // 1단계는 언제든 이동 가능
    if (step === 1) {
      setCurrentStep(1);
      return;
    }

    // 2단계는 재배면적 설정이 되어있어야 이동 가능
    if (step === 2 && analysisData?.goals) {
      setCurrentStep(2);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 상단 배너 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
            경영 모의계산
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            재배면적 기준 농업 경영 분석 및 수익성 계산
          </p>
          <div className="mt-4 bg-[#f8f8f8] border-l-4 border-[#3a9d1f] p-3 sm:p-4 rounded-r-lg">
            <p className="text-xs sm:text-sm text-[#3a9d1f]">
              • 3.3m²(1평) 기준 작물별 수익성 정보를 바탕으로 원하시는
              재배면적에 대한 경영 분석을 제공합니다.
              <br className="hidden sm:block" />• 실제 경영 환경과 재배 조건에
              따라 결과가 달라질 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* 진행 단계 표시 */}
        <div className="flex flex-col items-center mb-8 sm:mb-12 mt-4 sm:mt-6">
          <div className="flex items-center justify-between w-full max-w-2xl">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl shadow-md transition-all duration-300 cursor-pointer hover:opacity-80 ${
                  currentStep >= 1
                    ? "bg-[#3a9d1f] text-white transform scale-110"
                    : "bg-gray-200 text-gray-400"
                }`}
                onClick={() => handleStepClick(1)}
                title="재배면적 설정 단계로 이동"
              >
                <GiStairsGoal className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-gray-600">
                재배면적 설정
              </span>
            </div>
            <div
              className={`w-8 sm:w-32 h-1 sm:h-2 rounded-full transition-all duration-300 ${
                currentStep >= 2 ? "bg-[#3a9d1f]" : "bg-gray-200"
              }`}
            ></div>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl shadow-md transition-all duration-300 cursor-pointer hover:opacity-80 ${
                  currentStep >= 2
                    ? "bg-[#3a9d1f] text-white transform scale-110"
                    : "bg-gray-200 text-gray-400"
                } ${
                  !analysisData?.goals ? "cursor-not-allowed opacity-50" : ""
                }`}
                onClick={() => handleStepClick(2)}
                title={
                  analysisData?.goals
                    ? "분석 결과 보기"
                    : "재배면적을 먼저 설정해주세요"
                }
              >
                <TbDeviceAnalytics className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-gray-600">
                분석 결과
              </span>
            </div>
          </div>
        </div>

        {/* 단계 설명 */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            {currentStep === 1 && "재배면적 설정"}
            {currentStep === 2 && "경영 분석 결과"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            {currentStep === 1 && "재배하실 면적을 입력해주세요 (3.3m² 기준)"}
            {currentStep === 2 && "설정하신 재배면적 기준 경영 분석 결과입니다"}
          </p>
          {currentStep === 1 && (
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg inline-block">
              <p className="text-xs sm:text-sm text-blue-700">
                입력하신 재배면적을 기준으로 예상 수익과 경영비가 계산됩니다
              </p>
            </div>
          )}
        </div>

        {/* 단계별 컨텐츠 */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-xl">
            {currentStep === 1 && (
              <AgricultureGoalSetting
                onComplete={handleGoalSetting}
                method="single"
              />
            )}

            {currentStep === 2 && <AnalysisReport data={analysisData} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSimulation;
