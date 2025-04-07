import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { rootPath } from "../../utils/apiurl";

const initialState = {
  comments: [],
  myComments: [],
  loading: false,
  error: null,
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    // 로딩 상태
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // 에러 상태
    setError: (state, action) => {
      state.error = action.payload;
    },
    // 댓글 목록 설정
    setComments: (state, action) => {
      state.comments = action.payload;
      state.loading = false;
      state.error = null;
    },
    // 댓글 추가
    addComment: (state, action) => {
      state.comments.unshift(action.payload);
      state.loading = false;
      state.error = null;
    },
    // 댓글 수정
    updateComment: (state, action) => {
      const { comment_id, content } = action.payload;
      const comment = state.comments.find((c) => c.comment_id === comment_id);
      if (comment) {
        comment.content = content;
        comment.updated_at = new Date().toISOString();
      }
      state.loading = false;
      state.error = null;
    },
    // 댓글 삭제
    removeComment: (state, action) => {
      state.comments = state.comments.filter(
        (comment) => comment.comment_id !== action.payload
      );
      state.loading = false;
      state.error = null;
    },
    // 내 댓글 목록 설정
    setMyComments: (state, action) => {
      state.myComments = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchComments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
        state.error = null;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createComment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyComments.fulfilled, (state, action) => {
        state.loading = false;
        state.myComments = action.payload.data || [];
      })
      .addCase(fetchMyComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        state.myComments = state.myComments.filter(
          comment => comment.comment_id !== action.meta.arg
        );
        state.comments = state.comments.filter(
          comment => comment.comment_id !== action.meta.arg
        );
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// 액션 생성자
export const {
  setLoading,
  setError,
  setComments,
  addComment,
  updateComment,
  removeComment,
  setMyComments,
} = commentSlice.actions;

// Thunk 액션 생성자
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (postId) => {
    const response = await axios.get(`${rootPath}/api/comments/${postId}`);
    return response.data.data;
  }
);

export const createComment = createAsyncThunk(
  'comments/createComment',
  async (commentData, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue("로그인이 필요합니다.");
      }

      const decoded = jwtDecode(token);
      const userEmail = decoded.sub;

      const requestData = {
        post_id: parseInt(commentData.post_id),
        content: commentData.content.trim(),
        user_email: userEmail,
        parent_id: commentData.parent_id || null
      };

      const response = await axios.post(`${rootPath}/api/comments`, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const newComment = response.data.data;
        dispatch(addComment(newComment));
        return newComment;
      } else {
        return rejectWithValue(response.data.message || "댓글 생성에 실패했습니다.");
      }
    } catch (error) {
      return rejectWithValue(error.message || "댓글 생성에 실패했습니다.");
    }
  }
);

export const editComment = (commentId, content, postId) => async (dispatch) => {
  try {
    const response = await axios.put(`${rootPath}/api/comments/${commentId}`, {
      content: content.trim()
    });
    if (response.data.success) {
      dispatch(updateComment({ comment_id: commentId, content }));
      dispatch(fetchComments(postId));
    }
  } catch (error) {
    dispatch(setError(error.message || "댓글 수정에 실패했습니다."));
  }
};

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${rootPath}/api/comments/${commentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "댓글 삭제에 실패했습니다.");
    }
  }
);

export const fetchMyComments = createAsyncThunk(
  'comments/fetchMyComments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${rootPath}/api/comments/my`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "내 댓글 조회에 실패했습니다.");
    }
  }
);

export const selectMyComments = (state) => state.comments.myComments;

export default commentSlice.reducer;
