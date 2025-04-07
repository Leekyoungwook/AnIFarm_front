import React, { useState, useEffect } from "react";
import axios from "axios";
import { GET_CROP_DATA_API_URL } from '../../utils/apiurl';

const AgricultureGoalSetting = ({ onComplete, method }) => {
  const [formData, setFormData] = useState({
    cultivationArea: "",
    selectedCrops: [],
  });

  const [areaUnit, setAreaUnit] = useState("pyeong"); // pyeong 또는 m2
  const [searchTerm, setSearchTerm] = useState("");
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newCrops, setNewCrops] = useState([
    "사과",
    "배추",
    "대파",
    "배",
    "수박",
    "쌀",
    "포도",
    "옥수수",
    "밀",
  ]);

  // 모든 작물 데이터 로드
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await axios.get(GET_CROP_DATA_API_URL);
        if (response.data.success) {
          setCrops(response.data.data);
        } else {
          console.error("작물 데이터 가져오기 실패:", response.data.message);
          setCrops([]);
        }
      } catch (error) {
        console.error("작물 데이터 로드 중 오류 발생:", error);
        setCrops([]);
      }
    };

    fetchCrops();
  }, []);

  // 작물 검색
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      const response = await axios.get(GET_CROP_DATA_API_URL);
      if (response.data.success) {
        setCrops(response.data.data);
      }
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${GET_CROP_DATA_API_URL}/${encodeURIComponent(searchTerm)}`
      );
      if (response.data.success) {
        setCrops([response.data.data]);
      } else {
        setError("작물 검색에 실패했습니다.");
      }
    } catch (error) {
      console.error("작물 검색 중 오류 발생:", error);
      setError("작물 검색에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 작물 검색 필터링 (클라이언트 사이드)
  const filteredCrops = searchTerm
    ? crops.filter((crop) =>
        crop?.crop_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : crops;

  // 작물 추가 핸들러
  const handleAddCrop = (crop) => {
    if (
      !formData.selectedCrops.find(
        (selected) => selected.crop_name === crop.crop_name
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        selectedCrops: [...prev.selectedCrops, crop],
      }));
    }
  };

  // 작물 제거 핸들러
  const handleRemoveCrop = (cropName) => {
    setFormData((prev) => ({
      ...prev,
      selectedCrops: prev.selectedCrops.filter(
        (crop) => crop.crop_name !== cropName
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuickAdd = (field, amount) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] ? Number(prev[field]) + amount : amount,
    }));
  };

  const handleAreaUnitChange = (unit) => {
    setAreaUnit(unit);
    if (formData.cultivationArea) {
      const currentValue = Number(formData.cultivationArea);
      if (unit === "m2") {
        // 평에서 m²로 변환 (1평 = 3.3058m²)
        setFormData((prev) => ({
          ...prev,
          cultivationArea: (currentValue * 3.3058).toFixed(2),
        }));
      } else {
        // m²에서 평으로 변환
        setFormData((prev) => ({
          ...prev,
          cultivationArea: (currentValue / 3.3058).toFixed(2),
        }));
      }
    }
  };

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
          재배면적 대비 농업 목표 설정
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* 재배면적 입력 */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <span className="w-1.5 sm:w-2 h-5 sm:h-6 bg-[#3a9d1f] rounded mr-2"></span>
            재배면적을 입력해주세요
          </h3>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="w-full sm:w-2/3">
                <input
                  type="number"
                  name="cultivationArea"
                  value={formData.cultivationArea}
                  onChange={handleChange}
                  placeholder="재배면적을 입력해주세요"
                  className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3a9d1f] focus:border-[#3a9d1f]"
                  min="0"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-1/3">
                <button
                  type="button"
                  className="flex-1 px-3 py-2 text-sm sm:text-base rounded-md bg-[#3a9d1f] text-white"
                >
                  평
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[100, 200, 300, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickAdd("cultivationArea", amount)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  +{amount}
                  {areaUnit === "pyeong" ? "평" : "m²"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 작물 검색 및 선택 */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <span className="w-1.5 sm:w-2 h-5 sm:h-6 bg-[#3a9d1f] rounded mr-2"></span>
            희망재배 작물을 선택해주세요
          </h3>

          {/* 검색창 */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="원하는 작물명을 검색해주세요."
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3a9d1f] focus:border-[#3a9d1f]"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#3a9d1f] text-white rounded-md hover:bg-[#2d7a17] transition-colors duration-200 whitespace-nowrap"
                disabled={loading}
              >
                {loading ? "검색 중..." : "검색"}
              </button>
            </div>
          </div>

          {/* 검색 결과 테이블 */}
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-600">
                      작물명
                    </th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-600">
                      3.3m² 수익
                    </th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-600">
                      선택
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCrops.map((crop, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        newCrops.includes(crop.crop_name) ? "bg-green-50" : ""
                      }`}
                    >
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm">
                        {crop.crop_name}
                        {newCrops.includes(crop.crop_name) && (
                          <span className="ml-1 text-[#3a9d1f] text-xs">
                            (신규)
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm">
                        {crop.revenue_per_3_3m?.toLocaleString()}원
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleAddCrop(crop)}
                          className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm bg-[#3a9d1f] text-white rounded hover:bg-[#2d7a17] transition-colors duration-200"
                          disabled={formData.selectedCrops.some(
                            (selected) => selected.crop_name === crop.crop_name
                          )}
                        >
                          {formData.selectedCrops.some(
                            (selected) => selected.crop_name === crop.crop_name
                          )
                            ? "선택됨"
                            : "선택"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 선택된 작물 목록 */}
          {formData.selectedCrops.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <h4 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">
                선택된 작물
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.selectedCrops.map((crop) => (
                  <div
                    key={crop.crop_name}
                    className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#3a9d1f] text-white rounded text-xs sm:text-sm"
                  >
                    {crop.crop_name}
                    <button
                      type="button"
                      onClick={() => handleRemoveCrop(crop.crop_name)}
                      className="ml-1 hover:text-red-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-[#3a9d1f] text-white rounded-md hover:bg-[#2d7a17] transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={
              !formData.cultivationArea || formData.selectedCrops.length === 0
            }
          >
            분석 시작하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgricultureGoalSetting;
