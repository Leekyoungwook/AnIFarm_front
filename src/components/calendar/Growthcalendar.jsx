import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import styled from 'styled-components';
import axios from 'axios';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { saveCalendarData, fetchUserCalendar } from '../../redux/slices/calendarSlice';
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom';
import { GET_GROWTH_CALENDAR_API_URL } from '../../utils/apiurl';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: 'http://localhost:8000'
});

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 428px) {
    padding: 10px;
    gap: 10px;
  }
`;

const SelectorsContainer = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 428px) {
    flex-direction: column;
    padding: 15px;
    gap: 15px;

    > div {
      width: 100%;
      flex-direction: column;
      gap: 10px;
    }
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;

  @media (max-width: 428px) {
    width: 100%;
    min-width: unset;
  }
`;

const DateInputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 428px) {
    width: 100%;
    flex-direction: column;

    > div {
      width: 100%;
    }
  }
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  @media (max-width: 428px) {
    width: 100%;
  }
`;

const ConfirmButton = styled.button`
  padding: 8px 16px;
  background-color: #3a9d1f;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  @media (max-width: 428px) {
    width: 100%;
    padding: 12px;
  }

  &:hover {
    background-color: #0aab65;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Label = styled.label`
  font-weight: bold;
  margin-right: 8px;
`;

const GrowthStageIndicator = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #4caf50;
  font-size: 11px;
  color: #4caf50;
  text-align: center;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const StyledCalendar = styled(Calendar)`
  width: 100%;
  max-width: 800px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 0 auto;

  @media (max-width: 428px) {
    padding: 10px;
    font-size: 14px;

    .react-calendar__navigation {
      margin-bottom: 10px;

      button {
        min-width: 36px;
        height: 36px;
        font-size: 20px;
        padding: 0;

        &.react-calendar__navigation__label {
          font-size: 16px;
        }
      }
    }

    .react-calendar__tile {
      height: 80px;
      padding: 4px;
      font-size: 12px;
    }

    .react-calendar__month-view__weekdays {
      font-size: 0.7em;
    }
  }

  .react-calendar__navigation {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    button {
      min-width: 44px;
      height: 44px;
      background: none;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 24px;
      color: #333;
      margin: 0 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: #f0f0f0;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.react-calendar__navigation__label {
        font-size: 18px;
        font-weight: bold;
        flex-grow: 1;
      }
    }
  }

  .react-calendar__tile {
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 8px;
    font-size: 14px;
    position: relative;
    color: #000;

    &:enabled:hover,
    &:enabled:focus {
      background-color: #f8f8f8;
    }

    &--active {
      background-color: #e6f3ff !important;
      border-bottom: 3px solid #3a9d1f !important;
    }

    &--now {
      background-color: #fff3e6;
    }
  }

  .react-calendar__month-view__weekdays {
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.8em;
  }

  .react-calendar__month-view__weekdays__weekday {
    padding: 0.5em;
    text-align: center;
    text-decoration: none;
    
    &:nth-child(1) {
      color: #f44336;
    }
    
    &:nth-child(7) {
      color: #2196f3;
    }
  }

  abbr[title] {
    text-decoration: none;
  }

  .react-calendar__month-view__days__day--weekend {
    color: inherit;
  }

  .react-calendar__month-view__days__day {
    &:nth-child(7n) {
      color: #2196f3 !important;
    }
    &:nth-child(7n + 1) {
      color: #f44336 !important;
    }
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    color: #ccc !important;
    
    &:nth-child(7n) {
      color: rgba(33, 150, 243, 0.4) !important;
    }
    &:nth-child(7n + 1) {
      color: rgba(244, 67, 54, 0.4) !important;
    }
  }
`;

const CalendarTileContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  padding: 4px;
  position: relative;
`;

const WeatherIndicator = styled.div`
  font-size: 12px;
  color: #2196f3;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const WeatherInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const WeatherMessage = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 2px;
`;

