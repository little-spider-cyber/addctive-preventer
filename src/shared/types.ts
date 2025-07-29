export interface TimingConfig {
  initialDelay: number;        // seconds
  intervals: number[];         // minutes
  maxInterventions: number;
}

export interface CustomPrompt {
  id: string;
  text: string;
  category: 'intention' | 'awareness' | 'purpose' | 'alternative' | 'custom';
  weight: number;
  effectiveness: number;
  createdAt: Date;
  lastUsed: Date;
}

export interface ReflectionEntry {
  id: string;
  timestamp: Date;
  domain: string;
  prompt: string;
  response: string;
  responseTime: number;        // seconds
  action: 'continued' | 'redirected' | 'took-break';
  sessionDuration: number;     // seconds on site before intervention
}

export interface SuccessMetrics {
  mindfulSessions: number;
  reflectionEntries: number;
  timeReclaimed: number;       // minutes
  streakDays: number;
  interventionEffectiveness: number; // percentage
  averageReflectionTime: number;     // seconds
  mostEffectivePrompts: string[];
}

export interface UserSettings {
  timingConfig: TimingConfig;
  promptConfig: {
    rotationType: 'sequential' | 'random' | 'weighted';
    showTimer: boolean;
    requireReflection: boolean;
    minReflectionLength: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    modalSize: 'compact' | 'standard' | 'large';
    animationSpeed: 'slow' | 'normal' | 'fast';
  };
  privacy: {
    saveReflections: boolean;
    dataRetentionDays: number;
  };
}

export interface StorageSchema {
  blacklist: string[];
  timingConfig: TimingConfig;
  customPrompts: CustomPrompt[];
  reflectionEntries: ReflectionEntry[];
  successMetrics: SuccessMetrics;
  userSettings: UserSettings;
}

export interface InterventionModalProps {
  domain: string;
  sessionDuration: number;
  onReflect: (entry: Omit<ReflectionEntry, 'id' | 'timestamp'>) => void;
  onClose: () => void;
}

export type InterventionAction = 'continued' | 'redirected' | 'took-break';