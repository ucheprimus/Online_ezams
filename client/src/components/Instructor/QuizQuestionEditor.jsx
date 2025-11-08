import { Form, Row, Col, Button, Badge } from 'react-bootstrap';

const QuizQuestionEditor = ({ question, index, onChange, onDelete }) => {
  // Debug log to see what's happening
  console.log(`🔍 Question ${index} debug:`, {
    correctAnswer: question.correctAnswer,
    type: typeof question.correctAnswer,
    options: question.options
  });

  return (
    <div className="question-editor">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">
          Question {index + 1}
        </h6>
        <Button variant="outline-danger" size="sm" onClick={onDelete}>
          <i className="bi bi-trash"></i> Delete
        </Button>
      </div>

      <Form.Group className="mb-3">
        <Form.Label>Question Text *</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={question.question}
          onChange={(e) => onChange(index, 'question', e.target.value)}
          placeholder="Enter your question..."
        />
      </Form.Group>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Points</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={question.points}
              onChange={(e) => onChange(index, 'points', parseInt(e.target.value))}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Question Type</Form.Label>
            <Form.Select
              value={question.type}
              onChange={(e) => {
                const newType = e.target.value;
                const baseQuestion = {
                  type: newType,
                  question: question.question,
                  points: question.points,
                  explanation: question.explanation,
                  correctAnswer: '',
                  options: newType === 'multiple_choice' ? ['', '', '', ''] : [],
                  expectedKeywords: newType === 'theory' ? [] : undefined,
                  minWords: newType === 'theory' ? 50 : undefined,
                  caseSensitive: false
                };
                onChange(index, '', baseQuestion); // Replace entire question
              }}
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="theory">Theory/Text Answer</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {question.type === 'multiple_choice' && (
        <>
          <Form.Label>Options *</Form.Label>
          {question.options.map((option, optIndex) => (
            <Form.Group key={optIndex} className="mb-2">
              <div className="d-flex align-items-center">
                <Form.Check
                  type="radio"
                  name={`correct-${index}`}
                  checked={question.correctAnswer === optIndex.toString()}
                  onChange={() => onChange(index, 'correctAnswer', optIndex.toString())}
                  className="me-2"
                />
                <Form.Control
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options];
                    newOptions[optIndex] = e.target.value;
                    onChange(index, 'options', newOptions);
                  }}
                  placeholder={`Option ${optIndex + 1}`}
                />
              </div>
            </Form.Group>
          ))}
          
          {/* Show current correct answer for debugging */}
          <div className="mt-2 p-2 bg-light rounded">
            <small className="text-muted">
              <strong>Debug:</strong> Current correct answer: <code>{question.correctAnswer}</code> | 
              Type: <code>{typeof question.correctAnswer}</code>
            </small>
          </div>
        </>
      )}

      {question.type === 'theory' && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Expected Answer (for reference)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={question.correctAnswer}
              onChange={(e) => onChange(index, 'correctAnswer', e.target.value)}
              placeholder="Enter the expected answer for reference..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Keywords for Auto-grading (comma separated)</Form.Label>
            <Form.Control
              type="text"
              value={question.expectedKeywords?.join(', ') || ''}
              onChange={(e) => onChange(index, 'expectedKeywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
              placeholder="concept, term, keyword"
            />
            <Form.Text className="text-muted">
              Student answers containing these keywords will be graded automatically
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Minimum Word Count</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={question.minWords || 0}
              onChange={(e) => onChange(index, 'minWords', parseInt(e.target.value))}
            />
          </Form.Group>

          <Form.Check
            type="checkbox"
            label="Case Sensitive"
            checked={question.caseSensitive}
            onChange={(e) => onChange(index, 'caseSensitive', e.target.checked)}
            className="mb-3"
          />
        </>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Explanation (shown after quiz)</Form.Label>
        <Form.Control
          type="text"
          value={question.explanation}
          onChange={(e) => onChange(index, 'explanation', e.target.value)}
          placeholder="Why this answer is correct..."
        />
      </Form.Group>
    </div>
  );
};

export default QuizQuestionEditor;