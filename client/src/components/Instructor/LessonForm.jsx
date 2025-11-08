import { Form, Row, Col, InputGroup } from 'react-bootstrap';

export const LessonForm = ({ lesson, onUpdate }) => {
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  const extractYouTubeId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const handleYouTubeUrlChange = (url) => {
    const videoId = extractYouTubeId(url);
    handleChange('videoId', videoId);
  };

  return (
    <div className="lesson-form">
      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Lesson Title *</Form.Label>
            <Form.Control
              type="text"
              value={lesson.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter lesson title"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={lesson.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what students will learn in this lesson"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Video Type</Form.Label>
            <Form.Select
              value={lesson.videoType}
              onChange={(e) => handleChange('videoType', e.target.value)}
            >
              <option value="youtube">YouTube</option>
              <option value="upload">Upload (Coming Soon)</option>
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Duration (minutes) *</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={lesson.duration}
              onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
              placeholder="Lesson duration in minutes"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      {lesson.videoType === 'youtube' && (
        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>YouTube URL *</Form.Label>
              <InputGroup>
                <Form.Control
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                />
                <InputGroup.Text>
                  <i className="bi bi-youtube text-danger"></i>
                </InputGroup.Text>
              </InputGroup>
              <Form.Text className="text-muted">
                {lesson.videoId ? `✅ Video ID: ${lesson.videoId}` : 'Enter a valid YouTube URL'}
              </Form.Text>
            </Form.Group>

            {lesson.videoId && (
              <div className="youtube-preview mb-3">
                <div className="ratio ratio-16x9">
                  <iframe
                    src={`https://www.youtube.com/embed/${lesson.videoId}`}
                    title="YouTube video preview"
                    allowFullScreen
                    style={{ border: '1px solid #dee2e6', borderRadius: '0.375rem' }}
                  ></iframe>
                </div>
                <Form.Text className="text-muted">
                  Preview of your YouTube video
                </Form.Text>
              </div>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};