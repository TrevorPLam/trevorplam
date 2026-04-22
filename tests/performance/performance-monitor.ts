import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';

export interface TestMetrics {
  testFile: string;
  duration: number;
  category: TestCategory;
  timestamp: string;
  shard?: number;
  environment: 'ci' | 'local';
  metadata: TestMetadata;
}

export interface TestMetadata {
  transformTime: number;
  setupTime: number;
  importTime: number;
  testExecutionTime: number;
  environmentTime: number;
  memoryUsage?: MemoryMetrics;
  flakinessScore: number;
  passRate: number;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export type TestCategory = 
  | 'unit' 
  | 'components' 
  | 'integration' 
  | 'property' 
  | 'contract' 
  | 'accessibility' 
  | 'e2e' 
  | 'performance' 
  | 'security' 
  | 'fuzzing';

export interface PerformanceThresholds {
  [key in TestCategory]: {
    warning: number;
    critical: number;
  };
}

export interface RegressionAlert {
  testFile: string;
  category: TestCategory;
  currentDuration: number;
  baselineDuration: number;
  regressionPercentage: number;
  severity: 'warning' | 'critical';
  timestamp: string;
}

export class PerformanceMonitor {
  private readonly metricsFile: string;
  private readonly baselineFile: string;
  private readonly alertsFile: string;
  private readonly thresholds: PerformanceThresholds;

  constructor(
    metricsDir: string = 'tests/metrics',
    private readonly environment: 'ci' | 'local' = process.env.CI ? 'ci' : 'local'
  ) {
    this.metricsFile = join(metricsDir, 'performance-metrics.json');
    this.baselineFile = join(metricsDir, 'performance-baseline.json');
    this.alertsFile = join(metricsDir, 'performance-alerts.json');
    
    // Ensure metrics directory exists
    if (!existsSync(metricsDir)) {
      mkdirSync(metricsDir, { recursive: true });
    }

    // 2026 enterprise performance thresholds (in milliseconds)
    this.thresholds = {
      unit: { warning: 5000, critical: 10000 },
      components: { warning: 10000, critical: 20000 },
      integration: { warning: 30000, critical: 60000 },
      property: { warning: 45000, critical: 90000 },
      contract: { warning: 30000, critical: 60000 },
      accessibility: { warning: 24000, critical: 48000 },
      e2e: { warning: 60000, critical: 120000 },
      performance: { warning: 48000, critical: 96000 },
      security: { warning: 18000, critical: 36000 },
      fuzzing: { warning: 90000, critical: 180000 }
    };
  }

  /**
   * Collect comprehensive test execution metrics
   */
  async collectTestMetrics(testCommand: string = 'npm test'): Promise<TestMetrics[]> {
    console.log('Collecting comprehensive test execution metrics...');
    
    try {
      // Run tests with detailed timing output
      const output = execSync(`${testCommand} --reporter=json --reportFile=/tmp/test-results.json --run`, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 600000 // 10 minute timeout
      });
      
      // Parse test results and extract detailed timing data
      const testResults = JSON.parse(readFileSync('/tmp/test-results.json', 'utf8'));
      const metrics: TestMetrics[] = [];
      
      testResults.testFiles?.forEach(testFile => {
        const filePath = testFile.file;
        const duration = testFile.duration || 0;
        const category = this.categorizeTest(filePath);
        
        // Extract detailed timing from Vitest output
        const metadata = this.extractTestMetadata(testFile, output);
        
        const metric: TestMetrics = {
          testFile: filePath,
          duration,
          category,
          timestamp: new Date().toISOString(),
          shard: parseInt(process.env.CI_SHARD || '1'),
          environment: this.environment,
          metadata
        };
        
        metrics.push(metric);
      });
      
      // Save metrics
      this.saveMetrics(metrics);
      
      console.log(`Collected metrics for ${metrics.length} test files`);
      return metrics;
      
    } catch (error) {
      console.error('Error collecting test metrics:', error.message);
      throw error;
    }
  }

