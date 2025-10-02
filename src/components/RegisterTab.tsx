import React, { useState, useEffect } from 'react';
import { Session, Player } from '../types';
import CollapsibleSection from './CollapsibleSection';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

// Constants
const MAX_REGULAR_PLAYERS = 13; // Maximum number of regular registered players

interface PlannedSession extends Omit<Session, 'id'> {
  id?: string; // Firestore ID is string
  createdAt?: Timestamp;
  walkInGuests?: number; // Number of walk-in guests
}

interface RegisterTabProps {
  // Players
  players: Player[];
  
  // Notifications
  onShowNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const RegisterTab: React.FC<RegisterTabProps> = ({
  players,
  onShowNotification
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PlannedSession | null>(null);
  const [sectionExpanded, setSectionExpanded] = useState(true);
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Memoize players data to prevent unnecessary re-renders
  const memoizedPlayers = React.useMemo(() => players, [players]);
  
  // Load planned sessions from Firestore
  useEffect(() => {
    const loadPlannedSessions = async () => {
      try {
        setIsLoading(true);
        const plannedSessionsRef = collection(db, 'plannedSessions');
        const snapshot = await getDocs(plannedSessionsRef);
        const loadedSessions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PlannedSession[];
        
        // Sort sessions by date
        const sortedSessions = loadedSessions.sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        
        setPlannedSessions(sortedSessions);
      } catch (error) {
        console.error('Error loading planned sessions:', error);
        onShowNotification('Failed to load planned sessions', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlannedSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove dependency to prevent double-loading

  const handleAddPlannedSession = async () => {
    if (!selectedDate) {
      onShowNotification('Please select a date', 'error');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const date = new Date(selectedDate);
      const sessionName = `Planned Day ${plannedSessions.length + 1}`;
      
      const newSession: PlannedSession = {
        name: sessionName,
        date: selectedDate,
        participants: [],
        additionalFee: 0,
        waterFee: 0,
        walkInGuests: 0,
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'plannedSessions'), newSession);
      
      // Add the new session with the Firestore ID and sort by date
      setPlannedSessions(prev => {
        const updated = [...prev, { ...newSession, id: docRef.id }];
        return updated.sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
      });
      setSelectedDate(''); // Reset date picker
      onShowNotification('Day added to next month\'s plan!', 'success');
    } catch (error) {
      console.error('Error adding planned session:', error);
      onShowNotification('Failed to add planned day', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSession = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the plan?`)) {
      try {
        // Update UI immediately for better user experience
        setPlannedSessions(prev => prev.filter(session => session.id !== id));
        
        // Then perform the actual delete operation
        await deleteDoc(doc(db, 'plannedSessions', id));
        onShowNotification('Day removed from plan successfully!', 'success');
      } catch (error) {
        console.error('Error removing planned session:', error);
        onShowNotification('Failed to remove planned day', 'error');
        
        // If the delete operation failed, reload sessions to restore the UI
        const plannedSessionsRef = collection(db, 'plannedSessions');
        const snapshot = await getDocs(plannedSessionsRef);
        const loadedSessions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PlannedSession[];
        setPlannedSessions(loadedSessions);
      }
    }
  };

  const handleEditParticipants = (session: PlannedSession) => {
    setSelectedSession(session);
    setShowParticipantsModal(true);
  };

  const handleSaveParticipants = async (participants: number[]) => {
    if (selectedSession && selectedSession.id) {
      try {
        // Start the update operation
        const sessionRef = doc(db, 'plannedSessions', selectedSession.id);
        
        // Calculate walk-in guests if participants exceed the limit
        let regularParticipants = participants;
        let walkInGuests = 0;
        
        if (participants.length > MAX_REGULAR_PLAYERS) {
          // First 13 are regular, the rest are walk-ins
          regularParticipants = participants;
          walkInGuests = participants.length - MAX_REGULAR_PLAYERS;
        }
        
        // Pre-update the local state for immediate feedback
        setPlannedSessions(prev => 
          prev.map(session => 
            session.id === selectedSession.id 
              ? { 
                  ...session, 
                  participants: regularParticipants,
                  walkInGuests: walkInGuests
                } 
              : session
          )
        );
        
        // Reset UI state before the async operation completes
        setShowParticipantsModal(false);
        setSelectedSession(null);
        
        // Now perform the Firestore update
        await updateDoc(sessionRef, { 
          participants: regularParticipants,
          walkInGuests: walkInGuests
        });
        
        // Show appropriate notification
        if (walkInGuests > 0) {
          onShowNotification(`Updated with ${regularParticipants.length} regular players and ${walkInGuests} walk-in guests`, 'success');
        } else {
          onShowNotification('Participants updated successfully!', 'success');
        }
      } catch (error) {
        console.error('Error updating participants:', error);
        onShowNotification('Failed to update participants', 'error');
      }
    }
  };

  const handleCancelParticipants = () => {
    setShowParticipantsModal(false);
    setSelectedSession(null);
  };

  const formatDateString = (dateString?: string) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get next month's name for the heading
  const getNextMonthName = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="tab-content fade-in">
      <CollapsibleSection
        title={`Plan for ${getNextMonthName()}`}
        icon="fas fa-calendar-alt"
        className="planned-sessions-section"
        defaultExpanded={true}
        isExpanded={sectionExpanded}
        onToggle={setSectionExpanded}
      >
        <div>
          <div className="add-session-form">
            <div className="add-session-heading">
              <h3 className="card-title"><i className="fas fa-calendar-plus"></i> Add Planned Day</h3>
              <div className="status-badge status-badge-pending">
                <i className="fas fa-clock"></i> Upcoming Month
              </div>
            </div>
            
            <div className="add-session-container">
              <div className="form-group">
                <label htmlFor="sessionDate">Select Date</label>
                <input
                  type="date"
                  id="plannedSessionDate"
                  className="modern-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Only future dates
                />
              </div>
              <button
                className="modern-button modern-button-primary"
                onClick={handleAddPlannedSession}
                disabled={!selectedDate || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Adding...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus"></i> Add to Plan
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="sessions-list">
            <div className="add-session-heading">
              <h3 className="card-title"><i className="fas fa-list"></i> Planned Days</h3>
              <div className="status-badge status-badge-success">
                <i className="fas fa-calendar-check"></i> {plannedSessions.length} Days
              </div>
            </div>
            
            {isLoading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin fa-2x"></i>
                <p>Loading planned days...</p>
              </div>
            ) : plannedSessions.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-calendar"></i>
                <p>No days planned yet. Add a day to get started.</p>
              </div>
            ) : (
              <div className="sessions-grid">
                {plannedSessions.map((session) => (
                  <div key={session.id} className="session-card slide-in">
                    <div className="session-indicator"></div>
                    <div className="session-header">
                      <h4>{session.name}</h4>
                      <div className="date-label">
                        <i className="fas fa-calendar-day"></i>
                        {formatDateString(session.date)}
                      </div>
                    </div>

                    <div className="session-details">
                      <div className="participants-overview">
                        <div className="participants-count">
                          <span>
                            <strong>{session.participants.length}</strong> {session.participants.length === 1 ? 'player' : 'players'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="registered-players">
                        {session.participants.length > 0 ? (
                          <div className="player-overview">
                            <div className="player-avatars">
                              {/* Regular players */}
                              {session.participants.slice(0, Math.min(3, MAX_REGULAR_PLAYERS)).map((playerId, index) => {
                                const player = memoizedPlayers.find(p => p.id === playerId);
                                return player ? (
                                  <div key={player.id} className="player-avatar" title={player.name}>
                                    <i className="fas fa-user-circle"></i>
                                  </div>
                                ) : null;
                              })}
                              {/* Show more regular players indicator */}
                              {session.participants.length > 3 && session.participants.length <= MAX_REGULAR_PLAYERS && (
                                <div className="player-avatar-more" title={`${session.participants.length - 3} more players`}>
                                  +{session.participants.length - 3}
                                </div>
                              )}
                              {/* Show walk-in indicator if needed */}
                              {session.participants.length > MAX_REGULAR_PLAYERS && (
                                <div className="player-avatar-walkin" title={`${session.walkInGuests || 0} walk-in guests`}>
                                  +{session.walkInGuests || 0}
                                </div>
                              )}
                            </div>
                            
                            {(session.walkInGuests || 0) > 0 && (
                              <div className="registration-summary">
                                <span>{Math.min(session.participants.length, MAX_REGULAR_PLAYERS)} regular + {session.walkInGuests} walk-in</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="no-players">No players registered yet</span>
                        )}
                      </div>
                    </div>

                    <div className="session-actions">
                      <button
                        className="modern-button modern-button-primary"
                        onClick={() => handleEditParticipants(session as PlannedSession)}
                      >
                        <i className="fas fa-user-plus"></i> Register
                      </button>
                      <button
                        className="modern-button modern-button-danger delete-button"
                        onClick={() => handleRemoveSession(session.id as string, session.name)}
                        title="Delete this day"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showParticipantsModal && selectedSession && (
            <div className="modal-overlay">
              <div className="modal register-modal">
                <div className="modal-header">
                  <h2 className="card-title">
                    <i className="fas fa-user-plus"></i> 
                    Register Players: {selectedSession.name}
                  </h2>
                  <button className="close-btn" onClick={handleCancelParticipants}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  {/* Registration information panel - always visible with consistent height */}
                  <div className={`registration-info ${selectedSession.participants.length > MAX_REGULAR_PLAYERS ? 'registration-warning' : ''}`}>
                    {selectedSession.participants.length > MAX_REGULAR_PLAYERS ? (
                      <>
                        <i className="fas fa-exclamation-triangle"></i>
                        <div className="registration-content">
                          <p>
                            <strong>Walk-in Guest Notice:</strong> Players beyond the first {MAX_REGULAR_PLAYERS} will be considered "Walk-in Guests".
                          </p>
                          <p className="registration-stats">
                            <span className="regular-count"><i className="fas fa-user"></i> Regular: {Math.min(selectedSession.participants.length, MAX_REGULAR_PLAYERS)}</span>
                            <span className="walkin-count"><i className="fas fa-walking"></i> Walk-in: {Math.max(0, selectedSession.participants.length - MAX_REGULAR_PLAYERS)}</span>
                            <span className="total-count"><i className="fas fa-users"></i> Total: {selectedSession.participants.length}</span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-info-circle"></i>
                        <div className="registration-content">
                          <p>
                            <strong>Player Registration:</strong> Currently {selectedSession.participants.length} {selectedSession.participants.length === 1 ? 'player' : 'players'} selected.
                          </p>
                          <p className="registration-stats">
                            <span className="regular-count"><i className="fas fa-user"></i> Regular: {selectedSession.participants.length}</span>
                            <span className="total-count"><i className="fas fa-users"></i> Total: {selectedSession.participants.length}</span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {memoizedPlayers.length === 0 ? (
                    <div className="empty-state">
                      <i className="fas fa-users"></i>
                      <p>No players added yet. Add players in Settings to register them for sessions.</p>
                    </div>
                  ) : (
                    <div className="participants-grid">
                      {memoizedPlayers.map(player => (
                        <div 
                          key={player.id} 
                          className={`participant-card ${
                            selectedSession.participants.includes(player.id) && 
                            selectedSession.participants.findIndex(id => id === player.id) >= MAX_REGULAR_PLAYERS 
                              ? 'walk-in-guest' 
                              : ''
                          }`}
                        >
                          {/* The walk-in label is handled by ::after in CSS */}
                          <label className="checkbox-container modern-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedSession.participants.includes(player.id)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                let updatedParticipants;
                                
                                if (isChecked) {
                                  updatedParticipants = [...selectedSession.participants, player.id];
                                } else {
                                  updatedParticipants = selectedSession.participants.filter(id => id !== player.id);
                                }

                                setSelectedSession({
                                  ...selectedSession,
                                  participants: updatedParticipants
                                });
                              }}
                            />
                            <span className="checkmark"></span>
                            <span className="player-name">
                              <i className="fas fa-user"></i> {player.name}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="modern-button" onClick={handleCancelParticipants}>Cancel</button>
                  <button
                    className="modern-button modern-button-primary"
                    onClick={() => handleSaveParticipants(selectedSession.participants)}
                  >
                    <i className="fas fa-save"></i> Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default RegisterTab;