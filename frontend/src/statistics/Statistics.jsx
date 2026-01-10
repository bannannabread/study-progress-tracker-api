import React, { useState, useEffect } from 'react';

function Statistics() {
  const [topics, setTopics] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [topicsRes, sessionsRes] = await Promise.all([
        fetch('http://localhost:8000/topics/'),
        fetch('http://localhost:8000/sessions/')
      ]);

      const topicsData = await topicsRes.json();
      const sessionsData = await sessionsRes.json();

      setTopics(topicsData);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total study time
  const getTotalMinutes = () => {
    return sessions.reduce((total, session) => total + session.duration_minutes, 0);
  };

  // Calculate average session length
  const getAverageSessionLength = () => {
    if (sessions.length === 0) return 0;
    return Math.round(getTotalMinutes() / sessions.length);
  };

  // Get study time per topic
  const getTopicStats = () => {
    const stats = {};
    
    sessions.forEach(session => {
      if (!stats[session.topic_id]) {
        stats[session.topic_id] = {
          minutes: 0,
          sessionCount: 0
        };
      }
      stats[session.topic_id].minutes += session.duration_minutes;
      stats[session.topic_id].sessionCount += 1;
    });

    return Object.entries(stats).map(([topicId, data]) => {
      const topic = topics.find(t => t.id === parseInt(topicId));
      return {
        topicId: parseInt(topicId),
        topicName: topic ? topic.title : 'Unknown',
        minutes: data.minutes,
        sessionCount: data.sessionCount
      };
    }).sort((a, b) => b.minutes - a.minutes);
  };

  // Get most studied topic
  const getMostStudiedTopic = () => {
    const topicStats = getTopicStats();
    return topicStats.length > 0 ? topicStats[0] : null;
  };

  // Get study time for last 7 days
  const getLast7DaysData = () => {
    const last7Days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create array of last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date,
        dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        minutes: 0
      });
    }

    // Add session minutes to corresponding days
    sessions.forEach(session => {
      const sessionDate = new Date(session.start_time);
      sessionDate.setHours(0, 0, 0, 0);
      
      const dayData = last7Days.find(day => day.date.getTime() === sessionDate.getTime());
      if (dayData) {
        dayData.minutes += session.duration_minutes;
      }
    });

    return last7Days;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const topicStats = getTopicStats();
  const mostStudied = getMostStudiedTopic();
  const last7DaysData = getLast7DaysData();
  const maxDayMinutes = Math.max(...last7DaysData.map(d => d.minutes), 1);

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="statistics-container">
        <h2>Statistics</h2>
        <div className="no-data">
          <p>No study data yet. Complete some study sessions to see your statistics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      <h2>Study Statistics</h2>

      {/* Overview Cards */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-value">{formatTime(getTotalMinutes())}</div>
          <div className="stat-label">Total Study Time</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{sessions.length}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{formatTime(getAverageSessionLength())}</div>
          <div className="stat-label">Average Session</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{mostStudied ? mostStudied.topicName : 'N/A'}</div>
          <div className="stat-label">Most Studied</div>
        </div>
      </div>

      {/* Time by Subject */}
      <div className="stats-section">
        <h3>Time by Subject</h3>
        <div className="subject-bars">
          {topicStats.map(stat => {
            const maxMinutes = Math.max(...topicStats.map(s => s.minutes), 1);
            const percentage = (stat.minutes / maxMinutes) * 100;
            
            return (
              <div key={stat.topicId} className="subject-bar-item">
                <div className="subject-bar-label">
                  <span className="subject-name">{stat.topicName}</span>
                  <span className="subject-time">{formatTime(stat.minutes)}</span>
                </div>
                <div className="subject-bar-container">
                  <div 
                    className="subject-bar-fill" 
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="subject-sessions">{stat.sessionCount} sessions</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last 7 Days Line Graph */}
      <div className="stats-section">
        <h3>Last 7 Days Study Time</h3>
        <div className="line-graph">
          <div className="line-graph-container">
            <svg viewBox="0 0 700 300" className="line-graph-svg">
              {/* Grid lines */}
              <line x1="50" y1="250" x2="650" y2="250" stroke="#e5e7eb" strokeWidth="2" />
              {[0, 1, 2, 3, 4].map(i => (
                <line 
                  key={i}
                  x1="50" 
                  y1={250 - (i * 50)} 
                  x2="650" 
                  y2={250 - (i * 50)} 
                  stroke="#f3f4f6" 
                  strokeWidth="1" 
                />
              ))}
              
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map(i => {
                const value = Math.round((maxDayMinutes / 4) * i);
                return (
                  <text 
                    key={i}
                    x="35" 
                    y={255 - (i * 50)} 
                    fontSize="12" 
                    fill="#6b7280"
                    textAnchor="end"
                  >
                    {value}m
                  </text>
                );
              })}

              {/* Line path */}
              <path
                d={last7DaysData.map((day, index) => {
                  const x = 50 + (index * 100);
                  const y = 250 - (day.minutes / maxDayMinutes * 200);
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Gradient fill under line */}
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`${last7DaysData.map((day, index) => {
                  const x = 50 + (index * 100);
                  const y = 250 - (day.minutes / maxDayMinutes * 200);
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')} L 650 250 L 50 250 Z`}
                fill="url(#lineGradient)"
              />

              {/* Data points */}
              {last7DaysData.map((day, index) => {
                const x = 50 + (index * 100);
                const y = 250 - (day.minutes / maxDayMinutes * 200);
                return (
                  <g key={index}>
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="6" 
                      fill="#3b82f6" 
                      stroke="white"
                      strokeWidth="2"
                    />
                    {/* X-axis labels */}
                    <text 
                      x={x} 
                      y="275" 
                      fontSize="12" 
                      fill="#6b7280"
                      textAnchor="middle"
                    >
                      {day.dateString}
                    </text>
                    {/* Value labels on hover */}
                    {day.minutes > 0 && (
                      <text 
                        x={x} 
                        y={y - 12} 
                        fontSize="11" 
                        fill="#1f2937"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        {day.minutes}m
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;