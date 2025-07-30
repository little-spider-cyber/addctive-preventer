import { useState, useEffect } from 'react';
import { BlacklistManager } from '../components/BlacklistManager';
import { PromptEditor } from '../components/PromptEditor';
import { TimingSettings } from '../components/TimingSettings';
import { MetricsDashboard } from '../components/MetricsDashboard';
import { storage } from '../shared/storage';
import { SuccessMetrics } from '../shared/types';

type Tab = 'blacklist' | 'prompts' | 'timing' | 'metrics';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('blacklist');
  const [metrics, setMetrics] = useState<SuccessMetrics | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const metricsData = await storage.getSuccessMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const tabs = [
    { 
      id: 'blacklist' as Tab, 
      label: 'Websites', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      )
    },
    { 
      id: 'prompts' as Tab, 
      label: 'Prompts', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    { 
      id: 'timing' as Tab, 
      label: 'Timing', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'metrics' as Tab, 
      label: 'Progress', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="w-96 h-[32rem] bg-white shadow-xl flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-200/50 bg-gradient-to-r from-primary-50 to-success-50 flex-shrink-0">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-neutral-900">
              Mindful Browsing
            </h1>
          </div>
          {metrics && (
            <div className="flex items-center justify-center space-x-4">
              <div className="badge-primary">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {metrics.mindfulSessions} sessions
              </div>
              <div className="badge-success">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {Math.round(metrics.timeReclaimed)}min saved
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-200/50 bg-neutral-50/50 flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`flex-1 px-2 py-3 text-sm font-medium transition-all duration-200 flex flex-col items-center space-y-1 min-w-0 ${
              activeTab === tab.id
                ? 'text-primary-600 bg-white border-b-2 border-primary-600 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className={`transition-colors duration-200 ${
              activeTab === tab.id ? 'text-primary-600' : 'text-neutral-400'
            }`}>
              {tab.icon}
            </div>
            <span className="text-xs whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 relative overflow-hidden">
        <div className={`absolute inset-0 ${activeTab === 'blacklist' ? 'block' : 'hidden'}`}>
          <BlacklistManager />
        </div>
        <div className={`absolute inset-0 ${activeTab === 'prompts' ? 'block' : 'hidden'}`}>
          <PromptEditor />
        </div>
        <div className={`absolute inset-0 ${activeTab === 'timing' ? 'block' : 'hidden'}`}>
          <TimingSettings />
        </div>
        <div className={`absolute inset-0 ${activeTab === 'metrics' ? 'block' : 'hidden'}`}>
          <MetricsDashboard onUpdate={loadMetrics} />
        </div>
      </div>
    </div>
  );
}
