// pages/LessonPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import YouTubePlayer from '../components/YouTubePlayer';
import EnhancedQuiz from '../components/EnhancedQuiz';
import './LessonPage.css';

const LessonPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  const fetchLessonData = async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`);
      const data = await response.json();
      setLesson(data.lesson);
      setQuiz(data.quiz);
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoEnd = () => {
    setShowQuiz(true);
  };

  const handleQuizSubmit = async (answers, timeSpent) => {
    const response = await fetch(`/api/quizzes/${quiz._id}/attempt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers,
        timeSpent
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit quiz');
    }
    
    return await response.json();
  };

  if (loading) {
    return <div className="loading">Loading lesson...</div>;
  }

  if (!lesson) {
    return <div className="error">Lesson not found</div>;
  }

  return (
    <div className="lesson-page">
      <div className="lesson-header">
        <h1>{lesson.title}</h1>
        <p>{lesson.description}</p>
      </div>

      <div className="lesson-content">
        <div className="video-section">
          {lesson.videoType === 'youtube' ? (
            <YouTubePlayer
              videoId={lesson.videoId}
              onVideoEnd={handleVideoEnd}
            />
          ) : (
            <div className="video-placeholder">
              <p>Uploaded video player would go here</p>
            </div>
          )}
        </div>

        {showQuiz && quiz && (
          <div className="quiz-section">
            <h2>Quiz: Test Your Knowledge</h2>
            <EnhancedQuiz
              quiz={quiz}
              onSubmit={handleQuizSubmit}
            />
          </div>
        )}

        {!showQuiz && quiz && (
          <div className="quiz-prompt">
            <p>Complete the video to unlock the quiz</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPage;