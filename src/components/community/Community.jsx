import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  getPostsStart,
  getPostsSuccess,
  getPostsFailure,
  selectPosts,
  fetchPosts,
  selectLoading,
} from "../../redux/slices/writeSlice";
import Write from "./Write";
import CommunityNavigation from "./CommunityNavigation";
import CreatePostModal from "./WriteModal";
import { getRequest } from "../../utils/requestMethods";

const Community = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const postsData = useSelector(selectPosts);
  const loading = useSelector(selectLoading);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 현재 커뮤니티 타입 결정
  const getCommunityType = () => {
    if (location.pathname.includes("/gardening")) return "gardening";
    if (location.pathname.includes("/marketplace")) return "marketplace";
    if (location.pathname.includes("/freeboard")) return "freeboard";
    return "freeboard"; // 기본값
  };

  const communityType = getCommunityType();

  // 커뮤니티 타입별 카테고리 설정
  const getCategoriesByType = () => {
    switch (communityType) {
      case "gardening":
        return [
          { id: "all", name: "전체" },
          { id: "general", name: "일반 토론" },
          { id: "food", name: "식물 재배" },
          { id: "indoor", name: "실내 식물" },
          { id: "pests", name: "병충해 관리" },
          { id: "hydroponic", name: "수경 재배" },
        ];
      case "marketplace":
        return [
          { id: "all", name: "전체" },
          { id: "sell", name: "판매하기" },
          { id: "buy", name: "구매하기" },
        ];
      case "freeboard":
        return [
          { id: "all", name: "전체" },
        ];
      default:
        return [{ id: "all", name: "전체" }];
    }
  };

  const categories = getCategoriesByType();

  // 커뮤니티 타입이 변경될 때마다 카테고리를 '전체'로 초기화
  useEffect(() => {
    setSelectedCategory("all");
    dispatch(fetchPosts(communityType));
  }, [communityType, dispatch]);

  // 게시글 필터링
  const filteredPosts = useMemo(() => {
    if (!postsData?.data || !Array.isArray(postsData.data)) {
      // console.log("[Community] 유효한 게시글 데이터가 없음");
      return [];
    }

    const filtered = postsData.data.filter((post) => {
      if (!post) return false;

      const matchesSearch =
        searchTerm === "" ||
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || 
        post.category === selectedCategory;
        
      const matchesCommunityType = post.community_type === communityType;

      return matchesSearch && matchesCategory && matchesCommunityType;
    });

    return filtered;
  }, [postsData, searchTerm, selectedCategory, communityType]);

  // 카테고리 이름 변환 함수 수정
  const getCategoryName = (categoryId) => {
    // 카테고리 매핑 객체 추가
    const categoryMapping = {
      all: "전체",
      general: "일반 토론",
      food: "식물 재배",
      indoor: "실내 식물",
      pests: "병충해 관리",
      hydroponic: "수경 재배",
      sell: "판매하기",
      buy: "구매하기",
      freeboard: "자유게시판"
    };

    return categoryMapping[categoryId] || categoryId;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0aab65] mt-[-100px]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <CommunityNavigation />

      <div className="flex flex-row items-center mb-6 gap-2 md:justify-between px-4">
        {communityType !== "freeboard" && (
          <div ref={dropdownRef} className="flex-shrink-0">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-gray-600 cursor-pointer hover:text-gray-800 border border-gray-300 rounded-lg px-2 py-2 flex items-center space-x-1 text-sm md:text-base md:px-3"
            >
              <span className="truncate max-w-[80px] md:max-w-none">{getCategoryName(selectedCategory)}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <input
              type="search"
              placeholder="검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border rounded-lg text-sm md:text-base"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg 
                className="w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 bg-[#3a9d1f] text-white px-3 py-2 rounded-lg hover:bg-[#0aab65] text-sm md:text-base md:px-6"
          >
            글쓰기
          </button>
        </div>
      </div>

      <Write posts={filteredPosts} />

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          dispatch(fetchPosts(communityType));
        }}
        communityType={communityType}
      />
    </div>
  );
};

export default Community;
