export const DEFAULT_TIMING_CONFIG = {
  initialDelay: 0, // 0 seconds - show immediately
  intervals: [10, 30, 60], // 10, 30, 60 minutes
  maxInterventions: 4,
};

export const DEFAULT_PROMPTS = [
  {
    id: "intention-1",
    text: "What were you hoping to accomplish when you came here?",
    category: "intention" as const,
    weight: 1,
    effectiveness: 0,
    createdAt: new Date(),
    lastUsed: new Date(0),
  },
  {
    id: "awareness-1",
    text: "How are you feeling right now? What emotions brought you here?",
    category: "awareness" as const,
    weight: 1,
    effectiveness: 0,
    createdAt: new Date(),
    lastUsed: new Date(0),
  },
  {
    id: "purpose-1",
    text: "Is this activity serving your current goals?",
    category: "purpose" as const,
    weight: 1,
    effectiveness: 0,
    createdAt: new Date(),
    lastUsed: new Date(0),
  },
  {
    id: "alternative-1",
    text: "What's one thing you could do instead that would feel more fulfilling?",
    category: "alternative" as const,
    weight: 1,
    effectiveness: 0,
    createdAt: new Date(),
    lastUsed: new Date(0),
  },
  {
    id: "time-check-1",
    text: "You've been here for a while. How does that align with your intentions?",
    category: "awareness" as const,
    weight: 1,
    effectiveness: 0,
    createdAt: new Date(),
    lastUsed: new Date(0),
  },
  {
    id: "mindfulness-1",
    text: "Take a deep breath. What do you really need right now?",
    category: "awareness" as const,
    weight: 1,
    effectiveness: 0,
    createdAt: new Date(),
    lastUsed: new Date(0),
  },
  {
    id: "values-1",
    text: "What would the person you want to become do in this moment?",
    category: "purpose" as const,
    weight: 1,
    effectiveness: 0,
    createdAt: new Date(),
    lastUsed: new Date(0),
  },
  {
    id: "future-self-1",
    text: "How will you feel about this time spent when you look back tonight?",
    category: "purpose" as const,
    weight: 1,
    effectiveness: 0,
    createdAt: new Date(),
    lastUsed: new Date(0),
  },
];

export const DEFAULT_BLACKLIST = ["www.baidu.com"];

export const DEFAULT_USER_SETTINGS = {
  timingConfig: DEFAULT_TIMING_CONFIG,
  promptConfig: {
    rotationType: "weighted" as const,
    showTimer: true,
    requireReflection: true,
    minReflectionLength: 10,
  },
  appearance: {
    theme: "auto" as const,
    modalSize: "standard" as const,
    animationSpeed: "normal" as const,
  },
  privacy: {
    saveReflections: true,
    dataRetentionDays: 30,
  },
};

export const DEFAULT_SUCCESS_METRICS = {
  mindfulSessions: 0,
  reflectionEntries: 0,
  timeReclaimed: 0,
  streakDays: 0,
  interventionEffectiveness: 0,
  averageReflectionTime: 0,
  mostEffectivePrompts: [],
};
