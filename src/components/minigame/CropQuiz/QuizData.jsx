import React, { useState, useEffect } from 'react';
import { GET_QUIZ_API_URL } from '../../../utils/apiurl';

// 각 작물별 퀴즈 데이터를 저장합니다.

const QuizData = ({ selectedCrop }) => {
  // 각 작물별 퀴즈 데이터, 선택된 답, 제출 결과, 에러 및 로딩 상태 관리
  const [quizQuestions, setQuizQuestions] = useState([]);
  // 각 질문의 선택된 옵션을 저장 (quiz id: 선택된 옵션 텍스트)
  const [selectedAnswers, setSelectedAnswers] = useState({});
  // 제출 후 받은 결과 (정답 여부, 총 점수 등)
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  // 로딩 상태를 관리합니다.
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 작물이 변경되면 상태 리셋 (이전 문제, 선택 답안, 결과, 에러 제거)
    setQuizQuestions([]);
    setSelectedAnswers({});
    setResult(null);
    setError(null);

    if (selectedCrop) {
      const fetchQuizData = async () => {
        try {
          setLoading(true);
          const encodedCrop = encodeURIComponent(selectedCrop);
          const response = await fetch(`${GET_QUIZ_API_URL}/${encodedCrop}`);
          if (!response.ok) {
            throw new Error(`네트워크 오류: ${response.status}`);
          }
          const data = await response.json();
          // console.log("Fetched quiz data:", data);
          setQuizQuestions(data);
        } catch (err) {
          console.error("Error fetching quiz questions:", err);
          setError("퀴즈 데이터를 불러오는데 문제가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      };

      fetchQuizData();
    }
  }, [selectedCrop]);

  // 로딩중일 때 SaleNews와 같은 로딩 스피너를 보여줍니다.
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0aab65]"></div>
      </div>
    );
  }

  // 사용자가 옵션 버튼을 클릭 시 선택한 옵션 텍스트 저장
  const handleOptionSelect = (quizId, optionText) => {
    setSelectedAnswers(prevAnswers => ({
      ...prevAnswers,
      [quizId]: optionText
    }));
  };

  // "결과 확인하기" 버튼 클릭 시, 각 문제의 정답 여부 및 총 점수를 계산합니다.
  const handleSubmitQuiz = () => {
    const computedResults = quizQuestions.map(quiz => {
      const selectedAnswer = selectedAnswers[quiz.id];
      // 제출 시 정답 여부 비교
      const isCorrect = selectedAnswer !== undefined &&
          selectedAnswer.trim() === quiz.correct_answer.trim();
      return { quiz_id: quiz.id, is_correct: isCorrect };
    });

    const score = computedResults.reduce(
      (acc, item) => (item.is_correct ? acc + 1 : acc),
      0
    );

    // console.log("각 퀴즈의 결과 (quiz_id, is_correct):", computedResults);
    // console.log("총 정답 개수:", score);

    setResult({
      score,
      total_questions: quizQuestions.length,
      results: computedResults,
    });
  };

  // quiz의 correct_answer 값을 이용해 해당 옵션 텍스트를 반환합니다.
  const getCorrectAnswerText = quiz => {
    const correctOption = String(quiz.correct_answer || "").trim();
    // 만약 백엔드에서 인덱스("0", "1", "2", "3") 형태의 값이 전달된다면 기존 로직대로 처리
    if (["0", "1", "2", "3"].includes(correctOption)) {
      switch (correctOption) {
        case "0":
          return quiz.option_1;
        case "1":
          return quiz.option_2;
        case "2":
          return quiz.option_3;
        case "3":
          return quiz.option_4;
      }
    }
    // 그렇지 않다면(예: "주황" 등) 해당 텍스트를 그대로 반환합니다.
    return correctOption || "정답 정보 없음";
  };

  return (
    <div className="flex flex-col items-center w-full mt-10">
      <div className="text-left flex flex-col w-full max-w-lg p-4 mb-2">
        <div className="text-xl font-semibold mb-2 ">
          {selectedCrop} 퀴즈 문제 (총 {quizQuestions.length}문제)
        </div>
        {error && (
          <div className="text-red-600 mb-2">
            {error}
          </div>
        )}
        <div className="quiz-question-list space-y-4 border-t pt-2">
          {quizQuestions.length > 0 ? (
            quizQuestions.map(quiz => (
              <div key={quiz.id} className="quiz-card border rounded-md mt-2">
                <h4 className="mb-2 bg-green-500 text-white p-2 ">{quiz.question}</h4>
                <ul className="p-4">
                  <li className="flex items-center mb-1">
                    <button 
                      className={`mr-2 w-5 h-5 rounded-full border cursor-pointer flex justify-center items-center ${
                        selectedAnswers[quiz.id] === quiz.option_1 
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                      onClick={() => handleOptionSelect(quiz.id, quiz.option_1)}
                    >
                      1
                    </button>
                    {quiz.option_1}
                  </li>
                  <li className="flex items-center mb-1">
                    <button 
                      className={`mr-2 w-5 h-5 rounded-full border cursor-pointer flex justify-center items-center ${
                        selectedAnswers[quiz.id] === quiz.option_2 
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                      onClick={() => handleOptionSelect(quiz.id, quiz.option_2)}
                    >
                      2
                    </button>
                    {quiz.option_2}
                  </li>
                  <li className="flex items-center mb-1">
                    <button 
                      className={`mr-2 w-5 h-5 rounded-full border cursor-pointer flex justify-center items-center ${
                        selectedAnswers[quiz.id] === quiz.option_3 
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                      onClick={() => handleOptionSelect(quiz.id, quiz.option_3)}
                    >
                      3
                    </button>
                    {quiz.option_3}
                  </li>
                  <li className="flex items-center">
                    <button 
                      className={`mr-2 w-5 h-5 rounded-full border cursor-pointer flex justify-center items-center ${
                        selectedAnswers[quiz.id] === quiz.option_4 
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                      onClick={() => handleOptionSelect(quiz.id, quiz.option_4)}
                    >
                      4
                    </button>
                    {quiz.option_4}
                  </li>
                </ul>
                {/* 결과 확인 후 각 문제의 정답 옵션 텍스트를 출력 */}
                {result && (
                  <div className="pl-3 mb-2 text-green-600">
                    정답: {getCorrectAnswerText(quiz)}
                  </div>
                )}
              </div>
            ))
          ) : (
            !error && <div className="text-gray-500">선택된 작물에 대한 퀴즈가 없습니다.</div>
          )}
        </div>
        <div className="flex justify-center mt-4 ">
          <button
            onClick={handleSubmitQuiz}
            className="submit-button px-4 py-2 bg-green-500 text-white rounded-md"
          >
            결과 확인하기
          </button>
        </div>
        {result && (
          <div className="mt-4 text-center">
            <div>총 {result.score}개 정답입니다! (총 {result.total_questions}문제 중)</div>
            <ul className="mt-2">
              {result.results.map((item, index) => (
                <li 
                  key={index} 
                  className={item.is_correct ? "text-green-500" : "text-red-500"}
                >
                  문제 {index + 1}: {item.is_correct ? "정답" : "오답"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizData