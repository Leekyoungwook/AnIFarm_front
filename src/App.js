import "./App.css";
import React, { useEffect, useCallback, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Home from "./components/common/Home";
import Culture from "./components/common/Culture";
import Sale from "./components/common/Sale";
import Header1 from "./components/common/Header1";
import Footer from "./components/common/Footer";
import Register from "./components/login/Register";
import Login from "./components/login/details/Login";
import Mypage from "./components/login/Mypage";
import PricingInformation from "./components/PricingInformation/PricingInformation";
import Weather from "./components/weather/Weather.jsx";
import Community from "./components/community/Community";
import SalsesInformation from "./components/SalsesInformation/SalsesInformation";
import Pests from "./components/pests/Pests";
import TrainingMethod from "./components/trainingMethod/TrainingMethod";
import QuizData from "./components/minigame/CropQuiz/QuizData";
import CropQuiz from "./components/minigame/CropQuiz/CropQuiz";
import PostDetail from "./components/community/PostDetail";
import Write from "./components/community/Write";
import { useDispatch, useSelector } from "react-redux";
import TrainingDetail from "./components/trainingMethod/TrainingDetail";
import Today from "./components/Today/Today";
import useAutoLogout from "./hooks/useAutoLogout";
import { ChatIcon } from "./components/chatbot/ChatIcon";
import { ChatMsg } from "./components/chatbot/ChatMsg";
import ChatForm from "./components/chatbot/ChatForm";
import Minigame from "./components/minigame/Minigame";
import BusinessSimulation from "./components/business-simulation-analysis/BusinessSimulation";
import CultureCalendar from "./components/calendar/Growthcalendar.jsx";
import Swal from "sweetalert2";
import QuizGame from "./components/minigame/QuizGame";
import Support from "./components/support/Support";
import YoungFarmer from "./components/youngFarmer/YoungFarmer";
import { POST_CHAT_API_URL } from "./utils/apiurl";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// 새로운 컴포넌트를 만들어 Router 내부에서 useLocation을 사용
function AppContent() {
  const location = useLocation();
  const dispatch = useDispatch();
  useAutoLogout(); // 커스텀 훅 사용
  const navigate = useNavigate();

  // 챗봇 관련 상태
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatBodyRef = useRef();

  const generateChatResponse = async (history) => {
    const updateHistory = (text) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "생각중..."),
        { role: "model", text },
      ]);
    };

    const formattedHistory = history.map(({ role, text }) => ({
      role: role === "user" ? "user" : "model",
      parts: [{ text: text }],
    }));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: formattedHistory }),
    };

    try {
      const response = await fetch(POST_CHAT_API_URL, requestOptions);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error.message || "요청 오류가 발생했습니다.");

      const responseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();
      updateHistory(responseText);
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  // 보호된 라우트를 위한 함수 추가
  const ProtectedMypage = () => {
    const token = localStorage.getItem("token");
    const user = useSelector((state) => state.login.user);

    useEffect(() => {
      if (!token || !user) {
        Swal.fire({
          title: "로그인이 필요합니다",
          text: "로그인 페이지로 이동합니다.",
          icon: "warning",
          confirmButtonText: "확인",
        }).then(() => {
          navigate("/login");
        });
      }
    }, [navigate, user]);

    if (!token || !user) {
      return null;
    }

    return <Mypage />;
  };

  return (
    <div className="App">
      <Header1 />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/culture" element={<Culture />} />
        <Route path="/youngFarmer" element={<YoungFarmer />} />
        <Route path="/sale" element={<Sale />} />
        <Route path="/pricingInformation" element={<PricingInformation />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/community/gardening" element={<Community />} />
        <Route path="/community/marketplace" element={<Community />} />
        <Route path="/community/freeboard" element={<Community />} />
        <Route path="/community/:postId" element={<PostDetail />} />
        <Route path="/Community/write" element={<Write />} />
        <Route path="/SalsesInformation" element={<SalsesInformation />} />
        <Route path="/trainingMethod" element={<TrainingMethod />} />
        <Route path="/pests" element={<Pests />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mypage" element={<ProtectedMypage />} />
        <Route path="/QuizData" element={<QuizData />} />
        <Route path="/CropQuiz" element={<CropQuiz />} />
        <Route path="/Today" element={<Today />} />
        <Route path="/trainingDetail" element={<TrainingDetail />} />
        <Route path="/minigame" element={<Minigame />} />
        <Route path="/business-simulation" element={<BusinessSimulation />} />
        <Route path="/cultureCalendar" element={<CultureCalendar />} /> 
        <Route path="/QuizGame" element={<QuizGame />} />
        <Route path="/support" element={<Support />} />
      </Routes>
      <Footer />

      {/* 버튼 컨테이너 - 챗봇 컨테이너와 별도로 분리 */}
      <div className="fixed bottom-4 right-8 z-50 flex flex-row items-center gap-4">
        {/* 미니게임 버튼 */}
        <Link to="/QuizGame">
          <button className="w-14 h-14 bg-[#3a9d1f] hover:bg-[#0aab65] text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "28px" }}
            >
              sports_esports
            </span>
          </button>
        </Link>

        {/* 챗봇 토글 버튼 */}
        <button
          onClick={() => setShowChatbot((prev) => !prev)}
          className="w-14 h-14 bg-[#3a9d1f] hover:bg-[#0aab65] text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "28px" }}
          >
            {showChatbot ? "close" : "mode_comment"}
          </span>
        </button>
      </div>

      {/* 챗봇 UI - container 클래스 유지 */}
      <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
        <div className="cb-popup">
          <div className="cb-header">
            <div className="header-info">
              <ChatIcon />
              <h2 className="logo-text">Farming Agent Chatbot</h2>
            </div>
            <button
              className="material-symbols-outlined"
              onClick={() => setShowChatbot(false)}
            >
              keyboard_arrow_down
            </button>
          </div>
          <div className="cb-body" ref={chatBodyRef}>
            <div className="message bot-message">
              <ChatIcon />
              <p className="message-text">
                안녕하세요 <br /> 저는 농업 챗봇입니다. 무엇을 도와드릴까요?
              </p>
            </div>
            {chatHistory.map((chat, index) => (
              <ChatMsg key={index} chat={chat} />
            ))}
          </div>
          <div className="cb-footer">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateChatResponse={generateChatResponse}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
