import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { postRequest } from "../../../utils/requestMethods";
import mediLogo from "../../assets/medi_logo.png";
import Swal from "sweetalert2";

const ResetPwd = () => {
  const navigator = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    password: "",
    confirm_password: "",
  });

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "접근 오류",
        text: "유효하지 않은 접근입니다.",
      }).then(() => {
        navigator("/findpwd");
      });
    }
  }, [token, navigator]);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (passwords.password !== passwords.confirm_password) {
      await Swal.fire({
        icon: "error",
        title: "비밀번호 불일치",
        text: "비밀번호가 일치하지 않습니다.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await postRequest("auth/reset_pwd", {
        body: JSON.stringify({
          token,
          newPassword: passwords.password,
        }),
      });

      await Swal.fire({
        icon: "success",
        title: "비밀번호 변경 완료",
        text: response.message,
      });

      setTimeout(() => navigator("/login"), 2000);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "비밀번호 변경 실패",
        text: error.message || "비밀번호 재설정에 실패했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-auto mb-16">
      <div className="logo w-[250px] md:w-[350px] mt-20 md:mt-32 mb-10 md:mb-12">
        <img src={mediLogo} alt="logo" />
      </div>
      <div className="shadow-lg px-12 py-10 w-[500px] border mb-16 rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">
          새 비밀번호 설정
        </h2>

        <form onSubmit={handleResetPassword}>
          <div className="mb-2">
            <label
              htmlFor="password"
              className="block text-neutral-700 text-lg mb-1"
            >
              새 비밀번호
            </label>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border rounded-md mb-2"
              name="password"
              value={passwords.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="confirm_password"
              className="block text-neutral-700 text-lg mb-1"
            >
              새 비밀번호 확인
            </label>
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-3 py-2 border rounded-md mb-2"
              name="confirm_password"
              value={passwords.confirm_password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-center items-center gap-2 mb-6">
            <button
              className="w-full h-12 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:text-white transition-all duration-200"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "처리중..." : "비밀번호 변경"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPwd;
