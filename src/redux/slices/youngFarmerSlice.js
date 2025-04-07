import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { rootPath } from '../../utils/apiurl';

// 청년농 목록 조회
export const fetchYoungFarmerList = createAsyncThunk(
  'youngFarmer/fetchList',
  async ({ s_code = "01", page = 1, row_cnt = 200 }) => {
    try {
      const response = await axios.get(`${rootPath}/api/youth/list`, {
        params: {
          s_code,
          cp: page,
          row_cnt
        }
      });
      return response.data;
    } catch (error) {
      console.error('API 호출 에러:', error);
      throw error;
    }
  }
);

const initialState = {
  farmerList: [],
  paging: {
    currentPage: 1,
    totalCount: 0,
    lastPage: 1
  },
  selectedCategory: "02",
  loading: false,
  error: null
};

const youngFarmerSlice = createSlice({
  name: 'youngFarmer',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearFarmerList: (state) => {
      state.farmerList = [];
      state.paging = initialState.paging;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchYoungFarmerList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchYoungFarmerList.fulfilled, (state, action) => {
        state.loading = false;
        state.farmerList = action.payload.data.youth_list;
        state.paging = action.payload.data.youth_paging;
      })
      .addCase(fetchYoungFarmerList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setCategory, clearFarmerList } = youngFarmerSlice.actions;
export default youngFarmerSlice.reducer; 