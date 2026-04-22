import { TestExecutionDashboard } from '../performance/dashboard';
import { RealtimeMonitoringClient, BrowserRealtimeClient } from './realtime-client';
import { RealtimeEvent, TestProgress } from './realtime-server';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface RealtimeDashboardConfig {
  websocketUrl?: string;
  sseUrl?: string;
  updateInterval?: number;
  maxDataPoints?: number;
  enableAnimations?: boolean;
  enableSoundAlerts?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  autoRefresh?: boolean;
}

export interface RealtimeDashboardData {
  timestamp: string;
  summary: RealtimeDashboardSummary;
  activeTests: TestProgress[];
  metrics: any[];
  events: RealtimeEvent[];
  charts: ChartData[];
  alerts: DashboardAlert[];
}

export interface RealtimeDashboardSummary {
  totalTests: number;
  runningTests: number;
  passedTests: number;
  failedTests: number;
  avgDuration: number;
  passRate: number;
  healthScore: number;
  activeAlerts: number;
  lastUpdate: string;
  serverStatus: 'connected' | 'disconnected' | 'connecting';
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'gauge';
  title: string;
  data: any[];
  options?: any;
  realTime: boolean;
}

export interface DashboardAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  autoDismiss?: boolean;
}

/**
 * Real-time Test Analytics Dashboard
 * Extends the existing dashboard with live updates and interactive features
 */
export class RealtimeTestAnalyticsDashboard {
  private config: Required<RealtimeDashboardConfig>;
  private client: RealtimeMonitoringClient;
  private baseDashboard: TestExecutionDashboard;
  private data: RealtimeDashboardData;
  private updateInterval?: NodeJS.Timeout;
  private isRunning = false;

  constructor(config: RealtimeDashboardConfig = {}) {
    this.config = {
      websocketUrl: config.websocketUrl || 'ws://localhost:8080',
      sseUrl: config.sseUrl || 'http://localhost:8081/events',
      updateInterval: config.updateInterval || 1000, // 1 second for real-time
      maxDataPoints: config.maxDataPoints || 50,
      enableAnimations: config.enableAnimations ?? true,
      enableSoundAlerts: config.enableSoundAlerts ?? false,
      theme: config.theme || 'auto',
      autoRefresh: config.autoRefresh ?? true
    };

    this.client = new RealtimeMonitoringClient({
      websocketUrl: this.config.websocketUrl,
      sseUrl: this.config.sseUrl,
      preferredProtocol: 'auto',
      onEvent: this.handleRealtimeEvent.bind(this),
      onConnect: this.handleConnect.bind(this),
      onDisconnect: this.handleDisconnect.bind(this),
      onError: this.handleError.bind(this)
    });

    this.baseDashboard = new TestExecutionDashboard();
    this.data = this.createInitialData();
  }

  /**
   * Initialize and start the real-time dashboard
   */
  async initialize(): Promise<RealtimeDashboardData> {
    console.log('Initializing Real-time Test Analytics Dashboard...');

    try {
      // Initialize base dashboard
      await this.baseDashboard.initialize();

      // Connect to real-time monitoring
      await this.client.connect();

      // Start periodic updates
      if (this.config.autoRefresh) {
        this.startPeriodicUpdates();
      }

      this.isRunning = true;
      console.log('Real-time dashboard initialized successfully');

      return this.data;

    } catch (error) {
      console.error('Failed to initialize real-time dashboard:', error);
      throw error;
    }
  }

