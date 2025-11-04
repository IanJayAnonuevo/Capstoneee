import React, { useEffect, useState } from 'react';
import { buildApiUrl } from '../../config/api';

function MyAssignments({ userId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetch(buildApiUrl(`get_my_assignments.php?user_id=${userId}&role=driver`))
      .then(res => res.json())
      .then(data => {
        if (data.success) setAssignments(data.assignments);
        setLoading(false);
      });
  }, [userId]);

  const respond = (assignment_id, response_status) => {
  fetch(buildApiUrl('respond_assignment.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignment_id, user_id: userId, response_status, role: 'driver' }),
    })
      .then(res => res.json())
      .then(() => {
        setAssignments(assignments.filter(a => a.assignment_id !== assignment_id));
      });
  };

  if (loading) return <div>Loading assignments...</div>;

  return (
    <div>
      <h2>My Assignments</h2>
      {assignments.length === 0 ? (
        <div>No pending assignments.</div>
      ) : (
        <ul>
          {assignments.map(a => (
            <li key={a.assignment_id}>
              Task for cluster {a.cluster_id} on {a.date} at {a.time}
              <button onClick={() => respond(a.assignment_id, 'confirmed')}>Confirm</button>
              <button onClick={() => respond(a.assignment_id, 'declined')}>Decline</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyAssignments; 