const TaskCount = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  color: #3a9d1f;
  font-weight: bold;
`;

const TaskIndicator = styled.div`
  color: #43a047;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background-color: rgba(67, 160, 71, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  width: 100%;
  text-align: center;
`;

const GuidanceContainer = styled.div`
  padding: 20px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 20px;
`;

const GuidanceTitle = styled.h3`
  color: white;
  font-size: 16px;
  background-color: #3a9d1f;
  padding: 8px 12px;
  border-radius: 4px;
  margin: -20px -20px 16px -20px;
`;

const GuidanceList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const GuidanceItem = styled.li`
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  background-color: ${props => props.type === 'task' ? '#e8f5e9' : '#fff'};
  border-radius: 4px;
  margin-bottom: 8px;
  
  @media (max-width: 428px) {
    padding: 10px;
    font-size: 13px;
    flex-wrap: wrap;

    span {
      margin-left: 4px;
    }
  }
  
  &:last-child {
    border-bottom: none;
  }

  .weather-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .temperature {
    color: #2196f3;
    font-weight: bold;
  }

  .description {
    color: #666;
    font-size: 14px;
  }

  span {
    margin-left: 8px;
  }
`;

// 작물별 권장 파종시기 데이터 추가
const cropEmojis = {
  '토마토': '🍅',
  '상추': '🥬',
  '감자': '🥔',
  '딸기': '🍓',
  '당근': '🥕',
  '오이': '🥒',
  '고추': '🌶️'
};

const recommendedSowingPeriods = {
  '토마토': [
    { start: '3월', end: '4월', note: '봄 재배' },
    { start: '7월', end: '8월', note: '여름 재배' }
  ],
  '상추': [
    { start: '2월', end: '4월', note: '봄 재배' },
    { start: '8월', end: '9월', note: '가을 재배' }
  ],
  '감자': [
    { start: '2월', end: '3월', note: '봄 재배' },
    { start: '8월', end: '9월', note: '가을 재배' }
  ],
  '딸기': [
    { start: '3월', end: '4월', note: '봄 재배' },
    { start: '8월', end: '9월', note: '가을 재배' }
  ],
  '당근': [
    { start: '2월', end: '3월', note: '봄 재배' },
    { start: '8월', end: '9월', note: '가을 재배' }
  ],
  '오이': [
    { start: '3월', end: '4월', note: '봄 재배' },
    { start: '8월', end: '9월', note: '가을 재배' }
  ],
  '고추': [
    { start: '2월', end: '3월', note: '봄 재배' },
    { start: '8월', end: '9월', note: '가을 재배' }
  ]
};

// 새로운 스타일 컴포넌트 추가
const CalendarContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 428px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const SowingGuideContainer = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  min-width: 250px;
  max-width: 300px;

  @media (max-width: 428px) {
    min-width: unset;
    max-width: unset;
    width: 100%;
  }
`;

const SowingGuideTitle = styled.h4`
  margin: 0 0 12px 0;
  color: white;
  font-size: 16px;
  background-color: #3a9d1f;
  padding: 8px 12px;
  border-radius: 4px;
  margin: -16px -16px 12px -16px;
`;

const CropSection = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CropTitle = styled.h5`
  margin: 0 0 8px 0;
  color: #3a9d1f;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SowingPeriodList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SowingPeriodItem = styled.li`
  padding: 4px 0;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  span.period {
    color: #333;
  }

  span.note {
    color: #666;
    font-size: 12px;
  }
`;

const HarvestIndicator = styled.div`
  color: #3a9d1f;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-top: 4px;
  width: 100%;
`;

const TodayGuidance = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;

  @media (max-width: 428px) {
    margin-top: 15px;
    padding: 15px;

    h3 {
      font-size: 16px;
      padding: 10px 15px;
      margin: -15px -15px 12px -15px;
    }
  }
`;

const TileContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  padding: 4px;
  position: relative;
