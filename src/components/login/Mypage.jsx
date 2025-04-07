import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserInfo, fetchDeleteAuthData, fetchUpdateAuthData } from "../../redux/slices/authslice";
import { refreshToken } from '../../redux/slices/loginslice';
import MyInfo from './MyInfo';
import MyPosts from './MyPosts';
import MyComments from './MyComments';
import PasswordModal from './PasswordModal';
import Swal from 'sweetalert2';
import MyCalendar from './MyCalendar';


const Mypage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, userInfoLoading, userInfoError } = useSelector((state) => state.auth);
  const loginUser = useSelector((state) => state.login.user);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMyInfoModal, setShowMyInfoModal] = useState(false);

  useEffect(() => {
    const checkAndFetchUserInfo = async () => {
      try {
        // 토큰 만료 시간 체크
        const expireTime = localStorage.getItem('tokenExpiry');
        const now = new Date().getTime();
        
        if (expireTime && now > parseInt(expireTime)) {
          // 토큰 갱신 시도
          const refreshResult = await dispatch(refreshToken()).unwrap();
          if (!refreshResult) {
            throw new Error('토큰 갱신 실패');
          }
        }
        
        // 사용자 정보 조회
        await dispatch(fetchUserInfo()).unwrap();
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    checkAndFetchUserInfo();
  }, [dispatch]);

  const handlePasswordChange = () => {
    setShowPasswordModal(true);
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: '회원 탈퇴',
      text: '탈퇴를 결정하시기 전에 다시 한 번 고민해 보시겠어요? 삭제 후에는 복구할 수 없어요.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: '탈퇴',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(fetchDeleteAuthData()).unwrap();
        localStorage.removeItem('token');
        navigate('/');
        Swal.fire('탈퇴 완료', '회원 탈퇴가 완료되었습니다.', 'success');
      } catch (error) {
        Swal.fire('오류', error.message || '회원 탈퇴에 실패했습니다.', 'error');
      }
    }
  };

  if (userInfoLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0aab65] mt-[-100px]" />
      </div>
    );
  }

  if (userInfoError) {
    const isAuthError = 
      userInfoError.includes("인증이 만료되었습니다") || 
      userInfoError.includes("401") || 
      !localStorage.getItem("token");

    if (isAuthError) {
      localStorage.removeItem("token");
      navigate("/login");
      return null;
    }

    return (
      <div className="flex justify-center items-center min-h-screen pt-16">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{userInfoError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="md:mt-8 mt-4 md:mb-8 mb-12">
      <div>
        <div className="flex flex-col md:flex-row gap-6 mt-10 mr-10 ml-11">
          <div className="md:hidden w-full">
            <button
              onClick={() => setShowMyInfoModal(true)}
              className="w-full bg-[#3a9d1f] text-white py-2 px-4 rounded-lg hover:bg-[#0aab65] transition-colors"
            >
              내 정보 보기
            </button>
          </div>
          <div className="hidden md:block w-full md:w-1/4 md:sticky md:top-[120px] h-fit">
            <MyInfo 
              userInfo={userInfo}
              onPasswordChange={handlePasswordChange}
              onDeleteAccount={handleDeleteAccount}
            />
          </div>
          <div className="w-full md:w-3/4 space-y-6">
            <MyCalendar />
            <MyPosts />
            <MyComments />
          </div>
        </div>
      </div>

      {/* 내 정보 모달 */}
      {showMyInfoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            // 모달 바깥 영역 클릭 시에만 닫힘
            if (e.target === e.currentTarget) {
              setShowMyInfoModal(false);
            }
          }}
        >
          <div className="w-full max-w-md">
            <MyInfo 
              userInfo={userInfo}
              onPasswordChange={handlePasswordChange}
              onDeleteAccount={handleDeleteAccount}
            />
          </div>
        </div>
      )}

      {showPasswordModal && (
        <PasswordModal 
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordChange}
        />
      )}
    </div>
  );
};

export default Mypage;
