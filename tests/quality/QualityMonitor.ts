/**
 * Real-Time Quality Monitoring Dashboard
 * Provides live quality metrics tracking and alerting
 */

export interface QualityMetrics {
  codeCoverage?: number;
  testPassRate?: number;
  defectDensity?: number;
  performanceScore?: number;
  securityScore?: number;
  buildTime?: number;
  bundleSize?: number;
  timestamp: Date;
}

export interface QualityThresholds {
  codeCoverage: number;
  testPassRate: number;
  defectDensity: number;
  performanceScore: number;
  securityScore: number;
  buildTime: number;
  bundleSize: number;
}

export interface QualityAlert {
  type: 'warning' | 'error' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
}

/**
 * Real-Time Quality Monitoring Dashboard
 * Tracks quality metrics and provides alerts for threshold violations
 */
export class QualityMonitor {
  private static metrics: QualityMetrics[] = [];
  private static thresholds: QualityThresholds = {
    codeCoverage: 80,
    testPassRate: 95,
    defectDensity: 1,
    performanceScore: 90,
    securityScore: 95,
    buildTime: 120000, // 2 minutes in ms
    bundleSize: 1048576 // 1MB in bytes
  };

  /**
   * Record quality metrics from test execution
   */
  static recordMetrics(metrics: Partial<QualityMetrics>): void {
    const fullMetrics: QualityMetrics = {
      ...metrics,
      timestamp: new Date()
    };

    this.metrics.push(fullMetrics);
    this.checkThresholds(fullMetrics);
    this.updateDashboard(fullMetrics);
  }

  /**
   * Check metrics against thresholds and generate alerts
   */
  private static checkThresholds(metrics: QualityMetrics): QualityAlert[] {
    const alerts: QualityAlert[] = [];

    // Code coverage check
    if (metrics.codeCoverage !== undefined && metrics.codeCoverage < this.thresholds.codeCoverage) {
      alerts.push({
        type: 'warning',
        message: `Code coverage ${metrics.codeCoverage}% below threshold ${this.thresholds.codeCoverage}%`,
        metric: 'codeCoverage',
        value: metrics.codeCoverage,
        threshold: this.thresholds.codeCoverage
      });
    }

    // Test pass rate check
    if (metrics.testPassRate !== undefined && metrics.testPassRate < this.thresholds.testPassRate) {
      alerts.push({
        type: 'error',
        message: `Test pass rate ${metrics.testPassRate}% below threshold ${this.thresholds.testPassRate}%`,
        metric: 'testPassRate',
        value: metrics.testPassRate,
        threshold: this.thresholds.testPassRate
      });
    }

    // Defect density check
    if (metrics.defectDensity !== undefined && metrics.defectDensity > this.thresholds.defectDensity) {
      alerts.push({
        type: 'warning',
        message: `Defect density ${metrics.defectDensity} above threshold ${this.thresholds.defectDensity}`,
        metric: 'defectDensity',
        value: metrics.defectDensity,
        threshold: this.thresholds.defectDensity
      });
    }

    // Performance score check
    if (metrics.performanceScore !== undefined && metrics.performanceScore < this.thresholds.performanceScore) {
      alerts.push({
        type: 'warning',
        message: `Performance score ${metrics.performanceScore} below threshold ${this.thresholds.performanceScore}`,
        metric: 'performanceScore',
        value: metrics.performanceScore,
        threshold: this.thresholds.performanceScore
      });
    }

    // Security score check
    if (metrics.securityScore !== undefined && metrics.securityScore < this.thresholds.securityScore) {
      alerts.push({
        type: 'error',
        message: `Security score ${metrics.securityScore} below threshold ${this.thresholds.securityScore}`,
        metric: 'securityScore',
        value: metrics.securityScore,
        threshold: this.thresholds.securityScore
      });
    }

    // Build time check
    if (metrics.buildTime !== undefined && metrics.buildTime > this.thresholds.buildTime) {
      alerts.push({
        type: 'warning',
        message: `Build time ${metrics.buildTime}ms above threshold ${this.thresholds.buildTime}ms`,
        metric: 'buildTime',
        value: metrics.buildTime,
        threshold: this.thresholds.buildTime
      });
    }

    // Bundle size check
    if (metrics.bundleSize !== undefined && metrics.bundleSize > this.thresholds.bundleSize) {
      alerts.push({
        type: 'error',
        message: `Bundle size ${metrics.bundleSize} bytes above threshold ${this.thresholds.bundleSize} bytes`,
        metric: 'bundleSize',
        value: metrics.bundleSize,
        threshold: this.thresholds.bundleSize
      });
    }

    return alerts;
  }

