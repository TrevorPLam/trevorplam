import { PerformanceMonitor, TestMetrics, RegressionAlert, TestCategory } from './performance-monitor';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface RegressionPattern {
  testFile: string;
  category: TestCategory;
  pattern: 'gradual' | 'sudden' | 'intermittent';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  detectedAt: string;
  trendData: TrendDataPoint[];
}

export interface TrendDataPoint {
  timestamp: string;
  duration: number;
  environment: string;
}

export interface IntelligentThreshold {
  testFile: string;
  category: TestCategory;
  baseline: number;
  adaptiveThreshold: number;
  confidence: number;
  lastUpdated: string;
  adjustmentHistory: ThresholdAdjustment[];
}

export interface ThresholdAdjustment {
  timestamp: string;
  oldThreshold: number;
  newThreshold: number;
  reason: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface RegressionPrediction {
  testFile: string;
  category: TestCategory;
  riskScore: number; // 0-1
  predictedRegression: number; // percentage
  confidence: number; // 0-1
  factors: RiskFactor[];
  recommendation: string;
}

export interface RiskFactor {
  type: 'historical' | 'complexity' | 'dependency' | 'environmental';
  weight: number;
  description: string;
}

export class RegressionDetector {
  private readonly monitor: PerformanceMonitor;
  private readonly patternsFile: string;
  private readonly thresholdsFile: string;
  private readonly predictionsFile: string;

  constructor(metricsDir: string = 'tests/metrics') {
    this.monitor = new PerformanceMonitor(metricsDir);
    this.patternsFile = join(metricsDir, 'regression-patterns.json');
    this.thresholdsFile = join(metricsDir, 'intelligent-thresholds.json');
    this.predictionsFile = join(metricsDir, 'regression-predictions.json');
  }

  /**
   * Perform comprehensive regression analysis
   */
  async analyzeRegressions(): Promise<RegressionAnalysisResult> {
    console.log('Starting comprehensive regression analysis...');
    
    // Collect recent metrics
    const metrics = await this.monitor.collectTestMetrics();
    
    // Detect current regressions
    const currentRegressions = this.monitor.detectRegressions(metrics);
    
    // Analyze historical patterns
    const patterns = this.analyzeRegressionPatterns(metrics);
    
    // Update intelligent thresholds
    const thresholds = this.updateIntelligentThresholds(metrics, patterns);
    
    // Predict future regressions
    const predictions = this.predictRegressions(metrics, patterns);
    
    // Generate comprehensive report
    const result: RegressionAnalysisResult = {
      timestamp: new Date().toISOString(),
      currentRegressions,
      patterns,
      intelligentThresholds: thresholds,
      predictions,
      summary: this.generateRegressionSummary(currentRegressions, patterns, predictions),
      recommendations: this.generateRecommendations(currentRegressions, patterns, predictions)
    };
    
    // Save analysis results
    this.saveAnalysisResults(result);
    
    return result;
  }

  /**
   * Analyze historical regression patterns
   */
  private analyzeRegressionPatterns(metrics: TestMetrics[]): RegressionPattern[] {
    console.log('Analyzing historical regression patterns...');
    
    const patterns: RegressionPattern[] = [];
    const groupedMetrics = this.groupMetricsByTest(metrics);
    
    Object.entries(groupedMetrics).forEach(([testFile, testMetrics]) => {
      if (testMetrics.length < 5) return; // Need sufficient data points
      
      const sortedMetrics = testMetrics.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const trendData: TrendDataPoint[] = sortedMetrics.map(metric => ({
        timestamp: metric.timestamp,
        duration: metric.duration,
        environment: metric.environment
      }));
      
      const pattern = this.detectPattern(trendData, testFile, this.monitor.categorizeTest(testFile));
      if (pattern) {
        patterns.push(pattern);
      }
    });
    
    return patterns;
  }

