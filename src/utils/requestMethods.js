import axios from "axios";

// 기본 URL 설정
const AUTH_BASE_URL = "https://backend.jjiwon.site";  // 인증 관련 요청용
const API_BASE_URL = "https://backend.jjiwon.site/api";  // 일반 API 요청용

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 인증용 axios 인스턴스 생성
const authAxiosInstance = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰 관리 함수
const getTokenWithExpiry = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const tokenData = localStorage.getItem("tokenExpiry");
  if (!tokenData) return null;

  const expiry = parseInt(tokenData);
  const now = new Date().getTime();

  if (now > expiry) {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    return null;
  }
  return token;
};

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getTokenWithExpiry();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 인증용 요청 인터셉터 추가
authAxiosInstance.interceptors.request.use(
  (config) => {
    const token = getTokenWithExpiry();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getRequest = async (url) => {
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postRequest = async (url, data) => {
  try {
    const response = await axiosInstance.post(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const putRequest = async (url, data) => {
  try {
    const response = await axiosInstance.put(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteRequest = async (url) => {
  try {
    const response = await axiosInstance.delete(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// myMedi 요청 함수
export async function postMyMediRequest(url, options) {
  const token = getTokenWithExpiry();
  const defaultOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        JSON.stringify({
          status: response.status,
          msg: data.msg || "Request failed",
        })
      );
    }
    return { status: response.status, data }; // 성공 시 상태 코드와 데이터를 반환
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error(
          JSON.stringify({
            status: 500,
            msg: error.message || "Unknown error occurred",
          })
        );
  }
}

export async function postFormRequest(url, options) {
  const token = getTokenWithExpiry();
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || "Something went wrong");
  }

  return { status: response.status, data: responseData };
}

export async function patchRequest(url, options) {
  const token = getTokenWithExpiry();
  return await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  });
}

// 로그인 요청 함수
export const loginRequest = async (data) => {
  try {
    // // console.log("로그인 요청 데이터:", data);
    const response = await authAxiosInstance.post("/auth/login", data);
    // // console.log("로그인 응답 데이터:", response);
    return response.data;
  } catch (error) {
    // console.error("로그인 요청 에러:", error.response?.data || error);
    throw error;
  }
};

