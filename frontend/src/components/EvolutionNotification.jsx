import React, { useEffect, useState } from 'react';

function EvolutionNotification({ evolutionData, onClose }) {
  const [show, setShow] = useState(false);
  const [stage, setStage] = useState('initial'); // initial, evolving, complete

  useEffect(() => {
    setShow(true);
    
    // Stage 1: Show for 1 second
    setTimeout(() => setStage('evolving'), 1000);
    
    // Stage 2: Evolution animation for 2 seconds
    setTimeout(() => setStage('complete'), 3000);
    
    // Auto-close after 6 seconds total
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 500); // Wait for fade out
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!evolutionData) return null;

  return (
    <div className={`evolution-overlay ${show ? 'show' : ''}`}>
      <div className={`evolution-container ${stage}`}>
        {stage === 'initial' && (
          <div className="evolution-stage">
            <h2>What's happening?!</h2>
            <div className="evolution-sprite">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolutionData.from_id}.png`}
                alt={evolutionData.from_name}
                className="sprite-flash"
              />
            </div>
            <p className="evolution-name">{evolutionData.from_name}</p>
          </div>
        )}

        {stage === 'evolving' && (
          <div className="evolution-stage">
            <h2>🌟 EVOLVING! 🌟</h2>
            <div className="evolution-sprite evolving">
              <div className="evolution-light"></div>
            </div>
            <p className="evolution-text">Your Pokémon is evolving...</p>
          </div>
        )}

        {stage === 'complete' && (
          <div className="evolution-stage">
            <h2>Congratulations!</h2>
            <div className="evolution-sprite complete">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolutionData.to_id}.png`}
                alt={evolutionData.to_name}
                className="sprite-appear"
              />
            </div>
            <p className="evolution-message">
              {evolutionData.from_name} evolved into <strong>{evolutionData.to_name}</strong>!
            </p>
            <p className="evolution-level">At Level {evolutionData.at_level}</p>
          </div>
        )}

        <button className="evolution-close" onClick={() => {
          setShow(false);
          setTimeout(onClose, 500);
        }}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default EvolutionNotification;