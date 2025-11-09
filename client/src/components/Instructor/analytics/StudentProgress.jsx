// client/src/components/instructor/analytics/StudentProgress.jsx
import { Card, Row, Col, Table, Badge, ProgressBar, Alert } from 'react-bootstrap';

const StudentProgress = ({ data }) => {
  const { progressStats = [], completionRanges = {}, averageCompletion, totalStudents } = data;

  const getCompletionVariant = (percentage) => {
    if (percentage >= 75) return 'success';
    if (percentage >= 50) return 'warning';
    if (percentage >= 25) return 'info';
    return 'danger';
  };

  const getActivityStatus = (lastActivity) => {
    const lastActive = new Date(lastActivity);
    const now = new Date();
    const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return { text: 'Today', variant: 'success' };
    if (daysDiff === 1) return { text: 'Yesterday', variant: 'success' };
    if (daysDiff <= 7) return { text: `${daysDiff}d ago`, variant: 'warning' };
    return { text: `${daysDiff}d ago`, variant: 'danger' };
  };

  return (
    <Row className="g-4">
      {/* Progress Overview */}
      <Col lg={4}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Header className="bg-white border-0">
            <h6 className="mb-0">
              <i className="bi bi-graph-up me-2 text-primary"></i>
              Progress Overview
            </h6>
          </Card.Header>
          <Card.Body>
            <div className="text-center mb-4">
              <div className="display-4 fw-bold text-primary">{totalStudents}</div>
              <p className="text-muted mb-0">Active Students</p>
            </div>
            
            <div className="text-center mb-4">
              <div className="display-4 fw-bold text-success">{averageCompletion}%</div>
              <p className="text-muted mb-0">Average Completion</p>
            </div>

            {/* Completion Distribution */}
            <div className="completion-distribution">
              <h6 className="mb-3">Completion Distribution</h6>
              {Object.entries(completionRanges).map(([range, count]) => (
                <div key={range} className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">{range}%</span>
                  <div className="d-flex align-items-center" style={{ width: '60%' }}>
                    <ProgressBar 
                      now={(count / totalStudents) * 100} 
                      variant={getCompletionVariant(parseInt(range.split('-')[1]))}
                      style={{ height: '6px', flex: 1 }}
                    />
                  </div>
                  <Badge bg="secondary" className="ms-2">{count}</Badge>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Student Progress Table */}
      <Col lg={8}>
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0">
            <h6 className="mb-0">
              <i className="bi bi-people me-2 text-primary"></i>
              Student Progress
            </h6>
          </Card.Header>
          <Card.Body>
            {progressStats.length > 0 ? (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Completion</th>
                      <th>Progress</th>
                      <th>Last Activity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressStats.map((student, index) => {
                      const activity = getActivityStatus(student.lastActivity);
                      return (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="student-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                   style={{ width: '32px', height: '32px', fontSize: '0.875rem' }}>
                                {student.studentName?.charAt(0)?.toUpperCase() || 'S'}
                              </div>
                              <span className="fw-medium">{student.studentName}</span>
                            </div>
                          </td>
                          <td>
                            <Badge bg={getCompletionVariant(student.completionRate)}>
                              {student.completionRate}%
                            </Badge>
                          </td>
                          <td style={{ width: '120px' }}>
                            <ProgressBar 
                              now={student.completionRate} 
                              variant={getCompletionVariant(student.completionRate)}
                              style={{ height: '6px' }}
                            />
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(student.lastActivity).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <Badge bg={activity.variant}>
                              {activity.text}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            ) : (
              <Alert variant="info" className="text-center mb-0">
                <i className="bi bi-info-circle me-2"></i>
                No student progress data available yet.
              </Alert>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Progress Insights */}
      <Col lg={12}>
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0">
            <h6 className="mb-0">
              <i className="bi bi-lightbulb me-2 text-warning"></i>
              Progress Insights
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="text-center p-3">
                  <div className={`icon-circle bg-${completionRanges['76-100'] > 0 ? 'success' : 'secondary'} bg-opacity-10 mx-auto mb-3`}>
                    <i className={`bi bi-trophy-fill text-${completionRanges['76-100'] > 0 ? 'success' : 'secondary'}`} style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <h5 className="fw-bold">{completionRanges['76-100'] || 0}</h5>
                  <p className="text-muted mb-0">High Achievers<br />(76-100%)</p>
                </div>
              </Col>
              
              <Col md={4}>
                <div className="text-center p-3">
                  <div className={`icon-circle bg-${completionRanges['51-75'] > 0 ? 'warning' : 'secondary'} bg-opacity-10 mx-auto mb-3`}>
                    <i className={`bi bi-graph-up text-${completionRanges['51-75'] > 0 ? 'warning' : 'secondary'}`} style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <h5 className="fw-bold">{completionRanges['51-75'] || 0}</h5>
                  <p className="text-muted mb-0">Making Progress<br />(51-75%)</p>
                </div>
              </Col>
              
              <Col md={4}>
                <div className="text-center p-3">
                  <div className={`icon-circle bg-${completionRanges['0-25'] > 0 ? 'danger' : 'secondary'} bg-opacity-10 mx-auto mb-3`}>
                    <i className={`bi bi-exclamation-triangle text-${completionRanges['0-25'] > 0 ? 'danger' : 'secondary'}`} style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <h5 className="fw-bold">{completionRanges['0-25'] || 0}</h5>
                  <p className="text-muted mb-0">Needs Attention<br />(0-25%)</p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>

      <style>{`
        .student-avatar {
          font-weight: 600;
        }
        .completion-distribution .progress {
          background-color: #e9ecef;
        }
        .icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </Row>
  );
};

export default StudentProgress;