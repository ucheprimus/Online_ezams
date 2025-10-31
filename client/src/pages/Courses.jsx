import { useState, useEffect } from 'react';
import { courseAPI } from '../lib/api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    level: '',
    search: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    return (
      (filter.category === '' || course.category === filter.category) &&
      (filter.level === '' || course.level === filter.level) &&
      (filter.search === '' || 
        course.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        course.description.toLowerCase().includes(filter.search.toLowerCase()))
    );
  });

  const categories = [...new Set(courses.map(course => course.category))];
  const levels = [...new Set(courses.map(course => course.level))];

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Browse Courses</h1>
          
          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search courses..."
                    value={filter.search}
                    onChange={(e) => setFilter({...filter, search: e.target.value})}
                  />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filter.category}
                    onChange={(e) => setFilter({...filter, category: e.target.value})}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filter.level}
                    onChange={(e) => setFilter({...filter, level: e.target.value})}
                  >
                    <option value="">All Levels</option>
                    {levels.map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-5">
              <h5>No courses found</h5>
              <p className="text-muted">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredCourses.map(course => (
                <div key={course._id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                    {course.image && (
                      <img 
                        src={course.image} 
                        className="card-img-top" 
                        alt={course.title}
                        style={{ 
                          height: '200px', 
                          objectFit: 'cover',
                          borderTopLeftRadius: '15px',
                          borderTopRightRadius: '15px'
                        }}
                      />
                    )}
                    <div className="card-body d-flex flex-column">
                      <div className="mb-2">
                        <span className="badge bg-primary me-2">{course.level}</span>
                        <span className="badge bg-secondary">{course.category}</span>
                      </div>
                      <h5 className="card-title">{course.title}</h5>
                      <p className="card-text text-muted flex-grow-1">
                        {course.description.length > 100 
                          ? `${course.description.substring(0, 100)}...` 
                          : course.description
                        }
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <div>
                          <h6 className="text-primary mb-0">${course.price}</h6>
                          <small className="text-muted">By {course.instructor.name}</small>
                        </div>
                        <button className="btn btn-primary">Enroll Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}