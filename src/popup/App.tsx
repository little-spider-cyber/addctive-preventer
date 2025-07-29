import { useState, useEffect } from 'react';
import { BlacklistManager } from '../components/BlacklistManager';
import { PromptEditor } from '../components/PromptEditor';
import { TimingSettings } from '../components/TimingSettings';
import { MetricsDashboard } from '../components/MetricsDashboard';
import { storage } from '../shared/storage';
import { SuccessMetrics } from '../shared/types';
import './App.css';

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
    { id: 'blacklist' as Tab, label: 'Websites', icon: '🌐' },
    { id: 'prompts' as Tab, label: 'Prompts', icon: '💭' },
    { id: 'timing' as Tab, label: 'Timing', icon: '⏱️' },
    { id: 'metrics' as Tab, label: 'Progress', icon: '📊' }
  ];

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1>🧘 Mindful Browsing</h1>
        {metrics && (
          <div className="quick-stats">
            <span className="stat">
              🎯 {metrics.mindfulSessions} mindful sessions
            </span>
            <span className="stat">
              ⏰ {Math.round(metrics.timeReclaimed)}min reclaimed
            </span>
          </div>
        )}
      </div>

      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        <div className={`tab-panel ${activeTab === 'blacklist' ? 'active' : 'hidden'}`}>
          <BlacklistManager />
        </div>
        <div className={`tab-panel ${activeTab === 'prompts' ? 'active' : 'hidden'}`}>
          <PromptEditor />
        </div>
        <div className={`tab-panel ${activeTab === 'timing' ? 'active' : 'hidden'}`}>
          <TimingSettings />
        </div>
        <div className={`tab-panel ${activeTab === 'metrics' ? 'active' : 'hidden'}`}>
          <MetricsDashboard onUpdate={loadMetrics} />
        </div>
      </div>
    </div>
  );
}
