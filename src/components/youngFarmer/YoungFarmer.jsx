import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from 'react-redux';
import { fetchYoungFarmerList, setCategory } from '../../redux/slices/youngFarmerSlice';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const YoungFarmer = () => {
  const dispatch = useDispatch();
  const { farmerList, loading, selectedCategory } = useSelector(state => state?.youngFarmer) || {
    farmerList: [],
    loading: false,
    selectedCategory: "01"
  };

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 한 페이지당 보여줄 아이템 수

  // 카테고리 정의
  const categories = [
    { code: "01", name: "청년 생생이야기", icon: "👨‍🌾" },
    { code: "02", name: "청년농 홍보영상", icon: "🎥" }
  ];

  // 현재 페이지의 데이터만 필터링
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return farmerList.slice(startIndex, endIndex);
  };

  // 총 페이지 수 계산
  const totalPages = Math.ceil((farmerList?.length || 0) / itemsPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (categoryCode) => {
    dispatch(setCategory(categoryCode));
    dispatch(fetchYoungFarmerList({ s_code: categoryCode, page: 1 }));
    setCurrentPage(1); // 카테고리 변경 시 첫 페이지로 리셋
  };

  useEffect(() => {
    dispatch(fetchYoungFarmerList({ s_code: selectedCategory, page: 1 }));
  }, [dispatch]);

  // 사례 카드 컴포넌트
  const renderFarmerCard = (farmer) => (
    <motion.div 
      key={farmer.bbsSeq}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col min-h-[250px]"
    >
      <div className="flex-grow">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 line-clamp-2">
          {farmer.title}
        </h3>
        <div className="text-sm text-gray-600 mb-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">농업인:</span>
            <span>{farmer.bbsInfo03}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">품목:</span>
            <span>{farmer.bbsInfo04}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">지역:</span>
            <span>{farmer.area1Nm} {farmer.area2Nm}</span>
          </div>
        </div>
      </div>
      {farmer.bbsInfo08 && (
        <a 
          href={farmer.bbsInfo08} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-[#3a9d1f] text-white px-4 py-2 rounded-md hover:bg-[#0aab65] transition-colors text-sm w-full text-center mt-auto"
        >
          {selectedCategory === "02" ? "영상 보기" : "자세히 보기"}
        </a>
      )}
    </motion.div>
  );

  // 페이지네이션 컴포넌트
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5; // 한 번에 보여줄 최대 페이지 번호 수

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 이전 페이지 버튼
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md hover:bg-green-100 disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <FaChevronLeft />
      </button>
    );

    // 페이지 번호 버튼
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-md ${
            currentPage === i
              ? "bg-[#3a9d1f] text-white"
              : "hover:bg-green-100"
          }`}
        >
          {i}
        </button>
      );
    }

    // 다음 페이지 버튼
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md hover:bg-green-100 disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <FaChevronRight />
      </button>
    );

    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mt-8 mb-16">  {/* 상단 여백 추가, 하단 여백 조정 */}
        <h1 className="text-4xl font-bold text-center mb-12">청년농 소개&영상</h1>
        
        {/* 카테고리 버튼 그룹 */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.code}
              onClick={() => handleCategoryChange(category.code)}
              className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2
                ${selectedCategory === category.code 
                  ? "bg-[#3a9d1f] text-white shadow-lg transform scale-105" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
            >
              <span className="text-xl">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* 사례 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-500"></div>
            </div>
          ) : getCurrentPageData().length > 0 ? (
            getCurrentPageData().map((farmer) => renderFarmerCard(farmer))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              해당 카테고리의 사례가 없습니다.
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {!loading && farmerList.length > 0 && (
          <div className="flex justify-center gap-2">
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

export default YoungFarmer;