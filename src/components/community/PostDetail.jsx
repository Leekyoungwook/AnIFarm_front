import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchComments,
  createComment,
  editComment,
  deleteComment,
  setLoading,
} from "../../redux/slices/commentSlice";
import axios from "axios";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { rootPath } from "../../utils/apiurl";


const PostDetail = () => {
  const { postId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();


  // Redux state에서 댓글 데이터 가져오기
  const comments = useSelector((state) => state.comments.comments);
  const commentLoading = useSelector((state) => state.comments.loading);
  const commentError = useSelector((state) => state.comments.error);


  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isWritingComment, setIsWritingComment] = useState(true); // 기본 댓글 작성 모드


  // 공통 버튼 스타일을 위한 상수 추가
  const buttonStyles = {
    primary: "h-10 px-6 bg-[#3a9d1f] text-white rounded-lg hover:bg-[#0aab65] transition-all duration-200 flex items-center justify-center",
    secondary: "h-10 px-6 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center",
    danger: "h-10 px-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center",
    edit: "h-10 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center"
  };


  useEffect(() => {
    // console.log("useEffect 실행, postId:", postId);
    fetchPostAndComments();


    const token = localStorage.getItem("token");
    // console.log("현재 토큰:", token);


    if (token) {
      try {
        const decoded = jwtDecode(token);
        // console.log("디코딩된 토큰:", decoded);
        setCurrentUser(decoded);
      } catch (error) {
        console.error("토큰 디코딩 실패:", error);
        localStorage.removeItem("token");
      }
    }
  }, [postId, dispatch]);


  const fetchPostAndComments = async () => {
    try {
      // 게시물 데이터 가져오기
      const response = await axios.get(`${rootPath}/api/posts/${postId}`);


      if (response.data.success && response.data.data) {
        setPost(response.data.data);
        // Redux thunk를 통해 댓글 데이터 가져오기
        await dispatch(fetchComments(postId));
      } else {
        throw new Error("게시물을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      Swal.fire({
        icon: "error",
        title: "오류 발생",
        text: "게시물을 불러오는 중 오류가 발생했습니다.",
      }).then(() => {
        navigate("/community");
      });
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "로그인이 필요합니다.",
          text: "다시 로그인해주세요.",
        });
        return;
      }


      const response = await axios.delete(`${rootPath}/api/write/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "게시글이 삭제되었습니다.",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          navigate(-1);
        });
      }
    } catch (error) {
      console.error("게시글 삭제 중 오류 발생:", error);
      if (error.response?.status === 401) {
        Swal.fire({
          icon: "error",
          title: "인증 오류",
          text: "로그인이 필요하거나 인증이 만료되었습니다. 다시 로그인해주세요.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "오류 발생",
          text: "게시글 삭제 중 오류가 발생했습니다.",
        });
      }
    }
  };


  // CommentInput을 별도의 컴포넌트로 분리
  const CommentInputContainer = React.memo(({ onSubmit, initialValue = "", placeholder, buttonText, onCancel = null }) => {
    const [content, setContent] = useState(initialValue);


    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!content.trim()) return;
     
      await onSubmit(content);
      setContent("");
    };


    const handleChange = (e) => {
      setContent(e.target.value);
    };


    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={handleChange}
          className="w-full p-3 border-2 border-gray-300 rounded-lg
          focus:border-[#3a9d1f] focus:ring-2 focus:ring-green-200
          transition-all duration-200 resize-y min-h-[100px]"
          placeholder={placeholder}
          rows="3"
        />
        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            className={`${buttonStyles.primary} ${!content.trim() && 'opacity-50 cursor-not-allowed'}`}
            disabled={!content.trim()}
          >
            {buttonText}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={buttonStyles.secondary}
            >
              취소
            </button>
          )}
        </div>
      </form>
    );
  });


  // 댓글 입력 핸들러 최적화
  const handleCommentChange = React.useCallback((e) => {
    setNewComment(e.target.value);
  }, []);


  // 댓글 제출 핸들러 최적화
  const handleCommentSubmit = React.useCallback(async (content) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "로그인 필요",
          text: "댓글을 작성하려면 로그인이 필요합니다.",
        });
        return;
      }


      const resultAction = await dispatch(
        createComment({
          post_id: parseInt(postId),
          content: content.trim(),
          parent_id: replyTo
        })
      );


      if (createComment.fulfilled.match(resultAction)) {
        setReplyTo(null);
        setIsWritingComment(true);
        await dispatch(fetchComments(postId));
        Swal.fire({
          icon: "success",
          title: "성공",
          text: "댓글이 작성되었습니다.",
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      Swal.fire({
        icon: "error",
        title: "댓글 작성 실패",
        text: error.message || "댓글 작성 중 오류가 발생했습니다.",
      });
    }
  }, [postId, replyTo, dispatch]);


  const handleEditPost = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        await Swal.fire({
          icon: "error",
          title: "인증 오류",
          text: "로그인이 필요합니다.",
        });
        return;
      }


      const response = await axios.put(
        `${rootPath}/api/posts/${postId}`,
        {
          title: post.title,
          content: post.content,
          category: post.category,
          community_type: post.community_type
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );


      if (response.data.success) {
        setIsEditing(false);
        await Swal.fire({
          icon: "success",
          title: "수정 완료",
          text: "게시글이 성공적으로 수정되었습니다.",
          showConfirmButton: false,
          timer: 1500
        });
        await fetchPostAndComments();
      } else {
        throw new Error(response.data.message || "게시글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("게시글 수정 실패:", error);
     
      let errorMessage = "게시글 수정 중 오류가 발생했습니다.";
      if (error.response?.status === 401) {
        errorMessage = "로그인이 필요하거나 인증이 만료되었습니다.";
      } else if (error.response?.status === 403) {
        errorMessage = "게시글을 수정할 권한이 없습니다.";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }


      await Swal.fire({
        icon: "error",
        title: "오류 발생",
        text: errorMessage
      });
    }
  };


  const handleEditComment = async (commentId) => {
    try {
      if (!editedContent.trim()) {
        Swal.fire({
          icon: "warning",
          title: "경고",
          text: "댓글 내용을 입력해주세요.",
        });
        return;
      }


      const result = await dispatch(editComment(commentId, editedContent, postId));
     
      if (result && result.success) {
        setEditingCommentId(null);
        setEditedContent("");
       
        // 댓글 목록 새로고침
        await dispatch(fetchComments(postId));
       
        Swal.fire({
          icon: "success",
          title: "성공",
          text: "댓글이 수정되었습니다.",
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      if (error.message.includes('로그인')) {
        // 로그인 관련 오류인 경우 로그인 페이지로 이동
        window.location.href = '/login';
      } else {
        Swal.fire({
          icon: "error",
          title: "오류",
          text: error.message || "댓글 수정에 실패했습니다.",
        });
      }
    }
  };


  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "로그인이 필요합니다",
          text: "댓글을 삭제하려면 로그인이 필요합니다.",
        });
        navigate("/login");
        return;
      }


      const result = await Swal.fire({
        title: "댓글을 삭제하시겠습니까?",
        text: "삭제된 댓글은 복구할 수 없습니다.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "삭제",
        cancelButtonText: "취소",
      });


      if (result.isConfirmed) {
        const response = await axios.delete(`${rootPath}/api/comments/${commentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });


        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "댓글이 삭제되었습니다.",
            showConfirmButton: false,
            timer: 1500,
          });
          fetchPostAndComments();
        } else {
          throw new Error(response.data.message || "댓글 삭제에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      if (error.response?.status === 401) {
        Swal.fire({
          icon: "error",
          title: "인증 오류",
          text: "세션이 만료되었습니다. 다시 로그인해주세요.",
        }).then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "오류 발생",
          text: error.message || "댓글 삭제 중 오류가 발생했습니다.",
        });
      }
    }
  };


  const getCategoryName = (category) => {
    const categories = {
      general: "일반 토론",
      food: "식물 재배",
      indoor: "실내 식물",
      pests: "병충해 관리",
      hydroponic: "수경 재배",
      question: "질문하기",
      marketplace: "판매하기",
      sell: "판매하기",
      buy: "구매하기",
      gardening: "재배하기"
    };
    return categories[category] || category;
  };


  const isPostAuthor = () => {
    return currentUser && post && post.email === currentUser.sub;
  };


  const isCommentAuthor = (comment) => {
    return currentUser && comment && comment.email === currentUser.sub;
  };


  // 카테고리 옵션 함수 추가
  const getCategoryOptions = (communityType) => {
    switch (communityType) {
      case 'gardening':
        return [
          { value: 'general', label: '일반 토론' },
          { value: 'food', label: '식물 재배' },
          { value: 'indoor', label: '실내 식물' },
          { value: 'pests', label: '병충해 관리' },
          { value: 'hydroponic', label: '수경 재배' }
        ];
      case 'marketplace':
        return [
          { value: 'sell', label: '판매하기' },
          { value: 'buy', label: '구매하기' }
        ];
      case 'freeboard':
        return [
          { value: 'free', label: '자유' }
        ];
      default:
        return [];
    }
  };


  // 이메일을 사용자명으로 변환하는 함수 추가
  const formatUserEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    return `${username.slice(0, 2)}***@${domain}`;
  };


  // 댓글 렌더링 함수 수정
  const renderComments = (comments, parentId = null, depth = 0) => {
    return comments
      .filter(comment => comment.parent_id === parentId)
      .map(comment => (
        <div
          key={comment.comment_id}
          className={`relative border-t border-b border-gray-200
            ${depth > 0 ? 'ml-8 pl-4' : ''}`}
        >
          <div className="flex flex-col space-y-2 py-4">
            {/* 댓글 헤더 */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {formatUserEmail(comment.email)}
                  </span>
                  {depth > 0 && (
                    <span className="text-xs text-gray-500">
                      답글
                    </span>
                  )}
                  {comment.is_edited && (
                    <span className="text-xs text-gray-500">
                      (수정됨)
                    </span>
                  )}
                </div>
              </div>
            </div>


            {/* 댓글 내용 */}
            {editingCommentId === comment.comment_id ? (
              <div className="space-y-2 pl-11">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-200
                  transition-all duration-200 resize-none"
                  rows="2"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEditComment(comment.comment_id)}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={!editedContent.trim()}
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditedContent("");
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="pl-11">
                  <p className="text-gray-800 break-words">{comment.content}</p>
                </div>
                <div className="flex justify-end items-center space-x-4 pl-11">
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                  {depth < 2 && (
                    <button
                      onClick={() => {
                        setReplyTo(comment.comment_id);
                        setIsWritingComment(false);
                        setNewComment('');
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      답글 달기
                    </button>
                  )}
                  {isCommentAuthor(comment) && (
                    <>
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.comment_id);
                          setEditedContent(comment.content);
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.comment_id)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </>
            )}


            {/* 답글 입력 폼 */}
            {replyTo === comment.comment_id && (
              <div className="mt-2 pl-11">
                <CommentInputContainer
                  onSubmit={handleCommentSubmit}
                  onCancel={() => {
                    setReplyTo(null);
                    setIsWritingComment(true);
                  }}
                  placeholder="답글을 작성하세요"
                  buttonText="답글 작성"
                />
              </div>
            )}
          </div>


          {/* 대댓글 렌더링 */}
          {renderComments(comments, comment.comment_id, depth + 1)}
        </div>
      ));
  };


  if (loading || !post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0aab65] mt-[-100px]" />
      </div>
    );
  }


  return (
    <div className="container mx-auto p-2 max-w-4xl">
      {/* 상단 네비게이션 */}
      <div className="hidden md:flex justify-between items-center my-2 md:my-6">
        <button
          onClick={() => navigate(`/community/${post.community_type || "gardening"}`)}
          className={buttonStyles.primary}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          목록으로 돌아가기
        </button>
      </div>


      {/* 모바일 상단 네비게이션 */}
      <div className="md:hidden flex items-center my-2">
        <button
          onClick={() => navigate(-1)}
          className="text-[#3a9d1f] font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </button>
      </div>


      <div className="bg-white rounded-lg shadow-md p-3 md:p-6 mb-4 border border-gray-200">
        <div className="flex flex-col mb-3 md:mb-4">
          {isEditing ? (
            <div className="w-full space-y-3">
              <input
                type="text"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                className="text-lg md:text-2xl font-bold w-full p-2 border rounded"
                placeholder="제목을 입력하세요"
              />
              <select
                value={post.category}
                onChange={(e) => setPost({ ...post, category: e.target.value })}
                className="w-full p-2 border rounded text-gray-700"
              >
                {getCategoryOptions(post.community_type).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <h1 className="text-lg md:text-2xl font-bold mb-2">{post.title}</h1>
              <div className="flex justify-between items-center text-sm md:text-base">
                <div className="flex flex-col md:flex-row md:gap-4">
                  <span className="text-gray-600">
                    작성자: {formatUserEmail(post.email)}
                  </span>
                  <span className="text-gray-600">
                    카테고리: {getCategoryName(post.category)}
                  </span>
                </div>
                <span className="text-gray-500 text-sm">
                  {new Date(post.date).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </div>


        <div className="border-t border-b py-3 md:py-4 mb-3 md:mb-4">
          {isEditing ? (
            <textarea
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
              className="w-full p-2 border rounded text-sm md:text-base"
              rows="6"
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm md:text-base">{post.content}</p>
          )}
        </div>


        {isPostAuthor() && (
          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleEditPost}
                  className="px-3 py-1.5 text-sm md:px-4 md:py-2 bg-[#3a9d1f] text-white rounded hover:bg-[#0aab65]"
                >
                  저장
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-sm md:px-4 md:py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-sm md:px-4 md:py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm md:px-4 md:py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  삭제
                </button>
              </>
            )}
          </div>
        )}
      </div>


      {/* 댓글 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-3 md:p-6 border border-gray-200 mb-2">
        <h2 className="text-lg md:text-xl font-bold mb-4">댓글</h2>
        {isWritingComment && !replyTo && (
          <CommentInputContainer
            onSubmit={handleCommentSubmit}
            placeholder="댓글을 작성하세요"
            buttonText="댓글 작성"
          />
        )}
        <div className="mt-4 space-y-4 md:space-y-6">
          {comments && comments.length > 0 ? (
            renderComments(comments)
          ) : (
            <div className="text-center text-gray-500 py-6">
              첫 번째 댓글을 작성해보세요!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default PostDetail;