  /**
   * Detect specific regression patterns in time series data
   */
  private detectPattern(
    trendData: TrendDataPoint[], 
    testFile: string, 
    category: TestCategory
  ): RegressionPattern | null {
    const durations = trendData.map(d => d.duration);
    const recentData = durations.slice(-10); // Last 10 data points
    const olderData = durations.slice(-20, -10); // Previous 10 data points
    
    if (recentData.length < 5 || olderData.length < 5) {
      return null;
    }
    
    const recentAvg = recentData.reduce((sum, d) => sum + d, 0) / recentData.length;
    const olderAvg = olderData.reduce((sum, d) => sum + d, 0) / olderData.length;
    const overallChange = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    // Calculate variance to detect stability
    const recentVariance = this.calculateVariance(recentData);
    const olderVariance = this.calculateVariance(olderData);
    
    let pattern: 'gradual' | 'sudden' | 'intermittent';
    let severity: 'low' | 'medium' | 'high' | 'critical';
    let confidence: number;
    
    // Determine pattern type
    if (recentVariance > olderVariance * 2) {
      pattern = 'intermittent'; // High variance indicates intermittent issues
      confidence = Math.min(0.9, recentVariance / olderVariance / 2);
    } else if (Math.abs(overallChange) > 20) {
      pattern = 'sudden'; // Large change indicates sudden regression
      confidence = Math.min(0.9, Math.abs(overallChange) / 50);
    } else if (overallChange > 5) {
      pattern = 'gradual'; // Smaller but consistent change
      confidence = Math.min(0.8, Math.abs(overallChange) / 25);
    } else {
      return null; // No significant pattern detected
    }
    
    // Determine severity based on impact
    const absChange = Math.abs(overallChange);
    if (absChange > 50) {
      severity = 'critical';
    } else if (absChange > 25) {
      severity = 'high';
    } else if (absChange > 10) {
      severity = 'medium';
    } else {
      severity = 'low';
    }
    
    return {
      testFile,
      category,
      pattern,
      severity,
      confidence,
      detectedAt: new Date().toISOString(),
      trendData
    };
  }

  /**
   * Update intelligent thresholds based on historical data
   */
  private updateIntelligentThresholds(
    metrics: TestMetrics[], 
    patterns: RegressionPattern[]
  ): IntelligentThreshold[] {
    console.log('Updating intelligent thresholds...');
    
    const thresholds: IntelligentThreshold[] = [];
    const groupedMetrics = this.groupMetricsByTest(metrics);
    const existingThresholds = this.loadIntelligentThresholds();
    
    Object.entries(groupedMetrics).forEach(([testFile, testMetrics]) => {
      if (testMetrics.length < 3) return; // Need minimum data
      
      const category = this.monitor.categorizeTest(testFile);
      const durations = testMetrics.map(m => m.duration);
      
      // Calculate statistical baseline
      const sortedDurations = durations.sort((a, b) => a - b);
      const median = sortedDurations[Math.floor(sortedDurations.length / 2)];
      const stdDev = Math.sqrt(this.calculateVariance(durations));
      
      // Check for existing pattern affecting this test
      const pattern = patterns.find(p => p.testFile === testFile);
      const existingThreshold = existingThresholds[testFile];
      
      let adaptiveThreshold: number;
      let confidence: number;
      let adjustmentHistory: ThresholdAdjustment[] = [];
      
      if (pattern && pattern.confidence > 0.7) {
        // Adjust threshold based on detected pattern
        const adjustmentFactor = this.getPatternAdjustmentFactor(pattern);
        adaptiveThreshold = median + (stdDev * 2 * adjustmentFactor);
        confidence = pattern.confidence;
        
        if (existingThreshold) {
          adjustmentHistory = [
            ...existingThreshold.adjustmentHistory,
            {
              timestamp: new Date().toISOString(),
              oldThreshold: existingThreshold.adaptiveThreshold,
              newThreshold: adaptiveThreshold,
              reason: `Pattern detected: ${pattern.pattern} regression`,
              impact: adaptiveThreshold > existingThreshold.adaptiveThreshold ? 'negative' : 'positive'
            }
          ];
        }
      } else {
        // Standard statistical threshold
        adaptiveThreshold = median + (stdDev * 2);
        confidence = 0.8;
        
        if (existingThreshold) {
          adjustmentHistory = existingThreshold.adjustmentHistory;
        }
      }
      
      thresholds.push({
        testFile,
        category,
        baseline: median,
        adaptiveThreshold,
        confidence,
        lastUpdated: new Date().toISOString(),
        adjustmentHistory
      });
    });
    
    // Save updated thresholds
    this.saveIntelligentThresholds(thresholds);
    
    return thresholds;
  }

  /**
   * Predict future regressions using ML-inspired analysis
   */
  private predictRegressions(
    metrics: TestMetrics[], 
    patterns: RegressionPattern[]
  ): RegressionPrediction[] {
    console.log('Predicting future regressions...');
    
    const predictions: RegressionPrediction[] = [];
    const groupedMetrics = this.groupMetricsByTest(metrics);
    
    Object.entries(groupedMetrics).forEach(([testFile, testMetrics]) => {
      if (testMetrics.length < 5) return; // Need sufficient historical data
      
      const category = this.monitor.categorizeTest(testFile);
      const factors = this.analyzeRiskFactors(testFile, testMetrics, patterns);
      const riskScore = this.calculateRiskScore(factors);
      const predictedRegression = this.predictRegressionPercentage(testMetrics, riskScore);
      const confidence = this.calculatePredictionConfidence(testMetrics, factors);
      
      const recommendation = this.generateRecommendation(riskScore, predictedRegression, category);
      
      predictions.push({
        testFile,
        category,
        riskScore,
        predictedRegression,
        confidence,
        factors,
        recommendation
      });
    });
    
    // Sort by risk score (highest first)
    predictions.sort((a, b) => b.riskScore - a.riskScore);
    
    return predictions;
  }

