import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMarketData } from "../../../redux/slices/apiSlice";
import { createMarketChart } from "../../../data/marketChart";
import { keyMapping, isValidPeriod } from "../../../data/marketData";

const RaceChart = () => {
  const dispatch = useDispatch();
  const marketData = useSelector((state) => state.api.marketData);
  const loading = useSelector((state) => state.api.loading);
  const chartRef = useRef(null);
  const dataFetchedRef = useRef(false);

  const transformData = (data) => {
    if (!data || typeof data !== 'object') {
      // console.log("Invalid data format:", data);
      return null;
    }

    // 데이터가 이미 올바른 형식이면 그대로 반환
    if (data["202101"] && typeof data["202101"] === 'object') {
      // console.log("Data is in correct format, returning as is");
      return data;
    }

    // console.log("Data transformation not needed");
    return data;
  };

  useEffect(() => {
    if (!dataFetchedRef.current) {
      dispatch(fetchMarketData());
      dataFetchedRef.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    if (loading) return;

    if (chartRef.current) {
      chartRef.current.dispose();
      chartRef.current = null;
    }

    // marketData가 객체이고 비어있지 않은지 확인
    const isValidData = marketData && 
                       typeof marketData === 'object' && 
                       Object.keys(marketData).length > 0;

    if (isValidData) {
      const transformedData = transformData(marketData);
      
      if (transformedData) {
        // console.log("Creating chart with data:", transformedData);
        chartRef.current = createMarketChart("chartdiv", transformedData);
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.dispose();
        chartRef.current = null;
      }
    };
  }, [marketData, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0aab65] mt-[-100px]" />
      </div>
    );
  }

  // 데이터 유효성 검사 수정
  const isEmptyData = !marketData || 
                     typeof marketData !== 'object' || 
                     Object.keys(marketData).length === 0;

  if (isEmptyData) {
    return (
      <div
        id="chartdiv"
        className="w-full h-[500px] mt-5 mb-10 border-2 border-gray-300 rounded-lg flex items-center justify-center"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0aab65]" />
      </div>
    );
  }

  return (
    <div
      id="chartdiv"
      className="w-full h-[600px] mt-5 mb-10 border-2 border-gray-300 rounded-lg"
    ></div>
  );
};

export default RaceChart;