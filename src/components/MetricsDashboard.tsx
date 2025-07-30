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
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-neutral-600">
          <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading progress...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-neutral-900">Failed to load metrics</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">Your Progress</h2>
          <p className="text-sm text-neutral-600">Track your mindful browsing journey</p>
        </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Primary Metric - Mindful Sessions */}
        <div className="col-span-2 card p-4 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-primary-900">{metrics.mindfulSessions}</div>
              <div className="text-sm font-medium text-primary-800">Mindful Sessions</div>
              <div className="text-xs text-primary-700">Times you made conscious choices</div>
            </div>
          </div>
        </div>

        {/* Time Reclaimed */}
        <div className="card p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-lg font-bold text-neutral-900">{Math.round(metrics.timeReclaimed)}</div>
          </div>
          <div className="text-xs font-medium text-neutral-700">Minutes Reclaimed</div>
          <div className="text-xs text-neutral-500">Time saved from mindless browsing</div>
        </div>

        {/* Reflections */}
        <div className="card p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="text-lg font-bold text-neutral-900">{metrics.reflectionEntries}</div>
          </div>
          <div className="text-xs font-medium text-neutral-700">Reflections</div>
          <div className="text-xs text-neutral-500">Total moments of self-awareness</div>
        </div>

        {/* Success Rate */}
        <div className="card p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-lg font-bold text-neutral-900">{Math.round(metrics.interventionEffectiveness * 100)}%</div>
          </div>
          <div className="text-xs font-medium text-neutral-700">Success Rate</div>
          <div className="text-xs text-neutral-500">How often reminders help you</div>
        </div>

        {/* Day Streak */}
        <div className="card p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <div className="text-lg font-bold text-neutral-900">{metrics.streakDays}</div>
          </div>
          <div className="text-xs font-medium text-neutral-700">Day Streak</div>
          <div className="text-xs text-neutral-500">Consecutive days of mindful browsing</div>
        </div>
      </div>

      {/* Average Reflection Time */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-700">Average Reflection Time</div>
              <div className="text-xs text-neutral-500">Time spent thinking per prompt</div>
            </div>
          </div>
          <div className="text-xl font-bold text-primary-600">{formatTime(Math.round(metrics.averageReflectionTime))}</div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentEntries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200/50">
            <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-semibold text-neutral-900">Recent Activity</h3>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {recentEntries.map(entry => (
              <div key={entry.id} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                <div className="text-lg">{getActionIcon(entry.action)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-neutral-900 truncate">{entry.domain}</span>
                    <span className="text-xs text-neutral-500">•</span>
                    <span className="text-xs text-neutral-600">{getActionLabel(entry.action)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-500">{formatDate(entry.timestamp)}</div>
                    {entry.response && (
                      <div className="text-xs text-neutral-600 italic truncate">
                        "{entry.response.substring(0, 60)}{entry.response.length > 60 ? '...' : ''}"
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs font-medium text-neutral-500 whitespace-nowrap">
                  {formatTime(entry.sessionDuration)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="space-y-3 pt-2 border-t border-neutral-200/50">
        <div className="p-4 bg-success-50 rounded-lg border border-success-200/50">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-success-600 mt-0.5">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-xs text-success-700">
              Every moment of awareness is progress. Keep up the mindful browsing!
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            loadData();
            onUpdate();
          }}
          className="btn-outline w-full flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Data</span>
        </button>
      </div>
      </div>
    </div>
  );
};