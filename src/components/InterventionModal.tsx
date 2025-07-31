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
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <div className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-neutral-200/50">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-0">
              Mindful Browsing Check-in
            </h2>
            {showTimer && (
              <div className="inline-flex items-center px-3 py-1.5 mt-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {domain} • {formatTime(sessionDuration)}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Prompt */}
          <div className="text-center mb-6">
            <p className="text-lg text-gray-700 leading-relaxed italic m-0">
              "{prompt}"
            </p>
          </div>

          {/* Reflection Input */}
          <div>
            <label htmlFor="reflection" className="block text-sm font-medium text-gray-700 mb-2">
              Your reflection
            </label>
            <textarea
              id="reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Take a moment to reflect on your intentions..."
              rows={4}
              className="w-full min-h-[100px] p-3 text-sm leading-relaxed text-gray-900 bg-white border border-gray-300 rounded-lg resize-y focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all"
            />
            {reflection.length < minReflectionLength && (
              <p className="flex items-center mt-2 text-xs text-gray-500 m-0">
                <svg width="16" height="16" fill="none" stroke="#f59e0b" viewBox="0 0 24 24" className="mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Please reflect a bit more ({reflection.length}/{minReflectionLength} characters)
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 border-t border-neutral-200/50 bg-gray-50/50 rounded-b-2xl">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <button
              onClick={() => handleAction('took-break')}
              disabled={!isReflectionValid}
              className={`flex items-center justify-center px-4 py-3 text-sm font-medium text-white rounded-lg transition-all ${
                isReflectionValid 
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Take a Break</span>
            </button>
            <button
              onClick={() => handleAction('continued')}
              disabled={!isReflectionValid}
              className={`flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg border transition-all ${
                isReflectionValid 
                  ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Continue Mindfully</span>
            </button>
            <button
              onClick={() => handleAction('redirected')}
              disabled={!isReflectionValid}
              className={`flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg border transition-all ${
                isReflectionValid 
                  ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 hover:text-gray-700 cursor-pointer' 
                  : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span>Go Elsewhere</span>
            </button>
          </div>
          
          <p className="text-xs text-center text-gray-500 pt-2 m-0">
            This gentle reminder helps you stay aware of your browsing habits
          </p>
        </div>
      </div>
    </div>
  );
};