  /**
   * Detect performance regressions based on historical data
   */
  detectRegressions(metrics: TestMetrics[]): RegressionAlert[] {
    console.log('Detecting performance regressions...');
    
    const baseline = this.loadBaseline();
    const alerts: RegressionAlert[] = [];
    
    metrics.forEach(metric => {
      const baselineData = baseline[metric.testFile];
      if (!baselineData) {
        // No baseline data for this test
        return;
      }
      
      const regressionPercentage = this.calculateRegression(
        metric.duration, 
        baselineData.duration
      );
      
      // Check if regression exceeds thresholds
      const threshold = this.getRegressionThreshold(metric.category, regressionPercentage);
      
      if (regressionPercentage >= threshold) {
        const alert: RegressionAlert = {
          testFile: metric.testFile,
          category: metric.category,
          currentDuration: metric.duration,
          baselineDuration: baselineData.duration,
          regressionPercentage,
          severity: regressionPercentage >= 50 ? 'critical' : 'warning',
          timestamp: new Date().toISOString()
        };
        
        alerts.push(alert);
      }
    });
    
    // Save alerts
    if (alerts.length > 0) {
      this.saveAlerts(alerts);
      console.warn(`Detected ${alerts.length} performance regressions`);
    }
    
    return alerts;
  }

