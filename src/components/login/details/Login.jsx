import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../../redux/slices/authslice";
import { setToken } from "../../../redux/slices/loginslice";
import Swal from "sweetalert2";

const Login = () => {
  const dispatch = useDispatch();
  const navigator = useNavigate();

  const [value, setValue] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setValue({
      ...value,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // // console.log("로그인 시도:", value);

    if (value.email === "" || value.password === "") {
      await Swal.fire({
        icon: "warning",
        title: "입력 오류",
        text: "이메일, 비밀번호는 필수 입력값입니다.",
      });
      return;
    }

    try {
      // // console.log("loginUser 디스패치 전");
      const response = await dispatch(loginUser(value)).unwrap();
      // // console.log("로그인 응답 데이터:", response);

      // response에 access_token이 있는지 확인
      if (response && response.access_token) {
        dispatch(setToken(response.access_token));
        await Swal.fire({
          icon: "success",
          text: "로그인에 성공했습니다.",
          timer: 1500,
          showConfirmButton: false,
        });
        navigator("/");
        return;
      }

      // 토큰이 없는 경우
      await Swal.fire({
        icon: "error",
        title: "로그인에 실패했습니다.",
        text: response?.message || "이메일 또는 비밀번호를 확인해주세요.",
      });
    } catch (error) {
      console.error("로그인 에러:", error);
      await Swal.fire({
        icon: "error",
        title: "오류 발생",
        text: error?.message || "비밀번호를 확인해주세요.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full m-4 space-y-8 p-10 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div>
          <h2 className="mt-4 text-center text-3xl font-bold text-gray-800">
            로그인
          </h2>
          <p className="mt-2 text-center text-base text-gray-600">
            계정에 로그인하세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-emerald-700 mb-1"
              >
                이메일
              </label>
              <input
                type="email"
                placeholder="Email"
                className="appearance-none relative block w-full px-5 py-3.5 border border-[#3a9d1f] placeholder-[#3a9d1f]/40 text-gray-900 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#0aab65]/30 focus:border-[#0aab65]/30 transition-all duration-300 hover:border-[#0aab65]/20"
                name="email"
                onChange={handleChange}
                id="emailInput"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-emerald-700 mb-1"
              >
                비밀번호
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="appearance-none relative block w-full px-5 py-3.5 border border-[#3a9d1f] placeholder-[#3a9d1f]/40 text-gray-900 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#8bd05c]/30 focus:border-[#3a9d1f]/30 transition-all duration-300 hover:border-[#0aab65]/20"
                name="password"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 bg-[#3a9d1f] text-white rounded-2xl hover:bg-[#0aab65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3a9d1f] transition-all duration-300 shadow-sm hover:shadow-md"
            >
              로그인 하기
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-emerald-600">
          
          <Link
            to="/register"
            className="hover:text-emerald-800 transition-colors duration-200"
          >
            회원가입 하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