  /**
   * Analyze risk factors for regression prediction
   */
  private analyzeRiskFactors(
    testFile: string, 
    testMetrics: TestMetrics[], 
    patterns: RegressionPattern[]
  ): RiskFactor[] {
    const factors: RiskFactor[] = [];
    
    // Historical factor
    const recentTrend = this.calculateRecentTrend(testMetrics);
    if (recentTrend > 10) {
      factors.push({
        type: 'historical',
        weight: 0.4,
        description: `Recent performance trend shows ${recentTrend.toFixed(1)}% degradation`
      });
    }
    
    // Complexity factor (based on test duration variance)
    const variance = this.calculateVariance(testMetrics.map(m => m.duration));
    const avgDuration = testMetrics.reduce((sum, m) => sum + m.duration, 0) / testMetrics.length;
    const coefficientOfVariation = Math.sqrt(variance) / avgDuration;
    
    if (coefficientOfVariation > 0.3) {
      factors.push({
        type: 'complexity',
        weight: 0.3,
        description: `High performance variance (CV: ${(coefficientOfVariation * 100).toFixed(1)}%)`
      });
    }
    
    // Pattern factor
    const pattern = patterns.find(p => p.testFile === testFile);
    if (pattern && pattern.confidence > 0.6) {
      factors.push({
        type: 'dependency',
        weight: 0.2,
        description: `Historical ${pattern.pattern} regression pattern detected`
      });
    }
    
    // Environmental factor
    const environmentVariance = this.calculateEnvironmentVariance(testMetrics);
    if (environmentVariance > 0.2) {
      factors.push({
        type: 'environmental',
        weight: 0.1,
        description: `Performance varies significantly between environments`
      });
    }
    
    return factors;
  }

  /**
   * Calculate overall risk score from factors
   */
  private calculateRiskScore(factors: RiskFactor[]): number {
    return factors.reduce((score, factor) => score + (factor.weight * factor.weight), 0);
  }

  /**
   * Predict regression percentage based on historical data and risk factors
   */
  private predictRegressionPercentage(testMetrics: TestMetrics[], riskScore: number): number {
    const recentTrend = this.calculateRecentTrend(testMetrics);
    const basePrediction = Math.max(0, recentTrend);
    
    // Adjust based on risk score
    const riskMultiplier = 1 + (riskScore * 0.5);
    
    return Math.min(basePrediction * riskMultiplier, 100);
  }

  /**
   * Calculate confidence in prediction
   */
  private calculatePredictionConfidence(testMetrics: TestMetrics[], factors: RiskFactor[]): number {
    const dataPoints = testMetrics.length;
    const dataConfidence = Math.min(0.9, dataPoints / 20); // More data = higher confidence
    
    const factorConfidence = factors.reduce((sum, factor) => sum + factor.weight, 0);
    
    return (dataConfidence + factorConfidence) / 2;
  }

  /**
   * Generate recommendation based on risk assessment
   */
  private generateRecommendation(riskScore: number, predictedRegression: number, category: TestCategory): string {
    if (riskScore > 0.8) {
      return `HIGH RISK: Immediate optimization recommended. Predicted ${predictedRegression.toFixed(1)}% regression.`;
    } else if (riskScore > 0.6) {
      return `MODERATE RISK: Monitor closely and consider optimization. Predicted ${predictedRegression.toFixed(1)}% regression.`;
    } else if (riskScore > 0.4) {
      return `LOW RISK: Continue monitoring. Predicted ${predictedRegression.toFixed(1)}% regression.`;
    } else {
      return `MINIMAL RISK: No immediate action needed.`;
    }
  }

  // Helper methods

