import { useState } from 'react';
import { courseAPI } from '../lib/api';

export default function CourseForm({ onCourseCreated, onCancel, editCourse }) {
  const [formData, setFormData] = useState({
    title: editCourse?.title || '',
    description: editCourse?.description || '',
    price: editCourse?.price || '',
    category: editCourse?.category || 'web-development',
    level: editCourse?.level || 'beginner',
    image: editCourse?.image || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editCourse) {
        await courseAPI.update(editCourse._id, formData);
      } else {
        await courseAPI.create(formData);
      }
      
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'web-development',
        level: 'beginner',
        image: ''
      });
      
      if (onCourseCreated) {
        onCourseCreated();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'web-development', label: 'Web Development' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'music', label: 'Music' },
    { value: 'photography', label: 'Photography' },
    { value: 'health', label: 'Health & Fitness' },
    { value: 'language', label: 'Language' }
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h5 className="card-title mb-4">
          {editCourse ? 'Edit Course' : 'Create New Course'}
        </h5>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="title" className="form-label">Course Title *</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter course title"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="price" className="form-label">Price ($) *</label>
              <input
                type="number"
                className="form-control"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description *</label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe what students will learn in this course"
            ></textarea>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="category" className="form-label">Category *</label>
              <select
                className="form-select"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="level" className="form-label">Difficulty Level *</label>
              <select
                className="form-select"
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="image" className="form-label">Course Image URL</label>
            <input
              type="url"
              className="form-control"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editCourse ? 'Update Course' : 'Create Course')}
            </button>
            {onCancel && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}