  /**
   * Update quality dashboard with latest metrics
   */
  private static updateDashboard(metrics: QualityMetrics): void {
    // This would integrate with your dashboard system
    // For now, log to console and store in memory
    console.log('📊 Quality Metrics Updated:', {
      timestamp: metrics.timestamp,
      codeCoverage: `${metrics.codeCoverage}%`,
      testPassRate: `${metrics.testPassRate}%`,
      defectDensity: metrics.defectDensity,
      performanceScore: metrics.performanceScore,
      securityScore: metrics.securityScore,
      buildTime: `${metrics.buildTime}ms`,
      bundleSize: `${metrics.bundleSize} bytes`
    });

    // Store metrics for dashboard access
    if (typeof window !== 'undefined') {
      window.qualityMetrics = metrics;
    }
  }

  /**
   * Get current quality metrics
   */
  static getCurrentMetrics(): QualityMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get quality trend over time
   */
  static getQualityTrend(hours: number = 24): QualityMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(metric => metric.timestamp >= cutoff);
  }

  /**
   * Calculate quality score (0-100)
   */
  static calculateQualityScore(metrics: QualityMetrics): number {
    const weights = {
      codeCoverage: 0.3,
      testPassRate: 0.25,
      defectDensity: 0.2,
      performanceScore: 0.15,
      securityScore: 0.1
    };

    const normalizedScores = {
      codeCoverage: Math.min((metrics.codeCoverage ?? 0) / 100, 1),
      testPassRate: (metrics.testPassRate ?? 0) / 100,
      defectDensity: Math.max(0, 1 - ((metrics.defectDensity ?? 0) / 10)), // Inverse, lower is better
      performanceScore: (metrics.performanceScore ?? 0) / 100,
      securityScore: (metrics.securityScore ?? 0) / 100
    };

    const score = Object.entries(weights).reduce((total, [metric, weight]) => {
      return total + (normalizedScores[metric as keyof typeof normalizedScores] * weight);
    }, 0);

    return Math.round(score * 100);
  }

  /**
   * Generate quality report
   */
  static generateQualityReport(): string {
    const latestMetrics = this.getCurrentMetrics();
    if (!latestMetrics) {
      return 'No quality metrics available';
    }

    const qualityScore = this.calculateQualityScore(latestMetrics);
    const trend = this.getQualityTrend(24);
    
    return `
# Quality Report - ${latestMetrics.timestamp.toLocaleDateString()}

## Overall Quality Score: ${qualityScore}/100

### Current Metrics
- **Code Coverage**: ${latestMetrics.codeCoverage ?? 0}%
- **Test Pass Rate**: ${latestMetrics.testPassRate ?? 0}%
- **Defect Density**: ${latestMetrics.defectDensity ?? 0}
- **Performance Score**: ${latestMetrics.performanceScore ?? 0}/100
- **Security Score**: ${latestMetrics.securityScore ?? 0}/100
- **Build Time**: ${latestMetrics.buildTime ?? 0}ms
- **Bundle Size**: ${latestMetrics.bundleSize ?? 0} bytes

### 24-Hour Trend
${trend.map((metric, index) => `
${index + 1}. ${metric.timestamp.toLocaleDateString()} - Score: ${this.calculateQualityScore(metric)}
`).join('\n')}

### Recommendations
${this.generateRecommendations(latestMetrics, qualityScore)}
    `.trim();
  }

  /**
   * Generate recommendations based on quality metrics
   */
  private static generateRecommendations(metrics: QualityMetrics, score: number): string {
    const recommendations: string[] = [];

    if ((metrics.codeCoverage ?? 0) < 80) {
      recommendations.push('🔍 Increase test coverage to meet 80% threshold');
    }

    if ((metrics.testPassRate ?? 0) < 95) {
      recommendations.push('🧪 Address failing tests to improve pass rate');
    }

    if ((metrics.defectDensity ?? 0) > 1) {
      recommendations.push('🐛 Focus on reducing defect density through better testing');
    }

    if ((metrics.performanceScore ?? 0) < 90) {
      recommendations.push('⚡ Optimize build performance and reduce bundle size');
    }

    if ((metrics.securityScore ?? 0) < 95) {
      recommendations.push('🔒 Address security vulnerabilities and compliance issues');
    }

    if (score >= 90) {
      recommendations.push('✅ Excellent quality metrics - maintain current practices');
    } else if (score >= 70) {
      recommendations.push('⚠️ Good quality metrics - room for improvement');
    } else {
      recommendations.push('❌ Poor quality metrics - immediate attention required');
    }

    return recommendations.join('\n');
  }

  /**
   * Export metrics for external monitoring
   */
  static exportMetrics(): string {
    const latestMetrics = this.getCurrentMetrics();
    if (!latestMetrics) {
      return JSON.stringify({ error: 'No metrics available' });
    }

    return JSON.stringify({
      timestamp: latestMetrics.timestamp,
      metrics: latestMetrics,
      thresholds: this.thresholds,
      qualityScore: this.calculateQualityScore(latestMetrics),
      alerts: this.checkThresholds(latestMetrics)
    }, null, 2);
  }
}

// Extend global Window interface for dashboard integration
declare global {
  var qualityMetrics: QualityMetrics;
}
