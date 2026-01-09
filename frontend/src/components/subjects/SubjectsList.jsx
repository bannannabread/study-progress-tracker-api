import { useState, useEffect } from 'react';
import SubjectForm from './SubjectForm';

function SubjectsList() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  // REMOVE: duplicateWarning and showDuplicateModal states

  console.log('Component rendering, topics:', topics.length);

  const fetchTopics = () => {
    fetch('http://localhost:8000/topics/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch topics');
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched data:', data);
        setTopics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  };
  
  useEffect(() => {
    console.log('useEffect running');
    fetchTopics();
  }, []);

  const handleTopicCreated = (newTopic) => {
    // Simple add to list - duplicate checking is done in SubjectForm
    setTopics(prevTopics => [newTopic, ...prevTopics]);
  };

  const handleDeleteClick = (id, title) => {
    console.log('Delete clicked!', { id, title });
    setTopicToDelete({ id, title });
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    console.log('Confirm delete called');
    if (!topicToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:8000/topics/${topicToDelete.id}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to delete topic');
      }

      setTopics(topics.filter(topic => topic.id !== topicToDelete.id));
      setShowConfirm(false);
      setTopicToDelete(null);
      console.log('Topic deleted successfully');
      
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Failed to delete topic: ' + error.message);
    }
  };

  const cancelDelete = () => {
    console.log('Cancel delete');
    setShowConfirm(false);
    setTopicToDelete(null);
  };

  if (loading) return <div>Loading topics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="subjects-list">
      {/* Delete Confirmation Modal */}
      {showConfirm && topicToDelete && (
        <div className="confirmation-modal">
          <h3>Delete Topic</h3>
          <p>Are you sure you want to delete "{topicToDelete.title}"?</p>
          <p className="warning-text">This action cannot be undone.</p>
          
          <div className="confirmation-buttons">
            <button onClick={confirmDelete} className="confirm-btn">
              Delete
            </button>
            <button onClick={cancelDelete} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Overlay for modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={cancelDelete} />
      )}

      <h2>My Study Topics</h2>
      
      {/* Pass topics as existingTopics prop */}
      <SubjectForm 
        onTopicCreated={handleTopicCreated} 
        existingTopics={topics}
      />
      
      {topics.length === 0 ? (
        <p>No topics yet. Create your first one!</p>
      ) : (
        <div className="topics-grid">
          {topics.map(topic => (
            <div key={topic.id} className="topic-card">
              <div className="topic-card-header">
                <h3>{topic.title}</h3>
              </div>
              <p>{topic.description}</p>
              <div className="topic-details">
                <div className="left-section">
                  <span className={`status ${topic.status}`}>
                    {topic.status.replace('_', ' ')}
                  </span>
                  <button 
                    onClick={() => handleDeleteClick(topic.id, topic.title)}
                    className="delete-btn"
                    title="Delete topic"
                  >
                    ×
                  </button>
                </div>
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