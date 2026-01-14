import React, { useState, useEffect } from 'react';
import './App.css';
import SubjectsList from './components/subjects/SubjectsList';
import Timer from './timer/StudyTimer';
import History from './history/StudyHistory';
import Statistics from './statistics/Statistics'
import StarterSelection from './components/StarterSelection'

function App() {
  const [activeTab, setActiveTab] = useState('subjects');
  const [showStarter, setShowStarter] = useState(false);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    checkForTopics();
  }, []);

  const checkForTopics = async () => {
    try {
      const response = await fetch('http://localhost:8000/topics/');
      const data = await response.json();
      setTopics(data);

      if (data.length === 0) {
        setShowStarter(true);
      }
    } catch (err) {
        console.error('Error fetching topics:', err);
      }
    };

    const handleStarterSelected = (newTopic) => {
      setShowStarter(false);
      setTopics([newTopic]);
    };

    if (showStarter) {
      return <StarterSelection onStarterSelected = {handleStarterSelected} />;
    }

  return (
    <div className='App'>
      <h1 className='title'>STUDYMON</h1>
      {/*Exp Bar Placeholder */}
      <div className='exp-bar'>
        <h2>Level 1 - 0 XP</h2>
      </div>

      {/* Tab Navigation */}
      <div className='tab-navigation'>
        <button
          onClick={() => setActiveTab('subjects')}
          className={activeTab === 'subjects' ? 'active' : ''}
        >
          Subjects
        </button>

        <button
          onClick={() => setActiveTab('timer')}
          className={activeTab === 'timer' ? 'active' : ''}
        >
          Study Timer
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={activeTab === 'history' ? 'active' : ''}
        >
          History
        </button>

        <button
          onClick={() => setActiveTab('statistics')}
          className={activeTab === 'statistics' ? 'active' : ''}
        >
          Statistics
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'subjects' && <SubjectsList />}
        {activeTab === 'timer' && <Timer />}
        {activeTab === 'history' && <History />}
        {activeTab === 'statistics' && <Statistics/>}
      </div>
    </div>
  );
}

export default App;
