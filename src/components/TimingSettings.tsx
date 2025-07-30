import React, { useState, useEffect } from 'react';
import { storage } from '../shared/storage';
import { TimingConfig, UserSettings } from '../shared/types';

export const TimingSettings: React.FC = () => {
  const [timingConfig, setTimingConfig] = useState<TimingConfig | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [timing, settings] = await Promise.all([
        storage.getTimingConfig(),
        storage.getUserSettings()
      ]);
      setTimingConfig(timing);
      setUserSettings(settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimingConfig = async (newConfig: TimingConfig) => {
    try {
      await storage.setTimingConfig(newConfig);
      setTimingConfig(newConfig);
    } catch (error) {
      console.error('Failed to update timing config:', error);
    }
  };

  const updateUserSettings = async (updates: Partial<UserSettings>) => {
    if (!userSettings) return;
    
    try {
      const newSettings = { ...userSettings, ...updates };
      await storage.setUserSettings(newSettings);
      setUserSettings(newSettings);
    } catch (error) {
      console.error('Failed to update user settings:', error);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds === 0) return 'Immediate';
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const formatMinutes = (minutes: number) => {
    return minutes < 60 ? `${minutes}min` : `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
  };

  if (isLoading || !timingConfig || !userSettings) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-neutral-600">
          <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">Timing Configuration</h2>
          <p className="text-sm text-neutral-600">Customize when and how often you receive mindful browsing reminders</p>
        </div>

      {/* Initial Delay */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200/50">
          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-neutral-900">Initial Delay</h3>
        </div>
        <p className="text-xs text-neutral-600 mb-3">
          How long to wait before showing the first reminder
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Immediate</span>
            <span className="text-xs font-medium text-primary-600">{formatTime(timingConfig.initialDelay)}</span>
            <span className="text-xs text-neutral-500">5 min</span>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            step="10"
            value={timingConfig.initialDelay}
            onChange={(e) => updateTimingConfig({
              ...timingConfig,
              initialDelay: parseInt(e.target.value)
            })}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
        </div>
      </div>

      {/* Follow-up Intervals */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200/50">
          <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <h3 className="text-sm font-semibold text-neutral-900">Follow-up Intervals</h3>
        </div>
        <p className="text-xs text-neutral-600 mb-3">
          How often to show additional reminders (in minutes)
        </p>
        <div className="space-y-3">
          {timingConfig.intervals.map((interval, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700">Reminder {index + 2}</span>
                <span className="text-xs font-medium text-success-600">{formatMinutes(interval)}</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={interval}
                onChange={(e) => {
                  const newIntervals = [...timingConfig.intervals];
                  newIntervals[index] = parseInt(e.target.value);
                  updateTimingConfig({
                    ...timingConfig,
                    intervals: newIntervals
                  });
                }}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider-thumb-success"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Maximum Interventions */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200/50">
          <svg className="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-sm font-semibold text-neutral-900">Maximum Interventions</h3>
        </div>
        <p className="text-xs text-neutral-600 mb-3">
          Maximum number of reminders per browsing session
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">1</span>
            <span className="text-xs font-medium text-warning-600">{timingConfig.maxInterventions}</span>
            <span className="text-xs text-neutral-500">10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={timingConfig.maxInterventions}
            onChange={(e) => updateTimingConfig({
              ...timingConfig,
              maxInterventions: parseInt(e.target.value)
            })}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider-thumb-warning"
          />
        </div>
      </div>

      {/* Prompt Behavior */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200/50">
          <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-neutral-900">Prompt Behavior</h3>
        </div>
        
        <div className="space-y-4">
          {/* Show Timer Checkbox */}
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={userSettings.promptConfig.showTimer}
              onChange={(e) => updateUserSettings({
                promptConfig: {
                  ...userSettings.promptConfig,
                  showTimer: e.target.checked
                }
              })}
              className="mt-0.5 w-4 h-4 text-primary-600 bg-white border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-neutral-900">Show session timer in reminders</span>
            </div>
          </label>

          {/* Require Reflection Checkbox */}
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={userSettings.promptConfig.requireReflection}
              onChange={(e) => updateUserSettings({
                promptConfig: {
                  ...userSettings.promptConfig,
                  requireReflection: e.target.checked
                }
              })}
              className="mt-0.5 w-4 h-4 text-primary-600 bg-white border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-neutral-900">Require written reflection to continue</span>
            </div>
          </label>

          {/* Minimum Reflection Length */}
          {userSettings.promptConfig.requireReflection && (
            <div className="ml-7 space-y-2 p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700">Minimum reflection length</span>
                <span className="text-xs font-medium text-primary-600">{userSettings.promptConfig.minReflectionLength} characters</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={userSettings.promptConfig.minReflectionLength}
                onChange={(e) => updateUserSettings({
                  promptConfig: {
                    ...userSettings.promptConfig,
                    minReflectionLength: parseInt(e.target.value)
                  }
                })}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </div>
          )}

          {/* Prompt Selection Method */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Prompt selection method</label>
            <select
              value={userSettings.promptConfig.rotationType}
              onChange={(e) => updateUserSettings({
                promptConfig: {
                  ...userSettings.promptConfig,
                  rotationType: e.target.value as 'sequential' | 'random' | 'weighted'
                }
              })}
              className="input text-sm"
            >
              <option value="weighted">Smart (based on effectiveness)</option>
              <option value="sequential">Sequential (least recently used)</option>
              <option value="random">Random</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline Preview */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200/50">
          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <h3 className="text-sm font-semibold text-neutral-900">Timeline Preview</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
            <span className="text-xs text-neutral-700">Visit blacklisted site</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span className="text-xs text-neutral-700">
              First reminder {timingConfig.initialDelay === 0 ? 'appears immediately' : `after ${formatTime(timingConfig.initialDelay)}`}
            </span>
          </div>
          {timingConfig.intervals.slice(0, Math.min(3, timingConfig.maxInterventions - 1)).map((interval, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-xs text-neutral-700">Next reminder after {formatMinutes(interval)} more</span>
            </div>
          ))}
          {timingConfig.maxInterventions > 4 && (
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-neutral-300 rounded-full"></div>
              <span className="text-xs text-neutral-500">... and more as configured</span>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};