  /**
   * Update performance baseline with latest stable data
   */
  updateBaseline(metrics: TestMetrics[]): void {
    console.log('Updating performance baseline...');
    
    const baseline: Record<string, TestMetrics> = {};
    
    // Calculate moving averages for each test
    const groupedMetrics = this.groupMetricsByTest(metrics);
    
    Object.entries(groupedMetrics).forEach(([testFile, testMetrics]) => {
      if (testMetrics.length === 0) return;
      
      // Use median for baseline to avoid outlier influence
      const durations = testMetrics.map(m => m.duration).sort((a, b) => a - b);
      const medianIndex = Math.floor(durations.length / 2);
      const medianDuration = durations[medianIndex];
      
      // Find the metric with median duration
      const baselineMetric = testMetrics.find(m => m.duration === medianDuration) || testMetrics[0];
      
      baseline[testFile] = {
        ...baselineMetric,
        duration: medianDuration // Use calculated median
      };
    });
    
    // Save baseline
    writeFileSync(this.baselineFile, JSON.stringify(baseline, null, 2));
    console.log(`Updated baseline for ${Object.keys(baseline).length} test files`);
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport(): PerformanceReport {
    const metrics = this.loadMetrics();
    const alerts = this.loadAlerts();
    const baseline = this.loadBaseline();
    
    const report: PerformanceReport = {
      generated: new Date().toISOString(),
      summary: this.generateSummary(metrics),
      categoryAnalysis: this.analyzeCategories(metrics),
      regressionAnalysis: this.analyzeRegressions(alerts),
      trends: this.analyzeTrends(metrics),
      recommendations: this.generateRecommendations(metrics, alerts),
      thresholds: this.thresholds
    };
    
    // Save report
    const reportFile = join(dirname(this.metricsFile), 'performance-report.json');
    writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    return report;
  }

  /**
   * Get intelligent test scheduling recommendations
   */
  getSchedulingRecommendations(): SchedulingRecommendation[] {
    const metrics = this.loadMetrics();
    const recommendations: SchedulingRecommendation[] = [];
    
    // Group by category
    const categoryGroups = this.groupMetricsByCategory(metrics);
    
    Object.entries(categoryGroups).forEach(([category, categoryMetrics]) => {
      const avgDuration = categoryMetrics.reduce((sum, m) => sum + m.duration, 0) / categoryMetrics.length;
      const flakinessScore = categoryMetrics.reduce((sum, m) => sum + m.metadata.flakinessScore, 0) / categoryMetrics.length;
      
      let priority: 'high' | 'medium' | 'low';
      let schedule: 'early' | 'middle' | 'late';
      
      // Determine priority based on duration and flakiness
      if (avgDuration < 10000 && flakinessScore < 0.05) {
        priority = 'high';
        schedule = 'early';
      } else if (avgDuration < 30000 && flakinessScore < 0.1) {
        priority = 'medium';
        schedule = 'middle';
      } else {
        priority = 'low';
        schedule = 'late';
      }
      
      recommendations.push({
        category: category as TestCategory,
        priority,
        schedule,
        avgDuration,
        flakinessScore,
        reasoning: this.generateScheduleReasoning(avgDuration, flakinessScore, category as TestCategory)
      });
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Private helper methods

  private categorizeTest(filePath: string): TestCategory {
    if (filePath.includes('unit/')) return 'unit';
    if (filePath.includes('components/')) return 'components';
    if (filePath.includes('integration/')) return 'integration';
    if (filePath.includes('property/')) return 'property';
    if (filePath.includes('contract/')) return 'contract';
    if (filePath.includes('a11y/')) return 'accessibility';
    if (filePath.includes('e2e/')) return 'e2e';
    if (filePath.includes('performance/')) return 'performance';
    if (filePath.includes('security/')) return 'security';
    if (filePath.includes('fuzzing/')) return 'fuzzing';
    return 'unit'; // default
  }

  private extractTestMetadata(testFile: any, output: string): TestMetadata {
    // Parse Vitest timing output for detailed metrics
    const timingMatch = output.match(/Duration\s+([\d.]+)s\s+\(transform\s+([\d.]+)ms,\s+setup\s+([\d.]+)ms,\s+import\s+([\d.]+)ms,\s+tests\s+([\d.]+)ms/);
    
    if (timingMatch) {
      return {
        transformTime: parseFloat(timingMatch[2]),
        setupTime: parseFloat(timingMatch[3]),
        importTime: parseFloat(timingMatch[4]),
        testExecutionTime: parseFloat(timingMatch[5]),
        environmentTime: 0, // Not available in current output format
        flakinessScore: this.calculateFlakinessScore(testFile),
        passRate: this.calculatePassRate(testFile)
      };
    }
    
    // Fallback to basic metrics
    return {
      transformTime: 0,
      setupTime: 0,
      importTime: 0,
      testExecutionTime: testFile.duration || 0,
      environmentTime: 0,
      flakinessScore: this.calculateFlakinessScore(testFile),
      passRate: this.calculatePassRate(testFile)
    };
  }

  private calculateFlakinessScore(testFile: any): number {
    // Simple flakiness calculation based on test results
    // In a real implementation, this would analyze historical pass/fail patterns
    const totalTests = testFile.numTotalTests || 1;
    const failedTests = testFile.numFailedTests || 0;
    return Math.min(failedTests / totalTests, 1.0);
  }

  private calculatePassRate(testFile: any): number {
    const totalTests = testFile.numTotalTests || 1;
    const passedTests = testFile.numPassedTests || 0;
    return passedTests / totalTests;
  }

  private calculateRegression(current: number, baseline: number): number {
    if (baseline === 0) return 0;
    return ((current - baseline) / baseline) * 100;
  }

  private getRegressionThreshold(category: TestCategory, regression: number): number {
    // Category-specific regression thresholds
    const thresholds = {
      unit: 30,
      components: 25,
      integration: 20,
      property: 15,
      contract: 20,
      accessibility: 25,
      e2e: 15,
      performance: 10,
      security: 20,
      fuzzing: 15
    };
    
    return thresholds[category] || 20;
  }

  private saveMetrics(metrics: TestMetrics[]): void {
    const existingMetrics = this.loadMetrics();
    const updatedMetrics = [...existingMetrics, ...metrics];
    writeFileSync(this.metricsFile, JSON.stringify(updatedMetrics, null, 2));
  }

  private loadMetrics(): TestMetrics[] {
    if (!existsSync(this.metricsFile)) return [];
    try {
      return JSON.parse(readFileSync(this.metricsFile, 'utf8'));
    } catch {
      return [];
    }
  }

  private loadBaseline(): Record<string, TestMetrics> {
    if (!existsSync(this.baselineFile)) return {};
    try {
      return JSON.parse(readFileSync(this.baselineFile, 'utf8'));
    } catch {
      return {};
    }
  }

  private loadAlerts(): RegressionAlert[] {
    if (!existsSync(this.alertsFile)) return [];
    try {
      return JSON.parse(readFileSync(this.alertsFile, 'utf8'));
    } catch {
      return [];
    }
  }

  private saveAlerts(alerts: RegressionAlert[]): void {
    const existingAlerts = this.loadAlerts();
    const updatedAlerts = [...existingAlerts, ...alerts];
    writeFileSync(this.alertsFile, JSON.stringify(updatedAlerts, null, 2));
  }

  private groupMetricsByTest(metrics: TestMetrics[]): Record<string, TestMetrics[]> {
    return metrics.reduce((groups, metric) => {
      if (!groups[metric.testFile]) {
        groups[metric.testFile] = [];
      }
      groups[metric.testFile].push(metric);
      return groups;
    }, {} as Record<string, TestMetrics[]>);
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

  private generateSummary(metrics: TestMetrics[]): PerformanceSummary {
    const totalTests = metrics.length;
    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    const avgDuration = totalDuration / totalTests;
    
    const categoryCounts = metrics.reduce((counts, metric) => {
      counts[metric.category] = (counts[metric.category] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    return {
      totalTests,
      totalDuration,
      avgDuration,
      categoryCounts,
      environment: this.environment,
      lastUpdated: new Date().toISOString()
    };
  }

  private analyzeCategories(metrics: TestMetrics[]): CategoryAnalysis[] {
    const categoryGroups = this.groupMetricsByCategory(metrics);
    
    return Object.entries(categoryGroups).map(([category, categoryMetrics]) => {
      const durations = categoryMetrics.map(m => m.duration);
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      const threshold = this.thresholds[category as TestCategory];
      
      const warningCount = durations.filter(d => d >= threshold.warning).length;
      const criticalCount = durations.filter(d => d >= threshold.critical).length;
      
      return {
        category: category as TestCategory,
        testCount: categoryMetrics.length,
        avgDuration,
        maxDuration,
        minDuration,
        threshold,
        warningCount,
        criticalCount,
        healthScore: this.calculateCategoryHealthScore(categoryMetrics, threshold)
      };
    });
  }

  private calculateCategoryHealthScore(metrics: TestMetrics[], threshold: { warning: number; critical: number }): number {
    const warningCount = metrics.filter(m => m.duration >= threshold.warning).length;
    const criticalCount = metrics.filter(m => m.duration >= threshold.critical).length;
    
    const totalTests = metrics.length;
    const healthyTests = totalTests - warningCount - criticalCount;
    
    return (healthyTests / totalTests) * 100;
  }

  private analyzeRegressions(alerts: RegressionAlert[]): RegressionAnalysis {
    const totalRegressions = alerts.length;
    const criticalRegressions = alerts.filter(a => a.severity === 'critical').length;
    const warningRegressions = alerts.filter(a => a.severity === 'warning').length;
    
    const categoryRegressions = alerts.reduce((counts, alert) => {
      counts[alert.category] = (counts[alert.category] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const avgRegression = alerts.length > 0 
      ? alerts.reduce((sum, a) => sum + a.regressionPercentage, 0) / alerts.length 
      : 0;
    
    return {
      totalRegressions,
      criticalRegressions,
      warningRegressions,
      categoryRegressions,
      avgRegressionPercentage: avgRegression,
      lastDetected: alerts.length > 0 ? alerts[alerts.length - 1].timestamp : null
    };
  }

  private analyzeTrends(metrics: TestMetrics[]): TrendAnalysis[] {
    // Simple trend analysis - in production would use more sophisticated algorithms
    const categoryGroups = this.groupMetricsByCategory(metrics);
    
    return Object.entries(categoryGroups).map(([category, categoryMetrics]) => {
      const sortedMetrics = categoryMetrics.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      if (sortedMetrics.length < 2) {
        return {
          category: category as TestCategory,
          trend: 'stable',
          trendPercentage: 0,
          dataPoints: sortedMetrics.length
        };
      }
      
      const recent = sortedMetrics.slice(-5); // Last 5 runs
      const older = sortedMetrics.slice(-10, -5); // Previous 5 runs
      
      if (older.length === 0) {
        return {
          category: category as TestCategory,
          trend: 'stable',
          trendPercentage: 0,
          dataPoints: sortedMetrics.length
        };
      }
      
      const recentAvg = recent.reduce((sum, m) => sum + m.duration, 0) / recent.length;
      const olderAvg = older.reduce((sum, m) => sum + m.duration, 0) / older.length;
      
      const trendPercentage = ((recentAvg - olderAvg) / olderAvg) * 100;
      let trend: 'improving' | 'degrading' | 'stable';
      
      if (Math.abs(trendPercentage) < 5) {
        trend = 'stable';
      } else if (trendPercentage > 0) {
        trend = 'degrading';
      } else {
        trend = 'improving';
      }
      
      return {
        category: category as TestCategory,
        trend,
        trendPercentage,
        dataPoints: sortedMetrics.length
      };
    });
  }

  private generateRecommendations(metrics: TestMetrics[], alerts: RegressionAlert[]): string[] {
    const recommendations: string[] = [];
    
    if (alerts.length > 0) {
      recommendations.push(`Address ${alerts.length} performance regressions detected in recent runs`);
    }
    
    const categoryGroups = this.groupMetricsByCategory(metrics);
    Object.entries(categoryGroups).forEach(([category, categoryMetrics]) => {
      const avgDuration = categoryMetrics.reduce((sum, m) => sum + m.duration, 0) / categoryMetrics.length;
      const threshold = this.thresholds[category as TestCategory];
      
      if (avgDuration > threshold.warning) {
        recommendations.push(`Optimize ${category} tests - average duration (${Math.round(avgDuration)}ms) exceeds warning threshold (${threshold.warning}ms)`);
      }
    });
    
    return recommendations;
  }

  private generateScheduleReasoning(avgDuration: number, flakinessScore: number, category: TestCategory): string {
    if (avgDuration < 10000 && flakinessScore < 0.05) {
      return `Fast and reliable tests - ideal for early execution to provide quick feedback`;
    } else if (avgDuration < 30000 && flakinessScore < 0.1) {
      return `Moderate duration with acceptable stability - suitable for middle execution`;
    } else {
      return `Long-running or potentially flaky tests - best scheduled late to avoid blocking faster feedback`;
    }
  }
}

// Type definitions for report generation
export interface PerformanceReport {
  generated: string;
  summary: PerformanceSummary;
  categoryAnalysis: CategoryAnalysis[];
  regressionAnalysis: RegressionAnalysis;
  trends: TrendAnalysis[];
  recommendations: string[];
  thresholds: PerformanceThresholds;
}

export interface PerformanceSummary {
  totalTests: number;
  totalDuration: number;
  avgDuration: number;
  categoryCounts: Record<string, number>;
  environment: string;
  lastUpdated: string;
}

export interface CategoryAnalysis {
  category: TestCategory;
  testCount: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
  threshold: { warning: number; critical: number };
  warningCount: number;
  criticalCount: number;
  healthScore: number;
}

export interface RegressionAnalysis {
  totalRegressions: number;
  criticalRegressions: number;
  warningRegressions: number;
  categoryRegressions: Record<string, number>;
  avgRegressionPercentage: number;
  lastDetected: string | null;
}

export interface TrendAnalysis {
  category: TestCategory;
  trend: 'improving' | 'degrading' | 'stable';
  trendPercentage: number;
  dataPoints: number;
}

export interface SchedulingRecommendation {
  category: TestCategory;
  priority: 'high' | 'medium' | 'low';
  schedule: 'early' | 'middle' | 'late';
  avgDuration: number;
  flakinessScore: number;
  reasoning: string;
}
