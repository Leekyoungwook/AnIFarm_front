import { combineReducers, configureStore } from "@reduxjs/toolkit";
// combineReducers: 여러 리듀서를 하나로 합쳐주는 함수
// configureStore: 스토어를 생성하는 함수
import authReducer from "./slices/authslice";
import loginReducer from "./slices/loginslice";
import writeReducer from "./slices/writeSlice";
import commentReducer from "./slices/commentSlice";
import imageModelReducer from "./slices/imageModelSlice";
import apiReducer from "./slices/apiSlice";
import calendarReducer from "./slices/calendarSlice";
import youngFarmerReducer from './slices/youngFarmerSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  login: loginReducer,
  write: writeReducer,
  comments: commentReducer,
  imageModel: imageModelReducer,
  api: apiReducer,
  calendar: calendarReducer,
  youngFarmer: youngFarmerReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 비직렬화 가능한 값 허용
    }),
});

export default store;
