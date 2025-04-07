import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { GET_SUPPORT_PROGRAMS_API_URL } from '../../utils/apiurl';

const Support = () => {
  const [activeTab, setActiveTab] = useState('support');
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    setImagesLoaded(true);
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(GET_SUPPORT_PROGRAMS_API_URL);
      if (response.data.success) {
        setPrograms(response.data.data);
        setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
        setCurrentPage(1);
      } else {
        console.error("지원 프로그램 데이터 가져오기 실패:", response.data.message);
        setPrograms([]);
      }
    } catch (error) {
      console.error("지원 프로그램 데이터를 가져오는 중 오류 발생:", error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    try {
      const endpoint = activeTab === 'support'
        ? `/api/support/detail/${id}`
        : `/api/education/detail/${id}`;
      const response = await axios.get(`http://localhost:8000${endpoint}`);
      setSelectedProgram(response.data.data);
    } catch (err) {
      setError('상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleProgramClick = (program) => {
    if (program.url) {
      window.open(program.url, '_blank');
    } else {
      fetchDetail(program.id);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = programs.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0aab65]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl text-gray-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 my-8">
      {imagesLoaded ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <h1 className="mt-12 text-3xl md:text-4xl text-black font-bold mb-12 text-center">농업인 지원 프로그램</h1>

          {/* 탭 메뉴 */}
          <motion.div 
            className="flex justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex rounded-lg border border-gray-200 shadow-sm">
              <button
                className={`px-8 py-3 rounded-l-lg transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'support'
                    ? 'bg-[#3a9d1f] text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('support')}
              >
                <span className="text-xl">💡</span>
                <span>지원사업</span>
              </button>
              <button
                className={`px-8 py-3 rounded-r-lg transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'education'
                    ? 'bg-[#3a9d1f] text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('education')}
              >
                <span className="text-xl">🎓</span>
                <span>교육 프로그램</span>
              </button>
            </div>
          </motion.div>
          
          {/* 프로그램 목록 */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {currentItems.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 relative flex flex-col min-h-[280px]"
                onClick={() => handleProgramClick(program)}
              >
                <h3 className="text-lg font-semibold mb-3 text-gray-800 line-clamp-2">
                  {program.title}
                </h3>
                <div className="text-sm text-gray-600 space-y-2 flex-grow mb-14">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">대상:</span>
                    <span>{program.target}</span>
                  </div>
                  {activeTab === 'support' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">신청기간:</span>
                        <span>{program.application_period}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">주관기관:</span>
                        <span>{program.organization}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">연락처:</span>
                        <span>{program.contact || '-'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">교육기간:</span>
                        <span>{program.period}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">신청기간:</span>
                        <span>{program.application_period}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">교육방법:</span>
                        <span>{program.eduMethod} {program.eduMethod2} {program.eduMethod3}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">교육인원:</span>
                        <span>{program.capacity}명</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">교육시간:</span>
                        <span>{program.eduTime}시간</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">수강료:</span>
                        <span>{program.price || '무료'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">주관기관:</span>
                        <span>{program.organization}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">연락처:</span>
                        <span>{program.contact || '-'}</span>
                      </div>
                    </>
                  )}
                </div>
                <button 
                  className="inline-block bg-[#3a9d1f] text-white px-4 py-2 rounded-md hover:bg-[#0aab65] transition-colors text-sm w-[calc(100%-3rem)] absolute bottom-6 left-6 text-center"
                >
                  자세히 보기
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <motion.div 
              className="flex justify-center items-center space-x-2 mt-12 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                이전
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    currentPage === index + 1
                      ? 'bg-[#3a9d1f] text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                다음
              </button>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <div className="flex items-center justify-center h-full bg-white">
          <h2 className="text-2xl text-gray-500">로딩 중...</h2>
        </div>
      )}

      {/* 상세 정보 모달 */}
      <AnimatePresence>
        {selectedProgram && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{selectedProgram.title}</h2>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {activeTab === 'support' ? (
                  <>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-[#3a9d1f]">사업 개요</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedProgram.content}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-[#3a9d1f]">지원 내용</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedProgram.support_content}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-[#3a9d1f]">신청 자격</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedProgram.requirements}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-[#3a9d1f]">제출 서류</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedProgram.documents}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-[#3a9d1f]">교육 내용</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedProgram.content}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-[#3a9d1f]">신청 자격</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedProgram.requirements}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-[#3a9d1f]">교육 정원</h3>
                      <p className="text-gray-700">{selectedProgram.capacity}명</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-[#3a9d1f]">교육비</h3>
                      <p className="text-gray-700">{selectedProgram.price || '무료'}</p>
                    </div>
                  </>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-2 text-[#3a9d1f]">문의처</h3>
                  <p className="text-gray-700">{selectedProgram.contact || '-'}</p>
                </div>

                <div className="mt-6 pt-4 border-t">
                  {activeTab === 'support' ? (
                    <>
                      <p className="text-sm text-gray-500">
                        신청기간: {selectedProgram.application_period}
                      </p>
                      <p className="text-sm text-gray-500">
                        주관기관: {selectedProgram.organization}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">
                        교육기간: {selectedProgram.period}
                      </p>
                      <p className="text-sm text-gray-500">
                        신청기간: {selectedProgram.application_period}
                      </p>
                      <p className="text-sm text-gray-500">
                        교육방법: {selectedProgram.eduMethod} {selectedProgram.eduMethod2} {selectedProgram.eduMethod3}
                      </p>
                      <p className="text-sm text-gray-500">
                        교육시간: {selectedProgram.eduTime}시간
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Support;
