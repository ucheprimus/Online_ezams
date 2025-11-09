// client/src/components/Instructor/VideoUpload.jsx
import { useState } from 'react';
import { Form, Button, ProgressBar, Alert, Card } from 'react-bootstrap';
import axios from 'axios';

const VideoUpload = ({ 
  sectionId, 
  lessonId, 
  courseId, 
  currentVideo = null,
  onVideoUploaded,
  onVideoDeleted 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleVideoUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("video", file);
      formData.append("lessonId", lessonId);
      formData.append("courseId", courseId);

      const response = await axios.post(
        "http://localhost:5000/api/upload/video",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
          timeout: 300000, // 5 minutes timeout
        }
      );

      if (response.data.success) {
        onVideoUploaded(response.data.video);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      setError(
        "Failed to upload video: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "video/mp4", 
      "video/mov", 
      "video/avi", 
      "video/mkv", 
      "video/webm",
      "video/quicktime"
    ];
    
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid video file (MP4, MOV, AVI, MKV, or WebM)");
      return;
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 100MB");
      return;
    }

    handleVideoUpload(file);
    event.target.value = ''; // Reset file input
  };

  const handleDeleteVideo = async () => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/upload/video/${currentVideo._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onVideoDeleted();
    } catch (error) {
      console.error("Error deleting video:", error);
      setError("Failed to delete video: " + error.message);
    }
  };

  if (currentVideo) {
    return (
      <Card className="border-0 bg-light">
        <Card.Body className="p-3">
          {error && (
            <Alert variant="danger" className="py-2" style={{ fontSize: '0.8rem' }}>
              {error}
            </Alert>
          )}
          
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center">
              <i className="bi bi-file-earmark-play-fill text-primary me-2 fs-5"></i>
              <div>
                <div className="fw-semibold">{currentVideo.originalName}</div>
                <small className="text-muted">
                  Size: {Math.round(currentVideo.size / 1024 / 1024)}MB
                </small>
              </div>
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleDeleteVideo}
              disabled={uploading}
            >
              <i className="bi bi-trash"></i>
            </Button>
          </div>
          
          <div className="mt-2">
            <video
              controls
              style={{ 
                maxWidth: "100%", 
                maxHeight: "200px",
                borderRadius: "0.375rem"
              }}
              src={currentVideo.url}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Replace video option */}
          <div className="mt-3">
            <Form.Label className="small text-muted mb-2">
              Replace video:
            </Form.Label>
            <Form.Control
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={uploading}
              size="sm"
            />
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      {error && (
        <Alert variant="danger" className="py-2" style={{ fontSize: '0.8rem' }}>
          {error}
        </Alert>
      )}
      
      <Form.Group>
        <Form.Label>Upload Video File</Form.Label>
        <Form.Control
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Form.Text className="text-muted">
          Supported formats: MP4, MOV, AVI, MKV, WebM (Max 100MB)
        </Form.Text>
      </Form.Group>

      {uploading && (
        <div className="mt-2">
          <ProgressBar
            now={uploadProgress}
            label={`${uploadProgress}%`}
            animated
            variant="primary"
          />
          <small className="text-muted d-block mt-1">
            Uploading... {uploadProgress}% - Please don't close this page
          </small>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;