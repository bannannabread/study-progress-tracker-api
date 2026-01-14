import React, { useState, useEffect } from 'react';
import SubjectForm from './SubjectForm';

function SubjectsList() {
  const [topics, setTopics] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch('http://localhost:8000/topics/');
      const data = await response.json();
      setTopics(data);
    } catch (err) {
      console.error('Error fetching topics:', err);
    }
  };

  const handleTopicCreated = (newTopic) => {
    setTopics([...topics, newTopic]);
    setShowForm(false);
  };

  const handleDelete = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/topics/${topicId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete topic');

      setTopics(topics.filter(topic => topic.id !== topicId));
    } catch (err) {
      console.error('Error deleting topic:', err);
      alert('Failed to delete subject');
    }
  };

  const getExpForNextLevel = (level) => {
    return Math.pow(level + 1, 3);
  };

  const getExpForCurrentLevel = (level) => {
    return Math.pow(level, 3);
  };

  const calculateExpProgress = (topic) => {
    if (!topic.pokemon_id) return 0;
    
    const currentLevelExp = getExpForCurrentLevel(topic.pokemon_level);
    const nextLevelExp = getExpForNextLevel(topic.pokemon_level);
    const expInCurrentLevel = topic.pokemon_exp - currentLevelExp;
    const expNeededForLevel = nextLevelExp - currentLevelExp;
    
    return (expInCurrentLevel / expNeededForLevel) * 100;
  };

  const getExpRemaining = (topic) => {
    if (!topic.pokemon_id) return 0;
    
    const currentLevelExp = getExpForCurrentLevel(topic.pokemon_level);
    const nextLevelExp = getExpForNextLevel(topic.pokemon_level);
    const expInCurrentLevel = topic.pokemon_exp - currentLevelExp;
    const expNeededForLevel = nextLevelExp - currentLevelExp;
    
    return expNeededForLevel - expInCurrentLevel;
  };

  return (
    <div className="subjects-container">
      <div className="subjects-header">
        <h2>Your Subjects</h2>
        <button 
          className="add-subject-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Subject'}
        </button>
      </div>

      {showForm && <SubjectForm onTopicCreated={handleTopicCreated} />}

      <div className="subjects-grid">
        {topics.map(topic => (
          <div key={topic.id} className="subject-card-pokemon">
            {/* Pokémon Display Section */}
            {topic.pokemon_id ? (
              <div className="pokemon-section">
                <div className="pokemon-sprite-container">
                  <img 
                    src={topic.pokemon_sprite_url} 
                    alt={topic.pokemon_name}
                    className="pokemon-sprite"
                  />
                  <div className="pokemon-level-badge">Lv. {topic.pokemon_level}</div>
                </div>
                <div className="pokemon-info">
                  <h4 className="pokemon-name">{topic.pokemon_name}</h4>
                  <div className="exp-bar-container">
                    <div className="exp-bar-label">
                      <span>EXP</span>
                      <span>{getExpRemaining(topic)} to next level</span>
                    </div>
                    <div className="exp-bar-track">
                      <div 
                        className="exp-bar-fill"
                        style={{ width: `${calculateExpProgress(topic)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-pokemon">
                <p>No Pokémon assigned</p>
              </div>
            )}

            {/* Subject Info Section */}
            <div className="subject-info-section">
              <h3>{topic.title}</h3>
              <p className="subject-description">{topic.description}</p>
              
              <div className="subject-stats">
                <div className="stat-item">
                  <span className="stat-label">Status:</span>
                  <span className={`status-badge status-${topic.status}`}>
                    {topic.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Study Time:</span>
                  <span className="stat-value">
                    {Math.floor(topic.minutes_spent / 60)}h {topic.minutes_spent % 60}m
                  </span>
                </div>
              </div>

              <button 
                className="delete-subject-btn"
                onClick={() => handleDelete(topic.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {topics.length === 0 && !showForm && (
        <div className="no-subjects">
          <p>No subjects yet. Click "Add Subject" to get started!</p>
        </div>
      )}
    </div>
  );
}

export default SubjectsList;