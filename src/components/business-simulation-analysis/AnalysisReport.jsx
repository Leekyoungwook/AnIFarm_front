import React, { useState, useEffect } from "react";
import axios from "axios";
import { GET_CROP_DATA_API_URL } from '../../utils/apiurl';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const AnalysisReport = ({ data }) => {
  const { method, goals } = data;
  const [cropData, setCropData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 작물 데이터 로드
  useEffect(() => {
    const fetchCropData = async () => {
      try {
        const response = await axios.get(GET_CROP_DATA_API_URL);
        if (response.data.success) {
          // API 응답을 작물 이름을 키로 하는 객체로 변환
          const formattedData = response.data.data.reduce((acc, crop) => {
            const total = crop.total_cost;
            acc[crop.crop_name] = {
              hourly_sales: crop.revenue_per_hour,
              sales_per_area: crop.revenue_per_3_3m,
              annual_sales: crop.annual_sales,
              total_cost: crop.total_cost,
              monthly_income: (crop.annual_sales - crop.total_cost) / 12,
              costs: {
                수도광열비: crop.costs?.수도광열비 || 0,
                종자종묘비: crop.costs?.종자종묘비 || 0,
                기타재료비: crop.costs?.기타재료비 || 0,
                소농구비: crop.costs?.소농구비 || 0,
                대농구상각비: crop.costs?.대농구상각비 || 0,
                영농시설상각비: crop.costs?.영농시설상각비 || 0,
                수리유지비: crop.costs?.수리유지비 || 0,
                기타비용: crop.costs?.기타비용 || 0,
                농기계시설임차료: crop.costs?.농기계시설임차료 || 0,
                토지임차료: crop.costs?.토지임차료 || 0,
                위탁영농비: crop.costs?.위탁영농비 || 0,
                고용노동비: crop.costs?.고용노동비 || 0,
                보통비료비: crop.costs?.보통비료비 || 0,
                부산물비료비: crop.costs?.부산물비료비 || 0,
                농약비: crop.costs?.농약비 || 0,
              },
            };
            return acc;
          }, {});

          setCropData(formattedData);
        } else {
          setError("작물 데이터를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("작물 데이터 로드 중 오류 발생:", error);
        setError("작물 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchCropData();
  }, []);

  // 작물 종류에 따른 라벨 매핑
  const getCropLabel = (value) => {
    const cropMap = {
      rice: "쌀",
      vegetable: "채소",
      fruit: "과일",
      flower: "화훼",
      mushroom: "버섯",
      herb: "약초",
    };
    return cropMap[value] || value;
  };

  // 선택한 작물들의 평균 수익성 계산
  const calculateCropResults = () => {
    if (!goals.selectedCrops || goals.selectedCrops.length === 0 || !cropData) {
      return null;
    }

    const cultivationArea = Number(goals.cultivationArea) || 0;
    const selectedCropsData = goals.selectedCrops
      .map((crop) => {
        const details = cropData[crop.crop_name];
        if (!details) {
          return null;
        }

        const areaRatio = cultivationArea / 3.3;
        const newAnnualSales = details.sales_per_area * cultivationArea;

        // 총 경영비 계산 - 원래 연간매출액 대비 총경영비 비율을 새로운 연간매출액에 적용
        const costRatio = details.total_cost / details.annual_sales;
        const totalCost = newAnnualSales * costRatio;

        // 각 비용 항목의 원래 비율 유지하면서 새로운 총 경영비에 적용
        const costs = Object.entries(details.costs || {}).map(
          ([name, cost]) => ({
            name,
            cost: totalCost * (cost / details.total_cost), // 원래 비율 유지
          })
        );

        return {
          name: crop.crop_name,
          hourly_sales: details.hourly_sales,
          sales_per_area: details.sales_per_area,
          annual_sales: newAnnualSales,
          total_cost: totalCost,
          costs: costs,
        };
      })
      .filter(Boolean);

    if (selectedCropsData.length === 0) {
      return null;
    }

    // 선택된 작물들의 평균 계산
    const averageResults = {
      hourly_sales:
        selectedCropsData.reduce((sum, crop) => sum + crop.hourly_sales, 0) /
        selectedCropsData.length,
      sales_per_area:
        selectedCropsData.reduce((sum, crop) => sum + crop.sales_per_area, 0) /
        selectedCropsData.length,
      annual_sales:
        selectedCropsData.reduce((sum, crop) => sum + crop.annual_sales, 0) /
        selectedCropsData.length,
      total_cost:
        selectedCropsData.reduce((sum, crop) => sum + crop.total_cost, 0) /
        selectedCropsData.length,
      monthly_income:
        (selectedCropsData.reduce((sum, crop) => sum + crop.annual_sales, 0) -
          selectedCropsData.reduce((sum, crop) => sum + crop.total_cost, 0)) /
        (selectedCropsData.length * 12),
      net_profit:
        selectedCropsData.reduce(
          (sum, crop) => sum + (crop.annual_sales - crop.total_cost),
          0
        ) / selectedCropsData.length,
      cost_ratio: (
        (selectedCropsData.reduce((sum, crop) => sum + crop.total_cost, 0) /
          selectedCropsData.reduce((sum, crop) => sum + crop.annual_sales, 0)) *
        100
      ).toFixed(1),
    };

    // 경영비 항목별 색상 매핑
    const costColors = {
      수도광열비: "#FF6B6B",
      기타재료비: "#45B7D1",
      소농구비: "#96CEB4",
      대농구상각비: "#FFEEAD",
      영농시설상각비: "#D4A5A5",
      수리유지비: "#9B9B9B",
      기타비용: "#FFD93D",
      농기계시설임차료: "#6C5B7B",
      토지임차료: "#C06C84",
      위탁영농비: "#F8B195",
      고용노동비: "#355C7D",
      종자종묘비: "#4ECDC4",
      보통비료비: "#99B898",
      부산물비료비: "#2A363B",
      농약비: "#A8E6CF",
    };

    // 경영비 항목 순서 정의
    const costOrder = [
      "수도광열비",
      "기타재료비",
      "소농구비",
      "대농구상각비",
      "영농시설상각비",
      "수리유지비",
      "기타비용",
      "농기계시설임차료",
      "토지임차료",
      "위탁영농비",
      "고용노동비",
      "종자종묘비",
      "보통비료비",
      "부산물비료비",
      "농약비",
    ];

    // 비용 데이터를 정의된 순서대로 정렬
    const costData = costOrder.map((name) => ({
      name,
      cost: Math.round(
        selectedCropsData.reduce(
          (sum, crop) =>
            sum + crop.costs.find((c) => c.name === name)?.cost || 0,
          0
        ) / selectedCropsData.length
      ),
      color: costColors[name] || "#3a9d1f", // 기본 색상
    }));

    return {
      ...averageResults,
      costData,
      selectedCropsData,
    };
  };

  const results = calculateCropResults();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#3a9d1f] mt-[-100px]" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  if (!results) {
    return <div className="text-center p-4">작물을 선택해주세요.</div>;
  }

  // 차트 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded">
          <p className="font-bold text-gray-800">{label}</p>
          <p className="text-gray-600">{payload[0].value.toLocaleString()}원</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
          분석 보고서
        </h2>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm sm:text-base font-semibold text-gray-600 mb-2">
            연간 매출
          </h3>
          <p className="text-lg sm:text-xl font-bold text-gray-800">
            {Math.round(results.annual_sales).toLocaleString()}원
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm sm:text-base font-semibold text-gray-600 mb-2">
            총 경영비
          </h3>
          <p className="text-lg sm:text-xl font-bold text-gray-800">
            {Math.round(results.total_cost).toLocaleString()}원
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm sm:text-base font-semibold text-gray-600 mb-2">
            월 평균 소득
          </h3>
          <p className="text-lg sm:text-xl font-bold text-gray-800">
            {Math.round(results.monthly_income).toLocaleString()}원
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm sm:text-base font-semibold text-gray-600 mb-2">
            경영비 비율
          </h3>
          <p className="text-lg sm:text-xl font-bold text-gray-800">
            {results.cost_ratio}%
          </p>
        </div>
      </div>

      {/* 경영비 분석 */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <span className="w-1.5 sm:w-2 h-5 sm:h-6 bg-[#3a9d1f] rounded mr-2"></span>
          경영비 분석
        </h3>
        <div className="h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={results.costData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cost">
                {results.costData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 세부 분석 */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <span className="w-1.5 sm:w-2 h-5 sm:h-6 bg-[#3a9d1f] rounded mr-2"></span>
          세부 분석
        </h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                  항목
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-600">
                  금액
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-600">
                  비율
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.costData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    {item.name}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right text-gray-600">
                    {item.cost.toLocaleString()}원
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right text-gray-600">
                    {((item.cost / results.total_cost) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                  총 경영비
                </td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right text-gray-900">
                  {Math.round(results.total_cost).toLocaleString()}원
                </td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right text-gray-900">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 주의사항 */}
      <div className="bg-[#f8f8f8] border-l-4 border-[#3a9d1f] p-3 sm:p-4 rounded-r-lg">
        <p className="text-xs sm:text-sm text-[#3a9d1f]">
          • 본 분석 결과는 평균적인 데이터를 기반으로 산출된 예상 수치입니다.
          <br className="hidden sm:block" />• 실제 경영 환경과 재배 조건에 따라
          결과가 달라질 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default AnalysisReport;
