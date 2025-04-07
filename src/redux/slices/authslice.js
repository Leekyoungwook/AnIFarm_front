import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  putRequest,
  loginRequest,
} from "../../utils/requestMethods.js";
import axios from "axios";
import Swal from "sweetalert2";
import {
  POST_AUTH_API_URL,
  POST_EMAIL_VERIFICATION_API_URL,
  POST_LOGIN_API_URL,
  POST_UPDATE_PASSWORD_API_URL,
  POST_RESET_PASSWORD_REQUEST_API_URL,
  POST_RESET_PASSWORD_API_URL,
  DELETE_AUTH_API_URL,
  GET_MYPAGE_API_URL,
  POST_VERIFY_CODE_API_URL
} from "../../utils/apiurl";

// 토큰 만료 시간을 전역 상수로 정의
export const TOKEN_EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24시간

// 회원가입 요청
export const postAuthFetchThunk = (type, url) => {
  return createAsyncThunk(type, async (value, { rejectWithValue }) => {
    try {
      const response = await axios.post(POST_AUTH_API_URL, {
        email: value.email,
        password: value.password,
        birth_date: value.birth_date || null
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue({ message: err.message });
    }
  });
};

export const fetchPostAuthData = postAuthFetchThunk(
  "fetchPostAuth",
  POST_AUTH_API_URL
);

// 이메일 인증 요청
export const fetchPostEmailVerificationData = createAsyncThunk(
  "auth/fetchPostEmailVerificationData",
  async (email, { rejectWithValue }) => {
    try {
      // 이메일 형식 검증
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        Swal.fire({
          icon: 'error',
          title: '올바른 이메일 형식이 아닙니다.',
          showConfirmButton: false,
          timer: 1500
        });
        return rejectWithValue("올바른 이메일 형식이 아닙니다.");
      }

      // URL에 이메일을 쿼리 파라미터로 추가
      const response = await axios.post(`${POST_EMAIL_VERIFICATION_API_URL}?email=${encodeURIComponent(email)}`, null, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.success) {
        Swal.fire({
          icon: 'error',
          title: '이메일 인증 요청에 실패했습니다.',
          showConfirmButton: false,
          timer: 1500
        });
        return rejectWithValue(response.data.message || "이메일 인증 요청에 실패했습니다.");
      }

      Swal.fire({
        icon: 'success',
        title: '인증 이메일이 발송되었습니다.',
        text: '이메일을 확인해주세요.',
        showConfirmButton: false,
        timer: 1500
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 422) {
        Swal.fire({
          icon: 'error',
          title: '올바른 이메일 형식이 아닙니다.',
          showConfirmButton: false,
          timer: 1500
        });
        return rejectWithValue("올바른 이메일 형식이 아닙니다.");
      }
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "이메일 인증 요청에 실패했습니다."
      );
    }
  }
);

// 로그인 요청
export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await loginRequest(userData);
      
      if (response.success && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        // 24시간으로 통일
        const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
        localStorage.setItem("tokenExpiry", expiry.toString());
        return response.data;
      }
      return rejectWithValue(response.data?.message || "로그인 실패");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "로그인 실패");
    }
  }
);

// 회원정보 수정 요청
const updateAuthFetchThunk = (actionType, apiURL) => {
  return createAsyncThunk(
    actionType,
    async (updateData, { rejectWithValue }) => {
      try {
        const options = {
          body: JSON.stringify(updateData),
        };
        const fullPath = `${apiURL}/${updateData.id}`;
        const response = await putRequest(fullPath, options);
        return response;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );
};

export const fetchUpdateAuthData = createAsyncThunk(
  "auth/updatePassword",
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await axios.post(POST_UPDATE_PASSWORD_API_URL, updateData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "비밀번호 변경에 실패했습니다.");
    }
  }
);

// 비밀번호 재설정 요청
export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(POST_RESET_PASSWORD_REQUEST_API_URL, { email }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "비밀번호 재설정 요청에 실패했습니다.");
    }
  }
);

