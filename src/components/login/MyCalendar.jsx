import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fetchUserCalendar, deleteCalendarData } from '../../redux/slices/calendarSlice';
import Swal from 'sweetalert2';
import { FaCalendarAlt } from 'react-icons/fa';

const Container = styled.div`
  padding: 20px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

const CalendarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CalendarItem = styled.div`
  padding: 16px;
  background-color: #f8f8f8;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid #e5e7eb;

  &:hover {
    background-color: rgb(229 231 235 / var(--tw-bg-opacity, 1));
  }
`;

const CalendarInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;

  strong {
    color: #333;
    min-width: 60px;
  }
`;

const DeleteIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    height="24px" 
    viewBox="0 -960 960 960" 
    width="24px" 
    fill="currentColor"
  >
    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
  </svg>
);

const DeleteButton = styled.button`
  padding: 8px;
  color: #666;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #ff4444;
    background-color: rgba(255, 68, 68, 0.1);
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
`;

const LoadingContainer = styled.div`
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingItem = styled.div`
  width: 100%;
  height: 80px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #f8f8f8 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 10px;

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const MyCalendar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { calendarData, loading } = useSelector((state) => state.calendar);

  const ITEMS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const currentCalendarData = calendarData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    dispatch(fetchUserCalendar());
  }, [dispatch]);

  const handleDelete = async (e, calendarId) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    
    Swal.fire({
      title: '삭제하시겠습니까?',
      text: "삭제된 데이터는 복구할 수 없습니다.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3a9d1f',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteCalendarData(calendarId)).unwrap();
          Swal.fire({
            title: '삭제 완료',
            text: '성공적으로 삭제되었습니다.',
            icon: 'success',
            confirmButtonColor: '#3a9d1f'
          });
        } catch (error) {
          Swal.fire({
            title: '삭제 실패',
            text: '삭제 중 오류가 발생했습니다.',
            icon: 'error',
            confirmButtonColor: '#3a9d1f'
          });
        }
      }
    });
  };

  const handleItemClick = (item) => {
    // 실제 육성 캘린더 주소인 '/cultureCalendar'로 수정
    navigate('/cultureCalendar', {
      state: {
        selectedCity: item.region,
        selectedCrop: item.crop,
        sowingDate: item.growth_date,
        tempSowingDate: item.growth_date
      }
    });
  };

  if (loading) {
    return (
      <Container>
        <Title>
          <FaCalendarAlt className="text-[#3a9d1f] text-xl" />
          <h2 className="text-xl font-semibold text-gray-800">
            내 캘린더 ({calendarData.length})
          </h2>
        </Title>
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0aab65]" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        <FaCalendarAlt className="text-[#3a9d1f] text-xl" />
        <h2 className="text-xl font-semibold text-gray-800">
          내 캘린더 ({calendarData.length})
        </h2>
      </Title>

      {calendarData.length === 0 ? (
        <EmptyMessage>
          저장된 캘린더 데이터가 없습니다.
        </EmptyMessage>
      ) : (
        <>
          <CalendarList>
            {currentCalendarData.map((item) => (
              <CalendarItem 
                key={item.id} 
                onClick={() => handleItemClick(item)}
                className="hover:bg-gray-100"
              >
                <CalendarInfo>
                  <InfoRow>
                    <strong>지역</strong> {item.region}
                  </InfoRow>
                  <InfoRow>
                    <strong>작물</strong> {item.crop}
                  </InfoRow>
                  <InfoRow>
                    <strong>파종일</strong> {item.growth_date}
                  </InfoRow>
                </CalendarInfo>
                <DeleteButton 
                  onClick={(e) => handleDelete(e, item.id)}
                  aria-label="삭제"
                >
                  <DeleteIcon />
                </DeleteButton>
              </CalendarItem>
            ))}
          </CalendarList>

          {calendarData.length > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-1 md:gap-2 mt-4 md:mt-6">
              {Array.from(
                { length: Math.ceil(calendarData.length / ITEMS_PER_PAGE) },
                (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={
                      currentPage === i + 1
                        ? 'px-3 md:px-4 py-1 md:py-2 text-sm md:text-base rounded-lg transition-all duration-200 bg-[#3a9d1f] text-white font-medium'
                        : 'px-3 md:px-4 py-1 md:py-2 text-sm md:text-base rounded-lg transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default MyCalendar;