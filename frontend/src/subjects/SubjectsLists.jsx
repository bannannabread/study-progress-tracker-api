import { useState, useEffect } from 'react';
import SubjectForm from './components/subjects/SubjectForm';

function SubjectsList() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopics = () => {  // Extract fetch into a function
    fetch('http://localhost:8000/topics/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch topics');
        }
        return response.json();
      })
      .then(data => {
        setTopics(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleTopicCreated = (newTopic) => {  // Add this handler
    setTopics([...topics, newTopic]);
  };

  if (loading) return <div>Loading topics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="subjects-list">
      <h2>My Study Topics</h2>
      
      <SubjectForm onTopicCreated={handleTopicCreated} />  {/* Add this */}
      
      {topics.length === 0 ? (
        <p>No topics yet. Create your first one!</p>
      ) : (
        <div className="topics-grid">
          {topics.map(topic => (
            <div key={topic.id} className="topic-card">
              <h3>{topic.title}</h3>
              <p>{topic.description}</p>
              <div className="topic-details">
                <span className={`status ${topic.status}`}>
                  {topic.status.replace('_', ' ')}
                </span>
                <span>{topic.minutes_spent} minutes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubjectsList;