import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import './Admin.css';

/**
 * Admin Page Component
 * 
 * Implements User Story #5:
 * "As a platform admin, I want to easily create betting events so that 
 * users have legitimate matches to bet on."
 * 
 * Acceptance Criteria:
 * - Simple web form (Team A, Team B, start time)
 * - Events appear immediately in Gary's available matches
 * - Oracle automatically settles and triggers payouts
 */
const Admin: React.FC = () => {
  const { dispatch } = useAppContext();
  const [formData, setFormData] = useState({
    teamA: '',
    teamB: '',
    startTime: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.teamA || !formData.teamB || !formData.startTime) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          message: 'Please fill in all fields',
          type: 'error'
        }
      });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // TODO: Integrate with Solana program for event creation
      // This will be implemented in future tasks
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          message: `Event created: ${formData.teamA} vs ${formData.teamB}`,
          type: 'info'
        }
      });
      
      // Reset form
      setFormData({
        teamA: '',
        teamB: '',
        startTime: '',
      });
      
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          message: 'Failed to create event. Please try again.',
          type: 'error'
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h2>Create Betting Event</h2>
          <p>Add new matches for users to bet on</p>
        </div>
        
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="teamA">Team A</label>
            <input
              type="text"
              id="teamA"
              name="teamA"
              value={formData.teamA}
              onChange={handleInputChange}
              placeholder="Enter Team A name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="teamB">Team B</label>
            <input
              type="text"
              id="teamB"
              name="teamB"
              value={formData.teamB}
              onChange={handleInputChange}
              placeholder="Enter Team B name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="startTime">Start Time</label>
            <input
              type="datetime-local"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button type="submit" className="submit-button">
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin; 