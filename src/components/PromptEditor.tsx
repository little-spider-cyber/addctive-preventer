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
    return <div className="loading">Loading prompts...</div>;
  }

  return (
    <div className="prompt-editor">
      <div className="section-header">
        <h2>Reflection Prompts</h2>
        <p>Customize the questions that help you reflect on your browsing</p>
      </div>

      <div className="add-prompt-section">
        <div className="category-selector">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as CustomPrompt['category'])}
            className="category-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <textarea
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="Enter your reflection prompt..."
            className="prompt-input"
            rows={3}
          />
          <button 
            onClick={addPrompt}
            disabled={!newPrompt.trim()}
            className="add-button"
          >
            Add Prompt
          </button>
        </div>
      </div>

      <div className="prompts-list">
        {prompts.length === 0 ? (
          <div className="empty-state">
            <p>No custom prompts yet</p>
            <p>Add your first reflection question above</p>
          </div>
        ) : (
          <div className="prompts-grid">
            {categories.map(category => {
              const categoryPrompts = prompts.filter(p => p.category === category.value);
              if (categoryPrompts.length === 0) return null;

              return (
                <div key={category.value} className="category-section">
                  <h3 className="category-title">
                    {category.icon} {category.label}
                  </h3>
                  {categoryPrompts.map(prompt => (
                    <div key={prompt.id} className="prompt-item">
                      <div className="prompt-content">
                        <p className="prompt-text">{prompt.text}</p>
                        <div className="prompt-meta">
                          <span className="effectiveness">
                            {prompt.effectiveness > 0 
                              ? `${Math.round(prompt.effectiveness * 100)}% effective`
                              : 'Not used yet'
                            }
                          </span>
                          {prompt.lastUsed && new Date(prompt.lastUsed).getTime() > 0 && (
                            <span className="last-used">
                              Last used: {new Date(prompt.lastUsed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removePrompt(prompt.id)}
                        className="remove-button"
                        aria-label="Remove prompt"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="section-footer">
        <p className="footer-note">
          💡 Tip: Good prompts are open-ended and encourage honest self-reflection
        </p>
      </div>
    </div>
  );
};