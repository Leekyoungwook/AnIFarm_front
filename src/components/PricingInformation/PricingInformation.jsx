import React, { useState, useEffect } from "react";
import RaceChart from "./charts/RaceChart";
import Top10Chart from "./charts/Top10Chart";
import News from "./News/News";

// import market from "../../assets/images/free_icon_cart.png";

const PricingInformation = () => {
  const [activeChart, setActiveChart] = useState("top10");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleChartChange = (chartType) => {
    if (activeChart === chartType) return; // 같은 차트를 클릭한 경우 무시
    
    setIsLoading(true);
    setActiveChart(chartType);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleShowTop10Chart = () => handleChartChange("top10");
  const handleShowRaceChart = () => handleChartChange("race");
  const handleShowNews = () => handleChartChange("News");

  const renderDataSource = () => {
    if (activeChart === "top10" || activeChart === "race") {
      return (
        <div className="mt-2 text-sm text-gray-700 bg-gray-100 p-4 rounded-lg mb-3">
          <p className="flex items-center">
            <span className="text-red-500 font-bold mr-1">TIP</span>
            <span className="mr-1">※ 데이터 출처</span>
            <span className="text-gray-700">㈜마켓링크</span>
          </p>
          <p className="text-gray-700 mt-2">
            - 부류별(곡임, 채소, 식량작물, 수산물)로 2021.1월부터 현재까지의 품목별 매출액 순위 변화를 애니메이션 기능으로 제공합니다.
          </p>
          <p className="text-gray-700 mt-1">
            - 조사대상 : ('21.1.~'24.2.) 대형마트(롯데마트, 홈플러스, 하나로클럽, 이마트*), SSM(롯데슈퍼, 홈플러스 익스프레스, 이마트 에브리데이, GS슈퍼*)
          </p>
          <p className="text-gray-700 ml-[60px]">
            ('24.3.~현재) 유통사 데이터 변경(롯데멤버스, 농협 멤버스)
          </p>
          <p className="text-gray-700 mt-1">
            * 시장점유율을 고려한 추정치를 적용하였으니 자료 활용시 유의해주시기 바랍니다.
          </p>
          <p className="text-gray-700">
            - 데이터 제공처의 데이터 수집 및 가공 상황에 따라 데이터 제공 일정이 변경될 수 있습니다.
          </p>
        </div>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0aab65] mt-[-100px]" />
        </div>
      );
    }

    return (
      <>
        {activeChart === "top10" && <Top10Chart />}
        {activeChart === "race" && <RaceChart />}
        {activeChart === "News" && <News />}
        {renderDataSource()}
      </>
    );
  };

  return (
    <div className="container">
      <div className="flex items-center mt-8 gap-2">
        {/* <img src={market} alt="장바구니" className="w-8 h-8" /> */}
        <h1 className="title text-left text-4xl font-bold">
          대형마트 소비트렌드
        </h1>
      </div>
      <p className="subtitle text-left text-lg text-gray-600 mt-2 mb-5">
        한 눈에 보는 장바구니 쇼핑 동향
      </p>
      <div className="flex gap-4 mt-8">
        <button
          className={`px-4 py-2 rounded-full ${
            activeChart === "top10"
              ? "bg-[#3a9d1f] text-white hover:bg-[#0aab65]"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={handleShowTop10Chart}
        >
          판매 TOP 10
        </button>

        <button
          className={`px-4 py-2 rounded-full ${
            activeChart === "race"
              ? "bg-[#3a9d1f] text-white hover:bg-[#0aab65]"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={handleShowRaceChart}
        >
          레이스 차트
        </button>
        
        <button
          className={`px-4 py-2 rounded-full ${
            activeChart === "News"
              ? "bg-[#3a9d1f] text-white hover:bg-[#0aab65]"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={handleShowNews}
        >
          농산물  뉴스
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default PricingInformation;
