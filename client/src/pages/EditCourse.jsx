// client/src/pages/EditCourse.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Image,
} from "react-bootstrap";
import axios from "axios";

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInstructor } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadMethod, setUploadMethod] = useState("url"); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    level: "beginner",
    thumbnail: "",
    isPublished: false,
  });

  // Default thumbnails for fallback
  const defaultThumbnails = {
    'web-dev': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop',
    'data-science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
    'mobile-dev': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=225&fit=crop',
    'design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop',
    'business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
    'marketing': 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=225&fit=crop',
    'music': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=225&fit=crop',
    'photography': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=225&fit=crop',
    'default': 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=400&h=225&fit=crop'
  };

  const categories = [
    { value: "web-dev", label: "Web Development" },
    { value: "data-science", label: "Data Science" },
    { value: "mobile-dev", label: "Mobile Development" },
    { value: "design", label: "Design" },
    { value: "business", label: "Business" },
    { value: "marketing", label: "Marketing" },
    { value: "music", label: "Music" },
    { value: "photography", label: "Photography" },
  ];

  const levels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  useEffect(() => {
    if (!isInstructor) {
      navigate("/dashboard/my-courses");
      return;
    }
    fetchCourse();
  }, [id, isInstructor, navigate]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching course for editing with ID:", id);
      
      // Use the instructor-specific route
      const response = await axios.get(
        `http://localhost:5000/api/courses/instructor/course/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Course fetched successfully for editing:", response.data);
      
      const courseData = response.data;
      setFormData({
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        category: courseData.category,
        level: courseData.level,
        thumbnail: courseData.thumbnail || "",
        isPublished: courseData.isPublished,
      });

      // Set image preview based on existing thumbnail
      if (courseData.thumbnail && courseData.thumbnail.trim() !== '') {
        setImagePreview(courseData.thumbnail);
        setUploadMethod('url');
      } else if (courseData.category) {
        setImagePreview(defaultThumbnails[courseData.category] || defaultThumbnails.default);
      }
    } catch (err) {
      console.error("Full fetch error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      setError(err.response?.data?.message || "Failed to fetch course details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Update preview when thumbnail URL changes
    if (name === 'thumbnail' && value && uploadMethod === 'url') {
      setImagePreview(value);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData({
      ...formData,
      category: category,
    });

    // Update preview when category changes (if no custom image)
    if (category && !formData.thumbnail && !selectedFile) {
      setImagePreview(defaultThumbnails[category] || defaultThumbnails.default);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, GIF, etc.)');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const handleUploadMethodChange = (method) => {
    setUploadMethod(method);
    setSelectedFile(null);
    
    if (method === 'url') {
      // Reset to URL-based thumbnail
      if (formData.thumbnail) {
        setImagePreview(formData.thumbnail);
      } else if (formData.category) {
        setImagePreview(defaultThumbnails[formData.category] || defaultThumbnails.default);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

// Replace the uploadImageToServer function with this fixed version:

const uploadImageToServer = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Create an image element without using 'new'
      const img = document.createElement('img');
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 450;
        
        let { width, height } = img;
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        try {
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          console.log('Image compressed successfully, size:', compressedBase64.length);
          resolve(compressedBase64);
        } catch (compressError) {
          console.error('Compression error, using original:', compressError);
          // Fallback: use original base64 if compression fails
          resolve(e.target.result);
        }
      };
      
      img.onerror = () => {
        console.error('Failed to load image for compression, using original');
        // Fallback to original base64
        resolve(e.target.result);
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setUpdating(true);

  try {
    const token = localStorage.getItem("token");
    
    let thumbnailUrl = formData.thumbnail;

    // Handle file upload if a file is selected
    if (uploadMethod === 'file' && selectedFile) {
      try {
        console.log('Starting image upload...');
        thumbnailUrl = await uploadImageToServer(selectedFile);
        console.log('Image upload successful');
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        setError('Failed to process image. Please try another image or use URL instead.');
        setUpdating(false);
        return;
      }
    }

    // Use default thumbnail if none provided and category exists
    const finalThumbnail = thumbnailUrl || 
      (formData.category ? defaultThumbnails[formData.category] : defaultThumbnails.default);
    
    const courseData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      category: formData.category,
      level: formData.level,
      thumbnail: finalThumbnail,
      isPublished: formData.isPublished,
    };

    console.log('Updating course with data:', courseData);

    await axios.put(
      `http://localhost:5000/api/courses/${id}`,
      courseData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSuccess("Course updated successfully!");
    setTimeout(() => {
      navigate("/dashboard/my-courses");
    }, 1500);
  } catch (err) {
    console.error('Update course error details:', err);
    setError(err.response?.data?.message || "Failed to update course");
  } finally {
    setUpdating(false);
  }
};

  const removeCurrentImage = () => {
    setFormData(prev => ({ ...prev, thumbnail: '' }));
    setSelectedFile(null);
    setUploadMethod('url');
    
    if (formData.category) {
      setImagePreview(defaultThumbnails[formData.category] || defaultThumbnails.default);
    } else {
      setImagePreview(defaultThumbnails.default);
    }
  };

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'web-dev': 'Web Development',
      'data-science': 'Data Science',
      'mobile-dev': 'Mobile Development',
      'design': 'Design',
      'business': 'Business',
      'marketing': 'Marketing',
      'music': 'Music',
      'photography': 'Photography'
    };
    return categoryMap[category] || category;
  };

  if (loading) {
    return (
      <Container fluid className="create-course-container px-3 px-md-4 py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading course...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="create-course-container px-3 px-md-4 py-4">
      <Row className="justify-content-center">
        <Col xs={12} xl={10} xxl={8}>
          <div className="text-center mb-4">
            <h1 className="page-title mb-2">Edit Course</h1>
            <p className="page-subtitle">Update your course information</p>
          </div>

          <Card className="form-card border-0">
            <Card.Body className="p-4 p-lg-5">
              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-4">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col lg={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">
                        Course Title *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>

                  <Col lg={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">
                        Description *
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">Category *</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleCategoryChange}
                        required
                        className="form-control-custom"
                      >
                        <option value="">Select category...</option>
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">Level *</Form.Label>
                      <Form.Select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        required
                        className="form-control-custom"
                      >
                        {levels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col lg={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">
                        Price (USD) *
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>

                  {/* Enhanced Thumbnail Section */}
                  <Col lg={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">Course Thumbnail</Form.Label>
                      
                      {/* Current Thumbnail Preview */}
                      {imagePreview && (
                        <div className="current-thumbnail mb-4">
                          <p className="preview-label mb-2">
                            <strong>Current Thumbnail:</strong>
                          </p>
                          <div className="preview-container position-relative">
                            <Image 
                              src={imagePreview} 
                              alt="Current course thumbnail"
                              className="thumbnail-image"
                              rounded
                              style={{ 
                                width: '100%', 
                                maxWidth: '400px', 
                                height: '225px', 
                                objectFit: 'cover' 
                              }}
                              onError={(e) => {
                                e.target.src = defaultThumbnails.default;
                              }}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              className="position-absolute top-0 end-0 m-2"
                              onClick={removeCurrentImage}
                              title="Remove current image"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Upload Method Selection */}
                      <div className="upload-method-selector mb-4">
                        <p className="method-label mb-2">
                          <strong>Update Thumbnail:</strong>
                        </p>
                        <div className="method-buttons">
                          <Button
                            variant={uploadMethod === 'url' ? 'primary' : 'outline-primary'}
                            onClick={() => handleUploadMethodChange('url')}
                            className="method-btn me-2"
                          >
                            <i className="bi bi-link-45deg me-2"></i>
                            Use Image URL
                          </Button>
                          <Button
                            variant={uploadMethod === 'file' ? 'primary' : 'outline-primary'}
                            onClick={() => handleUploadMethodChange('file')}
                            className="method-btn"
                          >
                            <i className="bi bi-upload me-2"></i>
                            Upload Local File
                          </Button>
                        </div>
                      </div>

                      {/* URL Upload Method */}
                      {uploadMethod === 'url' && (
                        <div className="url-upload-section">
                          <Form.Control
                            type="url"
                            name="thumbnail"
                            value={formData.thumbnail}
                            onChange={handleChange}
                            placeholder="https://example.com/your-course-image.jpg"
                            className="form-control-custom mb-3"
                          />
                          
                          {/* Quick Thumbnail Options */}
                          <div className="quick-thumbnails">
                            <p className="quick-thumbnails-label">Quick options:</p>
                            <div className="d-flex gap-2 flex-wrap">
                              {Object.entries(defaultThumbnails).map(([key, url]) => (
                                key !== 'default' && (
                                  <Button
                                    key={key}
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, thumbnail: url }));
                                      setImagePreview(url);
                                    }}
                                    className="quick-thumbnail-btn"
                                  >
                                    {key.replace('-', ' ')}
                                  </Button>
                                )
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* File Upload Method */}
                      {uploadMethod === 'file' && (
                        <div className="file-upload-section">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="d-none"
                          />
                          <div 
                            className="file-upload-area border rounded p-4 text-center cursor-pointer"
                            onClick={triggerFileInput}
                            style={{ 
                              borderStyle: 'dashed', 
                              borderColor: '#dee2e6',
                              backgroundColor: '#f8f9fa',
                              cursor: 'pointer'
                            }}
                          >
                            <div className="upload-placeholder">
                              <i className="bi bi-cloud-upload display-4 text-muted mb-3"></i>
                              <p className="mb-2">Click to select an image</p>
                              <p className="text-muted small">Supports JPG, PNG, GIF • Max 5MB</p>
                            </div>
                          </div>
                          {selectedFile && (
                            <div className="selected-file-info mt-3">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-file-image text-success me-2"></i>
                                <span className="file-name">{selectedFile.name}</span>
                                <span className="file-size ms-2 text-muted">
                                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* New Thumbnail Preview */}
                      {(uploadMethod === 'file' && selectedFile) || (uploadMethod === 'url' && formData.thumbnail) ? (
                        <div className="new-thumbnail-preview mt-4">
                          <p className="preview-label">
                            <strong>New Thumbnail Preview:</strong>
                          </p>
                          <div className="preview-container">
                            <Image 
                              src={imagePreview} 
                              alt="New course thumbnail preview"
                              className="thumbnail-image"
                              rounded
                              style={{ 
                                width: '100%', 
                                maxWidth: '400px', 
                                height: '225px', 
                                objectFit: 'cover' 
                              }}
                              onError={(e) => {
                                e.target.src = defaultThumbnails.default;
                              }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </Form.Group>
                  </Col>

                  <Col lg={12}>
                    <Form.Group className="mb-4">
                      <Form.Check
                        type="checkbox"
                        name="isPublished"
                        label="Publish course (make it publicly visible)"
                        checked={formData.isPublished}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isPublished: e.target.checked,
                          })
                        }
                        className="form-check-custom"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-3 justify-content-end pt-4 border-top">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/dashboard/my-courses")}
                    className="action-btn cancel-btn"
                    disabled={updating}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="action-btn submit-btn"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Updating Course...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Update Course
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditCourse;