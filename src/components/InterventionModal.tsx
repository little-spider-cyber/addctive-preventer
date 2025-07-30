import React, { useState, useEffect } from 'react';
import { InterventionModalProps, InterventionAction } from '../shared/types';

export const InterventionModal: React.FC<InterventionModalProps> = ({
  domain,
  sessionDuration,
  onReflect,
  onClose
}) => {
  console.log('[InterventionModal] Component initialized with props:', { domain, sessionDuration });
  
  const [prompt, setPrompt] = useState('');
  const [reflection, setReflection] = useState('');
  const [startTime] = useState(Date.now());
  const [showTimer, setShowTimer] = useState(true);
  const [minReflectionLength, setMinReflectionLength] = useState(10);

  useEffect(() => {
    console.log('[InterventionModal] useEffect triggered, loading prompt and settings...');
    
    // Load prompt and settings
    const loadPromptAndSettings = async () => {
      try {
        console.log('[InterventionModal] Importing storage...');
        // Import storage dynamically to avoid issues in content script
        const { storage } = await import('../shared/storage');
        console.log('[InterventionModal] Storage imported, selecting prompt...');
        
        const selectedPrompt = await storage.selectPrompt();
        console.log('[InterventionModal] Selected prompt:', selectedPrompt);
        
        const settings = await storage.getUserSettings();
        console.log('[InterventionModal] User settings:', settings);
        
        setPrompt(selectedPrompt.text);
        setShowTimer(settings.promptConfig.showTimer);
        setMinReflectionLength(settings.promptConfig.minReflectionLength);
        
        console.log('[InterventionModal] Settings loaded successfully');
      } catch (error) {
        console.error('[InterventionModal] Failed to load prompt:', error);
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

  console.log('[InterventionModal] About to render component. Prompt:', prompt, 'IsValid:', isReflectionValid);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '512px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '32px 32px 24px',
          borderBottom: '1px solid rgba(229, 231, 235, 0.5)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px',
              margin: 0
            }}>
              Mindful Browsing Check-in
            </h2>
            {showTimer && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '8px'
              }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {domain} • {formatTime(sessionDuration)}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 32px' }}>
          {/* Prompt */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{
              fontSize: '18px',
              color: '#374151',
              lineHeight: '1.6',
              fontStyle: 'italic',
              margin: 0
            }}>
              "{prompt}"
            </p>
          </div>

          {/* Reflection Input */}
          <div>
            <label htmlFor="reflection" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Your reflection
            </label>
            <textarea
              id="reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Take a moment to reflect on your intentions..."
              rows={4}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px 16px',
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#111827',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.borderColor = '#3b82f6';
                target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.borderColor = '#d1d5db';
                target.style.boxShadow = 'none';
              }}
            />
            {reflection.length < minReflectionLength && (
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                marginTop: '8px',
                margin: '8px 0 0 0'
              }}>
                <svg width="16" height="16" fill="none" stroke="#f59e0b" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Please reflect a bit more ({reflection.length}/{minReflectionLength} characters)
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid rgba(229, 231, 235, 0.5)',
          backgroundColor: 'rgba(249, 250, 251, 0.5)',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <button
              onClick={() => handleAction('took-break')}
              disabled={!isReflectionValid}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 16px',
                backgroundColor: isReflectionValid ? '#3b82f6' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isReflectionValid ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                if (isReflectionValid) {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (isReflectionValid) {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = '#3b82f6';
                }
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Take a Break</span>
            </button>
            <button
              onClick={() => handleAction('continued')}
              disabled={!isReflectionValid}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 16px',
                backgroundColor: isReflectionValid ? 'white' : '#f3f4f6',
                color: isReflectionValid ? '#374151' : '#9ca3af',
                border: isReflectionValid ? '1px solid #d1d5db' : '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isReflectionValid ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                if (isReflectionValid) {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = '#f9fafb';
                  target.style.borderColor = '#9ca3af';
                }
              }}
              onMouseLeave={(e) => {
                if (isReflectionValid) {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = 'white';
                  target.style.borderColor = '#d1d5db';
                }
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Continue Mindfully</span>
            </button>
            <button
              onClick={() => handleAction('redirected')}
              disabled={!isReflectionValid}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 16px',
                backgroundColor: isReflectionValid ? '#f3f4f6' : '#f9fafb',
                color: isReflectionValid ? '#6b7280' : '#9ca3af',
                border: isReflectionValid ? '1px solid #e5e7eb' : '1px solid #f3f4f6',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isReflectionValid ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                if (isReflectionValid) {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = '#e5e7eb';
                  target.style.color = '#4b5563';
                }
              }}
              onMouseLeave={(e) => {
                if (isReflectionValid) {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = '#f3f4f6';
                  target.style.color = '#6b7280';
                }
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span>Go Elsewhere</span>
            </button>
          </div>
          
          <p style={{
            fontSize: '12px',
            textAlign: 'center',
            color: '#6b7280',
            paddingTop: '8px',
            margin: 0
          }}>
            This gentle reminder helps you stay aware of your browsing habits
          </p>
        </div>
      </div>
    </div>
  );
};