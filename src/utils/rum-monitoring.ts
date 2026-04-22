/**
 * Real User Monitoring (RUM) System
 * Tracks user behavior, performance metrics, and engagement patterns
 */

interface RUMEvent {
  type: 'page_view' | 'click' | 'scroll' | 'form_submit' | 'navigation' | 'performance';
  timestamp: number;
  url: string;
  sessionId: string;
  userId?: string;
  data: Record<string, any>;
}

interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domInteractive: number;
  loadComplete: number;
}

interface UserEngagement {
  timeOnPage: number;
  scrollDepth: number;
  clicksCount: number;
  formSubmissions: number;
  navigationEvents: number;
}

class RUMMonitoring {
  private sessionId: string;
  private startTime: number;
  private performanceMetrics: Partial<PerformanceMetrics> = {};
  private engagementMetrics: UserEngagement = {
    timeOnPage: 0,
    scrollDepth: 0,
    clicksCount: 0,
    formSubmissions: 0,
    navigationEvents: 0,
  };
  private isTracking = false;
  private visibilityChangeHandler: () => void;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
    this.initialize();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initialize(): void {
    // Start tracking
    this.isTracking = true;
    
    // Track page view
    this.trackPageView();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
    
    // Setup user interaction tracking
    this.setupInteractionTracking();
    
    // Setup visibility change tracking
    this.setupVisibilityTracking();
    
    // Setup navigation tracking
    this.setupNavigationTracking();
    
    // Setup form tracking
    this.setupFormTracking();
  }

  private trackPageView(): void {
    const event: RUMEvent = {
      type: 'page_view',
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this.sessionId,
      data: {
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        screen: {
          width: screen.width,
          height: screen.height,
        },
        connection: this.getConnectionInfo(),
      },
    };

    this.sendEvent(event);
  }

  private getConnectionInfo(): Record<string, any> {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    
    return { type: 'unknown' };
  }

