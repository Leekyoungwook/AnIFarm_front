import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaComments, FaList, FaSeedling, FaStore, FaEllipsisV } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { getCommunityTypeName } from './helpers';
import { GET_USER_COMMENTS_API_URL, POST_COMMENTS_API_URL } from '../../utils/apiurl';

const MyComments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [myComments, setMyComments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(null);
  const ITEMS_PER_PAGE = 3;
  const [loading, setLoading] = useState(true);

  // 댓글 목록 가져오기
  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(GET_USER_COMMENTS_API_URL, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setMyComments(response.data.data);
      }
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
      Swal.fire('오류', '댓글을 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // 필터링된 댓글
  const filteredComments = myComments.filter(comment => {
    if (selectedCategory === 'all') return true;
    switch(selectedCategory) {
      case 'growing':
        return comment.community_type === 'gardening';
      case 'market':
        return comment.community_type === 'marketplace';
      case 'free':
        return comment.community_type === 'freeboard';
      default:
        return true;
    }
  });

  // 현재 페이지의 댓글
  const currentComments = filteredComments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 댓글 삭제 핸들러
  const handleDeleteComment = async (commentId) => {
    try {
      const result = await Swal.fire({
        title: '댓글을 삭제하시겠습니까?',
        text: '삭제된 댓글은 복구할 수 없습니다.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        
        const response = await axios.delete(`${POST_COMMENTS_API_URL}/${commentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          await fetchComments();
          Swal.fire('삭제 완료', '댓글이 삭제되었습니다.', 'success');
        }
      }
    } catch (error) {
      console.error('댓글 삭제 중 오류 발생:', error);
      Swal.fire('오류', '댓글 삭제에 실패했습니다.', 'error');
    }
  };

  // 댓글 수정 핸들러
  const handleEditComment = async (comment) => {
    try {
      const result = await Swal.fire({
        title: '댓글 수정',
        input: 'text',
        inputValue: comment.content,
        showCancelButton: true,
        confirmButtonText: '수정',
        cancelButtonText: '취소',
        inputValidator: (value) => {
          if (!value) {
            return '내용을 입력해주세요.';
          }
        }
      });

      if (result.isConfirmed) {
        const response = await axios.put(
          `${POST_COMMENTS_API_URL}/${comment.comment_id}`,
          { content: result.value },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          await fetchComments();
          Swal.fire('수정 완료', '댓글이 수정되었습니다.', 'success');
        } else {
          throw new Error(response.data.message || '댓글 수정에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('댓글 수정 오류:', error);
      Swal.fire('오류', error.message || '댓글 수정에 실패했습니다.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200">
          <FaComments className="text-[#3a9d1f] text-xl" />
          <h2 className="text-xl font-semibold text-gray-800">내 댓글</h2>
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
        <FaComments className="text-[#3a9d1f] text-xl" />
        <h2 className="text-xl font-semibold text-gray-800">
          내 댓글 ({myComments.length})
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

      <div className="space-y-3">
        {currentComments.length > 0 ? (
          currentComments.map((comment) => (
            <div
              key={comment.comment_id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 relative group"
              onClick={() => navigate(`/Community/${comment.post_id}`)}
            >
              <div className="absolute right-2 top-2">
                <button 
                  className="p-2 hover:bg-gray-200 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(showDropdown === `comment-${comment.comment_id}` ? null : `comment-${comment.comment_id}`);
                  }}
                >
                  <FaEllipsisV className="text-gray-500" />
                </button>
                
                {showDropdown === `comment-${comment.comment_id}` && (
                  <div 
                    className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditComment(comment);
                        setShowDropdown(null);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteComment(comment.comment_id);
                        setShowDropdown(null);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <p className="font-medium text-gray-900">{comment.content}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${comment.community_type === 'gardening' ? 'bg-green-100 text-green-800' : 
                      comment.community_type === 'marketplace' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'}`}
                  >
                    {getCommunityTypeName(comment.community_type)}
                  </span>
                  <span className="text-sm text-gray-900 truncate flex-1" title={comment.post_title}>
                    {comment.post_title}
                  </span>
                </div>
                <p className="text-xs text-gray-500 text-right">
                  {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            {selectedCategory === 'all' 
              ? '작성한 댓글이 없습니다.' 
              : '해당 카테고리의 댓글이 없습니다.'}
          </p>
        )}
      </div>

      {filteredComments.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center items-center gap-1 md:gap-2 mt-4 md:mt-6">
          {Array.from({ length: Math.ceil(filteredComments.length / ITEMS_PER_PAGE) }, (_, i) => (
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

export default MyComments; 