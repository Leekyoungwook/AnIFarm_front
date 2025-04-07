import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { logoutWithAlert } from "../redux/slices/authslice";
import Swal from "sweetalert2";

const useAutoLogout = () => {
  const dispatch = useDispatch();
  const TOKEN_EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24시간

  const handleLogout = useCallback(() => {
    Swal.fire({
      icon: 'warning',
      title: '세션 만료',
      text: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
      confirmButtonText: '확인',
      allowOutsideClick: false,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    }).then(() => {
      dispatch(logoutWithAlert({
        title: '세션 만료',
        text: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.'
      }));
    });
  }, [dispatch]);

  useEffect(() => {
    let inactivityTimeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        handleLogout();
      }, TOKEN_EXPIRE_TIME); // TOKEN_EXPIRE_TIME 사용
    };

    const handleActivity = () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const expireTime = localStorage.getItem("tokenExpiry");
      if (expireTime) {
        const now = new Date().getTime();
        if (now > parseInt(expireTime)) {
          handleLogout();
        } else {
          // 활동이 있을 때마다 만료 시간 갱신
          const newExpireTime = new Date().getTime() + TOKEN_EXPIRE_TIME;
          localStorage.setItem("tokenExpiry", newExpireTime.toString());
          resetInactivityTimer();
        }
      }
    };

    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // 초기 타이머 설정
    if (localStorage.getItem("token")) {
      resetInactivityTimer();
    }

    return () => {
      clearTimeout(inactivityTimeout);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [handleLogout, TOKEN_EXPIRE_TIME]);

  return null;
};

export default useAutoLogout;
