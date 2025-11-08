import { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';

export const QuizBuilder = ({ lessonId, onSave }) => {
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);

  return (
    <Card className="border-0 bg-light">
      <Card.Body>
        <div className="text-center">
          <i className="bi bi-patch-question display-6 text-muted mb-3"></i>
          <h6>Add Quiz to This Lesson</h6>
          <p className="text-muted small mb-3">
            Create a quiz to test students' understanding
          </p>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => setShowQuizBuilder(true)}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Create Quiz
          </Button>
        </div>

        {showQuizBuilder && (
          <Alert variant="info" className="mt-3">
            <i className="bi bi-info-circle me-2"></i>
            Quiz builder coming soon! For now, you can add lessons with YouTube videos.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};