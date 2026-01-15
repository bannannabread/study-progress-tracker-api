import React, { useState, useEffect } from 'react';

function AcePokemonBar() {
  const [acePokemon, setAcePokemon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcePokemon();
  }, []);

  const fetchAcePokemon = async () => {
    try {
      const response = await fetch('http://localhost:8000/topics/');
      const topics = await response.json();

      // Filter topics that have Pokémon
      const topicsWithPokemon = topics.filter(t => t.pokemon_id);

      if (topicsWithPokemon.length === 0) {
        setAcePokemon(null);
        setLoading(false);
        return;
      }

      // Find the highest level Pokémon (ace)
      const ace = topicsWithPokemon.reduce((highest, current) => {
        if (current.pokemon_level > highest.pokemon_level) return current;
        if (current.pokemon_level === highest.pokemon_level && current.pokemon_exp > highest.pokemon_exp) {
          return current;
        }
        return highest;
      });

      setAcePokemon(ace);
    } catch (err) {
      console.error('Error fetching ace Pokémon:', err);
    } finally {
      setLoading(false);
    }
  };

  const getExpForNextLevel = (level) => {
    return Math.pow(level + 1, 3);
  };

  const getExpForCurrentLevel = (level) => {
    return Math.pow(level, 3);
  };

  const calculateExpProgress = () => {
    if (!acePokemon) return 0;
    
    const currentLevelExp = getExpForCurrentLevel(acePokemon.pokemon_level);
    const nextLevelExp = getExpForNextLevel(acePokemon.pokemon_level);
    const expInCurrentLevel = acePokemon.pokemon_exp - currentLevelExp;
    const expNeededForLevel = nextLevelExp - currentLevelExp;
    
    return (expInCurrentLevel / expNeededForLevel) * 100;
  };

  const getExpStats = () => {
    if (!acePokemon) return { current: 0, needed: 0 };
    
    const currentLevelExp = getExpForCurrentLevel(acePokemon.pokemon_level);
    const nextLevelExp = getExpForNextLevel(acePokemon.pokemon_level);
    const expInCurrentLevel = acePokemon.pokemon_exp - currentLevelExp;
    const expNeededForLevel = nextLevelExp - currentLevelExp;
    
    return {
      current: expInCurrentLevel,
      needed: expNeededForLevel
    };
  };

  if (loading) {
    return (
      <div className="ace-bar loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!acePokemon) {
    return (
      <div className="ace-bar empty">
        <p>🎮 Start studying to train your first Pokémon!</p>
      </div>
    );
  }

  const expStats = getExpStats();

  return (
    <div className="ace-bar">
      <div className="ace-container">
        {/* Left side: Pokémon info */}
        <div className="ace-pokemon-info">
          <div className="ace-sprite-container">
            <img 
              src={acePokemon.pokemon_sprite_url} 
              alt={acePokemon.pokemon_name}
              className="ace-sprite"
            />
          </div>
          <div className="ace-details">
            <div className="ace-label">ACE POKÉMON</div>
            <div className="ace-name">{acePokemon.pokemon_name}</div>
            <div className="ace-subject">{acePokemon.title}</div>
          </div>
        </div>

        {/* Center: Level and EXP */}
        <div className="ace-progress">
          <div className="ace-level-display">
            <span className="level-label">LEVEL</span>
            <span className="level-number">{acePokemon.pokemon_level}</span>
          </div>
          
          <div className="ace-exp-section">
            <div className="ace-exp-label">
              <span>EXP</span>
              <span>{expStats.current} / {expStats.needed}</span>
            </div>
            <div className="ace-exp-bar-track">
              <div 
                className="ace-exp-bar-fill"
                style={{ width: `${calculateExpProgress()}%` }}
              >
                <div className="exp-bar-shine" />
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Stats */}
        <div className="ace-stats">
          <div className="ace-stat-item">
            <span className="stat-icon">⏱️</span>
            <div className="stat-info">
              <div className="stat-value">{Math.floor(acePokemon.minutes_spent / 60)}h {acePokemon.minutes_spent % 60}m</div>
              <div className="stat-label-small">Study Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcePokemonBar;