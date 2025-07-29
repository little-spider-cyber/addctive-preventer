# Addictive Behavior Prevention App Specification

## Overview

A Chrome extension that helps users recognize and interrupt addictive browsing patterns through gentle, reflective interventions and customizable prompts.

## Current Architecture

- **Platform**: Chrome Extension (Manifest V3)
- **Tech Stack**: React + TypeScript + Vite + CRXJS
- **Structure**: Popup UI, Content Scripts, Background processes

## Core Features (Phase 1)

### 1. Gentle Intervention System

- **Approach**: Non-intrusive, supportive rather than blocking
- **Visual**: Soft, calming center modal with rounded corners and gentle animations
- **Tone**: Encouraging and reflective, not punitive
- **Dismissal**: Requires conscious interaction, not easily dismissed

### 2. Customizable Timing System

```typescript
interface TimingConfig {
  initialDelay: number; // Default: 30 seconds (gentle entry)
  intervals: number[]; // Default: [10, 30, 60] minutes
  maxInterventions: number; // Default: 4 per session
}
```

### 3. Reflective Journaling Prompts (Fully Customizable)

**Default Prompt Categories:**

- **Intention**: "What were you hoping to accomplish when you came here?"
- **Awareness**: "How are you feeling right now? What emotions brought you here?"
- **Purpose**: "Is this activity serving your current goals?"
- **Alternative**: "What's one thing you could do instead that would feel more fulfilling?"
- **Time Check**: "You've been here for X minutes. How does that align with your intentions?"
- **Mindfulness**: "Take a deep breath. What do you really need right now?"
- **Values**: "What would the person you want to become do in this moment?"
- **Future Self**: "How will you feel about this time spent when you look back tonight?"

**Customization Features:**

- Add unlimited personal prompts
- Edit existing prompts with rich text
- Set prompt rotation patterns (sequential, random, weighted)
- Import/export prompt collections
- Categorize prompts by mood/context

### 4. Website Blacklist Management

- **Initial Default**: `www.baidu.com`
- **Configuration**: Simple domain-based matching
- **UI**: Easy add/remove interface in popup
- **Advanced**: Subdomain handling, wildcard support
- **Persistence**: Chrome storage API for cross-session data

### 5. Success Metrics Dashboard

```typescript
interface SuccessMetrics {
  mindfulSessions: number; // Times user acknowledged and left
  reflectionEntries: number; // Completed journal responses
  timeReclaimed: number; // Minutes saved vs baseline
  streakDays: number; // Consecutive days of mindful usage
  interventionEffectiveness: number; // % of successful redirections
  averageReflectionTime: number; // Time spent on prompts
  mostEffectivePrompts: string[]; // Which prompts lead to redirection
}
```

## Technical Implementation

### Extension Structure

```
src/
├── popup/           # Settings UI and metrics dashboard
├── content/         # Site detection and intervention overlays
├── background/      # Timer management and data persistence
├── shared/          # Common utilities, types, and storage
└── components/      # Reusable UI components
```

### Key Components

#### 1. InterventionModal Component

```typescript
interface InterventionModal {
  style: "gentle-center";
  animation: "fade-in-scale";
  dismissible: false;
  components: {
    prompt: CustomizablePrompt;
    textArea: ReflectionInput;
    timer: OptionalTimeDisplay;
    actions: ["reflect-and-continue", "take-break", "leave-site"];
  };
  theme: {
    colors: "warm-neutral";
    typography: "readable-calm";
    spacing: "generous";
  };
}
```

#### 2. Settings Panel Sections

1. **Blacklist Management**: Add/remove domains with preview
2. **Timing Configuration**: Visual slider for interval customization
3. **Prompt Library**: Rich editor for custom questions with categories
4. **Metrics & Goals**: Progress visualization and goal setting
5. **Appearance**: Modal styling and animation preferences

#### 3. Storage Manager

```typescript
interface StorageSchema {
  blacklist: string[];
  timingConfig: TimingConfig;
  customPrompts: CustomPrompt[];
  reflectionEntries: ReflectionEntry[];
  successMetrics: SuccessMetrics;
  userSettings: UserSettings;
}
```

### Data Models

#### ReflectionEntry

```typescript
interface ReflectionEntry {
  id: string;
  timestamp: Date;
  domain: string;
  prompt: string;
  response: string;
  responseTime: number; // Seconds spent reflecting
  action: "continued" | "redirected" | "took-break";
  sessionDuration: number; // Total time on site before intervention
}
```

#### CustomPrompt

```typescript
interface CustomPrompt {
  id: string;
  text: string;
  category: "intention" | "awareness" | "purpose" | "alternative" | "custom";
  weight: number; // For weighted random selection
  effectiveness: number; // Calculated success rate
  createdAt: Date;
  lastUsed: Date;
}
```

#### UserSettings

```typescript
interface UserSettings {
  timingConfig: TimingConfig;
  promptConfig: {
    rotationType: "sequential" | "random" | "weighted";
    showTimer: boolean;
    requireReflection: boolean; // Must type something to continue
    minReflectionLength: number;
  };
  appearance: {
    theme: "light" | "dark" | "auto";
    modalSize: "compact" | "standard" | "large";
    animationSpeed: "slow" | "normal" | "fast";
  };
  privacy: {
    saveReflections: boolean;
    dataRetentionDays: number;
  };
}
```

## User Experience Flow

### First Time Setup

1. Welcome screen explaining gentle approach
2. Add first blacklisted site (default: www.baidu.com)
3. Customize initial timing preferences
4. Review default prompts and add personal ones
5. Set initial goals/intentions

### Daily Usage

1. User visits blacklisted site
2. After 30s, gentle modal appears with contextual prompt
3. User reflects and chooses action
4. Modal gracefully fades away
5. Subsequent interventions at customized intervals
6. Daily summary available in popup

### Settings Management

1. One-click access to all configuration
2. Visual feedback for changes
3. Import/export settings for backup
4. Reset to defaults option

## Privacy & Security

- All data stored locally in Chrome storage
- No external data transmission
- Optional reflection saving (user controlled)
- Configurable data retention periods
- Full data export/deletion capabilities
- Minimal required permissions

## Future Expansion Possibilities

### Phase 2: Enhanced Intelligence

- Smart prompt selection based on effectiveness
- Time-of-day awareness for different intervention styles
- Mood pattern recognition
- Integration with productivity tools

### Phase 3: Community Features

- Anonymous prompt sharing
- Success story sharing
- Accountability partnerships
- Guided reflection programs

### Phase 4: Cross-Platform

- Mobile companion app
- Desktop application
- Cross-device synchronization
- API for third-party integrations

## Success Criteria

- User reports increased awareness of browsing habits
- Measurable reduction in time spent on blacklisted sites
- High user engagement with reflection prompts
- Positive emotional response to interventions
- Sustained usage over time (not abandoned due to annoyance)