  private setupPerformanceMonitoring(): void {
    // Use PerformanceObserver for modern metrics
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.performanceMetrics.lcp = lastEntry.startTime;
          
          this.sendEvent({
            type: 'performance',
            timestamp: Date.now(),
            url: window.location.href,
            sessionId: this.sessionId,
            data: {
              metric: 'lcp',
              value: lastEntry.startTime,
            },
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart) {
              this.performanceMetrics.fid = entry.processingStart - entry.startTime;
              
              this.sendEvent({
                type: 'performance',
                timestamp: Date.now(),
                url: window.location.href,
                sessionId: this.sessionId,
                data: {
                  metric: 'fid',
                  value: this.performanceMetrics.fid,
                },
              });
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.performanceMetrics.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance monitoring setup failed:', error);
      }
    }

    // Traditional performance metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.performanceMetrics.ttfb = navigation.responseStart - navigation.requestStart;
          this.performanceMetrics.domInteractive = navigation.domInteractive - navigation.navigationStart;
          this.performanceMetrics.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
        }
      }, 0);
    });
  }

  private setupInteractionTracking(): void {
    // Track clicks
    document.addEventListener('click', (event) => {
      this.engagementMetrics.clicksCount++;
      
      const target = event.target as HTMLElement;
      this.sendEvent({
        type: 'click',
        timestamp: Date.now(),
        url: window.location.href,
        sessionId: this.sessionId,
        data: {
          tagName: target.tagName,
          className: target.className,
          id: target.id,
          textContent: target.textContent?.substring(0, 100),
          coordinates: {
            x: event.clientX,
            y: event.clientY,
          },
        },
      });
    });

    // Track scroll depth
    let maxScroll = 0;
    let scrollTimeout: NodeJS.Timeout;
    
    const trackScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;
        this.engagementMetrics.scrollDepth = maxScroll;
      }

      // Debounce scroll events
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (maxScroll > 0 && maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          this.sendEvent({
            type: 'scroll',
            timestamp: Date.now(),
            url: window.location.href,
            sessionId: this.sessionId,
            data: {
              scrollDepth: maxScroll,
              scrollY: window.scrollY,
              pageHeight: document.documentElement.scrollHeight,
            },
          });
        }
      }, 100);
    };

    window.addEventListener('scroll', trackScroll, { passive: true });
  }

  private setupVisibilityTracking(): void {
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page is hidden, calculate time on page
      this.engagementMetrics.timeOnPage = Date.now() - this.startTime;
    } else {
      // Page is visible again, reset start time
      this.startTime = Date.now();
    }
  }

  private setupNavigationTracking(): void {
    // Track client-side navigation (for SPAs)
    let navigationCount = 0;
    
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      navigationCount++;
      const result = originalPushState.apply(this, args);
      
      // Track navigation event
      setTimeout(() => {
        window.rum?.trackNavigationEvent('pushState', args[0] as string);
      }, 0);
      
      return result;
    };

    history.replaceState = function(...args) {
      navigationCount++;
      const result = originalReplaceState.apply(this, args);
      
      // Track navigation event
      setTimeout(() => {
        window.rum?.trackNavigationEvent('replaceState', args[0] as string);
      }, 0);
      
      return result;
    };

    this.engagementMetrics.navigationEvents = navigationCount;
  }

  private setupFormTracking(): void {
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.engagementMetrics.formSubmissions++;
      
      this.sendEvent({
        type: 'form_submit',
        timestamp: Date.now(),
        url: window.location.href,
        sessionId: this.sessionId,
        data: {
          formId: form.id,
          formClass: form.className,
          formAction: form.action,
          formMethod: form.method,
          fieldCount: form.elements.length,
        },
      });
    });
  }

  public trackNavigationEvent(type: string, url?: string): void {
    this.sendEvent({
      type: 'navigation',
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this.sessionId,
      data: {
        navigationType: type,
        targetUrl: url,
      },
    });
  }

  private sendEvent(event: RUMEvent): void {
    // Send to Plausible if available
    if (window.plausible) {
      window.plausible(`RUM: ${event.type}`, {
        props: {
          sessionId: this.sessionId,
          url: event.url,
          ...event.data,
        }
      });
    }

    // In production, send to RUM service
    if (this.isProduction()) {
      this.sendToRUMService(event);
    }

    // Store in local storage for debugging
    if (this.isDebugMode()) {
      this.storeEvent(event);
    }
  }

  private sendToRUMService(event: RUMEvent): void {
    // Example: Send to custom RUM endpoint
    /*
    fetch('/api/rum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(err => {
      console.warn('Failed to send RUM event:', err);
    });
    */
  }

  private storeEvent(event: RUMEvent): void {
    const events = JSON.parse(localStorage.getItem('rum_events') || '[]');
    events.push(event);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('rum_events', JSON.stringify(events));
  }

  private isProduction(): boolean {
    return window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1' &&
           !window.location.hostname.includes('dev');
  }

  private isDebugMode(): boolean {
    return localStorage.getItem('rum-debug') === 'true' || 
           new URLSearchParams(window.location.search).has('rum-debug');
  }

  // Public API
  public getSessionId(): string {
    return this.sessionId;
  }

  public getPerformanceMetrics(): Partial<PerformanceMetrics> {
    return { ...this.performanceMetrics };
  }

  public getEngagementMetrics(): UserEngagement {
    return { ...this.engagementMetrics };
  }

  public getCurrentSessionTime(): number {
    return Date.now() - this.startTime;
  }

  public destroy(): void {
    this.isTracking = false;
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    
    // Send final engagement metrics
    this.engagementMetrics.timeOnPage = this.getCurrentSessionTime();
    
    this.sendEvent({
      type: 'page_view',
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this.sessionId,
      data: {
        finalEngagement: this.engagementMetrics,
        finalPerformance: this.performanceMetrics,
        sessionDuration: this.engagementMetrics.timeOnPage,
      },
    });
  }
}

// Initialize global RUM monitoring
declare global {
  interface Window {
    rum?: RUMMonitoring;
  }
}

// Create global instance
window.rum = new RUMMonitoring();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  window.rum?.destroy();
});

export default RUMMonitoring;
export type { RUMEvent, PerformanceMetrics, UserEngagement };