// 비밀번호 재설정
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await axios.post(POST_RESET_PASSWORD_API_URL, resetData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "비밀번호 재설정에 실패했습니다.");
    }
  }
);

// 회원정보 삭제 요청
export const fetchDeleteAuthData = createAsyncThunk(
  "auth/deleteUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await axios.delete(DELETE_AUTH_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        return response.data;
      } else {
        throw new Error(response.data.message || "회원 탈퇴에 실패했습니다.");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "회원 탈퇴에 실패했습니다."
      );
    }
  }
);

// 마이페이지 데이터 조회 액션 추가
export const fetchUserInfo = createAsyncThunk(
  "auth/fetchUserInfo",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("토큰이 없습니다.");
      }

      const response = await axios.get(GET_MYPAGE_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "사용자 정보를 가져오는데 실패했습니다.");
    }
  }
);

// 비동기 로그아웃 처리를 위한 thunk
export const logoutWithAlert = createAsyncThunk(
  'auth/logoutWithAlert',
  async ({ title, text }, { dispatch }) => {
    await Swal.fire({
      icon: 'warning',
      title: title || '자동 로그아웃',
      text: text || '장시간 활동이 없어 자동 로그아웃되었습니다.',
      confirmButtonText: '확인',
      allowOutsideClick: false,
      timer: 3000,
      timerProgressBar: true
    });
    
    dispatch(logoutThunk());
    return true;
  }
);

// 토큰 체크 로직 수정
export const checkLoginStatusThunk = createAsyncThunk(
  'auth/checkLoginStatusThunk',
  async (_, { dispatch, getState }) => {
    // 현재 로그인 상태 확인
    const { isAuthenticated } = getState().auth;
    
    // 로그인된 상태일 때만 토큰 체크 수행
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      const tokenExpiry = localStorage.getItem("tokenExpiry");
      
      if (!token || !tokenExpiry) {
        dispatch(logoutWithAlert({
          title: '인증 만료',
          text: '로그인 정보가 만료되었습니다. 다시 로그인해주세요.'
        }));
        return;
      }

      const now = new Date().getTime();
      if (parseInt(tokenExpiry) < now) {
        dispatch(logoutWithAlert({
          title: '세션 만료',
          text: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.'
        }));
        return;
      }
    }
  }
);

// 토큰 만료 15분 전에 자동 갱신하는 로직 수정
export const checkTokenExpiration = createAsyncThunk(
  'auth/checkTokenExpiration',
  async (_, { dispatch }) => {
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const now = new Date().getTime();
    const timeToExpiry = parseInt(tokenExpiry) - now;
    
    if (timeToExpiry < 15 * 60 * 1000) { // 15분 미만 남은 경우
      await dispatch(refreshTokenThunk()); // refreshToken을 refreshTokenThunk로 변경
    }
  }
);

// 로그아웃 처리를 위한 공통 함수
const performLogout = () => {
  localStorage.clear();
  sessionStorage.clear();
};

// logoutThunk로 이름 변경
export const logoutThunk = createAsyncThunk(
  'auth/logoutThunk',
  async (_, { dispatch }) => {
    performLogout();
    return true;
  }
);

// handleFulfilled 함수 정의 : 요청 성공 시 상태 업데이트 로직을 별도의 함수로 분리
const handleFulfilled = (stateKey) => (state, action) => {
  state[stateKey] = action.payload; // action.payload에 응답 데이터가 들어있음
};

// handleRejected 함수 수정
const handleRejected = (state, action) => {
  state.isError = true;
  state.errorMessage = action.payload?.message || "오류가 발생했습니다.";
};

