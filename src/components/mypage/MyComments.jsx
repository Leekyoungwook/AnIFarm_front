import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GET_USER_COMMENTS_API_URL } from "../../utils/apiurl";

const MyComments = () => {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      // console.log("API URL:", GET_USER_COMMENTS_API_URL);
      // console.log("Token:", token);

      const response = await axios.get(GET_USER_COMMENTS_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log("Response:", response);

      if (response.data.success) {
        setComments(response.data.data);
      } else {
        setError("댓글을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("댓글 로딩 실패:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        config: err.config
      });
      setError("댓글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>내 댓글</h2>
      {comments.length === 0 ? (
        <p>작성한 댓글이 없습니다.</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <p>{comment.content}</p>
              <small>{new Date(comment.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyComments; 