import { useState } from 'react';
import './App.css';
import SubjectsList from './components/subjects/SubjectsList';
import Timer from './timer/StudyTimer';

function App() {
  const [activeTab, setActiveTab] = useState('subjects');
  
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
        {activeTab === 'history' && <div>History Tab</div>}
        {activeTab === 'statistics' && <div>Statistics Tab</div>}
      </div>
    </div>
  );
}

export default App;
