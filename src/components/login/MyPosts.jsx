import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyPosts, selectMyPosts } from '../../redux/slices/writeSlice';
import { FaPen, FaList, FaSeedling, FaStore, FaComments, FaEllipsisV } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import { getCategoryName, getCommunityTypeName } from './helpers';

const MyPosts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myPosts, loading } = useSelector((state) => ({
    myPosts: selectMyPosts(state),
    loading: state.write.loading
  }));
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(null);
  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    dispatch(fetchMyPosts()).then(() => {
      // 받아온 데이터의 형식을 확인
      // // console.log('게시글 데이터:', myPosts);
    });
  }, [dispatch]);

  const filteredPosts = myPosts?.filter(post => {
    if (selectedCategory === 'all') return true;
    switch(selectedCategory) {
      case 'growing':
        return post.community_type === 'gardening' && 
               ['general', 'food', 'indoor', 'pests', 'hydroponic'].includes(post.category);
      case 'market':
        return post.community_type === 'marketplace' && 
               ['sell', 'buy'].includes(post.category);
      case 'free':
        return post.community_type === 'freeboard';
      default:
        return true;
    }
  }) || [];

  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 게시글 수정 핸들러
  const handleEditPost = async (post) => {
    try {
      const result = await Swal.fire({
        title: '게시글 수정',
        html: `
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 text-left mb-1">제목</label>
              <input 
                id="swal-title" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3a9d1f] focus:border-[#3a9d1f]" 
                value="${post.title}"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 text-left mb-1">내용</label>
              <textarea 
                id="swal-content" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3a9d1f] focus:border-[#3a9d1f]"
                rows="8"
                style="min-height: 200px;"
              >${post.content}</textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 text-left mb-1">카테고리</label>
              <select 
                id="swal-category" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                ${post.community_type === 'gardening' ? `
                  <option value="general" ${post.category === 'general' ? 'selected' : ''}>일반토론</option>
                  <option value="food" ${post.category === 'food' ? 'selected' : ''}>식물 재배</option>
                  <option value="indoor" ${post.category === 'indoor' ? 'selected' : ''}>실내 식물</option>
                  <option value="pests" ${post.category === 'pests' ? 'selected' : ''}>병충해 관리</option>
                  <option value="hydroponic" ${post.category === 'hydroponic' ? 'selected' : ''}>수경 재배</option>
                ` : post.community_type === 'marketplace' ? `
                  <option value="sell" ${post.category === 'sell' ? 'selected' : ''}>판매</option>
                  <option value="buy" ${post.category === 'buy' ? 'selected' : ''}>구매</option>
                ` : `
                  <option value="free" selected>자유</option>
                `}
              </select>
            </div>
          </div>
        `,
        width: '600px',
        showCancelButton: true,
        confirmButtonText: '수정',
        cancelButtonText: '취소',
        preConfirm: () => {
          const title = document.getElementById('swal-title').value;
          const content = document.getElementById('swal-content').value;
          const category = document.getElementById('swal-category').value;
          
          if (!title.trim()) {
            Swal.showValidationMessage('제목을 입력해주세요');
            return false;
          }
          if (!content.trim()) {
            Swal.showValidationMessage('내용을 입력해주세요');
            return false;
          }
          
          return { title, content, category };
        }
      });

      if (result.isConfirmed) {
        const response = await axios.put(
          `https://backend.jjiwon.site/api/posts/${post.post_id}`,
          {
            title: result.value.title,
            content: result.value.content,
            community_type: post.community_type,
            category: result.value.category
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          dispatch(fetchMyPosts());
          Swal.fire({
            icon: 'success',
            title: '수정 완료',
            text: '게시글이 수정되었습니다.',
            timer: 1500,
            showConfirmButton: false
          });
        }
      }
    } catch (error) {
      console.error('게시글 수정 오류:', error);
      Swal.fire({
        icon: 'error',
        title: '수정 실패',
        text: error.response?.data?.message || '게시글 수정에 실패했습니다.',
        confirmButtonText: '확인'
      });
    }
  };

  // 게시글 삭제 핸들러
  const handleDeletePost = async (postId) => {
    try {
      const result = await Swal.fire({
        title: '게시글을 삭제하시겠습니까?',
        text: '삭제된 게시글은 복구할 수 없습니다.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
      });

      if (result.isConfirmed) {
        const response = await axios.delete(`https://backend.jjiwon.site/api/write/${postId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          dispatch(fetchMyPosts());
          Swal.fire({
            icon: 'success',
            title: '삭제 완료',
            text: '게시글이 삭제되었습니다.',
            timer: 1500,
            showConfirmButton: false
          });
        }
      }
    } catch (error) {
      console.error('[MyPosts] 게시글 삭제 오류:', error);
      Swal.fire({
        icon: 'error',
        title: '삭제 실패',
        text: error.response?.data?.message || '게시글 삭제에 실패했습니다.',
        confirmButtonText: '확인'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200">
          <FaPen className="text-[#3a9d1f] text-xl" />
          <h2 className="text-xl font-semibold text-gray-800">내 게시글</h2>
        </div>
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0aab65]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
      <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200">
        <FaPen className="text-[#3a9d1f] text-xl" />
        <h2 className="text-xl font-semibold text-gray-800">
          내 게시글 ({myPosts?.length || 0})
        </h2>
      </div>

      <div className="flex gap-3 mb-4 flex-col md:flex-row">
        {[
          { id: 'all', label: '전체', icon: <FaList /> },
          { id: 'growing', label: '재배하기', icon: <FaSeedling /> },
          { id: 'market', label: '판매/구매', icon: <FaStore /> },
          { id: 'free', label: '자유게시판', icon: <FaComments /> }
        ].map(button => (
          <button
            key={button.id}
            onClick={() => setSelectedCategory(button.id)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2
              ${selectedCategory === button.id
                ? 'bg-[#3a9d1f] text-white shadow-md transform scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {button.icon}
            {button.label}
          </button>
        ))}
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-3">
        {currentPosts.length > 0 ? (
          currentPosts.map((post) => {
            // // 디버깅을 위한 로그 추가
            // // console.log('게시글 날짜 데이터:', {
            //   postId: post.post_id,
            //   rawDate: post.created_at,
            //   type: typeof post.created_at
            // });

            return (
              <div
                key={post.post_id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 relative group"
                onClick={() => navigate(`/Community/${post.post_id}`)}
              >
                {/* 더보기 버튼 */}
                <div className="absolute right-2 top-2">
                  <button 
                    className="p-2 hover:bg-gray-200 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(showDropdown === `post-${post.post_id}` ? null : `post-${post.post_id}`);
                    }}
                  >
                    <FaEllipsisV className="text-gray-500" />
                  </button>
                  
                  {/* 드롭다운 메뉴 */}
                  {showDropdown === `post-${post.post_id}` && (
                    <div 
                      className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPost(post);
                          setShowDropdown(null);
                        }}
                      >
                        수정
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post.post_id);
                          setShowDropdown(null);
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <h3 className="font-medium text-gray-900 truncate" title={post.title}>
                    {post.title}
                  </h3>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${post.community_type === 'gardening' ? 'bg-green-100 text-green-800' : 
                        post.community_type === 'marketplace' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'}`}
                    >
                      {post.community_type === 'freeboard' 
                        ? '자유게시판' 
                        : getCategoryName(post.category)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    {post.date 
                      ? new Date(post.date).toISOString().split('T')[0].replace(/-/g, '.')
                      : '날짜 정보 없음'}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center py-4">
            {selectedCategory === 'all' 
              ? '작성한 게시글이 없습니다.' 
              : '해당 카테고리의 게시글이 없습니다.'}
          </p>
        )}
      </div>

      {/* 페이지네이션 */}
      {filteredPosts.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center items-center gap-1 md:gap-2 mt-4 md:mt-6">
          {Array.from({ length: Math.ceil(filteredPosts.length / ITEMS_PER_PAGE) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 md:px-4 py-1 md:py-2 text-sm md:text-base rounded-lg transition-all duration-200 
                ${currentPage === i + 1
                  ? 'bg-[#3a9d1f] text-white font-medium transform scale-105'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts; 