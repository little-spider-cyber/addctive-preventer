import React, { useState, useEffect } from 'react';
import { storage } from '../shared/storage';
import { CustomPrompt } from '../shared/types';

export const PromptEditor: React.FC = () => {
  const [prompts, setPrompts] = useState<CustomPrompt[]>([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CustomPrompt['category']>('custom');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const promptsData = await storage.getCustomPrompts();
      setPrompts(promptsData);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPrompt = async () => {
    if (!newPrompt.trim()) return;

    try {
      await storage.addCustomPrompt({
        text: newPrompt.trim(),
        category: selectedCategory,
        weight: 1
      });
      
      await loadPrompts();
      setNewPrompt('');
    } catch (error) {
      console.error('Failed to add prompt:', error);
    }
  };

  const removePrompt = async (promptId: string) => {
    try {
      const updatedPrompts = prompts.filter(p => p.id !== promptId);
      await storage.setCustomPrompts(updatedPrompts);
      setPrompts(updatedPrompts);
    } catch (error) {
      console.error('Failed to remove prompt:', error);
    }
  };

  const categories = [
    { value: 'intention' as const, label: 'Intention', icon: '🎯' },
    { value: 'awareness' as const, label: 'Awareness', icon: '🧘' },
    { value: 'purpose' as const, label: 'Purpose', icon: '✨' },
    { value: 'alternative' as const, label: 'Alternative', icon: '🔄' },
    { value: 'custom' as const, label: 'Custom', icon: '💭' }
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-neutral-600">
          <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading prompts...</span>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">Reflection Prompts</h2>
          <p className="text-sm text-neutral-600">Customize the questions that help you reflect on your browsing</p>
        </div>

      {/* Add Prompt Section */}
      <div className="space-y-4">
        <div className="space-y-3">
          <label htmlFor="category" className="text-sm font-medium text-neutral-700">Category</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as CustomPrompt['category'])}
            className="input text-sm"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label htmlFor="new-prompt" className="text-sm font-medium text-neutral-700">New Prompt</label>
          <textarea
            id="new-prompt"
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="Enter your reflection prompt..."
            className="textarea min-h-[80px] text-sm"
            rows={3}
          />
          <button 
            onClick={addPrompt}
            disabled={!newPrompt.trim()}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Prompt</span>
          </button>
        </div>
      </div>

      {/* Prompts List */}
      <div className="space-y-4">
        {prompts.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-900">No custom prompts yet</p>
              <p className="text-xs text-neutral-500">Add your first reflection question above</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map(category => {
              const categoryPrompts = prompts.filter(p => p.category === category.value);
              if (categoryPrompts.length === 0) return null;

              return (
                <div key={category.value} className="space-y-3">
                  <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200/50">
                    <span className="text-lg">{category.icon}</span>
                    <h3 className="text-sm font-semibold text-neutral-900">{category.label}</h3>
                    <div className="badge-primary ml-auto">{categoryPrompts.length}</div>
                  </div>
                  <div className="space-y-2">
                    {categoryPrompts.map(prompt => (
                      <div key={prompt.id} className="card p-4">
                        <div className="flex items-start justify-between space-x-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-neutral-900 leading-relaxed mb-3 italic">
                              "{prompt.text}"
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-neutral-500">
                              <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>
                                  {prompt.effectiveness > 0 
                                    ? `${Math.round(prompt.effectiveness * 100)}% effective`
                                    : 'Not used yet'
                                  }
                                </span>
                              </div>
                              {prompt.lastUsed && new Date(prompt.lastUsed).getTime() > 0 && (
                                <div className="flex items-center space-x-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>Last used: {new Date(prompt.lastUsed).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removePrompt(prompt.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                            aria-label="Remove prompt"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Tip */}
      {prompts.length > 0 && (
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
                Good prompts are open-ended and encourage honest self-reflection
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};