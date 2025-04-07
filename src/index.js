import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import store from "./redux/store";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { checkLoginStatusThunk, updateLastActivity, logoutAction, 
         checkActivityAndRefreshToken, periodicStatusCheck } from "./redux/slices/authslice";

// 토큰 만료 시간을 전역 상수로 정의
export const TOKEN_EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24시간

const theme = createTheme({
  typography: {
    fontFamily: ["Gowun Dodum", "sans-serif"].join(","),
  },
});

// 페이지 최초 로드 시 localStorage 초기화
const initializeAuth = () => {
  const token = localStorage.getItem("token");
  
  if (token) {
    // 토큰이 있을 때 만료 시간 설정 또는 갱신
    const currentExpireTime = localStorage.getItem("tokenExpiry");
    if (!currentExpireTime) {
      const expireTime = new Date().getTime() + TOKEN_EXPIRE_TIME;
      localStorage.setItem("tokenExpiry", expireTime.toString());
    }
    
    // 만료 체크
    const expireTime = localStorage.getItem("tokenExpiry");
    if (expireTime && new Date().getTime() > parseInt(expireTime)) {
      store.dispatch(logoutAction({
        title: '세션 만료',
        text: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.'
      }));
    }
  }
};

// 활동 감지 및 상태 체크 설정
const setupActivityTracking = () => {
  // 활동 감지
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  
  activityEvents.forEach(eventType => {
    document.addEventListener(eventType, () => {
      store.dispatch(checkActivityAndRefreshToken());
    });
  });

  // 주기적인 상태 체크 (5분마다)
  setInterval(() => {
    store.dispatch(periodicStatusCheck());
  }, 5 * 60 * 1000);
};

// 초기화 실행
initializeAuth();
store.dispatch(checkLoginStatusThunk());
setupActivityTracking();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

export default theme;
