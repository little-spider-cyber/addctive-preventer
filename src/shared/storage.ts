import { 
  StorageSchema, 
  TimingConfig, 
  CustomPrompt, 
  ReflectionEntry, 
  SuccessMetrics, 
  UserSettings 
} from './types';
import { 
  DEFAULT_TIMING_CONFIG, 
  DEFAULT_PROMPTS, 
  DEFAULT_BLACKLIST, 
  DEFAULT_USER_SETTINGS, 
  DEFAULT_SUCCESS_METRICS 
} from './constants';

class StorageManager {
  private async get<K extends keyof StorageSchema>(
    key: K
  ): Promise<StorageSchema[K]> {
    const result = await chrome.storage.local.get(key);
    return result[key];
  }

  private async set<K extends keyof StorageSchema>(
    key: K,
    value: StorageSchema[K]
  ): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }

  // Blacklist management
  async getBlacklist(): Promise<string[]> {
    const blacklist = await this.get("blacklist");
    return blacklist || DEFAULT_BLACKLIST;
  }

  async setBlacklist(blacklist: string[]): Promise<void> {
    await this.set("blacklist", blacklist);
  }

  async addToBlacklist(domain: string): Promise<void> {
    const blacklist = await this.getBlacklist();
    if (!blacklist.includes(domain)) {
      await this.setBlacklist([...blacklist, domain]);
    }
  }

  // Clean up existing blacklist entries to ensure consistent format
  async cleanupBlacklist(): Promise<void> {
    const blacklist = await this.getBlacklist();
    const cleanedList = blacklist
      .map(domain => domain
        .replace(/^https?:\/\//, '')  // Remove protocol
        .replace(/^www\./, '')        // Remove www prefix
        .replace(/\/.*$/, '')         // Remove path and trailing slash
        .toLowerCase()
      )
      .filter(domain => domain.length > 0)  // Remove empty entries
      .filter((domain, index, arr) => arr.indexOf(domain) === index); // Remove duplicates
    
    if (cleanedList.length !== blacklist.length || 
        !cleanedList.every((domain, index) => domain === blacklist[index])) {
      console.log('[Mindful Browsing] Cleaning up blacklist entries');
      await this.setBlacklist(cleanedList);
    }
  }

  async removeFromBlacklist(domain: string): Promise<void> {
    const blacklist = await this.getBlacklist();
    await this.setBlacklist(blacklist.filter((d) => d !== domain));
  }

  // Timing configuration
  async getTimingConfig(): Promise<TimingConfig> {
    const config = await this.get("timingConfig");
    return config || DEFAULT_TIMING_CONFIG;
  }

  async setTimingConfig(config: TimingConfig): Promise<void> {
    await this.set("timingConfig", config);
  }

  // Helper method to ensure dates are properly converted
  private ensureDateObjects(prompt: CustomPrompt): CustomPrompt {
    const createdAt =
      prompt.createdAt instanceof Date
        ? prompt.createdAt
        : new Date(prompt.createdAt || Date.now());
    const lastUsed =
      prompt.lastUsed instanceof Date
        ? prompt.lastUsed
        : new Date(prompt.lastUsed || 0);

    // Check if dates are valid
    if (isNaN(createdAt.getTime())) {
      console.warn(
        "Invalid createdAt date detected, using current date:",
        prompt.createdAt
      );
    }
    if (isNaN(lastUsed.getTime())) {
      console.warn(
        "Invalid lastUsed date detected, using epoch:",
        prompt.lastUsed
      );
    }

    return {
      ...prompt,
      createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
      lastUsed: isNaN(lastUsed.getTime()) ? new Date(0) : lastUsed,
    };
  }

  // Custom prompts
  async getCustomPrompts(): Promise<CustomPrompt[]> {
    const prompts = await this.get("customPrompts");
    const defaultPrompts = prompts || DEFAULT_PROMPTS;

    // Convert date strings back to Date objects safely
    return defaultPrompts.map((prompt) => this.ensureDateObjects(prompt));
  }

  async setCustomPrompts(prompts: CustomPrompt[]): Promise<void> {
    await this.set("customPrompts", prompts);
  }

  async addCustomPrompt(
    prompt: Omit<
      CustomPrompt,
      "id" | "createdAt" | "lastUsed" | "effectiveness"
    >
  ): Promise<void> {
    const prompts = await this.getCustomPrompts();
    const newPrompt: CustomPrompt = {
      ...prompt,
      id: `custom-${Date.now()}`,
      createdAt: new Date(),
      lastUsed: new Date(0),
      effectiveness: 0,
    };
    await this.setCustomPrompts([...prompts, newPrompt]);
  }

  async updatePromptEffectiveness(
    promptId: string,
    wasEffective: boolean
  ): Promise<void> {
    const prompts = await this.getCustomPrompts();
    const updatedPrompts = prompts.map((prompt) => {
      if (prompt.id === promptId) {
        const totalUses = prompt.effectiveness * 10; // Approximate usage count
        const newEffectiveness = wasEffective
          ? (prompt.effectiveness * totalUses + 1) / (totalUses + 1)
          : (prompt.effectiveness * totalUses) / (totalUses + 1);

        return {
          ...prompt,
          effectiveness: Math.max(0, Math.min(1, newEffectiveness)),
          lastUsed: new Date(),
        };
      }
      return prompt;
    });
    await this.setCustomPrompts(updatedPrompts);
  }

  // Helper method to ensure reflection entry dates are properly converted
  private ensureReflectionDateObjects(entry: any): ReflectionEntry {
    const timestamp =
      entry.timestamp instanceof Date
        ? entry.timestamp
        : entry.timestamp
        ? new Date(entry.timestamp)
        : new Date(Date.now());

    // Check if the timestamp is valid
    if (isNaN(timestamp.getTime())) {
      console.warn(
        "Invalid timestamp detected, using current date:",
        entry.timestamp
      );
      return {
        ...entry,
        timestamp: new Date(),
      };
    }

    return {
      ...entry,
      timestamp,
    };
  }

  // Reflection entries
  async getReflectionEntries(): Promise<ReflectionEntry[]> {
    const entries = await this.get("reflectionEntries");
    const defaultEntries = entries || [];

    // Convert date strings back to Date objects safely
    return defaultEntries.map((entry) =>
      this.ensureReflectionDateObjects(entry)
    );
  }

  async addReflectionEntry(
    entry: Omit<ReflectionEntry, "id" | "timestamp">
  ): Promise<void> {
    const entries = await this.getReflectionEntries();
    const newEntry: ReflectionEntry = {
      ...entry,
      id: `reflection-${Date.now()}`,
      timestamp: new Date(),
    };

    // Add new entry
    const updatedEntries = [...entries, newEntry];

    // Clean up old entries based on retention policy
    const settings = await this.getUserSettings();
    const retentionDate = new Date();
    retentionDate.setDate(
      retentionDate.getDate() - settings.privacy.dataRetentionDays
    );

    const filteredEntries = settings.privacy.saveReflections
      ? updatedEntries.filter((e) => e.timestamp > retentionDate)
      : [];

    await this.set("reflectionEntries", filteredEntries);

    // Update prompt effectiveness - find prompt by text since we store the text, not ID
    const wasEffective =
      entry.action === "redirected" || entry.action === "took-break";
    const prompts = await this.getCustomPrompts();
    const matchingPrompt = prompts.find((p) => p.text === entry.prompt);
    if (matchingPrompt) {
      await this.updatePromptEffectiveness(matchingPrompt.id, wasEffective);
    }

    // Update success metrics
    await this.updateSuccessMetrics(newEntry);
  }

  // Success metrics
  async getSuccessMetrics(): Promise<SuccessMetrics> {
    const metrics = await this.get("successMetrics");
    return metrics || DEFAULT_SUCCESS_METRICS;
  }

  private async updateSuccessMetrics(entry: ReflectionEntry): Promise<void> {
    const metrics = await this.getSuccessMetrics();
    const wasEffective =
      entry.action === "redirected" || entry.action === "took-break";

    const updatedMetrics: SuccessMetrics = {
      mindfulSessions: wasEffective
        ? metrics.mindfulSessions + 1
        : metrics.mindfulSessions,
      reflectionEntries: metrics.reflectionEntries + 1,
      timeReclaimed: wasEffective
        ? metrics.timeReclaimed + Math.max(0, entry.sessionDuration / 60 - 5) // Assume 5 min was intended
        : metrics.timeReclaimed,
      streakDays: metrics.streakDays, // Will be calculated separately
      interventionEffectiveness:
        (metrics.interventionEffectiveness * metrics.reflectionEntries +
          (wasEffective ? 1 : 0)) /
        (metrics.reflectionEntries + 1),
      averageReflectionTime:
        (metrics.averageReflectionTime * metrics.reflectionEntries +
          entry.responseTime) /
        (metrics.reflectionEntries + 1),
      mostEffectivePrompts: metrics.mostEffectivePrompts, // Will be updated separately
    };

    await this.set("successMetrics", updatedMetrics);
  }

  // User settings
  async getUserSettings(): Promise<UserSettings> {
    const settings = await this.get("userSettings");
    return settings || DEFAULT_USER_SETTINGS;
  }

  async setUserSettings(settings: UserSettings): Promise<void> {
    await this.set("userSettings", settings);
  }

  async updateUserSettings(updates: Partial<UserSettings>): Promise<void> {
    const current = await this.getUserSettings();
    const updated = { ...current, ...updates };
    await this.setUserSettings(updated);
  }

  // Utility methods
  async isBlacklisted(domain: string): Promise<boolean> {
    const blacklist = await this.getBlacklist();

    return blacklist.some((blocked) => {
      // Exact match
      if (domain === blocked) return true;

      // Remove www. from both for comparison
      const domainWithoutWww = domain.replace(/^www\./, "");
      const blockedWithoutWww = blocked.replace(/^www\./, "");

      // Match without www
      if (domainWithoutWww === blockedWithoutWww) return true;

      // Subdomain matching
      if (domain.endsWith("." + blocked) || blocked.endsWith("." + domain))
        return true;
      if (
        domain.endsWith("." + blockedWithoutWww) ||
        domainWithoutWww.endsWith("." + blocked)
      )
        return true;

      // Wildcard matching
      if (blocked.startsWith("*.") && domain.endsWith(blocked.slice(2)))
        return true;

      return false;
    });
  }

  async selectPrompt(): Promise<CustomPrompt> {
    const prompts = await this.getCustomPrompts();
    const settings = await this.getUserSettings();

    switch (settings.promptConfig.rotationType) {
      case "sequential":
        // Find least recently used
        return prompts.reduce((oldest, current) =>
          current.lastUsed < oldest.lastUsed ? current : oldest
        );

      case "weighted":
        // Weighted random selection based on effectiveness
        const totalWeight = prompts.reduce(
          (sum, p) => sum + (p.effectiveness + 0.1),
          0
        );
        let random = Math.random() * totalWeight;

        for (const prompt of prompts) {
          random -= prompt.effectiveness + 0.1;
          if (random <= 0) return prompt;
        }
        return prompts[0];

      case "random":
      default:
        return prompts[Math.floor(Math.random() * prompts.length)];
    }
  }

  // Clear all storage (for debugging)
  async clearAll(): Promise<void> {
    await chrome.storage.local.clear();
  }

  // Initialize default data
  async initialize(): Promise<void> {
    try {
      const blacklist = await this.get("blacklist");
      if (!blacklist) {
        await this.setBlacklist(DEFAULT_BLACKLIST);
      } else {
        // Clean up existing blacklist entries
        await this.cleanupBlacklist();
      }

      const prompts = await this.get("customPrompts");
      if (!prompts) {
        await this.setCustomPrompts(DEFAULT_PROMPTS);
      }

      const settings = await this.get("userSettings");
      if (!settings) {
        await this.setUserSettings(DEFAULT_USER_SETTINGS);
      }

      const metrics = await this.get("successMetrics");
      if (!metrics) {
        await this.set("successMetrics", DEFAULT_SUCCESS_METRICS);
      }
    } catch (error) {
      console.error("[Mindful Browsing] Storage initialization error:", error);
      // If there's corrupted data, clear and reinitialize
      await this.clearAll();
      await this.setBlacklist(DEFAULT_BLACKLIST);
      await this.setCustomPrompts(DEFAULT_PROMPTS);
      await this.setUserSettings(DEFAULT_USER_SETTINGS);
      await this.set("successMetrics", DEFAULT_SUCCESS_METRICS);
    }
  }
}

export const storage = new StorageManager();