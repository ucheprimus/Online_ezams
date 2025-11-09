// client/src/components/instructor/analytics/EnrollmentTrends.jsx
import { Card, Row, Col } from 'react-bootstrap';

const EnrollmentTrends = ({ data }) => {
  const { trends = [] } = data;

  // Simple bar chart component since we don't have Chart.js installed yet
  const BarChart = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.enrollments), 1);
    
    return (
      <div className="bar-chart mt-3">
        {data.map((item, index) => (
          <div key={index} className="d-flex align-items-center mb-3">
            <div className="me-3" style={{ width: '80px' }}>
              <small className="text-muted">
                {new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              </small>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between mb-1">
                <span className="fw-medium">{item.enrollments} enrollments</span>
                <span className="text-muted">
                  {Math.round((item.enrollments / maxValue) * 100)}%
                </span>
              </div>
              <div 
                className="progress" 
                style={{ height: '8px', backgroundColor: '#e9ecef' }}
              >
                <div
                  className="progress-bar bg-primary"
                  style={{ 
                    width: `${(item.enrollments / maxValue) * 100}%`,
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Row>
      <Col lg={8}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Header className="bg-white border-0">
            <h5 className="mb-0">
              <i className="bi bi-graph-up me-2 text-primary"></i>
              Enrollment Trends
            </h5>
            <p className="text-muted mb-0 small">
              Student enrollment over the last 6 months
            </p>
          </Card.Header>
          <Card.Body>
            {trends.length > 0 ? (
              <BarChart data={trends} />
            ) : (
              <div className="text-center py-4">
                <div className="text-muted mb-2">
                  <i className="bi bi-graph-up" style={{ fontSize: '3rem' }}></i>
                </div>
                <p className="text-muted">No enrollment data available yet</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
      
      <Col lg={4}>
        <Row className="g-3">
          <Col md={6} lg={12}>
            <Card className="border-0 shadow-sm bg-primary text-white">
              <Card.Body className="text-center py-4">
                <div className="display-6 fw-bold">
                  {trends.reduce((sum, item) => sum + item.enrollments, 0)}
                </div>
                <p className="mb-0 opacity-75">Total Enrollments</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={12}>
            <Card className="border-0 shadow-sm bg-success text-white">
              <Card.Body className="text-center py-4">
                <div className="display-6 fw-bold">
                  {trends.length > 0 ? Math.round(
                    trends.reduce((sum, item) => sum + item.enrollments, 0) / trends.length
                  ) : 0}
                </div>
                <p className="mb-0 opacity-75">Monthly Average</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={12}>
            <Card className="border-0 shadow-sm bg-info text-white">
              <Card.Body className="text-center py-4">
                <div className="display-6 fw-bold">
                  {trends.length > 0 ? 
                    Math.max(...trends.map(item => item.enrollments)) : 0
                  }
                </div>
                <p className="mb-0 opacity-75">Peak Month</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Col>

      <style>{`
        .bar-chart .progress-bar {
          border-radius: 4px;
        }
        .card.bg-primary, .card.bg-success, .card.bg-info {
          border-radius: 12px;
          transition: transform 0.2s ease;
        }
        .card.bg-primary:hover, .card.bg-success:hover, .card.bg-info:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </Row>
  );
};

export default EnrollmentTrends;