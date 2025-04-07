import { createSlice, createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "../../utils/jwtDecode.js";
import { fetchDeleteAuthData } from "./authslice.js";
import axios from "axios";
import { rootPath } from "../../utils/apiurl";

const initialToken = localStorage.getItem("token");
const initialState = {
  token: initialToken || null,
  user: initialToken ? jwtDecode(initialToken) : null,
  error: null,
  isLoggedIn: !!initialToken,
};

// 상수 추가
const TOKEN_EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24시간

// refreshToken 액션 수정
export const refreshToken = createAsyncThunk(
  'login/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${rootPath}/auth/refresh-token`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        // 24시간으로 통일
        const expireTime = new Date().getTime() + TOKEN_EXPIRE_TIME;
        localStorage.setItem('tokenExpiry', expireTime.toString());
        return response.data;
      }
      
      throw new Error('토큰 갱신 실패');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '토큰 갱신에 실패했습니다.');
    }
  }
);

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.user = jwtDecode(action.payload);
      state.error = null;
      localStorage.setItem("token", action.payload);
      const expireTime = new Date().getTime() + TOKEN_EXPIRE_TIME;
      localStorage.setItem("tokenExpiry", expireTime.toString());
      state.isLoggedIn = true;
    },
    clearToken: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      state.isLoggedIn = false;
    },
  },
  extraReducers: (builder) => {
    // 회원탈퇴 성공 시 로그인 상태 초기화
    builder.addCase(fetchDeleteAuthData.fulfilled, (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry"); // tokenExpiry로 통일
      // 열람 기록 삭제
      localStorage.removeItem(`viewedMedicines_${state.user?.userId}`);
      localStorage.removeItem(`viewedNews_${state.user?.userId}`);
      state.isLoggedIn = false;
    });

    // refreshToken 케이스 추가
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.access_token;
        state.user = jwtDecode(action.payload.access_token);
        state.error = null;
        state.isLoggedIn = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setToken, clearToken } = loginSlice.actions;
export default loginSlice.reducer;
