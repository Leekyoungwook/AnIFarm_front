import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { rootPath } from "../../utils/apiurl";

// axios 인스턴스 생성
const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Async Thunks
export const fetchPosts = createAsyncThunk(
  "write/fetchPosts",
  async (communityType) => {
    const response = await axiosInstance.get(
      `${rootPath}/api/write/community/${communityType}`
    );
    return response.data;
  }
);

export const createPost = createAsyncThunk(
  "write/createPost",
  async (postData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue({ message: "로그인이 필요합니다." });
      }

      const response = await axiosInstance.post(`${rootPath}/api/write/create`, postData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue({ message: "로그인이 필요합니다." });
      }
      return rejectWithValue(error.response?.data || { message: "게시글 작성 중 오류가 발생했습니다." });
    }
  }
);

export const deletePost = createAsyncThunk(
  "write/deletePost",
  async (postId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      }
      
      const response = await axiosInstance.delete(`${rootPath}/api/write/${postId}`);
      return postId;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("로그인이 필요하거나 인증이 만료되었습니다. 다시 로그인해주세요.");
      }
      throw error;
    }
  }
);

export const fetchMyPosts = createAsyncThunk(
  "write/fetchMyPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${rootPath}/api/write/user`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "게시글 조회에 실패했습니다.");
    }
  }
);

export const updatePost = createAsyncThunk(
  'write/updatePost',
  async (postData) => {
    try {
      const response = await axiosInstance.put(`${rootPath}/api/posts/${postData.post_id}`, {
        title: postData.title,
        content: postData.content,
        category: postData.category,
        community_type: postData.community_type
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

const writeSlice = createSlice({
  name: "write",
  initialState: {
    posts: {
      data: [],
      success: false,
      message: null,
    },
    currentPost: null,
    loading: false,
    error: null,
    myPosts: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 게시글 목록 조회
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.posts = {
            data: action.payload.data || [],
            success: true,
            message: null
          };
        } else {
          state.posts = {
            data: [],
            success: false,
            message: action.payload.message || "게시글 목록 조회에 실패했습니다."
          };
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        console.error("[writeSlice] 게시글 목록 조회 실패:", action.payload);
        state.loading = false;
        state.error = action.payload;
        state.posts = {
          data: [],
          success: false,
          message: action.payload?.message || "게시글 목록 조회에 실패했습니다."
        };
      })
      // 게시글 작성
      .addCase(createPost.pending, (state) => {
        // console.log("[writeSlice] 게시글 작성 중...");
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        // console.log("[writeSlice] 게시글 작성 성공:", action.payload);
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.posts.data = [action.payload.data, ...(state.posts.data || [])];
          state.posts.success = true;
          state.posts.message = null;
        } else {
          state.posts.success = false;
          state.posts.message = action.payload.message || "게시글 작성에 실패했습니다.";
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        console.error("[writeSlice] 게시글 작성 실패:", action.payload);
        state.loading = false;
        state.error = action.payload;
        state.posts.success = false;
        state.posts.message = action.payload?.message || "게시글 작성에 실패했습니다.";
      })
      // 게시글 삭제
      .addCase(deletePost.pending, (state) => {
        // console.log("[writeSlice] 게시글 삭제 중...");
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        // console.log("[writeSlice] 게시글 삭제 성공:", action.payload);
        state.loading = false;
        if (Array.isArray(state.posts.data)) {
          state.posts.data = state.posts.data.filter(
            (post) => post.post_id !== action.payload
          );
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        console.error("[writeSlice] 게시글 삭제 실패:", action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.myPosts = action.payload.data || [];
      })
      .addCase(fetchMyPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updatePost 액션 처리
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        // 필요한 경우 상태 업데이트
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const selectPosts = (state) => state.write.posts;
export const selectCurrentPost = (state) => state.write.currentPost;
export const selectLoading = (state) => state.write.loading;
export const selectError = (state) => state.write.error;
export const selectMyPosts = (state) => state.write.myPosts;

export default writeSlice.reducer;
