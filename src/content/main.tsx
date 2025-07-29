import React from 'react'
import ReactDOM from 'react-dom/client'
import { InterventionModal } from '../components/InterventionModal'
import { storage } from '../shared/storage'
import { ReflectionEntry } from '../shared/types'

class ContentScriptManager {
  private sessionStart: number = Date.now();
  private interventionCount: number = 0;
  private currentDomain: string;
  private timers: number[] = [];
  private modalRoot: HTMLElement | null = null;
  private reactRoot: ReactDOM.Root | null = null;

  constructor() {
    this.currentDomain = window.location.hostname;
    // Small delay to ensure page is fully loaded
    setTimeout(() => this.initialize(), 100);
  }

  private async initialize() {
    try {
      // Initialize storage
      await storage.initialize();
      
      // Check if current domain is blacklisted
      const isBlacklisted = await storage.isBlacklisted(this.currentDomain);
      const blacklist = await storage.getBlacklist();
      
      console.log('[Mindful Browsing] Domain:', this.currentDomain);
      console.log('[Mindful Browsing] Blacklist:', blacklist);
      console.log('[Mindful Browsing] Is blacklisted:', isBlacklisted);
      
      if (isBlacklisted) {
        console.log('[Mindful Browsing] Starting monitoring for', this.currentDomain);
        this.startMonitoring();
      }
    } catch (error) {
      console.error('Failed to initialize content script:', error);
    }
  }

  private async startMonitoring() {
    try {
      const timingConfig = await storage.getTimingConfig();
      console.log('[Mindful Browsing] Timing config:', timingConfig);
      
      // Set initial delay timer (0 means immediate)
      if (timingConfig.initialDelay === 0) {
        console.log('[Mindful Browsing] Showing immediate intervention');
        this.showIntervention();
      } else {
        console.log('[Mindful Browsing] Setting timer for', timingConfig.initialDelay, 'seconds');
        const initialTimer = window.setTimeout(() => {
          this.showIntervention();
        }, timingConfig.initialDelay * 1000);
        
        this.timers.push(initialTimer);
      }
      
      // Set interval timers
      timingConfig.intervals.forEach((_, index) => {
        if (index < timingConfig.maxInterventions - 1) {
          const timer = window.setTimeout(() => {
            this.showIntervention();
          }, (timingConfig.initialDelay + this.sumIntervals(timingConfig.intervals.slice(0, index + 1))) * 1000);
          
          this.timers.push(timer);
        }
      });
      
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  }

  private sumIntervals(intervals: number[]): number {
    return intervals.reduce((sum, interval) => sum + (interval * 60), 0);
  }

  private showIntervention() {
    try {
      console.log('[Mindful Browsing] Showing intervention #', this.interventionCount + 1);
      
      if (this.interventionCount >= 4) {
        console.log('[Mindful Browsing] Max interventions reached');
        return;
      }
      
      this.interventionCount++;
      
      if (!this.modalRoot) {
        this.modalRoot = document.createElement('div');
        this.modalRoot.id = 'addiction-preventer-modal';
        this.modalRoot.style.position = 'fixed';
        this.modalRoot.style.top = '0';
        this.modalRoot.style.left = '0';
        this.modalRoot.style.zIndex = '999999';
        document.body.appendChild(this.modalRoot);
        console.log('[Mindful Browsing] Created modal container');
      }

      if (!this.reactRoot) {
        this.reactRoot = ReactDOM.createRoot(this.modalRoot);
        console.log('[Mindful Browsing] Created React root');
      }

      const sessionDuration = Math.floor((Date.now() - this.sessionStart) / 1000);
      console.log('[Mindful Browsing] Session duration:', sessionDuration, 'seconds');

      this.reactRoot.render(
        React.createElement(InterventionModal, {
          domain: this.currentDomain,
          sessionDuration: sessionDuration,
          onReflect: this.handleReflection.bind(this),
          onClose: this.hideIntervention.bind(this)
        })
      );
      
      console.log('[Mindful Browsing] Modal rendered');
    } catch (error) {
      console.error('[Mindful Browsing] Error showing intervention:', error);
    }
  }

  private async handleReflection(entry: Omit<ReflectionEntry, 'id' | 'timestamp'>) {
    try {
      await storage.addReflectionEntry(entry);
      
      if (entry.action === 'redirected' || entry.action === 'took-break') {
        this.clearTimers();
      }
    } catch (error) {
      console.error('Failed to save reflection:', error);
    }
  }

  private hideIntervention() {
    if (this.reactRoot && this.modalRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
      this.modalRoot.remove();
      this.modalRoot = null;
    }
  }

  private clearTimers() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  public cleanup() {
    this.clearTimers();
    this.hideIntervention();
  }
}

let contentManager = new ContentScriptManager();

window.addEventListener('beforeunload', () => {
  contentManager.cleanup();
});

let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log('[Mindful Browsing] URL changed from', lastUrl, 'to', currentUrl);
    contentManager.cleanup();
    setTimeout(() => {
      console.log('[Mindful Browsing] Reinitializing for new URL');
      contentManager = new ContentScriptManager();
    }, 1000);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
