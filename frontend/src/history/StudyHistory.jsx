import React, { useState, useEffect } from 'react';

function History() {
  const [sessions, setSessions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch topics and sessions on mount
  useEffect(() => {
    fetchData();
  }, [selectedTopicFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch topics
      const topicsRes = await fetch('http://localhost:8000/topics/');
      const topicsData = await topicsRes.json();
      setTopics(topicsData);

      // Fetch sessions (with optional filter)
      let url = 'http://localhost:8000/sessions/';
      if (selectedTopicFilter) {
        url += `?topic_id=${selectedTopicFilter}`;
      }
      
      const sessionsRes = await fetch(url);
      const sessionsData = await sessionsRes.json();
      
      // Sort by most recent first
      const sortedSessions = sessionsData.sort((a, b) => 
        new Date(b.start_time) - new Date(a.start_time)
      );
      
      setSessions(sortedSessions);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTopicName = (topicId) => {
    const topic = topics.find(t => t.id === topicId);
    return topic ? topic.title : 'Unknown';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete session');

      // Refresh the list
      fetchData();
      alert('Session deleted successfully');
    } catch (err) {
      console.error('Error deleting session:', err);
      alert('Failed to delete session');
    }
  };

  const getTotalMinutes = () => {
    return sessions.reduce((total, session) => total + session.duration_minutes, 0);
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  return (
    <div className="history-container">
      <h2>Study History</h2>

      {/* Filter Section */}
      <div className="history-filter">
        <label htmlFor="filter-topic">Filter by Subject:</label>
        <select 
          id="filter-topic"
          value={selectedTopicFilter} 
          onChange={(e) => setSelectedTopicFilter(e.target.value)}
        >
          <option value="">All Subjects</option>
          {topics.map(topic => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="history-summary">
        <p><strong>Total Sessions:</strong> {sessions.length}</p>
        <p><strong>Total Time:</strong> {getTotalMinutes()} minutes ({Math.floor(getTotalMinutes() / 60)}h {getTotalMinutes() % 60}m)</p>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="no-sessions">
          <p>No study sessions yet. Start a timer to create your first session!</p>
        </div>
      ) : (
        <div className="sessions-list">
          {sessions.map(session => (
            <div key={session.id} className="session-card">
              <div className="session-header">
                <h3>{getTopicName(session.topic_id)}</h3>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(session.id)}
                >
                  ✕
                </button>
              </div>
              <div className="session-details">
                <p><strong>Duration:</strong> {session.duration_minutes} minutes</p>
                <p><strong>Started:</strong> {formatDate(session.start_time)}</p>
                {session.end_time && (
                  <p><strong>Ended:</strong> {formatDate(session.end_time)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;