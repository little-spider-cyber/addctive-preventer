import React, { useState, useEffect } from 'react';
import { InterventionModalProps, InterventionAction } from '../shared/types';
import './InterventionModal.css';

export const InterventionModal: React.FC<InterventionModalProps> = ({
  domain,
  sessionDuration,
  onReflect,
  onClose
}) => {
  const [prompt, setPrompt] = useState('');
  const [reflection, setReflection] = useState('');
  const [startTime] = useState(Date.now());
  const [showTimer, setShowTimer] = useState(true);
  const [minReflectionLength, setMinReflectionLength] = useState(10);

  useEffect(() => {
    // Load prompt and settings
    const loadPromptAndSettings = async () => {
      try {
        // Import storage dynamically to avoid issues in content script
        const { storage } = await import('../shared/storage');
        const selectedPrompt = await storage.selectPrompt();
        const settings = await storage.getUserSettings();
        
        setPrompt(selectedPrompt.text);
        setShowTimer(settings.promptConfig.showTimer);
        setMinReflectionLength(settings.promptConfig.minReflectionLength);
      } catch (error) {
        console.error('Failed to load prompt:', error);
        setPrompt('Take a moment to reflect on your browsing intention.');
      }
    };

    loadPromptAndSettings();
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const handleAction = (action: InterventionAction) => {
    const responseTime = Math.floor((Date.now() - startTime) / 1000);
    
    onReflect({
      domain,
      prompt,
      response: reflection,
      responseTime,
      action,
      sessionDuration
    });

    onClose();

    // Handle different actions
    switch (action) {
      case 'redirected':
        window.location.href = 'about:blank';
        break;
      case 'took-break':
        window.location.href = 'chrome://newtab/';
        break;
      case 'continued':
        // User continues on site
        break;
    }
  };

  const isReflectionValid = reflection.trim().length >= minReflectionLength;

  return (
    <div className="intervention-overlay">
      <div className="intervention-modal">
        <div className="modal-header">
          <h2>Mindful Browsing Check-in</h2>
          {showTimer && (
            <div className="session-info">
              You've been on {domain} for {formatTime(sessionDuration)}
            </div>
          )}
        </div>

        <div className="modal-content">
          <div className="prompt-section">
            <p className="prompt-text">{prompt}</p>
          </div>

          <div className="reflection-section">
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Take a moment to reflect..."
              className="reflection-input"
              rows={4}
            />
            <div className="reflection-hint">
              {reflection.length < minReflectionLength && (
                <span className="hint-text">
                  Please reflect a bit more ({reflection.length}/{minReflectionLength} characters)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={() => handleAction('took-break')}
            className="action-button primary"
            disabled={!isReflectionValid}
          >
            Take a Break
          </button>
          <button
            onClick={() => handleAction('continued')}
            className="action-button secondary"
            disabled={!isReflectionValid}
          >
            Continue Mindfully
          </button>
          <button
            onClick={() => handleAction('redirected')}
            className="action-button tertiary"
            disabled={!isReflectionValid}
          >
            Go Elsewhere
          </button>
        </div>

        <div className="modal-footer">
          <p className="footer-text">
            This gentle reminder helps you stay aware of your browsing habits
          </p>
        </div>
      </div>
    </div>
  );
};