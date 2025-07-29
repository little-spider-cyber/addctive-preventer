import React, { useState, useEffect } from 'react';
import { storage } from '../shared/storage';

export const BlacklistManager: React.FC = () => {
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBlacklist();
  }, []);

  const loadBlacklist = async () => {
    try {
      const domains = await storage.getBlacklist();
      setBlacklist(domains);
    } catch (error) {
      console.error('Failed to load blacklist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addDomain = async () => {
    if (!newDomain.trim()) return;
    
    const domain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '');
    
    try {
      await storage.addToBlacklist(domain);
      setBlacklist([...blacklist, domain]);
      setNewDomain('');
    } catch (error) {
      console.error('Failed to add domain:', error);
    }
  };

  const removeDomain = async (domain: string) => {
    try {
      await storage.removeFromBlacklist(domain);
      setBlacklist(blacklist.filter(d => d !== domain));
    } catch (error) {
      console.error('Failed to remove domain:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addDomain();
    }
  };

  if (isLoading) {
    return <div className="loading">Loading websites...</div>;
  }

  return (
    <div className="blacklist-manager">
      <div className="section-header">
        <h2>Monitored Websites</h2>
        <p>Add websites where you want mindful browsing reminders</p>
      </div>

      <div className="add-domain-section">
        <div className="input-group">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter domain (e.g., reddit.com)"
            className="domain-input"
          />
          <button 
            onClick={addDomain}
            disabled={!newDomain.trim()}
            className="add-button"
          >
            Add
          </button>
        </div>
        <div className="input-hint">
          Enter just the domain name without http:// or www.
        </div>
      </div>

      <div className="domains-list">
        {blacklist.length === 0 ? (
          <div className="empty-state">
            <p>No websites added yet</p>
            <p>Add your first website above to start mindful browsing</p>
          </div>
        ) : (
          blacklist.map(domain => (
            <div key={domain} className="domain-item">
              <div className="domain-info">
                <span className="domain-name">{domain}</span>
                <span className="domain-preview">https://{domain}</span>
              </div>
              <button
                onClick={() => removeDomain(domain)}
                className="remove-button"
                aria-label={`Remove ${domain}`}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="section-footer">
        <p className="footer-note">
          💡 Tip: You can add subdomains like <code>old.reddit.com</code> for more specific targeting
        </p>
      </div>
    </div>
  );
};