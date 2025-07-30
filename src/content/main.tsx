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
    console.log('[Mindful Browsing] ContentScriptManager constructor called for:', this.currentDomain);
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('[Mindful Browsing] DOM loaded, initializing...');
        setTimeout(() => this.initialize(), 100);
      });
    } else {
      console.log('[Mindful Browsing] DOM already ready, initializing...');
      setTimeout(() => this.initialize(), 100);
    }
  }

  private async initialize() {
    try {
      console.log('[Mindful Browsing] Initializing content script...');
      
      // Initialize storage
      await storage.initialize();
      console.log('[Mindful Browsing] Storage initialized');
      
      // Check if current domain is blacklisted
      const isBlacklisted = await storage.isBlacklisted(this.currentDomain);
      const blacklist = await storage.getBlacklist();
      const timingConfig = await storage.getTimingConfig();
      
      console.log('[Mindful Browsing] Domain:', this.currentDomain);
      console.log('[Mindful Browsing] Blacklist:', blacklist);
      console.log('[Mindful Browsing] Is blacklisted:', isBlacklisted);
      console.log('[Mindful Browsing] Timing config:', timingConfig);
      
      if (isBlacklisted) {
        console.log('[Mindful Browsing] Starting monitoring for', this.currentDomain);
        this.startMonitoring();
      } else {
        console.log('[Mindful Browsing] Domain not blacklisted, no monitoring started');
      }
    } catch (error) {
      console.error('[Mindful Browsing] Failed to initialize content script:', error);
    }
  }

  private async startMonitoring() {
    try {
      const timingConfig = await storage.getTimingConfig();
      console.log('[Mindful Browsing] Starting monitoring with config:', timingConfig);
      
      // Clear any existing timers
      this.clearTimers();
      this.interventionCount = 0;
      
      // Set initial delay timer (0 means immediate)
      if (timingConfig.initialDelay === 0) {
        console.log('[Mindful Browsing] Showing immediate intervention');
        // Use setTimeout with 0 to ensure it runs after current call stack
        setTimeout(() => {
          this.showIntervention();
        }, 0);
      } else {
        console.log('[Mindful Browsing] Setting timer for', timingConfig.initialDelay, 'seconds');
        const initialTimer = window.setTimeout(() => {
          console.log('[Mindful Browsing] Initial timer triggered');
          this.showIntervention();
        }, timingConfig.initialDelay * 1000);
        
        this.timers.push(initialTimer);
      }
      
      // Set interval timers
      timingConfig.intervals.forEach((_, index) => {
        if (index < timingConfig.maxInterventions - 1) {
          const delay = timingConfig.initialDelay + this.sumIntervals(timingConfig.intervals.slice(0, index + 1));
          console.log('[Mindful Browsing] Setting follow-up timer #', (index + 2), 'for', delay, 'seconds');
          
          const timer = window.setTimeout(() => {
            console.log('[Mindful Browsing] Follow-up timer #', (index + 2), 'triggered');
            this.showIntervention();
          }, delay * 1000);
          
          this.timers.push(timer);
        }
      });
      
      console.log('[Mindful Browsing] Set', this.timers.length, 'timers');
      
    } catch (error) {
      console.error('[Mindful Browsing] Failed to start monitoring:', error);
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
      
      // Clean up any existing modal first
      this.hideIntervention();
      
      console.log('[Mindful Browsing] Creating modal container...');
      this.modalRoot = document.createElement('div');
      this.modalRoot.id = 'addiction-preventer-modal';
      this.modalRoot.style.position = 'fixed';
      this.modalRoot.style.top = '0';
      this.modalRoot.style.left = '0';
      this.modalRoot.style.width = '100vw';
      this.modalRoot.style.height = '100vh';
      this.modalRoot.style.zIndex = '999999';
      this.modalRoot.style.pointerEvents = 'auto';
      
      // Ensure we can append to body
      if (!document.body) {
        console.error('[Mindful Browsing] Document body not available');
        return;
      }
      
      document.body.appendChild(this.modalRoot);
      console.log('[Mindful Browsing] Modal container appended to body');

      console.log('[Mindful Browsing] Creating React root...');
      this.reactRoot = ReactDOM.createRoot(this.modalRoot);
      console.log('[Mindful Browsing] React root created');

      const sessionDuration = Math.floor((Date.now() - this.sessionStart) / 1000);
      console.log('[Mindful Browsing] Session duration:', sessionDuration, 'seconds');

      const modalProps = {
        domain: this.currentDomain,
        sessionDuration: sessionDuration,
        onReflect: this.handleReflection.bind(this),
        onClose: this.hideIntervention.bind(this)
      };
      
      console.log('[Mindful Browsing] Modal props:', modalProps);
      console.log('[Mindful Browsing] Rendering React element...');

      this.reactRoot.render(
        React.createElement(InterventionModal, modalProps)
      );
      
      console.log('[Mindful Browsing] Modal rendered successfully');
      
      // Double check that the modal is in the DOM
      setTimeout(() => {
        const modalElement = document.getElementById('addiction-preventer-modal');
        console.log('[Mindful Browsing] Modal element in DOM:', modalElement);
        if (modalElement) {
          console.log('[Mindful Browsing] Modal element children:', modalElement.children.length);
          console.log('[Mindful Browsing] Modal element HTML:', modalElement.innerHTML.substring(0, 200));
        }
      }, 100);
      
    } catch (error) {
      console.error('[Mindful Browsing] Error showing intervention:', error);
      if (error instanceof Error) {
        console.error('[Mindful Browsing] Error stack:', error.stack);
      }
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
    try {
      console.log('[Mindful Browsing] Hiding intervention...');
      
      if (this.reactRoot) {
        console.log('[Mindful Browsing] Unmounting React root');
        this.reactRoot.unmount();
        this.reactRoot = null;
      }
      
      if (this.modalRoot) {
        console.log('[Mindful Browsing] Removing modal root from DOM');
        this.modalRoot.remove();
        this.modalRoot = null;
      }
      
      // Also remove any existing modal by ID as fallback
      const existingModal = document.getElementById('addiction-preventer-modal');
      if (existingModal) {
        console.log('[Mindful Browsing] Removing existing modal by ID');
        existingModal.remove();
      }
      
      console.log('[Mindful Browsing] Intervention hidden');
    } catch (error) {
      console.error('[Mindful Browsing] Error hiding intervention:', error);
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
