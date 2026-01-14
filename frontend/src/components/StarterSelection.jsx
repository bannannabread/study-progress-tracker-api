import React, { useState, useEffect } from 'react';

function StarterSelection({ onStarterSelected }) {
  const [starters, setStarters] = useState([]);
  const [selectedStarter, setSelectedStarter] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStarters();
  }, []);

  const fetchStarters = async () => {
    try {
      const response = await fetch('http://localhost:8000/pokemon/starters');
      const data = await response.json();
      setStarters(data);
    } catch (err) {
      console.error('Error fetching starters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStarterClick = (starter) => {
    setSelectedStarter(starter);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStarter || !subjectName) {
      alert('Please select a starter and enter a subject name!');
      return;
    }

    try {
      // Create topic with Pokémon
      const response = await fetch(
        `http://localhost:8000/topics/?pokemon_id=${selectedStarter.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: subjectName,
            description: subjectDescription || `Studying ${subjectName} with ${selectedStarter.name}!`
          })
        }
      );

      if (!response.ok) throw new Error('Failed to create topic');

      const newTopic = await response.json();
      onStarterSelected(newTopic);
    } catch (err) {
      console.error('Error creating topic:', err);
      alert('Failed to create your first subject. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="starter-loading">
        <p>Loading starters...</p>
      </div>
    );
  }

  return (
    <div className="starter-container">
      <div className="starter-header">
        <h1>Welcome to Studymon! 📚</h1>
        <p>Choose your starter Pokémon to begin your study journey!</p>
        <p className="starter-subtitle">
          Your Pokémon will level up as you study. The more you learn, the stronger they become!
        </p>
      </div>

      <div className="starters-grid">
        {starters.map((starter) => (
          <div
            key={starter.id}
            className={`starter-card ${selectedStarter?.id === starter.id ? 'selected' : ''}`}
            onClick={() => handleStarterClick(starter)}
          >
            <div className="starter-sprite">
              <img src={starter.sprite_url} alt={starter.name} />
            </div>
            <h3>{starter.name}</h3>
            <div className="starter-number">#{starter.id.toString().padStart(3, '0')}</div>
            {selectedStarter?.id === starter.id && (
              <div className="selected-badge">✓ Selected</div>
            )}
          </div>
        ))}
      </div>

      {selectedStarter && (
        <form className="starter-form" onSubmit={handleSubmit}>
          <h2>Create Your First Subject</h2>
          <p className="form-hint">
            What will you study with {selectedStarter.name}?
          </p>
          
          <div className="form-group">
            <label htmlFor="subject-name">Subject Name *</label>
            <input
              id="subject-name"
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g., Mathematics, Chemistry, History..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject-description">Description (optional)</label>
            <textarea
              id="subject-description"
              value={subjectDescription}
              onChange={(e) => setSubjectDescription(e.target.value)}
              placeholder="What are you learning about?"
              rows="3"
            />
          </div>

          <button type="submit" className="start-journey-btn">
            Start Your Journey with {selectedStarter.name}! 🚀
          </button>
        </form>
      )}
    </div>
  );
}

export default StarterSelection;