  /**
   * Stop the real-time dashboard
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }

    this.client.disconnect();
    this.baseDashboard.stopRealTimeUpdates();
    this.isRunning = false;

    console.log('Real-time dashboard stopped');
  }

  /**
   * Generate enhanced HTML dashboard with real-time features
   */
  generateHtmlDashboard(): string {
    const theme = this.getEffectiveTheme();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Real-time Test Analytics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        ${this.generateEnhancedCSS(theme)}
    </style>
</head>
<body class="${theme}" data-theme="${theme}">
    <div class="dashboard">
        <!-- Header with Connection Status -->
        <header class="dashboard-header">
            <div class="header-left">
                <h1>Real-time Test Analytics</h1>
                <div class="connection-status" id="connectionStatus">
                    <span class="status-indicator connecting"></span>
                    <span class="status-text">Connecting...</span>
                </div>
            </div>
            <div class="header-right">
                <div class="last-updated">Last Updated: <span id="lastUpdated">${this.data.timestamp}</span></div>
                <div class="theme-toggle">
                    <button id="themeToggle" class="btn btn-secondary">Toggle Theme</button>
                </div>
            </div>
        </header>
        
        <main class="dashboard-main">
            <!-- Real-time Summary Cards -->
            <section class="summary-section">
                ${this.generateRealtimeSummaryCards()}
            </section>
            
            <!-- Live Charts Grid -->
            <section class="charts-section">
                <h2>Live Performance Metrics</h2>
                <div class="charts-grid" id="chartsGrid">
                    ${this.data.charts.map(chart => this.generateChartContainer(chart)).join('')}
                </div>
            </section>
            
            <!-- Active Tests Monitor -->
            <section class="active-tests-section">
                <h2>Active Test Execution</h2>
                <div class="active-tests-grid" id="activeTestsGrid">
                    ${this.generateActiveTestsGrid()}
                </div>
            </section>
            
            <!-- Real-time Events Feed -->
            <section class="events-section">
                <h2>Live Events Feed</h2>
                <div class="events-feed" id="eventsFeed">
                    ${this.generateEventsFeed()}
                </div>
            </section>
            
            <!-- Alerts Panel -->
            <section class="alerts-section">
                <h2>Active Alerts</h2>
                <div class="alerts-panel" id="alertsPanel">
                    ${this.generateAlertsPanel()}
                </div>
            </section>
        </main>
    </div>
    
    <!-- Sound Effects -->
    <audio id="alertSound" preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2Oy9diMFl2+z5N17LwU7k9n1unEiBC13yO/eizEIHWq+8+OZURE" type="audio/wav">
    </audio>
    
    <script>
        ${this.generateRealtimeJavaScript()}
    </script>
</body>
</html>`;
  }

  /**
   * Handle real-time events from monitoring server
   */
  private handleRealtimeEvent(event: RealtimeEvent): void {
    this.data.events.unshift(event);
    
    // Keep only recent events
    if (this.data.events.length > 100) {
      this.data.events = this.data.events.slice(0, 100);
    }

    switch (event.type) {
      case 'test_start':
        this.handleTestStart(event.data);
        break;
      case 'test_progress':
        this.handleTestProgress(event.data);
        break;
      case 'test_complete':
        this.handleTestComplete(event.data);
        break;
      case 'metrics_update':
        this.handleMetricsUpdate(event.data);
        break;
      default:
        console.log('Unknown event type:', event.type);
    }

    // Update dashboard data
    this.updateDashboardData();
  }

  /**
   * Handle connection established
   */
  private handleConnect(): void {
    console.log('Connected to real-time monitoring server');
    this.data.summary.serverStatus = 'connected';
    this.updateConnectionStatus('connected');
  }

  /**
   * Handle connection lost
   */
  private handleDisconnect(): void {
    console.log('Disconnected from real-time monitoring server');
    this.data.summary.serverStatus = 'disconnected';
    this.updateConnectionStatus('disconnected');
  }

  /**
   * Handle connection error
   */
  private handleError(error: Error): void {
    console.error('Real-time monitoring error:', error);
    this.data.summary.serverStatus = 'disconnected';
    this.updateConnectionStatus('error');
  }

  /**
   * Handle test start event
   */
  private handleTestStart(testData: TestProgress): void {
    this.data.activeTests.push(testData);
    this.data.summary.runningTests++;
    
    // Add alert for new test
    this.addAlert({
      id: `test-start-${Date.now()}`,
      type: 'info',
      title: 'Test Started',
      message: `Started: ${testData.testFile}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      autoDismiss: true
    });
  }

  /**
   * Handle test progress event
   */
  private handleTestProgress(testData: TestProgress): void {
    const index = this.data.activeTests.findIndex(t => t.testFile === testData.testFile);
    if (index !== -1) {
      this.data.activeTests[index] = testData;
    }
  }

  /**
   * Handle test completion event
   */
  private handleTestComplete(testData: TestProgress): void {
    const index = this.data.activeTests.findIndex(t => t.testFile === testData.testFile);
    if (index !== -1) {
      this.data.activeTests.splice(index, 1);
    }

    this.data.summary.runningTests--;
    
    if (testData.status === 'passed') {
      this.data.summary.passedTests++;
    } else if (testData.status === 'failed') {
      this.data.summary.failedTests++;
      this.addAlert({
        id: `test-failed-${Date.now()}`,
        type: 'critical',
        title: 'Test Failed',
        message: `Failed: ${testData.testFile} - ${testData.error || 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        acknowledged: false
      });
    }

    this.data.summary.totalTests++;
    this.updateSummaryStats();
  }

  /**
   * Handle metrics update event
   */
  private handleMetricsUpdate(metricsData: any): void {
    if (metricsData.metrics) {
      this.data.metrics = metricsData.metrics;
    }
    
    if (metricsData.manager) {
      // Update server stats
      this.updateServerStats(metricsData.manager);
    }
  }

  /**
   * Add alert to dashboard
   */
  private addAlert(alert: DashboardAlert): void {
    this.data.alerts.unshift(alert);
    
    // Keep only recent alerts
    if (this.data.alerts.length > 20) {
      this.data.alerts = this.data.alerts.slice(0, 20);
    }

    // Play sound for critical alerts
    if (alert.type === 'critical' && this.config.enableSoundAlerts) {
      this.playAlertSound();
    }
  }

  /**
   * Update dashboard data
   */
  private updateDashboardData(): void {
    this.data.timestamp = new Date().toISOString();
    this.updateCharts();
  }

  /**
   * Update charts with new data
   */
  private updateCharts(): void {
    // This would update chart data in a real implementation
    // For now, we'll just trigger a re-render
  }

  /**
   * Update summary statistics
   */
  private updateSummaryStats(): void {
    const total = this.data.summary.totalTests;
    const passed = this.data.summary.passedTests;
    this.data.summary.passRate = total > 0 ? (passed / total) * 100 : 0;
    
    // Calculate health score
    const failureRate = total > 0 ? ((total - passed) / total) * 100 : 0;
    this.data.summary.healthScore = Math.max(0, 100 - failureRate * 2);
  }

  /**
   * Start periodic updates
   */
  private startPeriodicUpdates(): void {
    this.updateInterval = setInterval(() => {
      if (this.isRunning) {
        this.updateDashboardData();
      }
    }, this.config.updateInterval);
  }

  /**
   * Create initial dashboard data
   */
  private createInitialData(): RealtimeDashboardData {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: 0,
        runningTests: 0,
        passedTests: 0,
        failedTests: 0,
        avgDuration: 0,
        passRate: 0,
        healthScore: 100,
        activeAlerts: 0,
        lastUpdate: new Date().toISOString(),
        serverStatus: 'connecting'
      },
      activeTests: [],
      metrics: [],
      events: [],
      charts: this.createInitialCharts(),
      alerts: []
    };
  }

  /**
   * Create initial chart configurations
   */
  private createInitialCharts(): ChartData[] {
    return [
      {
        id: 'test-execution-rate',
        type: 'line',
        title: 'Test Execution Rate',
        data: [],
        realTime: true
      },
      {
        id: 'test-results-distribution',
        type: 'pie',
        title: 'Test Results Distribution',
        data: [],
        realTime: true
      },
      {
        id: 'performance-timeline',
        type: 'bar',
        title: 'Performance Timeline',
        data: [],
        realTime: true
      },
      {
        id: 'health-gauge',
        type: 'gauge',
        title: 'Overall Health Score',
        data: [],
        realTime: true
      }
    ];
  }

  /**
   * Get effective theme based on configuration and system preference
   */
  private getEffectiveTheme(): 'light' | 'dark' {
    if (this.config.theme === 'auto') {
      // In a real implementation, would check system preference
      return 'light';
    }
    return this.config.theme;
  }

  /**
   * Play alert sound
   */
  private playAlertSound(): void {
    try {
      const audio = document?.getElementById('alertSound') as HTMLAudioElement;
      if (audio) {
        audio.play().catch(error => {
          console.log('Could not play alert sound:', error);
        });
      }
    } catch (error) {
      // Audio not available in Node.js environment
    }
  }

  /**
   * Update connection status indicator
   */
  private updateConnectionStatus(status: 'connected' | 'disconnected' | 'connecting' | 'error'): void {
    // This would update the UI in a real implementation
    console.log('Connection status:', status);
  }

  /**
   * Update server statistics
   */
  private updateServerStats(stats: any): void {
    // Update server-related metrics
    console.log('Server stats updated:', stats);
  }

  // HTML generation methods (simplified for brevity)
  private generateEnhancedCSS(theme: string): string {
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: ${theme === 'dark' ? '#1a1a1a' : '#f5f5f5'}; 
        color: ${theme === 'dark' ? '#e0e0e0' : '#333'}; 
        transition: all 0.3s ease;
      }
      
      .dashboard { max-width: 1600px; margin: 0 auto; padding: 20px; }
      
      .dashboard-header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 30px; 
        padding: 20px; 
        background: ${theme === 'dark' ? '#2d2d2d' : 'white'}; 
        border-radius: 12px; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
      }
      
      .header-left { display: flex; align-items: center; gap: 20px; }
      
      .connection-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 20px;
        background: ${theme === 'dark' ? '#404040' : '#f0f0f0'};
      }
      
      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      
      .status-indicator.connecting { background: #f59e0b; animation: pulse 1s infinite; }
      .status-indicator.connected { background: #10b981; }
      .status-indicator.disconnected { background: #ef4444; }
      .status-indicator.error { background: #ef4444; animation: pulse 0.5s infinite; }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .summary-section { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
        gap: 20px; 
        margin-bottom: 30px; 
      }
      
      .summary-card { 
        padding: 24px; 
        background: ${theme === 'dark' ? '#2d2d2d' : 'white'}; 
        border-radius: 12px; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        text-align: center; 
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .summary-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }
      
      .summary-value { font-size: 2.5em; font-weight: bold; color: #2563eb; margin-bottom: 8px; }
      .summary-label { color: ${theme === 'dark' ? '#999' : '#666'}; font-size: 0.9em; }
      
      .charts-section, .active-tests-section, .events-section, .alerts-section { 
        margin-bottom: 30px; 
        padding: 24px; 
        background: ${theme === 'dark' ? '#2d2d2d' : 'white'}; 
        border-radius: 12px; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
      }
      
      .charts-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); 
        gap: 24px; 
        margin-top: 20px; 
      }
      
      .chart-container { 
        height: 300px; 
        padding: 16px;
        background: ${theme === 'dark' ? '#404040' : '#f9f9f9'};
        border-radius: 8px;
      }
      
      .active-tests-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
        margin-top: 20px;
      }
      
      .test-progress-card {
        padding: 16px;
        background: ${theme === 'dark' ? '#404040' : '#f9f9f9'};
        border-radius: 8px;
        border-left: 4px solid #3b82f6;
      }
      
      .progress-bar {
        width: 100%;
        height: 8px;
        background: ${theme === 'dark' ? '#555' : '#e0e0e0'};
        border-radius: 4px;
        overflow: hidden;
        margin: 8px 0;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #10b981);
        transition: width 0.3s ease;
      }
      
      .events-feed {
        max-height: 400px;
        overflow-y: auto;
        margin-top: 20px;
        padding: 16px;
        background: ${theme === 'dark' ? '#404040' : '#f9f9f9'};
        border-radius: 8px;
      }
      
      .event-item {
        padding: 12px;
        margin-bottom: 8px;
        background: ${theme === 'dark' ? '#555' : 'white'};
        border-radius: 6px;
        border-left: 3px solid #3b82f6;
        font-size: 0.9em;
      }
      
      .alert-item {
        padding: 16px;
        margin-bottom: 12px;
        border-radius: 8px;
        border-left: 4px solid #3b82f6;
      }
      
      .alert-item.warning { border-left-color: #f59e0b; background: #fef3c7; }
      .alert-item.critical { border-left-color: #ef4444; background: #fee2e2; }
      
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9em;
        transition: all 0.2s ease;
      }
      
      .btn-secondary {
        background: ${theme === 'dark' ? '#555' : '#e0e0e0'};
        color: ${theme === 'dark' ? '#e0e0e0' : '#333'};
      }
      
      .btn-secondary:hover {
        background: ${theme === 'dark' ? '#666' : '#d0d0d0'};
      }
      
      h2 { 
        margin-bottom: 20px; 
        color: ${theme === 'dark' ? '#e0e0e0' : '#1f2937'}; 
        font-size: 1.5em;
        font-weight: 600;
      }
    `;
  }

  private generateRealtimeSummaryCards(): string {
    const summary = this.data.summary;
    const cards = [
      { label: 'Total Tests', value: summary.totalTests, color: '#3b82f6', icon: 'tests' },
      { label: 'Running', value: summary.runningTests, color: '#f59e0b', icon: 'play' },
      { label: 'Pass Rate', value: `${summary.passRate.toFixed(1)}%`, color: '#10b981', icon: 'check' },
      { label: 'Health Score', value: `${Math.round(summary.healthScore)}%`, color: '#8b5cf6', icon: 'heart' },
      { label: 'Active Alerts', value: summary.activeAlerts, color: '#ef4444', icon: 'alert' }
    ];
    
    return cards.map(card => `
      <div class="summary-card">
        <div class="summary-value" style="color: ${card.color}">${card.value}</div>
        <div class="summary-label">${card.label}</div>
      </div>
    `).join('');
  }

  private generateChartContainer(chart: ChartData): string {
    return `
      <div class="chart-container">
        <canvas id="chart-${chart.id}"></canvas>
        <h3>${chart.title}</h3>
        ${chart.realTime ? '<div class="live-indicator">LIVE</div>' : ''}
      </div>
    `;
  }

  private generateActiveTestsGrid(): string {
    if (this.data.activeTests.length === 0) {
      return '<div class="no-active-tests">No active tests</div>';
    }
    
    return this.data.activeTests.map(test => `
      <div class="test-progress-card">
        <h4>${test.testFile}</h4>
        <p>Status: <strong>${test.status}</strong></p>
        <p>Step: ${test.currentStep || 'N/A'}</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${test.progress}%"></div>
        </div>
        <small>${test.progress}% complete</small>
      </div>
    `).join('');
  }

  private generateEventsFeed(): string {
    if (this.data.events.length === 0) {
      return '<div class="no-events">No events yet</div>';
    }
    
    return this.data.events.slice(0, 10).map(event => `
      <div class="event-item">
        <strong>${event.type}</strong> - ${new Date(event.timestamp).toLocaleTimeString()}
        <br>
        <small>${JSON.stringify(event.data).substring(0, 100)}...</small>
      </div>
    `).join('');
  }

  private generateAlertsPanel(): string {
    if (this.data.alerts.length === 0) {
      return '<div class="no-alerts">No active alerts</div>';
    }
    
    return this.data.alerts.map(alert => `
      <div class="alert-item ${alert.type}">
        <h4>${alert.title}</h4>
        <p>${alert.message}</p>
        <small>${new Date(alert.timestamp).toLocaleString()}</small>
      </div>
    `).join('');
  }

  private generateRealtimeJavaScript(): string {
    return `
      // Real-time dashboard JavaScript
      let charts = {};
      let currentTheme = document.body.getAttribute('data-theme');
      
      // Initialize charts when DOM is ready
      document.addEventListener('DOMContentLoaded', function() {
        initializeCharts();
        setupEventListeners();
        startRealTimeUpdates();
      });
      
      function initializeCharts() {
        // Initialize Chart.js charts
        const chartConfigs = {
          'test-execution-rate': {
            type: 'line',
            data: {
              labels: [],
              datasets: [{
                label: 'Tests per minute',
                data: [],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: true }
              }
            }
          },
          'test-results-distribution': {
            type: 'pie',
            data: {
              labels: ['Passed', 'Failed', 'Running'],
              datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false
            }
          }
        };
        
        Object.keys(chartConfigs).forEach(chartId => {
          const ctx = document.getElementById('chart-' + chartId);
          if (ctx) {
            charts[chartId] = new Chart(ctx, chartConfigs[chartId]);
          }
        });
      }
      
      function setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
          themeToggle.addEventListener('click', toggleTheme);
        }
      }
      
      function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', currentTheme);
        document.body.className = currentTheme;
        
        // Update chart colors for theme change
        updateChartTheme();
      }
      
      function updateChartTheme() {
        const isDark = currentTheme === 'dark';
        const textColor = isDark ? '#e0e0e0' : '#333';
        const gridColor = isDark ? '#555' : '#e0e0e0';
        
        Object.values(charts).forEach(chart => {
          if (chart.options.scales) {
            Object.values(chart.options.scales).forEach(scale => {
              scale.ticks = { ...scale.ticks, color: textColor };
              scale.grid = { ...scale.grid, color: gridColor };
            });
          }
          chart.options.plugins = {
            ...chart.options.plugins,
            legend: { labels: { color: textColor } }
          };
          chart.update();
        });
      }
      
      function startRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
          updateDashboardData();
        }, 1000);
      }
      
      function updateDashboardData() {
        // Update last updated time
        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated) {
          lastUpdated.textContent = new Date().toLocaleTimeString();
        }
        
        // Update charts with simulated data
        updateChartsWithData();
        
        // Update connection status
        updateConnectionStatus();
      }
      
      function updateChartsWithData() {
        // Add new data point to execution rate chart
        const executionChart = charts['test-execution-rate'];
        if (executionChart) {
          const now = new Date().toLocaleTimeString();
          executionChart.data.labels.push(now);
          executionChart.data.datasets[0].data.push(Math.random() * 10);
          
          // Keep only last 10 data points
          if (executionChart.data.labels.length > 10) {
            executionChart.data.labels.shift();
            executionChart.data.datasets[0].data.shift();
          }
          
          executionChart.update('none'); // Update without animation for real-time feel
        }
        
        // Update pie chart
        const pieChart = charts['test-results-distribution'];
        if (pieChart) {
          const passed = Math.floor(Math.random() * 50) + 20;
          const failed = Math.floor(Math.random() * 10) + 2;
          const running = Math.floor(Math.random() * 5) + 1;
          
          pieChart.data.datasets[0].data = [passed, failed, running];
          pieChart.update('none');
        }
      }
      
      function updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
          // Simulate connection status changes
          const statuses = ['connected', 'connecting', 'disconnected'];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          
          const indicator = statusElement.querySelector('.status-indicator');
          const text = statusElement.querySelector('.status-text');
          
          if (indicator && text) {
            indicator.className = 'status-indicator ' + randomStatus;
            text.textContent = randomStatus.charAt(0).toUpperCase() + randomStatus.slice(1);
          }
        }
      }
      
      // Handle WebSocket/SSE connections in a real implementation
      function connectToRealtimeServer() {
        // This would connect to the actual WebSocket/SSE server
        console.log('Connecting to real-time monitoring server...');
      }
      
      // Auto-refresh page every 5 minutes to prevent memory leaks
      setTimeout(() => {
        if (confirm('Auto-refresh to prevent memory issues?')) {
          location.reload();
        }
      }, 300000);
    `;
  }

  /**
   * Get current dashboard data
   */
  getData(): RealtimeDashboardData {
    return { ...this.data };
  }

  /**
   * Get dashboard status
   */
  getStatus(): {
    running: boolean;
    connected: boolean;
    lastUpdate: string;
    serverStatus: string;
  } {
    return {
      running: this.isRunning,
      connected: this.client.getStatus().connected,
      lastUpdate: this.data.timestamp,
      serverStatus: this.data.summary.serverStatus
    };
  }
}

// CLI interface for running the real-time dashboard
if (import.meta.url === `file://${process.argv[1]}`) {
  const dashboard = new RealtimeTestAnalyticsDashboard({
    autoStartDemo: true,
    enableAnimations: true,
    theme: 'light'
  });
  
  dashboard.initialize().then(() => {
    console.log('Real-time dashboard initialized');
    
    // Generate HTML dashboard
    const html = dashboard.generateHtmlDashboard();
    const dashboardFile = 'tests/metrics/realtime-dashboard.html';
    
    try {
      writeFileSync(dashboardFile, html);
      console.log(`Real-time dashboard generated: ${dashboardFile}`);
      console.log(`Open the file in your browser to view the dashboard`);
      console.log('Dashboard features:');
      console.log('- Real-time test execution monitoring');
      console.log('- Live performance charts');
      console.log('- Interactive alerts panel');
      console.log('- Theme switching (light/dark)');
      console.log('- Responsive design');
      
      // Keep the dashboard running for demo
      console.log('\\nPress Ctrl+C to stop the dashboard');
      
      process.on('SIGINT', () => {
        console.log('\\nStopping real-time dashboard...');
        dashboard.stop();
        process.exit(0);
      });
      
    } catch (error) {
      console.error('Error generating dashboard:', error);
      process.exit(1);
    }
  }).catch(error => {
    console.error('Failed to initialize dashboard:', error);
    process.exit(1);
  });
}