// 토큰 갱신 thunk 추가
export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      // // console.log('토큰 갱신 시도:', new Date().toLocaleTimeString());
      // // console.log('현재 토큰:', token);

      const response = await fetch('/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.newToken) {
          // 새 토큰 저장
          localStorage.setItem("token", data.data.newToken);
          // 만료 시간 갱신
          const newExpireTime = new Date().getTime() + TOKEN_EXPIRE_TIME;
          localStorage.setItem("tokenExpiry", newExpireTime.toString());
          
          // // console.log('토큰 갱신 성공:', new Date().toLocaleTimeString());
          // // console.log('새 토큰:', data.data.newToken);
          // // console.log('새 만료 시간:', new Date(newExpireTime).toLocaleString());
          
          return data.data;
        }
      }
      throw new Error('토큰 갱신 실패');
    } catch (error) {
      // console.error('토큰 갱신 실패:', error);
      return rejectWithValue(error.message);
    }
  }
);

// 활동 체크 및 토큰 갱신 thunk
export const checkActivityAndRefreshToken = createAsyncThunk(
  'auth/checkActivityAndRefresh',
  async (_, { dispatch, getState }) => {
    const token = localStorage.getItem("token");
    const expireTime = localStorage.getItem("tokenExpiry");
    
    if (token) {
      const now = new Date().getTime();
      const timeToExpiry = parseInt(expireTime) - now;
      
      // // console.log('토큰 만료까지 남은 시간:', Math.round(timeToExpiry / 1000 / 60), '분');
      
      // 만료 10분 전부터 토큰 갱신 시도
      if (expireTime && timeToExpiry <= 10 * 60 * 1000) {
        // // console.log('토큰 갱신 조건 충족 - 10분 이내 만료');
        try {
          await dispatch(refreshTokenThunk()).unwrap();
          dispatch(updateLastActivity());
          return true;
        } catch (error) {
          // console.error('토큰 갱신 실패:', error);
          return false;
        }
      } else {
        // // console.log('토큰 갱신 불필요 - 만료 시간 여유 있음');
        dispatch(updateLastActivity());
        return true;
      }
    }
    return false;
  }
);

// 주기적인 상태 체크 thunk
export const periodicStatusCheck = createAsyncThunk(
  'auth/periodicStatusCheck',
  async (_, { dispatch, getState }) => {
    const { isAuthenticated } = getState().auth;
    
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      const expireTime = localStorage.getItem("tokenExpiry");
      const now = new Date().getTime();

      if (!token || !expireTime || now > parseInt(expireTime)) {
        await Swal.fire({
          icon: 'warning',
          title: '세션 만료',
          text: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
          confirmButtonText: '확인'
        });
        dispatch(logoutAction());
        return false;
      }

      try {
        await dispatch(checkLoginStatusThunk()).unwrap();
        return true;
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: '인증 오류',
          text: '로그인 상태 확인에 실패했습니다. 다시 로그인해주세요.',
          confirmButtonText: '확인'
        });
        dispatch(logoutAction());
        return false;
      }
    }
    return false;
  }
);

