// 시작 주차와 종료 주차 설정
export const START_PERIOD = "202101";  // 2021년 1주차
export const END_PERIOD = "202513";    // 2025년 13주차

// 한글 키 매핑
export const keyMapping = {
  갈치: "갈치",
  감: "감",
  감귤: "감귤",
  건고추: "건고추",
  건멸치: "건멸치",
  고구마: "고구마",
  굴: "굴",
  김: "김",
  대파: "대파",
  딸기: "딸기",
  무: "무",
  물오징어: "물오징어",
  바나나: "바나나",
  방울토마토: "방울토마토",
  배: "배",
  배추: "배추",
  복숭아: "복숭아",
  사과: "사과",
  상추: "상추",
  새우: "새우",
  수박: "수박",
  시금치: "시금치",
  쌀: "쌀",
  양파: "양파",
  오렌지: "오렌지",
  오이: "오이",
  전복: "전복",
  참다래: "참다래",
  찹쌀: "찹쌀",
  체리: "체리",
  토마토: "토마토",
  포도: "포도"
};

// 데이터 유효성 검사 함수
export const isValidPeriod = (period) => {
  if (!period) return false;
  const year = parseInt(period.substring(0, 4));
  const week = parseInt(period.substring(4));
  
  if (year < 2021 || year > 2025) return false;
  if (year === 2025 && week > 13) return false;
  if (week < 1 || week > 52) return false;
  return true;
};

// 다음 주차 계산 함수
export const getNextPeriod = (currentPeriod) => {
  const year = parseInt(currentPeriod.substring(0, 4));
  const week = parseInt(currentPeriod.substring(4));
  
  if (year === 2025 && week === 13) return "202101";  // 2025년 1분기 이후 다시 처음으로
  
  if (week === 52) {
    return `${year + 1}01`;
  }
  return `${year}${(week + 1).toString().padStart(2, "0")}`;
};

// 이전 주차 계산 함수
export const getPrevPeriod = (currentPeriod) => {
  const year = parseInt(currentPeriod.substring(0, 4));
  const week = parseInt(currentPeriod.substring(4));
  
  if (year === 2021 && week === 1) return "202513";  // 2021년 1주차 이전은 2025년 1분기로
  
  if (week === 1) {
    return `${year - 1}52`;
  }
  return `${year}${(week - 1).toString().padStart(2, "0")}`;
};
