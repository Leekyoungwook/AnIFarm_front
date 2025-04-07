import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Tabs,
  Tab,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedImage,
  resetState,
  analyzeImage,
} from "../../redux/slices/imageModelSlice";

const Pests = () => {
  const dispatch = useDispatch();

  // useSelector를 분리해서 각각의 상태를 가져옴
  const selectedImage = useSelector((state) => state.imageModel.selectedImage);
  const result = useSelector((state) => state.imageModel.result);
  const isLoading = useSelector((state) => state.imageModel.isLoading);
  const error = useSelector((state) => state.imageModel.error);

  // 상태 변화 추적을 위한 useEffect들
  useEffect(() => {
    // // console.log("이미지 상태:", selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    // console.log("로딩 상태:", isLoading);
  }, [isLoading]);

  useEffect(() => {
    // console.log("결과 상태:", result);
  }, [result]);

  useEffect(() => {
    // console.log("에러 상태:", error);
  }, [error]);

  const [selectedTab, setSelectedTab] = useState(0);
  const [showExample, setShowExample] = useState(true);

  const crops = [
    { value: "chamoe", label: "🍋참외" },
    { value: "strawberry", label: "🍓딸기" },
    { value: "kiwi", label: "🥝 키위" },
    { value: "tomato", label: "🍅 토마토" },
    { value: "apple", label: "🍎 사과" },
    { value: "potato", label: "🥔 감자" },
    { value: "grape", label: "🍇 포도" },
    { value: "corn", label: "🌽 옥수수" },
  ];

  const resetStateHandler = () => {
    dispatch(resetState());
    setShowExample(true);
    const fileInput = document.getElementById("image-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    resetStateHandler();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      // Canvas를 사용하여 이미지 다시 그리기
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // 새로 그린 이미지로 설정
        dispatch(setSelectedImage(canvas.toDataURL()));
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleDiagnosis = async () => {
    if (!selectedImage) {
      alert("이미지를 먼저 업로드해주세요.");
      return;
    }

    setShowExample(false);

    const fileInput = document.getElementById("image-upload");
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      let response;
      // 작물 타입에 따른 분석 요청
      switch (crops[selectedTab].value) {
        case "kiwi":
          response = await dispatch(
            analyzeImage({ formData, type: "kiwi" })
          ).unwrap();
          // console.log("키위 분석 결과:", response);
          break;
        case "chamoe":
          response = await dispatch(
            analyzeImage({ formData, type: "chamoe" })
          ).unwrap();
          // console.log("참외 분석 결과:", response);
          break;
        case "strawberry":
          response = await dispatch(
            analyzeImage({ formData, type: "strawberry" })
          ).unwrap();
          // console.log("딸기 분석 결과:", response);
          break;
        case "potato":
          response = await dispatch(
            analyzeImage({ formData, type: "potato" })
          ).unwrap();
          // console.log("감자 분석 결과:", response);
          break;
        case "tomato":
          response = await dispatch(
            analyzeImage({ formData, type: "tomato" })
          ).unwrap();
          // console.log("토마토 분석 결과:", response);
          break;
        case "apple":
          response = await dispatch(
            analyzeImage({ formData, type: "apple" })
          ).unwrap();
          // console.log("사과 분석 결과:", response);
          break;
        case "grape":
          response = await dispatch(
            analyzeImage({ formData, type: "grape" })
          ).unwrap();
          // console.log("포도 분석 결과:", response);
          break;
        case "corn":
          response = await dispatch(
            analyzeImage({ formData, type: "corn" })
          ).unwrap();
          // console.log("옥수수 분석 결과:", response);
          break;
        default:
          break;
      }

      // 응답이 없는 경우 에러 처리
      if (!response) {
        throw new Error("분석 결과를 받지 못했습니다.");
      }
    } catch (err) {
      console.error("진단 중 오류 발생:", err);
      alert("진단 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const getExampleResult = () => {
    switch (crops[selectedTab].value) {
      case "chamoe":
        return {
          status: "diseased",
          disease: "ex) 흰가루병",
          recommendation:
            "ex) 통풍이 잘 되도록 관리하고, 질소질 비료를 줄이세요.",
        };
      case "strawberry":
        return {
          status: "diseased",
          disease: "ex) 잎끝마름병",
          recommendation:
            "ex) 과습을 피하고 토양이 건조하지 않도록 일정한 습도를 유지하세요.",
        };
      case "kiwi":
        return {
          status: "diseased",
          disease: "ex) 점무늬병",
          recommendation: "ex) 나무 사이 간격을 유지하고 환기를 자주 해주세요.",
        };
      case "tomato":
        return {
          status: "diseased",
          disease: "ex) 박테리아성 반점병",
          recommendation:
            "ex) 잎이 젖지 않도록 관리해주시고 줄기 및 잎을 정리해주세요.",
        };
      case "apple":
        return {
          status: "diseased",
          disease: "ex) 검은무늬병",
          recommendation:
            "ex)통풍을 원활하게 하여 잎이 빨리 마르도록 관리해주세요.",
        };
      case "potato":
        return {
          status: "diseased",
          disease: "ex) 잎마름병",
          recommendation:
            "ex) 물이 고이지 않도록 두둑을 높게 만들고 배수로 정비해주세요.",
        };
      case "grape":
        return {
          status: "diseased",
          disease: "ex) 에스카병",
          recommendation:
            "ex) 가지치기 시 상처를 최소화 해주시고 절단부위에 보호제를 도포해주세요",
        };
      case "corn":
        return {
          status: "diseased",
          disease: "ex) 세르코스포라 잎반점병",
          recommendation:
            "ex) 통풍을 원활하게하여 습도조절을 해주시고 감염부위를 신속히 제거 후 소각해주세요",
        };
      default:
        return {
          status: "healthy",
          disease: "ex) 정상",
          recommendation: "ex) 현재 특별한 조치가 필요하지 않습니다.",
        };
    }
  };

  return (
    <Container maxWidth="lg" className="px-4">
      <Box className="py-8">
        <Typography variant="h5" className="text-center mb-4">
          병충해 진단
        </Typography>

        <Paper className="p-4 md:p-6 mt-6 flex flex-col items-center border-2 border-gray-200 min-h-[400px] md:min-h-[600px]">
          <Box className="w-full border-b border-gray-200">
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="fullWidth"
              className="min-h-[48px]"
              sx={{
                "& .MuiTabs-flexContainer": {
                  flexWrap: "nowrap",
                  overflowX: "auto",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollbarWidth: "none",
                  "-ms-overflow-style": "none",
                  "@media (max-width: 768px)": {
                    padding: "0 8px",
                    gap: "8px",
                    WebkitOverflowScrolling: "touch",
                    scrollSnapType: "x mandatory",
                    "& > *": {
                      scrollSnapAlign: "start",
                    },
                  },
                },
                "& .MuiTabs-indicator": {
                  display: "none",
                },
              }}
            >
              {crops.map((crop) => (
                <Tab
                  key={crop.value}
                  label={crop.label}
                  className="min-h-[48px] min-w-[100px] flex-shrink-0"
                  sx={{
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: "normal",
                    whiteSpace: "nowrap",
                    color: "#666",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    margin: "0 4px",
                    "@media (max-width: 768px)": {
                      minWidth: "90px",
                      fontSize: "0.875rem",
                      padding: "8px 16px",
                      margin: "0",
                      height: "40px",
                      "& .MuiTab-wrapper": {
                        padding: "0",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    },
                    "&.Mui-selected": {
                      color: "#3a9d1f",
                      fontWeight: "bold",
                      backgroundColor: "#e8f5e9",
                      borderColor: "#3a9d1f",
                      boxShadow: "0 2px 4px rgba(58, 157, 31, 0.2)",
                    },
                    "&:hover": {
                      color: "#3a9d1f",
                      borderColor: "#3a9d1f",
                      backgroundColor: "#f1f8e9",
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>

          <Box className="w-full mt-8 flex flex-col md:flex-row gap-2">
            {/* 좌측 - 이미지 업로드 및 진단 가능 병해충 정보 */}
            <Box className="w-full md:w-1/2 flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="image-upload"
                onChange={handleImageUpload}
              />
              {!selectedImage ? (
                <Box className="w-full">
                  <Box className="flex justify-center flex-col items-center">
                    <label htmlFor="image-upload">
                      <Box className="w-full sm:w-[500px] h-[330px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                        <Box className="text-center">
                          <CloudUploadIcon
                            sx={{ fontSize: 60 }}
                            className="text-gray-400 mb-2"
                          />
                          <Typography variant="body1" className="text-gray-500">
                            이미지를 업로드해주세요
                          </Typography>
                          <Typography
                            variant="body2"
                            className="text-gray-400 mt-1"
                          >
                            (최대 5MB)
                          </Typography>
                          <Button
                            variant="contained"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            className="mt-4 min-w-[120px] h-[2.4rem]"
                            sx={{
                              backgroundColor: "#3a9d1f",
                              "&:hover": {
                                backgroundColor: "#2d7b18",
                              },
                            }}
                          >
                            이미지 업로드
                          </Button>
                        </Box>
                      </Box>
                    </label>

                    <Box className="mt-4 p-4 w-full sm:w-[500px] border-2 border-gray-300 rounded-lg h-[150px] overflow-y-auto">
                      <Typography
                        variant="subtitle1"
                        className="font-semibold mb-2 text-center sticky top-0 bg-white"
                      >
                        진단 가능한 병해충
                      </Typography>
                      {selectedTab === 0 && (
                        <Box className="text-center">
                          <Typography variant="body2" className="text-gray-600">
                            참외 잎사귀의 다음 증상을 진단할 수 있습니다:
                          </Typography>
                          <Box className="mt-2 flex justify-center gap-4">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              흰가루병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              노균병
                            </span>
                          </Box>
                        </Box>
                      )}
                      {selectedTab === 1 && (
                        <Box className="text-center">
                          <Typography variant="body2" className="text-gray-600">
                            딸기 잎사귀의 다음 증상을 진단할 수 있습니다:
                          </Typography>
                          <Box className="mt-2 flex justify-center gap-4">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              잎끝마름병
                            </span>
                          </Box>
                        </Box>
                      )}
                      {selectedTab === 2 && (
                        <Box className="text-center">
                          <Typography variant="body2" className="text-gray-600">
                            키위 잎사귀의 다음 증상을 진단할 수 있습니다:
                          </Typography>
                          <Box className="mt-2 flex justify-center gap-4">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              점무늬병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              총채벌레
                            </span>
                          </Box>
                        </Box>
                      )}
                      {selectedTab === 3 && (
                        <Box className="text-center">
                          <Typography variant="body2" className="text-gray-600">
                            토마토 잎사귀의 다음 증상을 진단할 수 있습니다:
                          </Typography>
                          <Box className="mt-2 flex flex-wrap justify-center gap-1">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              박테리아성 반점병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              잎마름병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              역병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              잎곰팡이병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              세프토리아 잎반점병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              거미 진드기
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              표적 반점병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              황화 잎말림 바이러스
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              모자이크 바이러스
                            </span>
                          </Box>
                        </Box>
                      )}
                      {selectedTab === 4 && (
                        <Box className="text-center">
                          <Typography variant="body2" className="text-gray-600">
                            사과 잎사귀의 다음 증상을 진단할 수 있습니다:
                          </Typography>
                          <Box className="mt-2 flex flex-wrap justify-center gap-2">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              검은무늬병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              흑색부패병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              삼나무 녹병
                            </span>
                          </Box>
                        </Box>
                      )}
                      {selectedTab === 5 && (
                        <Box className="text-center">
                          <Typography variant="body2" className="text-gray-600">
                            감자 잎사귀의 다음 증상을 진단할 수 있습니다:
                          </Typography>
                          <Box className="mt-2 flex flex-wrap justify-center gap-2">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              잎마름병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              역병
                            </span>
                          </Box>
                        </Box>
                      )}
                      {selectedTab === 6 && (
                        <Box className="text-center">
                          <Typography variant="body2" className="text-gray-600">
                            포도 잎사귀의 다음 증상을 진단할 수 있습니다:
                          </Typography>
                          <Box className="mt-2 flex flex-wrap justify-center gap-2">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              에스카병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              흑색 부패병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              잎마름병
                            </span>
                          </Box>
                        </Box>
                      )}
                      {selectedTab === 7 && (
                        <Box className="text-center">
                          <Typography variant="body2" className="text-gray-600">
                            옥수수 잎사귀의 다음 증상을 진단할 수 있습니다:
                          </Typography>
                          <Box className="mt-2 flex flex-wrap justify-center gap-2">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              세르코스포라 잎반점병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              일반 녹병
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              북부 잎마름병
                            </span>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <>
                  <Box className="flex gap-4 mb-4 justify-center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleDiagnosis}
                      disabled={isLoading}
                      className="min-w-[120px] h-[2.4rem]"
                      sx={{
                        backgroundColor: "#3a9d1f",
                        "&:hover": {
                          backgroundColor: "#2d7b18",
                        },
                        "&.Mui-disabled": {
                          backgroundColor: "#a5d3a0",
                        },
                      }}
                    >
                      {isLoading ? "분석 중..." : "진단하기"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={resetStateHandler}
                      disabled={isLoading}
                      className="min-w-[120px] h-[2.4rem]"
                      sx={{
                        color: "#3a9d1f",
                        borderColor: "#3a9d1f",
                        "&:hover": {
                          borderColor: "#2d7b18",
                          color: "#2d7b18",
                        },
                        "&.Mui-disabled": {
                          borderColor: "#a5d3a0",
                          color: "#a5d3a0",
                        },
                      }}
                    >
                      다시 시도
                    </Button>
                  </Box>
                  <Box className="w-full">
                    <Typography variant="h6" className="mb-4 pb-2"></Typography>
                    <Box className="flex justify-center">
                      <Box className="w-full sm:w-[500px] h-[330px] bg-white">
                        <img
                          src={selectedImage}
                          alt="선택된 이미지"
                          className="w-full h-full object-contain"
                        />
                      </Box>
                    </Box>
                    {!selectedImage && (
                      <Box className="mt-4 p-4 border-2 border-gray-300 rounded-lg">
                        <Typography
                          variant="subtitle1"
                          className="font-semibold mb-2"
                        >
                          진단 가능한 병해충
                        </Typography>
                        {selectedTab === 0 && (
                          <Typography variant="body2" className="flex gap-2">
                            참외:
                            <span className="text-gray-600">
                              흰가루병, 노균병, 정상
                            </span>
                          </Typography>
                        )}
                        {selectedTab === 1 && (
                          <Typography variant="body2" className="flex gap-2">
                            딸기:
                            <span className="text-gray-600">
                              잎끝마름, 정상
                            </span>
                          </Typography>
                        )}
                        {selectedTab === 2 && (
                          <Typography variant="body2" className="flex gap-2">
                            키위:
                            <span className="text-gray-600">
                              점무늬병, 총채벌레, 정상
                            </span>
                          </Typography>
                        )}
                        {selectedTab === 3 && (
                          <Typography variant="body2" className="flex gap-2">
                            토마토:
                            <span className="text-gray-600">
                              박테리아성 반점병, 잎마름병, 역병, 잎곰팡이병,
                              세프토리아 잎반점병, 거미 진드기, 표적 반점병,
                              황화 잎말림 바이러스, 모자이크 바이러스, 정상
                            </span>
                          </Typography>
                        )}
                        {selectedTab === 4 && (
                          <Typography variant="body2" className="flex gap-2">
                            사과:
                            <span className="text-gray-600">
                              검은무늬병, 흑색부패병, 삼나무 녹병, 정상
                            </span>
                          </Typography>
                        )}
                        {selectedTab === 5 && (
                          <Typography variant="body2" className="flex gap-2">
                            감자:
                            <span className="text-gray-600">
                              잎마름병, 역병, 정상
                            </span>
                          </Typography>
                        )}
                        {selectedTab === 6 && (
                          <Typography variant="body2" className="flex gap-2">
                            포도:
                            <span className="text-gray-600">
                              에스카병, 흑색 부패병, 잎마름병, 정상
                            </span>
                          </Typography>
                        )}
                        {selectedTab === 7 && (
                          <Typography variant="body2" className="flex gap-2">
                            옥수수:
                            <span className="text-gray-600">
                              세르코스포라 잎반점병, 일반 녹병, 북부 잎마름병,
                              정상
                            </span>
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>

            {/* 우측 - 진단 결과 카드 */}
            <Box className="w-full md:w-1/2 flex items-start justify-start mt-8 md:mt-0">
              <Box className="w-full sm:w-[500px]">
                <Box className="w-full sm:w-[500px] h-[520px] border-2 border-gray-300 rounded-lg p-4">
                  <Typography
                    variant="h6"
                    className="mb-3 border-b border-gray-200 pb-2"
                  >
                    {showExample ? "예상 진단 결과" : "진단 결과"}
                  </Typography>
                  <Paper
                    className={`p-3 h-[calc(100%-3rem)] flex items-center justify-center ${
                      (showExample ? getExampleResult() : result)?.status ===
                      "healthy"
                        ? "bg-green-50"
                        : (showExample ? getExampleResult() : result)
                            ?.status === "invalid"
                        ? "bg-gray-50"
                        : "bg-red-50"
                    } transition-colors duration-300`}
                    sx={{ boxShadow: "none" }}
                  >
                    <Box className="space-y-4 text-sm w-full">
                      <Typography variant="body2" className="text-center">
                        <span className="font-semibold">진단 결과: </span>
                        {showExample
                          ? getExampleResult().disease
                          : result?.disease}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="whitespace-pre-wrap text-center"
                      >
                        <span className="font-semibold">권장 조치: </span>
                        {showExample
                          ? getExampleResult().recommendation
                          : result?.recommendation}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </Box>
          </Box>

          {error && (
            <Typography color="error" className="mt-4">
              {error}
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Pests;