// 인증 코드 검증 요청
export const verifyEmailCode = createAsyncThunk(
  "auth/verifyEmailCode",
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const response = await axios.post(POST_VERIFY_CODE_API_URL, { email, code }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.success) {
        Swal.fire({
          icon: 'error',
          title: '인증 실패',
          text: response.data.message || '인증 코드 확인에 실패했습니다.',
          showConfirmButton: false,
          timer: 1500
        });
        return rejectWithValue(response.data.message || "인증 코드 확인에 실패했습니다.");
      }

      Swal.fire({
        icon: 'success',
        title: '인증 성공',
        text: '이메일이 성공적으로 인증되었습니다.',
        showConfirmButton: false,
        timer: 1500
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "인증 코드 확인에 실패했습니다."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    postAuthData: null,
    postLoginData: null,
    verificationCode: null,
    isEmailVerified: false,
    isError: false,
    errorMessage: null,
    deleteAuthData: null,
    updateAuthData: null,
    loginExpireTime: null,
    loading: false,
    user: null,
    isAuthenticated: false,
    userInfo: null,
    userInfoLoading: false,
    userInfoError: null,
    lastActivity: new Date().getTime(),
    hasShownExpiryAlert: false,
    hasShownInactivityAlert: false,
    redirectToLogin: false
  },
  reducers: {
    verifyEmail: (state, action) => {
      if (action.payload) {
        state.verificationCode = action.payload;
        state.isEmailVerified = true;
      }
    },
    resetAuthState: (state) => {
      state.verificationCode = null;
      state.isEmailVerified = false;
    },
    cancelMembership: (state) => {
      state.postLoginData = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    logoutAction: (state) => {
      Object.assign(state, {
        postLoginData: null,
        loginExpireTime: null,
        isEmailVerified: false,
        verificationCode: null,
        deleteAuthData: null,
        updateAuthData: null,
        isError: false,
        errorMessage: null,
        lastActivity: null,
        isAuthenticated: false,
        user: null,
        redirectToLogin: true
      });
      
      performLogout();
    },
    updateLastActivity: (state) => {
      const now = new Date().getTime();
      state.lastActivity = now;
      // // console.log('활동 시간 업데이트:', new Date(now).toLocaleTimeString());
    },
    clearRedirectFlag: (state) => {
      state.redirectToLogin = false;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchPostAuthData.fulfilled, handleFulfilled("postAuthData"))
      .addCase(fetchPostAuthData.rejected, handleRejected)

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.postLoginData = action.payload;
        state.lastActivity = new Date().getTime();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload?.status === 401) {
          state.errorMessage = "인증이 만료되었습니다. 다시 로그인해주세요.";
          Swal.fire({
            icon: 'error',
            title: '인증 만료',
            text: '다시 로그인해주세요.',
            confirmButtonText: '확인',
            timer: 3000,
            timerProgressBar: true,
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            }
          });
          return logoutWithAlert({ title: '인증 만료', text: '다시 로그인해주세요.' });
        }
      })

      .addCase(fetchPostEmailVerificationData.fulfilled, (state, action) => {
        state.verificationCode = action.payload;
      })
      .addCase(fetchPostEmailVerificationData.rejected, handleRejected)

      .addCase(fetchDeleteAuthData.fulfilled, (state, action) => {
        state.deleteAuthData = action.payload;
        state.postLoginData = null;
      })
      .addCase(fetchDeleteAuthData.rejected, handleRejected)

      .addCase(fetchUpdateAuthData.fulfilled, (state, action) => {
        state.updateAuthData = action.payload;
      })
      .addCase(fetchUpdateAuthData.rejected, handleRejected)

      .addCase(fetchUserInfo.pending, (state) => {
        state.userInfoLoading = true;
        state.userInfoError = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.userInfoLoading = false;
        state.userInfo = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.userInfoLoading = false;
        state.userInfoError = action.payload;
      })

      .addCase(logoutThunk.fulfilled, (state) => {
        // logoutAction 리듀서 재사용
        authSlice.caseReducers.logoutAction(state);
      })
      
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.lastActivity = new Date().getTime();
      })
      .addCase(refreshTokenThunk.rejected, (state, action) => {
        // 토큰 갱신 실패 시 처리
        // console.error('토큰 갱신 실패:', action.payload);
      })
      
      .addCase(checkActivityAndRefreshToken.fulfilled, (state, action) => {
        if (action.payload) {
          state.lastActivity = new Date().getTime();
        }
      })
      
      .addCase(periodicStatusCheck.fulfilled, (state, action) => {
        if (!action.payload) {
          state.isAuthenticated = false;
        }
      })

      .addCase(verifyEmailCode.fulfilled, (state, action) => {
        state.isEmailVerified = true;
        state.verificationCode = null;
      })
      .addCase(verifyEmailCode.rejected, (state, action) => {
        state.isEmailVerified = false;
        state.errorMessage = action.payload;
      });
  },
});

export const {
  verifyEmail,
  resetAuthState,
  cancelMembership,
  logoutAction,
  updateLastActivity,
  clearRedirectFlag
} = authSlice.actions;

export default authSlice.reducer;
