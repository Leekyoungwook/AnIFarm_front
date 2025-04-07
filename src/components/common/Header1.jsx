import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearToken } from "../../redux/slices/loginslice";
import AnifarmLogo from "../../assets/main/anifarmbig.png";
// 모바일 로고 이미지 (실제 경로에 맞게 수정)
import AnifarmMobileLogo from "../../assets/main/anifarmlogo-001.png";
import Swal from "sweetalert2";

const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.login.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 반응형 상태: 화면 너비가 768px 미만이면 모바일 환경으로 판단
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 현재 경로가 어떤 섹션에 속하는지 확인하는 함수
  const isActivePath = (path) => {
    const currentPath = location.pathname.toLowerCase();

    // 재배하기 관련 경로들
    const culturePaths = [
      "/culture",
      "/trainingmethod",
      "/trainingdetail",
      "/pests",
      "/weather",
      "/community/gardening",
      "/youngfarmer",
    ];

    // 판매하기 관련 경로들
    const salePaths = [
      "/sale",
      "/today",
      "/pricinginformation",
      "/salsesinformation",
      "/community/marketplace",
      "/business-simulation",
    ];

    if (path === "/culture") {
      return culturePaths.some((p) => currentPath.startsWith(p));
    }

    if (path === "/sale") {
      return salePaths.some((p) => currentPath.startsWith(p));
    }

    return false;
  };

  // 토큰 유효성 검사 추가
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && user) {
      // 토큰이 없는데 user 상태가 있다면 로그아웃 처리
      dispatch(clearToken());
      navigate("/");
    }
  }, [dispatch, user, navigate]);

  const handleLogout = () => {
    Swal.fire({
      title: "로그아웃",
      text: "정말 로그아웃 하시겠습니까?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        // 로그아웃 처리를 먼저 수행
        dispatch(clearToken());
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // UI 업데이트 후 안내 메시지 표시
        Swal.fire({
          title: "로그아웃 완료",
          text: "로그아웃 되었습니다.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/");
      }
    });
  };

  const handleMenuItemClick = (category, item) => {
    let path = "";

    // 상세 경로 매핑
    if (category === "재배 하기") {
      switch (item) {
        case "육성법":
          path = "/TrainingMethod";
          break;
        case "병충해":
          path = "/Pests";
          break;
        case "날씨":
          path = "/weather";
          break;
        case "육성캘린더":
          path = "/CultureCalendar";
          break;
        case "재배 커뮤니티":
          path = "/community/gardening";
          break;
        case "청년농 소개&영상":
          path = "/youngFarmer";
          break;
        default:
          path = "/culture";
      }
    } else if (category === "판매 하기") {
      switch (item) {
        case "오늘의 가격":
          path = "/Today";
          break;
        case "소비 트렌드":
          path = "/pricinginformation";
          break;
        case "가격 예측":
          path = "/SalsesInformation";
          break;
        case "판매 커뮤니티":
          path = "/community/marketplace";
          break;
        case "경영 모의계산":
          path = "/business-simulation";
          break;
        case "교육&지원":
          path = "/support";
          break;
        default:
          path = "/sale";
      }
    } else if (category === "기능/엔터") {
      switch (item) {
        case "챗봇":
          // 챗봇 안내 메시지 표시
          Swal.fire({
            title: "챗봇 이용 안내",
            text: "우측 하단의 토글 버튼을 누르면 챗봇을 이용하실 수 있습니다. 챗봇은 농산물 재배 방법과 병충해 치료법을 안내해 드립니다.",
            icon: "info",
            confirmButtonText: "확인",
            confirmButtonColor: "#3a9d1f",
          });
          setIsMenuOpen(false); // 메뉴 닫기
          return; // 여기서 함수 종료
        case "재배 시뮬레이션":
          path = "/Minigame";
          break;
        case "작물 퀴즈":
          path = "/CropQuiz";
          break;
        default:
          path = "/";
          break;
      }
    }

    // 카테고리와 아이템 모두 파라미터로 전달
    const queryParams = new URLSearchParams({
      category: category,
      type: item,
    });

    // 경로 이동
    navigate(`${path}?${queryParams.toString()}`);
    setIsMenuOpen(false);
  };

  const menuStructure = {
    "재배 하기": [
      "육성법",
      "병충해",
      "날씨",
      "육성캘린더",
      "재배 커뮤니티",
      "청년농 소개&영상",
    ],
    "판매 하기": [
      "오늘의 가격",
      "소비 트렌드",
      "가격 예측",
      "경영 모의계산",
      "교육&지원",
      "판매 커뮤니티",
    ],
    "기능/엔터": ["챗봇", "재배 시뮬레이션", "작물 퀴즈"],
  };

  return (
    <div className="w-full flex justify-center shadow-custom sticky top-0 z-50 border-b-2 bg-white">
      <div className="w-full max-w-7xl px-2 md:px-4 flex flex-col items-center relative overflow-hidden h-20 md:h-24">
        <div className="w-full flex justify-between items-center h-full">
          <div className="flex-shrink-0">
            <Link to="/">
              {/* 화면 크기에 따라 다른 로고 이미지 사용 */}
              <img
                src={isMobile ? AnifarmMobileLogo : AnifarmLogo}
                alt="로고"
                className="w-[40px] md:w-[220px]"
              />
            </Link>
          </div>

          <div className="flex-grow flex justify-center items-center mx-4">
            <div className="flex gap-1 md:gap-12 items-center mr-0 md:mr-12">
              <Link
                to="/culture"
                className={`inline-flex items-center justify-center h-[40px] md:h-[50px] px-3 md:px-5 py-0 text-base md:text-xl font-semibold text-center no-underline align-middle transition-all duration-300 ease-in-out border-2 rounded-full cursor-pointer select-none focus:outline-none whitespace-nowrap ${
                  isActivePath("/culture")
                    ? "bg-[#3a9d1f] text-white border-[#3a9d1f]"
                    : "bg-transparent border-transparent text-gray-900 hover:bg-[#3a9d1f] hover:text-white hover:border-[#3a9d1f] active:bg-[#3a9d1f] active:text-white active:border-[#3a9d1f]"
                }`}
              >
                재배하기
              </Link>
              <div className="border-l-[3px] h-6 border-gray-500"></div>
              <Link
                to="/sale"
                className={`inline-flex items-center justify-center h-[40px] md:h-[50px] px-3 md:px-5 py-0 text-base md:text-xl font-semibold text-center no-underline align-middle transition-all duration-300 ease-in-out border-2 rounded-full cursor-pointer select-none focus:outline-none whitespace-nowrap ${
                  isActivePath("/sale")
                    ? "bg-[#3a9d1f] text-white border-[#3a9d1f]"
                    : "bg-transparent border-transparent text-gray-900 hover:bg-[#3a9d1f] hover:text-white hover:border-[#3a9d1f] active:bg-[#3a9d1f] active:text-white active:border-[#3a9d1f]"
                }`}
              >
                판매하기
              </Link>
            </div>
          </div>

          <div className="flex-shrink-0">
            <div className="text-xs md:text-sm">
              <ul className="flex gap-2 md:gap-4 items-center">
                {user !== null ? (
                  <>
                    <li className="text-xs md:text-sm text-neutral-500 hover:text-black transition-all duration-100">
                      <button onClick={handleLogout}>로그아웃</button>
                    </li>
                    <li className="text-xs md:text-sm text-neutral-500 hover:text-black transition-all duration-100">
                      <Link to="/mypage">마이페이지</Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="text-xs md:text-sm text-neutral-500 hover:text-black transition-all duration-100">
                      <Link to="/login">로그인</Link>
                    </li>
                    <li className="text-xs md:text-sm text-neutral-500 hover:text-black transition-all duration-100">
                      <Link to="/register">회원가입</Link>
                    </li>
                  </>
                )}
                <li>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <div className="w-6 h-5 flex flex-col justify-between">
                      <span className="w-full h-0.5 bg-gray-600 rounded-full"></span>
                      <span className="w-full h-0.5 bg-gray-600 rounded-full"></span>
                      <span className="w-full h-0.5 bg-gray-600 rounded-full"></span>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[100] "
            onClick={() => setIsMenuOpen(false)}
          >
            <div
              className="absolute right-0 top-0 w-80 bg-white shadow-lg rounded-l-lg h-[650px] md:h-[850px] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex justify-end items-center">
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {Object.entries(menuStructure).map(([category, items]) => (
                    <div key={category} className="border rounded-lg">
                      <div className="font-semibold p-3 bg-[#3a9d1f] text-white rounded-t-lg border-b">
                        {category}
                      </div>
                      <div className="p-3">
                        <div className="space-y-2">
                          {items.map((item, index) => (
                            <div
                              key={index}
                              className="text-sm md:text-base text-gray-600 hover:text-black cursor-pointer"
                              onClick={() =>
                                handleMenuItemClick(category, item)
                              }
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
