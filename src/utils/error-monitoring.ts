/**
 * Global Error Monitoring System
 * Provides centralized error handling, logging, and user experience management
 */

interface ErrorContext {
  error: Error | string;
  source: string;
  line?: number;
  column?: number;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
}

interface ErrorReport extends ErrorContext {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'javascript' | 'network' | 'navigation' | 'performance' | 'security';
  stack?: string;
  resolved: boolean;
}

class ErrorMonitoring {
  private errors: ErrorReport[] = [];
  private maxErrors = 50; // Keep last 50 errors
  private isDebugMode = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check debug mode — wrap in try/catch for browsers with storage blocked
    try {
      this.isDebugMode = localStorage.getItem('debug-mode') === 'true' || 
                       new URLSearchParams(window.location.search).has('debug');
    } catch {
      this.isDebugMode = new URLSearchParams(window.location.search).has('debug');
    }

    // Setup global error handlers
    this.setupGlobalErrorHandlers();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
    
    // Setup network monitoring
    this.setupNetworkMonitoring();
  }

  private setupGlobalErrorHandlers() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        error: event.error || new Error(event.message),
        source: event.filename || 'unknown',
        line: event.lineno,
        column: event.colno,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        error: event.reason || new Error('Unhandled promise rejection'),
        source: 'unhandled-promise',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && (event.target as HTMLElement).tagName) {
        const element = event.target as HTMLElement;
        this.captureError({
          error: new Error(`Failed to load ${element.tagName.toLowerCase()}: ${element.getAttribute('src') || element.getAttribute('href')}`),
          source: 'resource-loading',
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
      }
    }, true);
  }

  private setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry.startTime > 4000) { // 4 seconds threshold
            this.captureError({
              error: new Error(`Slow LCP: ${Math.round(lastEntry.startTime)}ms`),
              source: 'performance',
              timestamp: Date.now(),
              userAgent: navigator.userAgent,
              url: window.location.href,
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          if (clsValue > 0.25) { // 0.25 threshold
            this.captureError({
              error: new Error(`High CLS: ${clsValue.toFixed(3)}`),
              source: 'performance',
              timestamp: Date.now(),
              userAgent: navigator.userAgent,
              url: window.location.href,
            });
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.startTime > 300) { // 300ms threshold
              this.captureError({
                error: new Error(`High FID: ${Math.round(entry.startTime)}ms`),
                source: 'performance',
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href,
              });
            }
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('Performance monitoring setup failed:', error);
      }
    }
  }

  private setupNetworkMonitoring() {
    // Monitor fetch/XHR errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.captureError({
            error: new Error(`HTTP ${response.status}: ${response.statusText}`),
            source: 'network',
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: args[0] as string,
          });
        }
        return response;
      } catch (error) {
        this.captureError({
          error: error as Error,
          source: 'network',
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: args[0] as string,
        });
        throw error;
      }
    };
  }

  private captureError(context: ErrorContext) {
    const errorReport: ErrorReport = {
      ...context,
      id: this.generateErrorId(),
      severity: this.determineSeverity(context),
      category: this.determineCategory(context),
      stack: context.error instanceof Error ? context.error.stack : undefined,
      resolved: false,
    };

    // Store error
    this.errors.push(errorReport);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log in debug mode
    if (this.isDebugMode) {
      console.error('Error captured:', errorReport);
    }

    // Send to analytics (if available)
    this.sendToAnalytics(errorReport);

    // Show user-friendly error for critical errors
    if (errorReport.severity === 'critical') {
      this.showUserError(errorReport);
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineSeverity(context: ErrorContext): ErrorReport['severity'] {
    const error = context.error instanceof Error ? context.error : new Error(context.error);

    // Critical errors
    if (error.message.includes('ChunkLoadError') ||
        error.message.includes('Network error') ||
        context.source === 'unhandled-promise') {
      return 'critical';
    }
    
    // High severity
    if (error.message.includes('TypeError') ||
        error.message.includes('ReferenceError') ||
        context.source === 'javascript') {
      return 'high';
    }
    
    // Medium severity
    if (context.source === 'network' || context.source === 'navigation') {
      return 'medium';
    }
    
    return 'low';
  }

  private determineCategory(context: ErrorContext): ErrorReport['category'] {
    const source = context.source;
    
    if (source.includes('unhandled-promise') || source === 'javascript') {
      return 'javascript';
    }
    if (source === 'network' || source === 'resource-loading') {
      return 'network';
    }
    if (source === 'navigation') {
      return 'navigation';
    }
    if (source === 'performance') {
      return 'performance';
    }
    
    return 'security';
  }

  private sendToAnalytics(errorReport: ErrorReport) {
    // Check if analytics are opted out
    try {
      const isOptedOut = localStorage.getItem('plausible_optout') === 'true' || 
                        (window as any).plausibleOptOut === true;
      if (isOptedOut) {
        return;
      }
    } catch {
      // Storage unavailable - proceed with analytics
    }

    // Send to Plausible if available
    if (window.plausible) {
      window.plausible('JavaScript Error', {
        props: {
          severity: errorReport.severity,
          category: errorReport.category,
          source: errorReport.source,
          message: errorReport.error instanceof Error ? errorReport.error.message : String(errorReport.error)
        }
      });
    }

    // In production, you might want to send to error tracking services
    // like Sentry, LogRocket, or custom endpoints
    if (this.isProduction()) {
      this.sendToErrorService(errorReport);
    }
  }

  private sendToErrorService(errorReport: ErrorReport) {
    // Example: Send to custom error endpoint
    // This would be implemented based on your error tracking service
    /*
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport)
    }).catch(err => {
      console.warn('Failed to send error report:', err);
    });
    */
  }

  private showUserError(errorReport: ErrorReport) {
    // Show user-friendly error notification
    const errorElement = document.createElement('div');
    errorElement.className = 'fixed bottom-4 right-4 max-w-sm p-4 bg-red-600 text-white rounded-lg shadow-lg z-50';
    errorElement.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h4 class="font-semibold">Error occurred</h4>
          <p class="text-sm mt-1">Something went wrong. We're working on it.</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          ×
        </button>
      </div>
    `;
    
    document.body.appendChild(errorElement);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorElement.parentElement) {
        errorElement.remove();
      }
    }, 10000);
  }

  private isProduction(): boolean {
    return window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1' &&
           !window.location.hostname.includes('dev');
  }

  // Public API
  public getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  public clearErrors(): void {
    this.errors = [];
  }

  public markAsResolved(errorId: string): void {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  public enableDebugMode(): void {
    this.isDebugMode = true;
    try {
      localStorage.setItem('debug-mode', 'true');
    } catch {
      // Storage unavailable — debug mode active for this session only
    }
  }

  public disableDebugMode(): void {
    this.isDebugMode = false;
    try {
      localStorage.removeItem('debug-mode');
    } catch {
      // Storage unavailable
    }
  }
}

// Initialize global error monitoring
declare global {
  interface Window {
    errorMonitoring?: ErrorMonitoring;
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

// Create global instance
window.errorMonitoring = new ErrorMonitoring();

export default ErrorMonitoring;
export type { ErrorReport, ErrorContext };
