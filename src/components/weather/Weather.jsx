import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  BsSun,
  BsCloudSun,
  BsCloud,
  BsClouds,
  BsCloudRain,
  BsCloudRainHeavy,
  BsCloudLightningRain,
  BsSnow,
  BsCloudFog,
} from "react-icons/bs";
import { GET_CITIES_API_URL, GET_WEATHER_API_URL, GET_SATELLITE_API_URL } from '../../utils/apiurl';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);  // 도시 목록
  const [selectedCity, setSelectedCity] = useState("서울");  // 선택된 도시
  const [satelliteData, setSatelliteData] = useState(null);
  const [imageType, setImageType] = useState('truecolor');
  const mapRef = useRef(null);

  // 도시 목록 가져오기
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(GET_CITIES_API_URL);
        if (response.data.success) {
          setCities(response.data.data.cities);
        } else {
          console.error("도시 목록 가져오기 실패:", response.data.message);
          setCities([]); // 실패 시 빈 배열로 초기화
        }
      } catch (error) {
        console.error("도시 목록 가져오기 오류:", error);
        setCities([]); // 오류 발생 시 빈 배열로 초기화
      }
    };

    fetchCities();
  }, []);

  // 로딩 상태를 개별적으로 관리
  const [loadingCity, setLoadingCity] = useState(null);

  // 날씨 데이터 가져오기 함수 수정
  const fetchWeatherData = async (city) => {
    try {
      setLoadingCity(city);
      const weatherResponse = await axios.get(
        `${GET_WEATHER_API_URL}?city=${city}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (weatherResponse.data.success && weatherResponse.data.data.raw && weatherResponse.data.data.raw.list) {
        const dailyData = processWeatherData(weatherResponse.data.data.raw.list);
        setWeatherData(dailyData);
        setSelectedCity(city);
      } else {
        throw new Error("날씨 데이터 형식이 올바르지 않습니다");
      }
    } catch (err) {
      console.error("데이터 가져오기 오류:", err);
      setError(err.message);
    } finally {
      setLoadingCity(null);
    }
  };

  // 위성 이미지 데이터 가져오기
  useEffect(() => {
    const fetchSatelliteData = async () => {
      try {
        const response = await axios.get(GET_SATELLITE_API_URL);
        // console.log("Satellite API Response:", response.data);
        
        if (response.data.success && response.data.data) {
          setSatelliteData(response.data.data);
        } else {
          console.error("위성 데이터 형식이 올바르지 않습니다:", response.data);
        }
      } catch (err) {
        console.error("위성 데이터 가져오기 오류:", err);
      }
    };

    fetchSatelliteData();
    
    // 10분마다 데이터 갱신
    const interval = setInterval(fetchSatelliteData, 600000);
    return () => clearInterval(interval);
  }, []);

  const processWeatherData = (list) => {
    if (!Array.isArray(list)) {
      console.error("리스트 데이터가 배열이 아닙니다:", list);
      return [];
    }

    const dailyData = [];
    const today = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // 해당 날짜의 데이터 필터링
      const dayData = list.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate.getDate() === date.getDate();
      });

      if (dayData.length > 0) {
        // 일일 데이터 계산
        const dayWeather = {
          dt: date.getTime() / 1000,
          main: {
            temp_max: Math.max(...dayData.map(d => d.main.temp_max)),
            temp_min: Math.min(...dayData.map(d => d.main.temp_min)),
            temp: dayData.reduce((sum, d) => sum + d.main.temp, 0) / dayData.length,
            humidity: dayData[0].main.humidity
          },
          weather: dayData[0].weather,
          pop: Math.round(Math.max(...dayData.map(d => d.pop || 0)) * 100),
          rain: dayData.reduce((sum, d) => sum + (d.rain?.['3h'] || 0), 0)
        };
        
        dailyData.push(dayWeather);
      }
    }

    // console.log("처리된 일일 데이터:", dailyData);
    return dailyData;
  };

  const createNewDataFrame = (dailyData) => {
    const newData = dailyData.map((day) => ({
      "avg temp": Math.round(day.main.temp),
      "max temp": Math.round(day.main.temp_max),
      "min temp": Math.round(day.main.temp_min),
      rainFall: day.rain ? day.rain.toFixed(1) : "0.0",
    }));

    // console.log(newData); // 콘솔에 새로운 데이터프레임 출력
  };

  const getWeatherIcon = (iconCode) => {
    const dayIcon = iconCode.replace("n", "d");

    const iconMap = {
      "01d": <BsSun className="w-10 h-10 text-yellow-400" />,
      "02d": <BsCloudSun className="w-10 h-10 text-blue-400" />,
      "03d": <BsCloud className="w-10 h-10 text-gray-500" />,
      "04d": <BsClouds className="w-10 h-10 text-gray-600" />,
      "09d": <BsCloudRain className="w-10 h-10 text-blue-500" />,
      "10d": <BsCloudRainHeavy className="w-10 h-10 text-blue-600" />,
      "11d": <BsCloudLightningRain className="w-10 h-10 text-yellow-500" />,
      "13d": <BsSnow className="w-10 h-10 text-blue-200" />,
      "50d": <BsCloudFog className="w-10 h-10 text-gray-400" />,
    };

    return iconMap[dayIcon] || <BsSun className="w-10 h-10 text-yellow-400" />;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(price));
  };

  // 탭 스타일을 위한 함수 수정
  const getTabStyle = (city) => {
    return `px-2 py-2 rounded-lg transition-all duration-200 text-sm ${
      selectedCity === city
        ? "bg-blue-500 text-white shadow-md"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;
  };

  // 기존 useEffect 수정
  useEffect(() => {
    fetchWeatherData(selectedCity);
  }, []); // 최초 로딩시에만 실행

  // 전체 로딩 상태 체크 수정
  if (loading && !weatherData) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0aab65]" />
    </div>
  );
  if (error) return <div>에러: {error}</div>;
  if (!weatherData) return <div>날씨 데이터가 없습니다.</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* 도시 선택 탭 */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <h2 className="text-xl font-medium col-span-2">지역별 날씨</h2>
        </div>
        {/* 한 줄 레이아웃 (lg 화면 이상) */}
        <div className="hidden lg:grid grid-cols-8 gap-1 p-2 bg-gray-50 rounded-xl shadow-sm">
          {cities.map((city) => (
            <button
              key={`lg-${city}`}
              onClick={() => fetchWeatherData(city)}
              disabled={loadingCity === city}
              className={getTabStyle(city)}
            >
              {loadingCity === city ? (
                <span className="inline-flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {city}
                </span>
              ) : (
                <span className="text-center">{city}</span>
              )}
            </button>
          ))}
        </div>
        
        {/* 두 줄 레이아웃 (lg 화면 미만) */}
        <div className="lg:hidden grid grid-cols-4 gap-2 p-2 bg-gray-50 rounded-xl shadow-sm">
          {cities.map((city) => (
            <button
              key={`sm-${city}`}
              onClick={() => fetchWeatherData(city)}
              disabled={loadingCity === city}
              className={`${getTabStyle(city)} text-center`}
            >
              {loadingCity === city ? (
                <span className="inline-flex items-center justify-center w-full">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {city}
                </span>
              ) : (
                <span className="text-center w-full">{city}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 날씨 섹션 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-black">
            {selectedCity} 주간예보
          </h2>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>

        {/* 전체 컨테이너에 동일한 width 적용 */}
        <div className="max-w-3xl mx-auto">
          {/* 오늘과 내일 날씨 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {weatherData.slice(0, 2).map((day, index) => {
              const date = new Date(day.dt * 1000);
              return (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg">
                        {index === 0 ? "오늘" : "내일"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {date.getMonth() + 1}.{date.getDate()}.
                      </div>
                      <div className="mt-2">
                        {getWeatherIcon(day.weather[0].icon)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">
                          {Math.round(day.main.temp_min)}°
                        </span>
                        <span className="text-gray-500">
                          {Math.round(day.main.temp)}°
                        </span>
                        <span className="text-red-500">
                          {Math.round(day.main.temp_max)}°
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">습도 {day.main.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">
                          강수확률 {day.pop || 0}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">
                          강수량 {day.rain ? day.rain.toFixed(1) : "0.0"}mm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 주간 날씨 */}
          <div className="grid grid-cols-6 gap-2">
            {weatherData.slice(0, 6).map((day, index) => {
              const date = new Date(day.dt * 1000);
              const weekday = new Intl.DateTimeFormat("ko-KR", {
                weekday: "short",
              }).format(date);
              return (
                <div key={index} className="text-center p-2">
                  <div className="font-medium">{weekday}</div>
                  <div className="text-sm text-gray-500">
                    {date.getMonth() + 1}.{date.getDate()}.
                  </div>
                  <div className="flex justify-center items-center my-2">
                    {getWeatherIcon(day.weather[0].icon)}
                  </div>
                  <div className="flex justify-center gap-2 text-sm">
                    <span className="text-blue-500">
                      {Math.round(day.main.temp_min)}°
                    </span>
                    <span className="text-gray-500">
                      {Math.round(day.main.temp)}°
                    </span>
                    <span className="text-red-500">
                      {Math.round(day.main.temp_max)}°
                    </span>
                  </div>
                  <div className="text-sm text-blue-500">{day.pop || 0}%</div>
                  <div className="text-sm text-blue-500">
                    {day.rain ? day.rain.toFixed(1) : "0.0"}mm
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 위성 이미지 섹션 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">한반도 위성 영상</h2>
          <span className="text-sm text-gray-500">10분마다 업데이트</span>
        </div>
        <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100">
          {satelliteData && satelliteData.length > 0 && satelliteData[0]['satImgC-file'] ? (
            <div className="relative min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
              <img
                src={satelliteData[0]['satImgC-file'].split(',')[0].replace('[', '')}
                alt="한반도 위성 영상"
                className="w-full h-full object-contain"
                style={{
                  backgroundColor: '#000'
                }}
                onError={(e) => {
                  // console.log("이미지 로딩 실패");
                  e.target.parentElement.innerHTML = `
                    <div class="flex items-center justify-center h-full text-gray-500">
                      <div class="text-center">
                        <p>위성 영상을 불러올 수 없습니다</p>
                        <p class="text-sm mt-2">잠시 후 다시 시도해주세요</p>
                      </div>
                    </div>
                  `;
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[300px] text-gray-500">
              <div className="text-center">
                <p>위성 영상을 불러올 수 없습니다</p>
                <p className="text-sm mt-2">잠시 후 다시 시도해주세요</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            기상청 제공
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500 text-center">
          * 위성 영상은 10분마다 업데이트됩니다
        </div>
      </div>
    </div>
  );
};

export default Weather;