import { PerformanceMonitor } from './performance-monitor';
import type { TestMetrics, SchedulingRecommendation } from './performance-monitor';
import { RegressionDetector } from './regression-detector';
import type { RegressionAnalysisResult } from './regression-detector';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface DashboardConfig {
  refreshInterval: number; // milliseconds
  maxDataPoints: number;
  enableRealTimeUpdates: boolean;
  enableAlerts: boolean;
  theme: 'light' | 'dark';
}

export interface DashboardData {
  timestamp: string;
  summary: DashboardSummary;
  metrics: TestMetrics[];
  regressions: RegressionAnalysisResult;
  scheduling: SchedulingRecommendation[];
  alerts: DashboardAlert[];
  trends: DashboardTrend[];
}

export interface DashboardSummary {
  totalTests: number;
  passingTests: number;
  failingTests: number;
  avgDuration: number;
  totalDuration: number;
  passRate: number;
  healthScore: number;
  activeAlerts: number;
  lastUpdated: string;
}

export interface DashboardAlert {
  id: string;
  type: 'regression' | 'performance' | 'flakiness' | 'infrastructure';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface DashboardTrend {
  category: string;
  dataPoints: TrendDataPoint[];
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

export interface TrendDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface PerformanceDashboard {
  config: DashboardConfig;
  data: DashboardData;
  lastUpdate: string;
}

export class TestExecutionDashboard {
  private readonly monitor: PerformanceMonitor;
  private readonly detector: RegressionDetector;
  private readonly config: DashboardConfig;
  private readonly dashboardFile: string;
  private updateInterval?: NodeJS.Timeout;

  constructor(
    metricsDir: string = 'tests/metrics',
    config: Partial<DashboardConfig> = {}
  ) {
    this.monitor = new PerformanceMonitor(metricsDir);
    this.detector = new RegressionDetector(metricsDir);
    this.dashboardFile = join(metricsDir, 'dashboard-data.json');
    
    this.config = {
      refreshInterval: 30000, // 30 seconds
      maxDataPoints: 100,
      enableRealTimeUpdates: true,
      enableAlerts: true,
      theme: 'light',
      ...config
    };
  }

  /**
   * Initialize and start the dashboard
   */
  async initialize(): Promise<PerformanceDashboard> {
    console.log('Initializing Test Execution Dashboard...');
    
    // Load existing data or create initial data
    const existingData = this.loadDashboardData();
    
    // Collect fresh data
    const freshData = await this.collectDashboardData();
    
    // Merge with existing data for trend analysis
    const mergedData = this.mergeDashboardData(existingData, freshData);
    
    const dashboard: PerformanceDashboard = {
      config: this.config,
      data: mergedData,
      lastUpdate: new Date().toISOString()
    };
    
    // Save dashboard data
    this.saveDashboardData(dashboard);
    
    // Start real-time updates if enabled
    if (this.config.enableRealTimeUpdates) {
      this.startRealTimeUpdates();
    }
    
    return dashboard;
  }

  /**
   * Start real-time dashboard updates
   */
  startRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(async () => {
      try {
        await this.updateDashboard();
      } catch (error) {
        console.error('Error updating dashboard:', error.message);
      }
    }, this.config.refreshInterval);
    
    console.log(`Dashboard updates started (interval: ${this.config.refreshInterval}ms)`);
  }

  /**
   * Stop real-time dashboard updates
   */
  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
      console.log('Dashboard updates stopped');
    }
  }

  /**
   * Update dashboard with fresh data
   */
  async updateDashboard(): Promise<PerformanceDashboard> {
    const freshData = await this.collectDashboardData();
    const existingData = this.loadDashboardData();
    const mergedData = this.mergeDashboardData(existingData, freshData);
    
    const dashboard: PerformanceDashboard = {
      config: this.config,
      data: mergedData,
      lastUpdate: new Date().toISOString()
    };
    
    this.saveDashboardData(dashboard);
    
    // Check for new alerts
    if (this.config.enableAlerts) {
      this.processAlerts(dashboard.data.alerts);
    }
    
    return dashboard;
  }

  /**
   * Generate HTML dashboard for viewing in browser
   */
  generateHtmlDashboard(): string {
    const dashboard = this.loadDashboardData();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Execution Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        ${this.generateDashboardCSS()}
    </style>
</head>
<body class="${this.config.theme}">
    <div class="dashboard">
        <header class="dashboard-header">
            <h1>Test Execution Dashboard</h1>
            <div class="last-updated">Last Updated: ${dashboard.lastUpdate}</div>
        </header>
        
        <main class="dashboard-main">
            <!-- Summary Cards -->
            <section class="summary-section">
                ${this.generateSummaryCards(dashboard.data.summary)}
            </section>
            
            <!-- Performance Trends -->
            <section class="trends-section">
                <h2>Performance Trends</h2>
                <div class="charts-grid">
                    ${dashboard.data.trends.map(trend => this.generateTrendChart(trend)).join('')}
                </div>
            </section>
            
            <!-- Recent Regressions -->
            <section class="regressions-section">
                <h2>Recent Regressions</h2>
                <div class="regressions-list">
                    ${dashboard.data.regressions.currentRegressions.slice(0, 5).map(regression => 
                      this.generateRegressionCard(regression)
                    ).join('')}
                </div>
            </section>
            
            <!-- Scheduling Recommendations -->
            <section class="scheduling-section">
                <h2>Test Scheduling Recommendations</h2>
                <div class="scheduling-grid">
                    ${dashboard.data.scheduling.map(rec => this.generateSchedulingCard(rec)).join('')}
                </div>
            </section>
            
            <!-- Active Alerts -->
            <section class="alerts-section">
                <h2>Active Alerts</h2>
                <div class="alerts-list">
                    ${dashboard.data.alerts.filter(alert => !alert.resolved).map(alert => 
                      this.generateAlertCard(alert)
                    ).join('')}
                </div>
            </section>
        </main>
    </div>
    
    <script>
        ${this.generateDashboardJS(dashboard)}
    </script>
</body>
</html>`;
  }

  /**
   * Collect comprehensive dashboard data
   */
  private async collectDashboardData(): Promise<DashboardData> {
    console.log('Collecting dashboard data...');
    
    // Collect metrics
    const metrics = await this.monitor.collectTestMetrics();
    
    // Analyze regressions
    const regressions = await this.detector.analyzeRegressions();
    
    // Get scheduling recommendations
    const scheduling = this.monitor.getSchedulingRecommendations();
    
    // Generate alerts
    const alerts = this.generateAlerts(metrics, regressions);
    
    // Analyze trends
    const trends = this.analyzeTrends(metrics);
    
    // Generate summary
    const summary = this.generateSummary(metrics, regressions, alerts);
    
    return {
      timestamp: new Date().toISOString(),
      summary,
      metrics,
      regressions,
      scheduling,
      alerts,
      trends
    };
  }

  /**
   * Generate dashboard alerts from metrics and regressions
   */
  private generateAlerts(
    metrics: TestMetrics[], 
    regressions: RegressionAnalysisResult
  ): DashboardAlert[] {
    const alerts: DashboardAlert[] = [];
    
    // Regression alerts
    regressions.currentRegressions.forEach((regression, index) => {
      alerts.push({
        id: `regression-${index}`,
        type: 'regression',
        severity: regression.severity === 'critical' ? 'critical' : 'warning',
        title: `Performance Regression: ${regression.testFile}`,
        message: `${regression.regressionPercentage.toFixed(1)}% increase in execution time (${regression.currentDuration}ms vs ${regression.baselineDuration}ms)`,
        timestamp: regression.timestamp,
        acknowledged: false,
        resolved: false
      });
    });
    
    // Performance alerts
    metrics.forEach(metric => {
      const threshold = this.monitor.getThresholds()[metric.category];
      if (metric.duration > threshold.critical) {
        alerts.push({
          id: `performance-${metric.testFile}`,
          type: 'performance',
          severity: 'critical',
          title: `Critical Performance: ${metric.testFile}`,
          message: `Test execution time (${metric.duration}ms) exceeds critical threshold (${threshold.critical}ms)`,
          timestamp: metric.timestamp,
          acknowledged: false,
          resolved: false
        });
      } else if (metric.duration > threshold.warning) {
        alerts.push({
          id: `performance-${metric.testFile}`,
          type: 'performance',
          severity: 'warning',
          title: `Performance Warning: ${metric.testFile}`,
          message: `Test execution time (${metric.duration}ms) exceeds warning threshold (${threshold.warning}ms)`,
          timestamp: metric.timestamp,
          acknowledged: false,
          resolved: false
        });
      }
    });
    
    // Flakiness alerts
    metrics.forEach(metric => {
      if (metric.metadata.flakinessScore > 0.1) {
        alerts.push({
          id: `flakiness-${metric.testFile}`,
          type: 'flakiness',
          severity: metric.metadata.flakinessScore > 0.2 ? 'critical' : 'warning',
          title: `Test Flakiness: ${metric.testFile}`,
          message: `Test flakiness score (${(metric.metadata.flakinessScore * 100).toFixed(1)}%) indicates instability`,
          timestamp: metric.timestamp,
          acknowledged: false,
          resolved: false
        });
      }
    });
    
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Analyze performance trends
   */
  private analyzeTrends(metrics: TestMetrics[]): DashboardTrend[] {
    const trends: DashboardTrend[] = [];
    const categoryGroups = this.groupMetricsByCategory(metrics);
    
    Object.entries(categoryGroups).forEach(([category, categoryMetrics]) => {
      if (categoryMetrics.length < 3) return;
      
      const sortedMetrics = categoryMetrics.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const dataPoints: TrendDataPoint[] = sortedMetrics.map(metric => ({
        timestamp: metric.timestamp,
        value: metric.duration,
        label: new Date(metric.timestamp).toLocaleDateString()
      }));
      
      // Calculate trend
      const recentData = dataPoints.slice(-5);
      const olderData = dataPoints.slice(-10, -5);
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let changePercentage = 0;
      
      if (recentData.length > 0 && olderData.length > 0) {
        const recentAvg = recentData.reduce((sum, d) => sum + d.value, 0) / recentData.length;
        const olderAvg = olderData.reduce((sum, d) => sum + d.value, 0) / olderData.length;
        
        changePercentage = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        if (Math.abs(changePercentage) < 5) {
          trend = 'stable';
        } else if (changePercentage > 0) {
          trend = 'up';
        } else {
          trend = 'down';
        }
      }
      
      trends.push({
        category,
        dataPoints: dataPoints.slice(-this.config.maxDataPoints),
        trend,
        changePercentage
      });
    });
    
    return trends;
  }

  /**
   * Generate dashboard summary
   */
  private generateSummary(
    metrics: TestMetrics[], 
    regressions: RegressionAnalysisResult, 
    alerts: DashboardAlert[]
  ): DashboardSummary {
    const totalTests = metrics.length;
    const passingTests = metrics.filter(m => m.metadata.passRate >= 0.95).length;
    const failingTests = totalTests - passingTests;
    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    const avgDuration = totalTests > 0 ? totalDuration / totalTests : 0;
    const passRate = totalTests > 0 ? passingTests / totalTests : 0;
    
    // Calculate health score
    const performanceScore = this.calculatePerformanceScore(metrics);
    const regressionScore = Math.max(0, 100 - (regressions.currentRegressions.length * 10));
    const alertScore = Math.max(0, 100 - (alerts.filter(a => a.severity === 'critical').length * 15));
    const healthScore = (performanceScore + regressionScore + alertScore) / 3;
    
    return {
      totalTests,
      passingTests,
      failingTests,
      avgDuration,
      totalDuration,
      passRate,
      healthScore,
      activeAlerts: alerts.filter(a => !a.resolved).length,
      lastUpdated: new Date().toISOString()
    };
  }

  private calculatePerformanceScore(metrics: TestMetrics[]): number {
    if (metrics.length === 0) return 100;
    
    const thresholds = this.monitor.getThresholds();
    let totalScore = 0;
    
    metrics.forEach(metric => {
      const threshold = thresholds[metric.category];
      if (metric.duration <= threshold.warning) {
        totalScore += 100;
      } else if (metric.duration <= threshold.critical) {
        totalScore += 50;
      } else {
        totalScore += 0;
      }
    });
    
    return totalScore / metrics.length;
  }

  // HTML generation methods

  private generateDashboardCSS(): string {
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f5f5f5; 
        color: #333; 
      }
      
      body.dark { 
        background: #1a1a1a; 
        color: #e0e0e0; 
      }
      
      .dashboard { max-width: 1400px; margin: 0 auto; padding: 20px; }
      
      .dashboard-header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 30px; 
        padding: 20px; 
        background: white; 
        border-radius: 8px; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
      }
      
      .dark .dashboard-header { background: #2d2d2d; }
      
      .summary-section { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
        gap: 20px; 
        margin-bottom: 30px; 
      }
      
      .summary-card { 
        padding: 20px; 
        background: white; 
        border-radius: 8px; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        text-align: center; 
      }
      
      .dark .summary-card { background: #2d2d2d; }
      
      .summary-value { font-size: 2em; font-weight: bold; color: #2563eb; }
      .summary-label { color: #666; margin-top: 5px; }
      
      .trends-section, .regressions-section, .scheduling-section, .alerts-section { 
        margin-bottom: 30px; 
        padding: 20px; 
        background: white; 
        border-radius: 8px; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
      }
      
      .dark .trends-section, 
      .dark .regressions-section, 
      .dark .scheduling-section, 
      .dark .alerts-section { background: #2d2d2d; }
      
      .charts-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
        gap: 20px; 
        margin-top: 20px; 
      }
      
      .chart-container { height: 200px; }
      
      .alert-card, .regression-card, .scheduling-card { 
        padding: 15px; 
        border-left: 4px solid #3b82f6; 
        margin-bottom: 10px; 
        border-radius: 4px; 
      }
      
      .alert-card.critical { border-left-color: #ef4444; }
      .alert-card.warning { border-left-color: #f59e0b; }
      
      .scheduling-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
        gap: 15px; 
        margin-top: 20px; 
      }
      
      h2 { margin-bottom: 20px; color: #1f2937; }
      .dark h2 { color: #e0e0e0; }
    `;
  }

  private generateSummaryCards(summary: DashboardSummary): string {
    const cards = [
      { label: 'Total Tests', value: summary.totalTests, color: '#3b82f6' },
      { label: 'Pass Rate', value: `${(summary.passRate * 100).toFixed(1)}%`, color: '#10b981' },
      { label: 'Avg Duration', value: `${Math.round(summary.avgDuration)}ms`, color: '#f59e0b' },
      { label: 'Health Score', value: `${Math.round(summary.healthScore)}%`, color: '#8b5cf6' },
      { label: 'Active Alerts', value: summary.activeAlerts, color: '#ef4444' }
    ];
    
    return cards.map(card => `
      <div class="summary-card">
        <div class="summary-value" style="color: ${card.color}">${card.value}</div>
        <div class="summary-label">${card.label}</div>
      </div>
    `).join('');
  }

  private generateTrendChart(trend: DashboardTrend): string {
    return `
      <div class="chart-container">
        <canvas id="chart-${trend.category}"></canvas>
        <h3>${trend.category} Tests</h3>
        <p>Trend: ${trend.trend} (${trend.changePercentage.toFixed(1)}%)</p>
      </div>
    `;
  }

  private generateRegressionCard(regression: any): string {
    return `
      <div class="regression-card ${regression.severity}">
        <h4>${regression.testFile}</h4>
        <p>${regression.regressionPercentage.toFixed(1)}% increase in execution time</p>
        <small>${new Date(regression.timestamp).toLocaleString()}</small>
      </div>
    `;
  }

  private generateSchedulingCard(rec: SchedulingRecommendation): string {
    const priorityColor = rec.priority === 'high' ? '#10b981' : rec.priority === 'medium' ? '#f59e0b' : '#6b7280';
    
    return `
      <div class="scheduling-card">
        <h4>${rec.category} Tests</h4>
        <p><strong>Priority:</strong> <span style="color: ${priorityColor}">${rec.priority.toUpperCase()}</span></p>
        <p><strong>Schedule:</strong> ${rec.schedule}</p>
        <p><strong>Avg Duration:</strong> ${Math.round(rec.avgDuration)}ms</p>
        <p><strong>Flakiness:</strong> ${(rec.flakinessScore * 100).toFixed(1)}%</p>
        <p><small>${rec.reasoning}</small></p>
      </div>
    `;
  }

  private generateAlertCard(alert: DashboardAlert): string {
    return `
      <div class="alert-card ${alert.severity}">
        <h4>${alert.title}</h4>
        <p>${alert.message}</p>
        <small>${new Date(alert.timestamp).toLocaleString()}</small>
      </div>
    `;
  }

  private generateDashboardJS(dashboard: PerformanceDashboard): string {
    return `
      // Initialize charts
      document.addEventListener('DOMContentLoaded', function() {
        ${dashboard.data.trends.map(trend => `
          new Chart(document.getElementById('chart-${trend.category}'), {
            type: 'line',
            data: {
              labels: ${JSON.stringify(trend.dataPoints.map(d => d.label))},
              datasets: [{
                label: '${trend.category} Duration (ms)',
                data: ${JSON.stringify(trend.dataPoints.map(d => d.value))},
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
          });
        `).join('')}
      });
      
      // Auto-refresh every 30 seconds
      setTimeout(() => location.reload(), 30000);
    `;
  }

  // Helper methods

  private loadDashboardData(): DashboardData {
    if (!existsSync(this.dashboardFile)) {
      return this.createEmptyDashboardData();
    }
    
    try {
      return JSON.parse(readFileSync(this.dashboardFile, 'utf8'));
    } catch {
      return this.createEmptyDashboardData();
    }
  }

  private createEmptyDashboardData(): DashboardData {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: 0,
        passingTests: 0,
        failingTests: 0,
        avgDuration: 0,
        totalDuration: 0,
        passRate: 0,
        healthScore: 100,
        activeAlerts: 0,
        lastUpdated: new Date().toISOString()
      },
      metrics: [],
      regressions: {
        timestamp: new Date().toISOString(),
        currentRegressions: [],
        patterns: [],
        intelligentThresholds: [],
        predictions: [],
        summary: {
          currentRegressions: 0,
          criticalRegressions: 0,
          detectedPatterns: 0,
          criticalPatterns: 0,
          highRiskPredictions: 0,
          overallRiskScore: 0
        },
        recommendations: []
      },
      scheduling: [],
      alerts: [],
      trends: []
    };
  }

  private mergeDashboardData(existing: DashboardData, fresh: DashboardData): DashboardData {
    // Merge trends for historical data
    const mergedTrends = this.mergeTrends(existing.trends, fresh.trends);
    
    return {
      ...fresh,
      trends: mergedTrends
    };
  }

  private mergeTrends(existing: DashboardTrend[], fresh: DashboardTrend[]): DashboardTrend[] {
    const merged: DashboardTrend[] = [];
    
    fresh.forEach(freshTrend => {
      const existingTrend = existing.find(t => t.category === freshTrend.category);
      
      if (existingTrend) {
        // Merge data points, keeping only the most recent
        const mergedDataPoints = [
          ...existingTrend.dataPoints,
          ...freshTrend.dataPoints
        ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
         .slice(-this.config.maxDataPoints);
        
        merged.push({
          ...freshTrend,
          dataPoints: mergedDataPoints
        });
      } else {
        merged.push(freshTrend);
      }
    });
    
    return merged;
  }

  private groupMetricsByCategory(metrics: TestMetrics[]): Record<string, TestMetrics[]> {
    return metrics.reduce((groups, metric) => {
      if (!groups[metric.category]) {
        groups[metric.category] = [];
      }
      groups[metric.category].push(metric);
      return groups;
    }, {} as Record<string, TestMetrics[]>);
  }

  private saveDashboardData(dashboard: PerformanceDashboard): void {
    writeFileSync(this.dashboardFile, JSON.stringify(dashboard, null, 2));
  }

  private processAlerts(alerts: DashboardAlert[]): void {
    // In a real implementation, this would send notifications, update external systems, etc.
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged);
    
    if (criticalAlerts.length > 0) {
      console.warn(`CRITICAL: ${criticalAlerts.length} unacknowledged critical alerts`);
    }
  }
}
