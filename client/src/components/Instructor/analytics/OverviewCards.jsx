// client/src/components/Instructor/analytics/OverviewCards.jsx
import { Card, Row, Col, Badge, ProgressBar } from 'react-bootstrap';

const OverviewCards = ({ data }) => {
  const {
    totalStudents = 0,
    totalCourses = 0,
    totalRevenue = 0,
    averageRating = 0,
    completionRate = 0,
    activeStudents = 0
  } = data;

  const cards = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: '👥',
      color: 'primary',
      change: '+12%',
      description: 'Students enrolled'
    },
    {
      title: 'Active Students',
      value: activeStudents,
      icon: '📈',
      color: 'success', 
      change: '+5%',
      description: 'Currently learning'
    },
    {
      title: 'Course Completion',
      value: `${completionRate}%`,
      icon: '✅',
      color: 'info',
      change: '+8%',
      description: 'Average completion rate'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue}`,
      icon: '💰',
      color: 'warning',
      change: '+15%',
      description: 'All time revenue'
    },
    {
      title: 'Average Rating',
      value: averageRating.toFixed(1),
      icon: '⭐',
      color: 'secondary',
      change: '+0.2',
      description: 'Out of 5.0'
    },
    {
      title: 'Total Courses',
      value: totalCourses,
      icon: '📚',
      color: 'dark',
      change: '+2',
      description: 'Published courses'
    }
  ];

  return (
    <Row className="g-3 mb-4">
      {cards.map((card, index) => (
        <Col key={index} xl={4} lg={6} md={6}>
          <Card className="h-100 border-0 shadow-sm overview-card">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="card-title text-muted mb-1">{card.title}</h6>
                  <h2 className="fw-bold text-dark mb-0">{card.value}</h2>
                  <small className="text-muted">{card.description}</small>
                </div>
                <div className="text-end">
                  <div className={`icon-circle bg-${card.color} bg-opacity-10`}>
                    <span className={`text-${card.color}`} style={{ fontSize: '1.5rem' }}>
                      {card.icon}
                    </span>
                  </div>
                  <Badge bg={card.color} className="mt-2">
                    {card.change}
                  </Badge>
                </div>
              </div>
              
              {/* Progress bar for completion rate card */}
              {card.title === 'Course Completion' && completionRate > 0 && (
                <ProgressBar 
                  now={completionRate} 
                  variant="info"
                  className="mt-2"
                  style={{ height: '6px' }}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      ))}

      <style>{`
        .overview-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border-radius: 12px;
        }
        .overview-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }
        .icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bg-primary.bg-opacity-10 { background-color: rgba(13, 110, 253, 0.1) !important; }
        .bg-success.bg-opacity-10 { background-color: rgba(25, 135, 84, 0.1) !important; }
        .bg-info.bg-opacity-10 { background-color: rgba(13, 202, 240, 0.1) !important; }
        .bg-warning.bg-opacity-10 { background-color: rgba(255, 193, 7, 0.1) !important; }
        .bg-secondary.bg-opacity-10 { background-color: rgba(108, 117, 125, 0.1) !important; }
        .bg-dark.bg-opacity-10 { background-color: rgba(33, 37, 41, 0.1) !important; }
      `}</style>
    </Row>
  );
};

export default OverviewCards;