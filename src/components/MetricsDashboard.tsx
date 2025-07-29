import React, { useState, useEffect } from 'react';
import { storage } from '../shared/storage';
import { SuccessMetrics, ReflectionEntry } from '../shared/types';

interface MetricsDashboardProps {
  onUpdate: () => void;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ onUpdate }) => {
  const [metrics, setMetrics] = useState<SuccessMetrics | null>(null);
  const [recentEntries, setRecentEntries] = useState<ReflectionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metricsData, entries] = await Promise.all([
        storage.getSuccessMetrics(),
        storage.getReflectionEntries()
      ]);
      
      setMetrics(metricsData);
      setRecentEntries(entries.slice(-10).reverse()); // Last 10 entries
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'redirected': return '🚀';
      case 'took-break': return '☕';
      case 'continued': return '👁️';
      default: return '📝';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'redirected': return 'Left site';
      case 'took-break': return 'Took break';
      case 'continued': return 'Continued mindfully';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return <div className="loading">Loading progress...</div>;
  }

  if (!metrics) {
    return <div className="error">Failed to load metrics</div>;
  }

  return (
    <div className="metrics-dashboard">
      <div className="section-header">
        <h2>Your Progress</h2>
        <p>Track your mindful browsing journey</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.mindfulSessions}</div>
            <div className="metric-label">Mindful Sessions</div>
            <div className="metric-description">Times you made conscious choices</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏰</div>
          <div className="metric-content">
            <div className="metric-value">{Math.round(metrics.timeReclaimed)}</div>
            <div className="metric-label">Minutes Reclaimed</div>
            <div className="metric-description">Time saved from mindless browsing</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💭</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.reflectionEntries}</div>
            <div className="metric-label">Reflections</div>
            <div className="metric-description">Total moments of self-awareness</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-value">{Math.round(metrics.interventionEffectiveness * 100)}%</div>
            <div className="metric-label">Success Rate</div>
            <div className="metric-description">How often reminders help you</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔥</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.streakDays}</div>
            <div className="metric-label">Day Streak</div>
            <div className="metric-description">Consecutive days of mindful browsing</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <div className="metric-value">{formatTime(Math.round(metrics.averageReflectionTime))}</div>
            <div className="metric-label">Avg. Reflection</div>
            <div className="metric-description">Time spent thinking per prompt</div>
          </div>
        </div>
      </div>

      {recentEntries.length > 0 && (
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentEntries.map(entry => (
              <div key={entry.id} className="activity-item">
                <div className="activity-icon">
                  {getActionIcon(entry.action)}
                </div>
                <div className="activity-content">
                  <div className="activity-main">
                    <span className="activity-domain">{entry.domain}</span>
                    <span className="activity-action">{getActionLabel(entry.action)}</span>
                  </div>
                  <div className="activity-meta">
                    <span className="activity-time">{formatDate(entry.timestamp)}</span>
                    {entry.response && (
                      <span className="activity-reflection">
                        "{entry.response.substring(0, 50)}{entry.response.length > 50 ? '...' : ''}"
                      </span>
                    )}
                  </div>
                </div>
                <div className="activity-duration">
                  {formatTime(entry.sessionDuration)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section-footer">
        <p className="footer-note">
          🌱 Every moment of awareness is progress. Keep up the mindful browsing!
        </p>
        <button 
          onClick={() => {
            loadData();
            onUpdate();
          }}
          className="refresh-button"
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};