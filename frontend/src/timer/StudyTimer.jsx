import React, { useState, useEffect } from 'react';
import EvolutionNotification from '../components/EvolutionNotification';

function Timer() {
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [evolutionData, setEvolutionData] = useState(null);

  // Fetch topics on mount
  useEffect(() => {
    fetch('http://localhost:8000/topics/')
      .then(res => res.json())
      .then(data => setTopics(data))
      .catch(err => console.error('Error fetching topics:', err));
  }, []);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isRunning && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!selectedTopicId) {
      alert('Please select a subject first!');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: parseInt(selectedTopicId) })
      });
      
      if (!response.ok) throw new Error('Failed to start session');
      
      const data = await response.json();
      setActiveSessionId(data.id);
      setIsRunning(true);
    } catch (err) {
      console.error('Error starting session:', err);
      alert('Failed to start timer');
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleStop = async () => {
    if (!activeSessionId) return;

    const durationMinutes = Math.floor(seconds / 60);

    try {
      const response = await fetch(`http://localhost:8000/sessions/${activeSessionId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_minutes: durationMinutes })
      });

      if (!response.ok) throw new Error('Failed to end session');

      const data = await response.json();

      // Check if evolution happened
      if (data.evolution) {
        setEvolutionData(data.evolution);
      }

      // Reset timer
      setIsRunning(false);
      setSeconds(0);
      setActiveSessionId(null);

      if (!data.evolution) {
        alert(`Session saved! You studied for ${durationMinutes} minutes.`);
      }
    } catch (err) {
      console.error('Error ending session:', err);
      alert('Failed to save session');
    }
  };

  return (
    <div className="timer-container">
      {evolutionData && (
        <EvolutionNotification 
          evolutionData={evolutionData}
          onClose={() => setEvolutionData(null)}
        />
      )}
      
      <h2>Study Timer</h2>
      
      {/* Subject Selector */}
      <div className="timer-selector">
        <label htmlFor="subject-select">Select Subject:</label>
        <select 
          id="subject-select"
          value={selectedTopicId} 
          onChange={(e) => setSelectedTopicId(e.target.value)}
          disabled={isRunning}
        >
          <option value="">-- Choose a subject --</option>
          {topics.map(topic => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
      </div>

      {/* Timer Display */}
      <div className="timer-display">
        {formatTime(seconds)}
      </div>

      {/* Timer Controls */}
      <div className="timer-controls">
        {!isRunning && activeSessionId === null && (
          <button className="btn-start" onClick={handleStart}>
            Start
          </button>
        )}
        
        {isRunning && (
          <button className="btn-pause" onClick={handlePause}>
            Pause
          </button>
        )}
        
        {!isRunning && activeSessionId !== null && (
          <>
            <button className="btn-resume" onClick={handleResume}>
              Resume
            </button>
            <button className="btn-stop" onClick={handleStop}>
              Stop & Save
            </button>
          </>
        )}
      </div>

      {/* Current Session Info */}
      {activeSessionId && (
        <div className="session-info">
          <p>Session active for: {topics.find(t => t.id === parseInt(selectedTopicId))?.title}</p>
        </div>
      )}
    </div>
  );
}

export default Timer;