`;

const WeatherIcon = styled.div`
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  gap: 4px;
  color: #3a9d1f;

  .temperature {
    font-weight: bold;
  }
`;

const HarvestIcon = styled.div`
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
`;

const SaveButton = styled(ConfirmButton)`
  background-color: #3a9d1f;
  &:hover {
    background-color: #2d7b18;
  }
`;

const GrowthCalendar = () => {
  const location = useLocation();
  // // console.log('location state:', location.state); // state 확인용 로그

  // state가 있을 경우 사용, 없으면 기본값 사용
  const [selectedCity, setSelectedCity] = useState(location.state?.selectedCity || '서울');
  const [selectedCrop, setSelectedCrop] = useState(location.state?.selectedCrop || '토마토');
  const [tempSowingDate, setTempSowingDate] = useState(location.state?.tempSowingDate || '');
  const [sowingDate, setSowingDate] = useState(location.state?.sowingDate || '');
  const [date, setDate] = useState(new Date());
  const [guidance, setGuidance] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  const cities = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '제주'];
  const crops = ['토마토', '상추', '감자', '딸기', '당근', '오이', '고추'];

  // location.state가 있을 경우 초기 데이터 로드
  useEffect(() => {
    if (location.state) {
      // // console.log('초기 데이터 설정:', location.state);
      setSelectedCity(location.state.selectedCity);
      setSelectedCrop(location.state.selectedCrop);
      setTempSowingDate(location.state.sowingDate);
      setSowingDate(location.state.sowingDate);
    }
  }, [location.state]);

  const getWeatherEmoji = (temp, rainfall) => {
    if (rainfall > 0) return '🌧️';
    if (temp >= 30) return '🌞';
    if (temp >= 25) return '☀️';
    if (temp >= 20) return '🌤️';
    if (temp >= 15) return '⛅';
    if (temp >= 10) return '🌥️';
    if (temp >= 5) return '☁️';
    return '❄️';
  };

  const getWeatherDescription = (temp, rainfall) => {
    if (rainfall > 0) {
      return '비가 예상되어 작물 관리에 주의가 필요합니다. 배수 상태를 확인해주세요.';
    }
    if (temp >= 30) {
      return '매우 더운 날씨입니다. 작물의 수분 공급에 신경 써주세요.';
    }
    if (temp >= 25) {
      return '따뜻한 날씨입니다. 적절한 수분 공급이 필요합니다.';
    }
    if (temp >= 20) {
      return '작물 생장에 좋은 날씨입니다.';
    }
    if (temp >= 15) {
      return '작물 생장에 적당한 온도입니다.';
    }
    if (temp >= 10) {
      return '서늘한 날씨입니다. 보온 관리가 필요할 수 있습니다.';
    }
    if (temp >= 5) {
      return '쌀쌀한 날씨입니다. 작물의 보온에 신경 써주세요.';
    }
    return '추운 날씨입니다. 동해 피해에 주의하세요.';
  };

  const fetchGuidance = async () => {
    try {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const response = await axios.get(GET_GROWTH_CALENDAR_API_URL, {
        params: {
          city: selectedCity,
          crop: selectedCrop,
          sowing_date: sowingDate ? format(new Date(sowingDate), 'yyyy-MM-dd') : null,
          target_date: format(firstDay, 'yyyy-MM-dd'),
          end_date: format(lastDay, 'yyyy-MM-dd')
        }
      });

      // // console.log('Received guidance:', response.data.data.guidance);
      
      // 작업 가이드만 따로 로깅
      // const taskGuidance = response.data.data.guidance.filter(g => g.type === 'task');
      // // console.log('Task guidance:', taskGuidance);

      setGuidance(response.data.data.guidance);
      setWeatherData(response.data.data.weather);
    } catch (error) {
      console.error('가이드 데이터를 가져오는 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    if (selectedCity) {
      fetchGuidance();
    }
  }, [selectedCity, selectedCrop, sowingDate, date.getMonth(), date.getFullYear()]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    if (activeStartDate) {
      const newDate = new Date(activeStartDate);
      setDate(newDate);
    }
  };

  const handleSowingDateConfirm = () => {
    if (!tempSowingDate) {
      Swal.fire({
        title: '날짜 선택',
        text: '파종일을 선택해주세요.',
        icon: 'warning',
        confirmButtonText: '확인',
        confirmButtonColor: '#3a9d1f'
      });
      return;
    }

    setSowingDate(tempSowingDate);
    Swal.fire({
      title: '파종일 설정 완료',
      text: `파종일이 ${tempSowingDate}로 설정되었습니다.`,
      icon: 'success',
      confirmButtonText: '확인',
      confirmButtonColor: '#3a9d1f',
      timer: 1500
    });
  };

// 컴포넌트 내부
const dispatch = useDispatch();
const { calendarData, loading, error } = useSelector((state) => state.calendar);

// 로그인 상태 확인 수정
const token = localStorage.getItem('token');
const isLoggedIn = !!token; // token이 있으면 true, 없으면 false

// 저장하기 핸들러 수정
const handleSave = () => {
  if (!isLoggedIn) {
    Swal.fire({
      title: '로그인 필요',
      text: '캘린더 저장은 로그인 후 이용 가능합니다.',
      icon: 'warning',
      confirmButtonText: '확인',
      confirmButtonColor: '#3a9d1f'
    });
    return;
  }

  if (!sowingDate) {
    Swal.fire({
      title: '파종일 필요',
      text: '파종일을 먼저 선택해주세요.',
      icon: 'warning',
      confirmButtonText: '확인',
      confirmButtonColor: '#3a9d1f'
    });
    return;
  }

  const calendarData = {
    region: selectedCity,
    crop: selectedCrop,
    growth_date: format(new Date(sowingDate), 'yyyy-MM-dd') // 파종일을 growth_date로 사용
  };
  
  // // console.log('저장할 데이터:', calendarData);

  Swal.fire({
    title: '저장하시겠습니까?',
    html: `
      <p>선택하신 정보:</p>
      <p>지역: ${selectedCity}</p>
      <p>작물: ${selectedCrop}</p>
      <p>파종일: ${format(new Date(sowingDate), 'yyyy년 MM월 dd일')}</p>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '저장',
    cancelButtonText: '취소',
    confirmButtonColor: '#3a9d1f',
    cancelButtonColor: '#d33'
  }).then((result) => {
    if (result.isConfirmed) {
      dispatch(saveCalendarData(calendarData))
        .unwrap()
        .then(() => {
          Swal.fire({
            title: '저장 완료',
            text: '캘린더에 성공적으로 저장되었습니다.',
            icon: 'success',
            confirmButtonText: '확인',
            confirmButtonColor: '#3a9d1f'
          });
        })
        .catch((error) => {
          // console.error('저장 실패:', error);
          Swal.fire({
            title: '저장 실패',
            text: error.response?.data?.message || '저장 중 오류가 발생했습니다.',
            icon: 'error',
            confirmButtonText: '확인',
            confirmButtonColor: '#3a9d1f'
          });
        });
    }
  });
};

