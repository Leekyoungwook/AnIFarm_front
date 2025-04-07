import React, { useState, useEffect } from "react";
import QuizData from "./QuizData";
import { GET_QUIZ_API_URL } from "../../../utils/apiurl";

const CropQuiz = () => {
  // 백엔드 API에서 받아온 작물 옵션 목록 (예: [{ id: 101, crop: '감자' }, ...])
  const [quizOptions, setQuizOptions] = useState([]);
  // 선택된 옵션은 객체 (예: { id: 101, crop: '감자' })
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    // GET /api/quiz/crops 엔드포인트를 호출하여 작물 옵션 데이터를 가져옵니다.
    fetch(GET_QUIZ_API_URL)
      .then((response) => response.json())
      .then((data) => {
        setQuizOptions(data);
        // 기본 선택: 첫 번째 옵션
        if (data.length > 0) {
          setSelectedOption(data[0]);
        }
      })
      .catch((error) => {
        console.error("작물 옵션 데이터를 가져오는데 에러가 발생했습니다:", error);
      });
  }, []);

  // 드롭다운 선택이 변경될 때 호출되는 함수
  const handleCropChange = (event) => {
    const selectedId = Number(event.target.value);
    const option = quizOptions.find((opt) => opt.id === selectedId);
    setSelectedOption(option);
  };

  return (
    <main className="container min-h-screen">
      <div className="relative pt-14 w-full h-full">
        {/* 타이틀 및 안내 문구 */}
        <div className="flex flex-col items-center w-full">
          <div className="text-left flex flex-col w-full max-w-lg">
            <div className="text-3xl font-bold mb-2">작물별 퀴즈</div>
            <div className="mb-6">
              <div className="crop-selection-instruction">
                퀴즈를 진행할 작물을 선택하세요.
              </div>
            </div>

            {/* 작물 드롭다운 */}
            <div className="relative">
              <select
                value={selectedOption ? selectedOption.id : ""}
                onChange={handleCropChange}
                className="border border-gray-300 p-2 rounded-lg w-full"
                style={{ maxWidth: "600px" }}
              >
                {quizOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.crop}
                  </option>
                ))}
              </select>
              <div className="mt-6 crop-selection-instruction">
                작물을 선택하면 해당 작물에 대한 퀴즈가 표시됩니다.
              </div>
            </div>
          </div>
        </div>

        {/* 선택된 작물 정보를 기반으로 QuizData 컴포넌트를 호출 */}
        {selectedOption && <QuizData selectedCrop={selectedOption.crop} />}
      </div>
    </main>
  );
};

export default CropQuiz;
