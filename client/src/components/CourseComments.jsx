// client/src/components/CourseComments.jsx
import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Form,
  Spinner,
  Alert,
  Badge
} from 'react-bootstrap';
import axios from 'axios';

const CourseComments = ({ courseId, currentLesson, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComments();
  }, [courseId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/courses/${courseId}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        console.log('Fetched comments:', response.data.comments);
        setComments(response.data.comments || []);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/courses/${courseId}/comments`,
        { 
          text: newComment,
          lessonId: currentLesson?._id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNewComment("");
        await fetchComments();
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment. Please try again.");
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/courses/${courseId}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchComments();
      }
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/courses/${courseId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchComments();
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment.");
    }
  };

  const handleAddReply = async (commentId, text) => {
    try {
      const token = localStorage.getItem("token");
      console.log('Adding reply to comment:', commentId, 'Text:', text);
      
      const response = await axios.post(
        `http://localhost:5000/api/courses/${courseId}/comments/${commentId}/replies`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Reply response:', response.data);

      if (response.data.success) {
        setReplyingTo(null);
        await fetchComments();
      } else {
        setError("Failed to add reply: " + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error("Error adding reply:", err.response?.data || err);
      setError("Failed to add reply. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  const ReplyForm = ({ commentId, onSubmit, onCancel }) => {
    const [localReplyText, setLocalReplyText] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();
      if (localReplyText.trim()) {
        onSubmit(commentId, localReplyText);
        setLocalReplyText("");
      }
    };

    return (
      <div className="mt-2 p-2 bg-light rounded">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Write a reply..."
              value={localReplyText}
              onChange={(e) => setLocalReplyText(e.target.value)}
              required
              style={{ fontSize: '0.9rem' }}
              autoFocus
            />
          </Form.Group>
          <div className="d-flex gap-2">
            <Button type="submit" variant="primary" size="sm" className="px-3">
              Reply
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setLocalReplyText("");
                onCancel();
              }}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    );
  };


  const CommentItem = ({ comment, depth = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const isOwner = user && comment.user?._id === user.id;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isLiked = user && comment.likes?.includes(user.id);

  const maxDepth = 2;
  const shouldIndent = depth > 0 && depth <= maxDepth;

  return (
    <div className={`comment-item ${shouldIndent ? 'ms-3' : ''}`} style={{ marginBottom: '0.75rem' }}>
      <div className="d-flex align-items-start">
        <img
          src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'User')}&background=007bff&color=fff`}
          alt={comment.user?.name}
          className="rounded-circle me-2 flex-shrink-0"
          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
        />
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                {comment.user?.name || 'Anonymous'}
              </span>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                {formatDate(comment.createdAt)}
              </span>
              {/* COLLAPSE BUTTON */}
              {hasReplies && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="btn btn-sm p-0 border-0 text-primary"
                  style={{ fontSize: '0.75rem' }}
                >
                  <i className={`bi bi-chevron-${isCollapsed ? 'down' : 'up'}`}></i>
                  <span className="ms-1">{comment.replies.length}</span>
                </button>
              )}
            </div>
            
            <div className="d-flex align-items-center gap-1">
              <button
                onClick={() => handleLikeComment(comment._id)}
                className={`btn btn-sm p-0 border-0 ${isLiked ? 'text-primary' : 'text-muted'}`}
                style={{ fontSize: '0.8rem' }}
                disabled={!user}
              >
                <i className="bi bi-hand-thumbs-up me-1"></i>
                <span>{comment.likes?.length || 0}</span>
              </button>
              
              {depth < maxDepth && user && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  className="btn btn-sm p-0 border-0 text-muted"
                  style={{ fontSize: '0.8rem' }}
                >
                  <i className="bi bi-reply"></i>
                </button>
              )}
              
              {isOwner && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="btn btn-sm p-0 border-0 text-danger"
                  style={{ fontSize: '0.8rem' }}
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          </div>
          
          <p className="mb-1" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
            {comment.text}
          </p>
          
          {replyingTo === comment._id && depth < maxDepth && user && (
            <ReplyForm
              commentId={comment._id}
              onSubmit={handleAddReply}
              onCancel={() => setReplyingTo(null)}
            />
          )}

          {/* COLLAPSIBLE REPLIES */}
          {hasReplies && depth < maxDepth && !isCollapsed && (
            <div className="replies-container mt-2">
              {comment.replies.map((reply) => (
                <CommentItem 
                  key={reply._id} 
                  comment={reply} 
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="d-flex flex-column h-100">
      {/* Header */}
      <Card.Header className="bg-white border-bottom py-3">
        <h6 className="mb-0 fw-bold d-flex align-items-center">
          <i className="bi bi-chat-dots me-2 text-primary"></i>
          Discussion
          <Badge bg="primary" className="ms-2" style={{ fontSize: '0.7rem' }}>
            {comments.length}
          </Badge>
        </h6>
      </Card.Header>

      {/* Comments List */}
      <div className="flex-grow-1" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Card.Body className="p-3 bg-light">
          {error && (
            <Alert variant="danger" className="mb-3 py-2" style={{ fontSize: '0.8rem' }}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <Button 
                variant="link" 
                className="p-0 ms-2" 
                onClick={() => setError("")}
                style={{ fontSize: '0.8rem' }}
              >
                Dismiss
              </Button>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" size="sm" />
              <p className="mt-2 text-muted small">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="comments-list">
              {comments.map((comment) => (
                <CommentItem key={comment._id} comment={comment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-chat-quote fs-1 mb-3 opacity-50"></i>
              <h6 className="small">No comments yet</h6>
              <p className="small mb-0">Be the first to start the discussion!</p>
            </div>
          )}
        </Card.Body>
      </div>

      {/* Comment Form */}
      {user && (
        <div className="border-top bg-white">
          <Card.Body className="p-2">
            <Form onSubmit={handleAddComment} className="mb-0">
              <Form.Group className="mb-2">
                <Form.Control
                  as="textarea"
                  rows={1}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                  style={{ 
                    fontSize: '0.85rem', 
                    resize: 'none',
                    minHeight: '40px',
                    maxHeight: '80px'
                  }}
                  className="border-0 bg-light"
                />
              </Form.Group>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                  {currentLesson ? `${currentLesson.title}` : 'Course discussion'}
                </small>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={!newComment.trim()}
                  className="d-flex align-items-center gap-1 px-2 py-1"
                  size="sm"
                  style={{ fontSize: '0.8rem' }}
                >
                  <i className="bi bi-send-fill"></i>
                </Button>
              </div>
            </Form>
          </Card.Body>
        </div>
      )}
    </div>
  );
};

export default CourseComments;