  private groupMetricsByTest(metrics: TestMetrics[]): Record<string, TestMetrics[]> {
    return metrics.reduce((groups, metric) => {
      if (!groups[metric.testFile]) {
        groups[metric.testFile] = [];
      }
      groups[metric.testFile].push(metric);
      return groups;
    }, {} as Record<string, TestMetrics[]>);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private calculateRecentTrend(testMetrics: TestMetrics[]): number {
    const sortedMetrics = testMetrics.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    if (sortedMetrics.length < 6) return 0;
    
    const recent = sortedMetrics.slice(-3); // Last 3 runs
    const previous = sortedMetrics.slice(-6, -3); // Previous 3 runs
    
    const recentAvg = recent.reduce((sum, m) => sum + m.duration, 0) / recent.length;
    const previousAvg = previous.reduce((sum, m) => sum + m.duration, 0) / previous.length;
    
    return ((recentAvg - previousAvg) / previousAvg) * 100;
  }

  private calculateEnvironmentVariance(testMetrics: TestMetrics[]): number {
    const ciMetrics = testMetrics.filter(m => m.environment === 'ci');
    const localMetrics = testMetrics.filter(m => m.environment === 'local');
    
    if (ciMetrics.length === 0 || localMetrics.length === 0) return 0;
    
    const ciAvg = ciMetrics.reduce((sum, m) => sum + m.duration, 0) / ciMetrics.length;
    const localAvg = localMetrics.reduce((sum, m) => sum + m.duration, 0) / localMetrics.length;
    
    return Math.abs(ciAvg - localAvg) / Math.max(ciAvg, localAvg);
  }

  private getPatternAdjustmentFactor(pattern: RegressionPattern): number {
    switch (pattern.pattern) {
      case 'sudden':
        return 1.5; // Higher threshold for sudden regressions
      case 'gradual':
        return 1.2; // Moderate adjustment for gradual regressions
      case 'intermittent':
        return 1.8; // Higher threshold for intermittent issues
      default:
        return 1.0;
    }
  }

  private loadIntelligentThresholds(): Record<string, IntelligentThreshold> {
    if (!existsSync(this.thresholdsFile)) return {};
    try {
      const thresholds = JSON.parse(readFileSync(this.thresholdsFile, 'utf8'));
      return thresholds.reduce((acc: Record<string, IntelligentThreshold>, threshold: IntelligentThreshold) => {
        acc[threshold.testFile] = threshold;
        return acc;
      }, {});
    } catch {
      return {};
    }
  }

  private saveIntelligentThresholds(thresholds: IntelligentThreshold[]): void {
    writeFileSync(this.thresholdsFile, JSON.stringify(thresholds, null, 2));
  }

  private generateRegressionSummary(
    currentRegressions: RegressionAlert[],
    patterns: RegressionPattern[],
    predictions: RegressionPrediction[]
  ): RegressionSummary {
    const highRiskPredictions = predictions.filter(p => p.riskScore > 0.7);
    const criticalPatterns = patterns.filter(p => p.severity === 'critical');
    
    return {
      currentRegressions: currentRegressions.length,
      criticalRegressions: currentRegressions.filter(r => r.severity === 'critical').length,
      detectedPatterns: patterns.length,
      criticalPatterns: criticalPatterns.length,
      highRiskPredictions: highRiskPredictions.length,
      overallRiskScore: predictions.length > 0 
        ? predictions.reduce((sum, p) => sum + p.riskScore, 0) / predictions.length 
        : 0
    };
  }

  private generateRecommendations(
    currentRegressions: RegressionAlert[],
    patterns: RegressionPattern[],
    predictions: RegressionPrediction[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (currentRegressions.length > 0) {
      recommendations.push(`Address ${currentRegressions.length} active regressions immediately`);
    }
    
    const criticalPatterns = patterns.filter(p => p.severity === 'critical');
    if (criticalPatterns.length > 0) {
      recommendations.push(`Investigate ${criticalPatterns.length} critical regression patterns`);
    }
    
    const highRiskPredictions = predictions.filter(p => p.riskScore > 0.8);
    if (highRiskPredictions.length > 0) {
      recommendations.push(`Proactively optimize ${highRiskPredictions.length} high-risk tests`);
    }
    
    return recommendations;
  }

  private saveAnalysisResults(result: RegressionAnalysisResult): void {
    const resultsFile = join(dirname(this.patternsFile), 'regression-analysis.json');
    writeFileSync(resultsFile, JSON.stringify(result, null, 2));
  }
}

// Type definitions
export interface RegressionAnalysisResult {
  timestamp: string;
  currentRegressions: RegressionAlert[];
  patterns: RegressionPattern[];
  intelligentThresholds: IntelligentThreshold[];
  predictions: RegressionPrediction[];
  summary: RegressionSummary;
  recommendations: string[];
}

export interface RegressionSummary {
  currentRegressions: number;
  criticalRegressions: number;
  detectedPatterns: number;
  criticalPatterns: number;
  highRiskPredictions: number;
  overallRiskScore: number;
}