// 컴포넌트 마운트 시 사용자의 캘린더 데이터 로드
useEffect(() => {
  dispatch(fetchUserCalendar());
}, [dispatch]); 

  const renderTileContent = ({ date: tileDate, view }) => {
    if (view !== 'month') return null;

    const formattedDate = format(tileDate, 'yyyy-MM-dd');
    const guidanceForDate = guidance.filter(g => g.date === formattedDate);
    const taskGuidance = guidanceForDate.filter(g => g.type === 'task');
    const weatherGuidance = guidanceForDate.find(g => g.type === 'weather');
    const harvestGuidance = guidanceForDate.find(g => g.type === 'harvest');

    return (
      <TileContent>
        {weatherGuidance && (
          <WeatherIcon>
            <span>{getWeatherEmoji(weatherGuidance.temperature, weatherGuidance.rainfall)}</span>
            <span className="temperature">{weatherGuidance.temperature}°</span>
          </WeatherIcon>
        )}
        {taskGuidance.length > 0 && (
          <TaskCount>
            🌱 오늘의 할일: {taskGuidance.length}개
          </TaskCount>
        )}
        {harvestGuidance && (
          <HarvestIcon>
            🧺 수확기
          </HarvestIcon>
        )}
      </TileContent>
    );
  };

  const renderTodayGuidance = () => {
    const selectedDate = format(date, 'yyyy-MM-dd');
    const selectedDateGuidance = guidance.filter(g => g.date === selectedDate);
    const taskGuidance = selectedDateGuidance.filter(g => g.type === 'task');
    
    if (selectedDateGuidance.length === 0) {
      return <p>선택한 날짜의 가이드가 없습니다.</p>;
    }

    return (
      <>
        {selectedDateGuidance.map((g, index) => (
          <GuidanceItem key={index} type={g.type}>
            {g.type === 'weather' && (
              <>
                <span>🌤️</span>
                <span>{g.message}</span>
                <span style={{ color: 'black', fontSize: '16px', marginLeft: '8px' }}>
                  ({getWeatherDescription(g.temperature, g.rainfall)})
                </span>
              </>
            )}
            {g.type === 'task' && (
              <>
                <span>🌱</span>
                <span>{g.message}</span>
              </>
            )}
            {g.type === 'harvest' && (
              <>
                <span>🧺</span>
                <span>{g.message}</span>
              </>
            )}
            {g.type === 'growth' && (
              <>
                <span>🌿</span>
                <span>{g.message}</span>
              </>
            )}
          </GuidanceItem>
        ))}
      </>
    );
  };

  return (
    <MainContent>
      <SelectorsContainer>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <Label>도시</Label>
            <Select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>작물</Label>
            <Select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}>
              {crops.map(crop => (
                <option key={crop} value={crop}>{cropEmojis[crop]} {crop}</option>
              ))}
            </Select>
          </div>
          <DateInputContainer>
            <div>
              <Label>파종일</Label>
              <DateInput
                type="date"
                value={tempSowingDate}
                onChange={e => setTempSowingDate(e.target.value)}
              />
            </div>
            <ConfirmButton 
              onClick={handleSowingDateConfirm}
              disabled={!tempSowingDate}
            >
              확인
            </ConfirmButton>
          </DateInputContainer>
        </div>
        {isLoggedIn && (
          <SaveButton onClick={handleSave}>
            저장하기
          </SaveButton>
        )}
      </SelectorsContainer>

      <CalendarContainer>
        <StyledCalendar
          onChange={handleDateChange}
          value={date}
          tileContent={renderTileContent}
          calendarType="gregory"
          onActiveStartDateChange={handleActiveStartDateChange}
          minDetail="month"
          maxDetail="month"
          defaultView="month"
        />
        
        <SowingGuideContainer>
          <SowingGuideTitle>작물별 권장 파종시기</SowingGuideTitle>
          {Object.entries(recommendedSowingPeriods).map(([crop, periods]) => (
            <CropSection key={crop}>
              <CropTitle>
                <span>{cropEmojis[crop]}</span> {crop}
              </CropTitle>
              <SowingPeriodList>
                {periods.map((period, index) => (
                  <SowingPeriodItem key={index}>
                    <span className="period">{period.start} ~ {period.end}</span>
                    <span className="note">{period.note}</span>
                  </SowingPeriodItem>
                ))}
              </SowingPeriodList>
            </CropSection>
          ))}
        </SowingGuideContainer>
      </CalendarContainer>

      <TodayGuidance>
        <h3>{format(date, 'yyyy년 MM월 dd일')} 가이드</h3>
        {renderTodayGuidance()}
      </TodayGuidance>
    </MainContent>
  );
};

export default GrowthCalendar;
