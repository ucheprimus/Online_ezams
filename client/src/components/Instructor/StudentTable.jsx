// client/src/components/Instructor/StudentTable.jsx
import React from 'react';
import { Table, Badge } from 'react-bootstrap';

const StudentTable = ({ students, onStudentClick }) => {
  if (!students || students.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No students found.</p>
      </div>
    );
  }

  return (
    <Table responsive hover className="mb-0">
      <thead className="bg-light">
        <tr>
          <th>Student</th>
          <th>Course</th>
          <th>Enrolled Date</th>
          <th>Progress</th>
          <th>Last Activity</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id} onClick={() => onStudentClick && onStudentClick(student)} style={{ cursor: onStudentClick ? 'pointer' : 'default' }}>
            <td>
              <div className="d-flex align-items-center">
                <div className="avatar-sm bg-primary rounded-circle me-3 d-flex align-items-center justify-content-center text-white fw-bold">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <div className="fw-semibold">{student.name}</div>
                  <small className="text-muted">{student.email}</small>
                </div>
              </div>
            </td>
            <td>
              <span className="fw-medium">{student.courseName}</span>
            </td>
            <td>{student.enrolledDate}</td>
            <td>
              <div className="d-flex align-items-center">
                <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>
                <small className="text-muted">{student.progress}%</small>
              </div>
            </td>
            <td>
              <small className={student.lastActivity === 'Today' ? 'text-success fw-medium' : 'text-muted'}>
                {student.lastActivity}
              </small>
            </td>
            <td>
              <Badge 
                bg={
                  student.progress === 100 ? 'success' :
                  student.progress >= 50 ? 'primary' :
                  student.progress > 0 ? 'warning' : 'secondary'
                }
              >
                {student.progress === 100 ? 'Completed' :
                 student.progress >= 50 ? 'In Progress' :
                 student.progress > 0 ? 'Started' : 'Not Started'}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default StudentTable;