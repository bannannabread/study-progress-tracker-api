import React, { useState } from 'react';

function SubjectForm({ onTopicCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showSafariZone, setShowSafariZone] = useState(false);
  const [safariPokemon, setSafariPokemon] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(false);

  const enterSafariZone = async () => {
    setLoading(true);
    try {
      // Fetch 3 random Pokémon
      const pokemon = await Promise.all([
        fetch('http://localhost:8000/pokemon/random/encounter').then(r => r.json()),
        fetch('http://localhost:8000/pokemon/random/encounter').then(r => r.json()),
        fetch('http://localhost:8000/pokemon/random/encounter').then(r => r.json())
      ]);
      
      setSafariPokemon(pokemon);
      setShowSafariZone(true);
    } catch (err) {
      console.error('Error entering Safari Zone:', err);
      alert('Failed to enter Safari Zone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonSelect = (pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPokemon) {
      alert('Please select a Pokémon from the Safari Zone!');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/topics/?pokemon_id=${selectedPokemon.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description })
        }
      );

      if (!response.ok) throw new Error('Failed to create topic');

      const newTopic = await response.json();
      onTopicCreated(newTopic);

      // Reset form
      setTitle('');
      setDescription('');
      setShowSafariZone(false);
      setSafariPokemon([]);
      setSelectedPokemon(null);
    } catch (err) {
      console.error('Error creating topic:', err);
      alert('Failed to create subject. Please try again.');
    }
  };

  const handleReroll = async () => {
    setSelectedPokemon(null);
    await enterSafariZone();
  };

  return (
    <div className="subject-form">
      <h3>Create New Subject</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="title">Subject Name *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Physics, Literature, Programming..."
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will you study?"
            rows="3"
          />
        </div>

        {!showSafariZone ? (
          <button
            type="button"
            className="safari-zone-btn"
            onClick={enterSafariZone}
            disabled={loading}
          >
            {loading ? 'Entering Safari Zone...' : '🌿 Enter Safari Zone'}
          </button>
        ) : (
          <>
            <div className="safari-zone-header">
              <h4>🌿 Safari Zone - Choose Your Pokémon!</h4>
              <p>Select one of these wild Pokémon to study with</p>
            </div>

            <div className="safari-pokemon-grid">
              {safariPokemon.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className={`safari-pokemon-card ${selectedPokemon?.id === pokemon.id ? 'selected' : ''}`}
                  onClick={() => handlePokemonSelect(pokemon)}
                >
                  <div className="safari-sprite">
                    <img src={pokemon.sprite_url} alt={pokemon.name} />
                  </div>
                  <h4>{pokemon.name}</h4>
                  <div className="safari-number">#{pokemon.id.toString().padStart(3, '0')}</div>
                  {selectedPokemon?.id === pokemon.id && (
                    <div className="safari-selected-badge">✓ Caught!</div>
                  )}
                </div>
              ))}
            </div>

            <div className="safari-actions">
              <button
                type="button"
                className="reroll-btn"
                onClick={handleReroll}
                disabled={loading}
              >
                {loading ? 'Searching...' : '🔄 Find Different Pokémon'}
              </button>

              {selectedPokemon && (
                <button type="submit" className="create-with-pokemon-btn">
                  Create Subject with {selectedPokemon.name}
                </button>
              )}
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default SubjectForm;