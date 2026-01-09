import { useState } from 'react';

function SubjectForm({ onTopicCreated, existingTopics = [] }) {  // Add existingTopics prop
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');  // Add duplicate error state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDuplicateError('');  // Clear any previous duplicate errors

    // Check for duplicates BEFORE sending to backend
    const isDuplicate = existingTopics.some(topic => 
      topic.title.toLowerCase() === title.toLowerCase()
    );

    if (isDuplicate) {
      setDuplicateError(`"${title}" already exists!`);
      setIsSubmitting(false);
      return;  // Stop here, don't send to backend
    }

    try {
      const response = await fetch('http://localhost:8000/topics/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create topic');
      }

      const newTopic = await response.json();
      
      // Clear form
      setTitle('');
      setDescription('');
      
      // Notify parent component
      onTopicCreated(newTopic);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      alert('Error creating topic: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="subject-form">
      <h3>Add New Topic</h3>
      
      {/* Success message */}
      {showSuccess && (
        <div className="success-message" style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px',
          border: '1px solid #c3e6cb'
        }}>
          Topic created successfully!
        </div>
      )}
      
      {/* Duplicate error message */}
      {duplicateError && (
        <div className="duplicate-error" style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px',
          border: '1px solid #ffeaa7'
        }}>
          ⚠️ {duplicateError}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="title">Title:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setDuplicateError('');  // Clear error when user types
          }}
          required
          placeholder="e.g., Learn React"
          className={duplicateError ? 'error-border' : ''}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="What will you learn?"
          rows="3"
        />
      </div>

      <button type="submit" disabled={isSubmitting || duplicateError}>
        {isSubmitting ? 'Creating...' : 'Create Topic'}
      </button>
    </form>
  );
}

export default SubjectForm;