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
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="timing-settings">
      <div className="section-header">
        <h2>Timing Configuration</h2>
        <p>Customize when and how often you receive mindful browsing reminders</p>
      </div>

      <div className="settings-section">
        <h3>Initial Delay</h3>
        <p className="setting-description">
          How long to wait before showing the first reminder
        </p>
        <div className="range-input-group">
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
            className="range-input"
          />
          <span className="range-value">{formatTime(timingConfig.initialDelay)}</span>
        </div>
      </div>

      <div className="settings-section">
        <h3>Follow-up Intervals</h3>
        <p className="setting-description">
          How often to show additional reminders (in minutes)
        </p>
        {timingConfig.intervals.map((interval, index) => (
          <div key={index} className="interval-setting">
            <label>Reminder {index + 2}:</label>
            <div className="range-input-group">
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
                className="range-input"
              />
              <span className="range-value">{formatMinutes(interval)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="settings-section">
        <h3>Maximum Interventions</h3>
        <p className="setting-description">
          Maximum number of reminders per browsing session
        </p>
        <div className="range-input-group">
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
            className="range-input"
          />
          <span className="range-value">{timingConfig.maxInterventions}</span>
        </div>
      </div>

      <div className="settings-section">
        <h3>Prompt Behavior</h3>
        
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={userSettings.promptConfig.showTimer}
              onChange={(e) => updateUserSettings({
                promptConfig: {
                  ...userSettings.promptConfig,
                  showTimer: e.target.checked
                }
              })}
            />
            Show session timer in reminders
          </label>
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={userSettings.promptConfig.requireReflection}
              onChange={(e) => updateUserSettings({
                promptConfig: {
                  ...userSettings.promptConfig,
                  requireReflection: e.target.checked
                }
              })}
            />
            Require written reflection to continue
          </label>
        </div>

        {userSettings.promptConfig.requireReflection && (
          <div className="sub-setting">
            <label>Minimum reflection length:</label>
            <div className="range-input-group">
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
                className="range-input"
              />
              <span className="range-value">{userSettings.promptConfig.minReflectionLength} characters</span>
            </div>
          </div>
        )}

        <div className="setting-group">
          <label>Prompt selection method:</label>
          <select
            value={userSettings.promptConfig.rotationType}
            onChange={(e) => updateUserSettings({
              promptConfig: {
                ...userSettings.promptConfig,
                rotationType: e.target.value as 'sequential' | 'random' | 'weighted'
              }
            })}
            className="select-input"
          >
            <option value="weighted">Smart (based on effectiveness)</option>
            <option value="sequential">Sequential (least recently used)</option>
            <option value="random">Random</option>
          </select>
        </div>
      </div>

      <div className="settings-preview">
        <h3>Preview</h3>
        <div className="timeline">
          <div className="timeline-item">
            <span className="timeline-dot"></span>
            <span>Visit blacklisted site</span>
          </div>
          <div className="timeline-item">
            <span className="timeline-dot"></span>
            <span>First reminder {timingConfig.initialDelay === 0 ? 'appears immediately' : `after ${formatTime(timingConfig.initialDelay)}`}</span>
          </div>
          {timingConfig.intervals.slice(0, Math.min(3, timingConfig.maxInterventions - 1)).map((interval, index) => (
            <div key={index} className="timeline-item">
              <span className="timeline-dot"></span>
              <span>Next reminder after {formatMinutes(interval)} more</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};