import React from "react";

const AnalysisMethodSelector = ({ onSelect }) => {
  const methods = [
    {
      id: "area",
      title: "재배면적 대비",
      description: "예상소득이 궁금해요",
      icon: "🌾",
      details: [
        "보유 면적에 따른 예상 소득 계산",
        "작물별 수익성 비교",
        "최적 작물 추천",
      ],
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
          경영 분석 방식을 선택해주세요
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          귀하의 상황에 맞는 분석 방식을 선택하여 경영 시뮬레이션을 시작하세요
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className="p-4 sm:p-6 border-2 border-gray-200 rounded-lg hover:border-[#3a9d1f] transition-all duration-300 bg-white hover:shadow-lg"
          >
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">
              {method.icon}
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800">
              {method.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              {method.description}
            </p>
            <ul className="text-left text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2">
              {method.details.map((detail, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#3a9d1f] rounded-full mr-1.5 sm:mr-2"></span>
                  {detail}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnalysisMethodSelector;
