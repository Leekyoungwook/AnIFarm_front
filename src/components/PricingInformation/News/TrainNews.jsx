import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { GET_NEWS_API_URL } from '../../../utils/apiurl';

const TrainNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  // 초기 값을 6으로 설정 (화면 크기에 따라 추후 업데이트됩니다.)
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // list=20 을 쿼리 파라미터로 전달 (TrainNews용 크롤링 링크)
        const response = await axios.get(`${GET_NEWS_API_URL}?list=20&pages=2`);
        // response.data.news_links 가 기사 배열로 구성되어 있다고 가정합니다.
        setNews(response.data.news_links || []);
      } catch (error) {
        console.error("뉴스 데이터 fetch 오류:", error);
        setNews([]);
      }
      setLoading(false);
    };

    fetchNews();
  }, []);

  // 화면 크기에 따라 itemsPerPage 값을 업데이트합니다.
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(6);
      }
    };

    // 초기 실행 및 리사이즈 이벤트 등록
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // 모바일 환경 여부를 업데이트합니다.
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0aab65]"></div>
      </div>
    );
  }

  const totalPages = Math.ceil(news.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleNews = news.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full max-w-[1280px] px-4 mx-auto pb-12">
      {news.length > 0 ? (
        <>
          <div className={`${isMobile ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-2 md:grid-cols-3 gap-8'}`}>
            {visibleNews.map((article, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* 이미지 URL이 존재하면 이미지 표시 (클릭 시 기사 링크로 이동) */}
                {article.image && (
                  <a href={article.link} target="_blank" rel="noopener noreferrer">
                    <img
                      src={article.image}
                      alt={article.title}
                      className={`w-full ${isMobile ? 'h-32' : 'h-44'} object-cover`}
                    />
                  </a>
                )}
                {/* 뉴스 제목 및 내용 영역 */}
                <div className={`${isMobile ? 'p-2' : 'p-1 md:p-4'}`}>
                  <h3 className={`${isMobile ? 'text-lg font-semibold text-blue-500 hover:text-blue-700 transition-colors p-2' : 'text-lg font-semibold text-blue-500 hover:text-blue-700 transition-colors p-1 md:p-3'}`}>
                    <a
                      className="block"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: isMobile ? 2 : 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {article.title}
                    </a>
                  </h3>
                  {/* 뉴스 본문(content) 3줄까지만 표시 */}
                  <p 
                    className="text-gray-600 text-sm mt-2"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {article.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* 페이지 네비게이션 */}
          <div className="flex justify-center items-center mt-8 gap-4">
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 0}
              className={`p-2 rounded-full bg-white shadow-lg ${
                currentPage === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
              }`}
            >
              <FaChevronLeft size={24} />
            </button>
            <span className="text-gray-700">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage >= totalPages - 1}
              className={`p-2 rounded-full bg-white shadow-lg ${
                currentPage >= totalPages - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
              }`}
            >
              <FaChevronRight size={24} />
            </button>
          </div>
        </>
      ) : (
        <div className="w-full h-[500px] mt-5 mb-10 border-2 border-gray-300 rounded-lg flex items-center justify-center">
          뉴스 데이터가 없습니다.
        </div>
      )}
    </div>
  );
};

export default TrainNews;