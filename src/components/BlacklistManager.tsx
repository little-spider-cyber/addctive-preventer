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
    
    const domain = newDomain.trim().toLowerCase()
      .replace(/^https?:\/\//, '')  // Remove protocol
      .replace(/^www\./, '')        // Remove www prefix
      .replace(/\/.*$/, '');        // Remove path and trailing slash
    
    // Validate that we have a non-empty domain
    if (!domain) {
      console.error('Invalid domain after processing:', newDomain);
      return;
    }
    
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addDomain();
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-neutral-600">
          <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading websites...</span>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">Monitored Websites</h2>
          <p className="text-sm text-neutral-600">Add websites where you want mindful browsing reminders</p>
        </div>

      {/* Add Domain Section */}
      <div className="space-y-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter URL or domain (e.g., reddit.com or https://reddit.com)"
              className="input text-sm"
            />
          </div>
          <button 
            onClick={addDomain}
            disabled={!newDomain.trim()}
            className="btn-primary px-6 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add</span>
          </button>
        </div>
        <p className="text-xs text-neutral-500 flex items-center">
          <svg className="w-4 h-4 mr-1.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Enter full URL or just domain name. Protocols and paths will be automatically removed.
        </p>
      </div>

      {/* Domains List */}
      <div className="space-y-3">
        {blacklist.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-900">No websites added yet</p>
              <p className="text-xs text-neutral-500">Add your first website above to start mindful browsing</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {blacklist.map(domain => (
              <div key={domain} className="flex items-center justify-between p-4 bg-white rounded-lg border border-neutral-200/50 hover:border-neutral-300 transition-colors duration-200">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <p className="text-sm font-medium text-neutral-900 truncate">{domain}</p>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">https://{domain}</p>
                </div>
                <button
                  onClick={() => removeDomain(domain)}
                  className="ml-3 p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  aria-label={`Remove ${domain}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Tip */}
      {blacklist.length > 0 && (
        <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200/50">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-primary-600 mt-0.5">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-primary-800 mb-1">Pro Tip</p>
              <p className="text-xs text-primary-700">
                You can add subdomains like <code className="px-1.5 py-0.5 bg-primary-100 rounded text-primary-800 font-mono">old.reddit.com</code> for more specific targeting
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};