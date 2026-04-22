import type { TestMetrics, TestCategory } from '../performance/performance-monitor';
import type { RealtimeEvent } from './realtime-server';
import type { Alert } from './alerting-system';

export interface HealthMetrics {
  overall: HealthScore;
  categories: Record<string, HealthScore>;
  trends: HealthTrend[];
  predictions: HealthPrediction[];
  recommendations: HealthRecommendation[];
}

export interface HealthScore {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: HealthFactor[];
  timestamp: string;
  confidence: number; // 0-1
}

export interface HealthFactor {
  name: string;
  weight: number; // 0-1
  value: number; // 0-100
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  trend: 'improving' | 'stable' | 'degrading';
}

export interface HealthTrend {
  metric: string;
  period: 'hourly' | 'daily' | 'weekly';
  direction: 'up' | 'down' | 'stable';
  changeRate: number; // percentage change
  significance: number; // 0-1, how significant the change is
  prediction: HealthPrediction;
}

export interface HealthPrediction {
  metric: string;
  timeframe: '1h' | '6h' | '24h' | '7d';
  predictedValue: number;
  confidence: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
}

export interface HealthRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'reliability' | 'maintainability' | 'security';
  title: string;
  description: string;
  impact: number; // Expected improvement in health score
  effort: 'low' | 'medium' | 'high';
  actions: string[];
}

export interface HealthScoringConfig {
  weights: HealthWeights;
  thresholds: HealthThresholds;
  mlConfig: MLConfiguration;
  retention: RetentionPolicy;
}

export interface HealthWeights {
  performance: number;
  reliability: number;
  maintainability: number;
  security: number;
  coverage: number;
}

export interface HealthThresholds {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
  critical: number;
}

export interface MLConfiguration {
  enablePredictions: boolean;
  enableTrendAnalysis: boolean;
  enableAnomalyDetection: boolean;
  modelComplexity: 'simple' | 'medium' | 'complex';
  trainingDataPoints: number;
  predictionHorizon: number; // hours
}

export interface RetentionPolicy {
  metricsHistory: number; // days
  trendsData: number; // days
  predictionsData: number; // days
  recommendationsData: number; // days
}

/**
 * ML-Inspired Test Health Scoring System
 * Uses machine learning concepts for trend analysis, predictions, and recommendations
 */
export class HealthScoringSystem {
  private config: HealthScoringConfig;
  private metricsHistory: TestMetrics[] = [];
  private healthHistory: HealthMetrics[] = [];
  private trends: HealthTrend[] = [];
  private predictions: HealthPrediction[] = [];
  private recommendations: HealthRecommendation[] = [];

  constructor(config?: Partial<HealthScoringConfig>) {
    this.config = {
      weights: {
        performance: 0.3,
        reliability: 0.3,
        maintainability: 0.2,
        security: 0.1,
        coverage: 0.1
      },
      thresholds: {
        excellent: 90,
        good: 75,
        fair: 60,
        poor: 40,
        critical: 25
      },
      mlConfig: {
        enablePredictions: true,
        enableTrendAnalysis: true,
        enableAnomalyDetection: true,
        modelComplexity: 'medium',
        trainingDataPoints: 100,
        predictionHorizon: 24
      },
      retention: {
        metricsHistory: 30,
        trendsData: 90,
        predictionsData: 7,
        recommendationsData: 30
      },
      ...config
    };
  }

  /**
   * Calculate comprehensive health score for test metrics
   */
  calculateHealthScore(metrics: TestMetrics[]): HealthMetrics {
    const timestamp = new Date().toISOString();
    
    // Update metrics history
    this.updateMetricsHistory(metrics);
    
    // Calculate category scores
    const categoryScores = this.calculateCategoryScores(metrics);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(categoryScores);
    
    // Analyze trends
    if (this.config.mlConfig.enableTrendAnalysis) {
      this.analyzeTrends();
    }
    
    // Generate predictions
    if (this.config.mlConfig.enablePredictions) {
      this.generatePredictions();
    }
    
    // Generate recommendations
    this.generateRecommendations(overallScore, categoryScores);
    
    const healthMetrics: HealthMetrics = {
      overall: overallScore,
      categories: categoryScores,
      trends: [...this.trends],
      predictions: [...this.predictions],
      recommendations: [...this.recommendations]
    };
    
    // Update health history
    this.healthHistory.push(healthMetrics);
    this.cleanupOldData();
    
    return healthMetrics;
  }

  /**
   * Calculate health scores for each test category
   */
  private calculateCategoryScores(metrics: TestMetrics[]): Record<string, HealthScore> {
    const categoryGroups = this.groupMetricsByCategory(metrics);
    const categoryScores: Record<string, HealthScore> = {};
    
    for (const [category, categoryMetrics] of Object.entries(categoryGroups)) {
      categoryScores[category] = this.calculateCategoryHealth(category as TestCategory, categoryMetrics);
    }
    
    return categoryScores;
  }

  /**
   * Calculate health score for a specific category
   */
  private calculateCategoryHealth(category: TestCategory, metrics: TestMetrics[]): HealthScore {
    const factors: HealthFactor[] = [];
    
    // Performance factor
    const performanceFactor = this.calculatePerformanceFactor(category, metrics);
    factors.push(performanceFactor);
    
    // Reliability factor
    const reliabilityFactor = this.calculateReliabilityFactor(category, metrics);
    factors.push(reliabilityFactor);
    
    // Maintainability factor
    const maintainabilityFactor = this.calculateMaintainabilityFactor(category, metrics);
    factors.push(maintainabilityFactor);
    
    // Security factor (if applicable)
    if (category === 'security' || category === 'fuzzing') {
      const securityFactor = this.calculateSecurityFactor(category, metrics);
      factors.push(securityFactor);
    }
    
    // Coverage factor (if applicable)
    const coverageFactor = this.calculateCoverageFactor(category, metrics);
    factors.push(coverageFactor);
    
    // Calculate weighted score
    const score = this.calculateWeightedScore(factors);
    
    // Determine grade
    const grade = this.determineGrade(score);
    
    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(metrics, factors);
    
    return {
      score,
      grade,
      factors,
      timestamp: new Date().toISOString(),
      confidence
    };
  }

  /**
   * Calculate performance factor for health scoring
   */
  private calculatePerformanceFactor(category: TestCategory, metrics: TestMetrics[]): HealthFactor {
    const durations = metrics.map(m => m.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    
    // Category-specific performance thresholds
    const thresholds = this.getPerformanceThresholds(category);
    
    // Calculate performance score (0-100)
    let score = 100;
    
    if (avgDuration > thresholds.critical) {
      score = 0;
    } else if (avgDuration > thresholds.poor) {
      score = 25;
    } else if (avgDuration > thresholds.fair) {
      score = 50;
    } else if (avgDuration > thresholds.good) {
      score = 75;
    }
    
    // Adjust for consistency (high variance reduces score)
    const variance = this.calculateVariance(durations);
    const variancePenalty = Math.min(20, variance / avgDuration * 100);
    score = Math.max(0, score - variancePenalty);
    
    // Determine trend
    const trend = this.calculateDurationTrend(category, metrics);
    
    return {
      name: 'Performance',
      weight: this.config.weights.performance,
      value: score,
      impact: score >= 75 ? 'positive' : score >= 50 ? 'neutral' : 'negative',
      description: `Average duration: ${Math.round(avgDuration)}ms (threshold: ${thresholds.good}ms)`,
      trend
    };
  }

  /**
   * Calculate reliability factor for health scoring
   */
  private calculateReliabilityFactor(category: TestCategory, metrics: TestMetrics[]): HealthFactor {
    const passRates = metrics.map(m => m.metadata.passRate);
    const avgPassRate = passRates.reduce((sum, r) => sum + r, 0) / passRates.length;
    const flakinessScores = metrics.map(m => m.metadata.flakinessScore);
    const avgFlakiness = flakinessScores.reduce((sum, f) => sum + f, 0) / flakinessScores.length;
    
    // Calculate reliability score based on pass rate and flakiness
    let score = avgPassRate * 100; // Convert to 0-100 scale
    
    // Penalize for flakiness
    const flakinessPenalty = avgFlakiness * 50; // Max 25 point penalty
    score = Math.max(0, score - flakinessPenalty);
    
    // Determine trend
    const trend = this.calculateReliabilityTrend(category, metrics);
    
    return {
      name: 'Reliability',
      weight: this.config.weights.reliability,
      value: score,
      impact: score >= 85 ? 'positive' : score >= 70 ? 'neutral' : 'negative',
      description: `Pass rate: ${(avgPassRate * 100).toFixed(1)}%, Flakiness: ${(avgFlakiness * 100).toFixed(1)}%`,
      trend
    };
  }

  /**
   * Calculate maintainability factor for health scoring
   */
  private calculateMaintainabilityFactor(category: TestCategory, metrics: TestMetrics[]): HealthFactor {
    // Maintainability is harder to measure directly, so we use proxy metrics
    const testCount = metrics.length;
    const avgComplexity = this.estimateTestComplexity(metrics);
    
    // Score based on test count and complexity
    let score = 100;
    
    // Too few tests might indicate poor coverage
    if (testCount < 5) {
      score -= 20;
    }
    
    // High complexity reduces maintainability
    const complexityPenalty = avgComplexity * 10;
    score = Math.max(0, score - complexityPenalty);
    
    // Determine trend
    const trend = this.calculateMaintainabilityTrend(category, metrics);
    
    return {
      name: 'Maintainability',
      weight: this.config.weights.maintainability,
      value: score,
      impact: score >= 80 ? 'positive' : score >= 60 ? 'neutral' : 'negative',
      description: `Test count: ${testCount}, Estimated complexity: ${avgComplexity.toFixed(1)}`,
      trend
    };
  }

  /**
   * Calculate security factor for health scoring
   */
  private calculateSecurityFactor(category: TestCategory, metrics: TestMetrics[]): HealthFactor {
    // Security tests should have high coverage and low failure rates
    const passRate = metrics.reduce((sum, m) => sum + m.metadata.passRate, 0) / metrics.length;
    const coverage = this.estimateSecurityCoverage(metrics);
    
    // Security score combines pass rate and coverage
    const score = (passRate * 0.7 + coverage * 0.3) * 100;
    
    return {
      name: 'Security',
      weight: this.config.weights.security,
      value: score,
      impact: score >= 90 ? 'positive' : score >= 75 ? 'neutral' : 'negative',
      description: `Security coverage: ${(coverage * 100).toFixed(1)}%, Pass rate: ${(passRate * 100).toFixed(1)}%`,
      trend: 'stable' // Security trends are typically stable
    };
  }

  /**
   * Calculate coverage factor for health scoring
   */
  private calculateCoverageFactor(category: TestCategory, metrics: TestMetrics[]): HealthFactor {
    // Estimate test coverage based on test patterns and metadata
    const coverage = this.estimateCodeCoverage(category, metrics);
    
    const score = coverage * 100;
    
    return {
      name: 'Coverage',
      weight: this.config.weights.coverage,
      value: score,
      impact: score >= 80 ? 'positive' : score >= 60 ? 'neutral' : 'negative',
      description: `Estimated code coverage: ${(coverage * 100).toFixed(1)}%`,
      trend: 'stable' // Coverage trends are typically stable
    };
  }

  /**
   * Calculate overall health score from category scores
   */
  private calculateOverallScore(categoryScores: Record<string, HealthScore>): HealthScore {
    const factors: HealthFactor[] = [];
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [category, score] of Object.entries(categoryScores)) {
      totalScore += score.score * this.getCategoryWeight(category as TestCategory);
      totalWeight += this.getCategoryWeight(category as TestCategory);
      
      // Add category as a factor
      factors.push({
        name: `${category} Health`,
        weight: this.getCategoryWeight(category as TestCategory),
        value: score.score,
        impact: score.score >= 75 ? 'positive' : score.score >= 50 ? 'neutral' : 'negative',
        description: `${category}: ${score.score}/100 (${score.grade})`,
        trend: 'stable'
      });
    }
    
    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const grade = this.determineGrade(overallScore);
    const confidence = this.calculateOverallConfidence(categoryScores);
    
    return {
      score: overallScore,
      grade,
      factors,
      timestamp: new Date().toISOString(),
      confidence
    };
  }

  /**
   * Analyze trends in health metrics
   */
  private analyzeTrends(): void {
    this.trends = [];
    
    if (this.healthHistory.length < 3) {
      return; // Not enough data for trend analysis
    }
    
    const recent = this.healthHistory.slice(-5);
    const older = this.healthHistory.slice(-10, -5);
    
    if (older.length === 0) {
      return;
    }
    
    // Overall health trend
    const recentAvg = recent.reduce((sum, h) => sum + h.overall.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.overall.score, 0) / older.length;
    
    const changeRate = ((recentAvg - olderAvg) / olderAvg) * 100;
    const direction = Math.abs(changeRate) < 5 ? 'stable' : changeRate > 0 ? 'up' : 'down';
    const significance = Math.min(1, Math.abs(changeRate) / 20);
    
    this.trends.push({
      metric: 'overall_health',
      period: 'daily',
      direction: direction as 'up' | 'down' | 'stable',
      changeRate,
      significance,
      prediction: this.generateTrendPrediction('overall_health', changeRate)
    });
    
    // Category trends
    for (const category of Object.keys(recent[0].categories)) {
      const recentCategoryAvg = recent.reduce((sum, h) => sum + h.categories[category].score, 0) / recent.length;
      const olderCategoryAvg = older.reduce((sum, h) => sum + h.categories[category].score, 0) / older.length;
      
      const categoryChangeRate = ((recentCategoryAvg - olderCategoryAvg) / olderCategoryAvg) * 100;
      const categoryDirection = Math.abs(categoryChangeRate) < 5 ? 'stable' : categoryChangeRate > 0 ? 'up' : 'down';
      const categorySignificance = Math.min(1, Math.abs(categoryChangeRate) / 20);
      
      this.trends.push({
        metric: `${category}_health`,
        period: 'daily',
        direction: categoryDirection as 'up' | 'down' | 'stable',
        changeRate: categoryChangeRate,
        significance: categorySignificance,
        prediction: this.generateTrendPrediction(`${category}_health`, categoryChangeRate)
      });
    }
  }

  /**
   * Generate health predictions using ML-inspired algorithms
   */
  private generatePredictions(): void {
    this.predictions = [];
    
    if (!this.config.mlConfig.enablePredictions || this.healthHistory.length < 10) {
      return;
    }
    
    // Simple linear regression for prediction
    const healthScores = this.healthHistory.map(h => h.overall.score);
    const predictions = this.simpleLinearRegression(healthScores);
    
    for (const timeframe of ['1h', '6h', '24h', '7d'] as const) {
      const hours = this.getTimeframeHours(timeframe);
      const predictedValue = predictions.predict(hours);
      const confidence = Math.max(0.1, 1 - (hours / 168)); // Confidence decreases with time
      
      this.predictions.push({
        metric: 'overall_health',
        timeframe,
        predictedValue,
        confidence,
        riskLevel: this.determineRiskLevel(predictedValue),
        factors: this.getPredictionFactors()
      });
    }
    
    // Category predictions
    for (const category of Object.keys(this.healthHistory[0].categories)) {
      const categoryScores = this.healthHistory.map(h => h.categories[category].score);
      const categoryPredictions = this.simpleLinearRegression(categoryScores);
      
      this.predictions.push({
        metric: `${category}_health`,
        timeframe: '24h',
        predictedValue: categoryPredictions.predict(24),
        confidence: 0.7,
        riskLevel: this.determineRiskLevel(categoryPredictions.predict(24)),
        factors: this.getPredictionFactors()
      });
    }
  }

  /**
   * Generate health recommendations
   */
  private generateRecommendations(overallScore: HealthScore, categoryScores: Record<string, HealthScore>): void {
    this.recommendations = [];
    
    // Analyze factors to generate targeted recommendations
    for (const factor of overallScore.factors) {
      if (factor.value < 60 && factor.impact === 'negative') {
        const recommendation = this.generateFactorRecommendation(factor);
        if (recommendation) {
          this.recommendations.push(recommendation);
        }
      }
    }
    
    // Category-specific recommendations
    for (const [category, score] of Object.entries(categoryScores)) {
      if (score.score < 70) {
        const categoryRecommendations = this.generateCategoryRecommendations(category as TestCategory, score);
        this.recommendations.push(...categoryRecommendations);
      }
    }
    
    // Sort recommendations by priority and impact
    this.recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || b.impact - a.impact;
    });
    
    // Keep only top recommendations
    this.recommendations = this.recommendations.slice(0, 10);
  }

  /**
   * Simple linear regression implementation for predictions
   */
  private simpleLinearRegression(data: number[]): { predict: (x: number) => number } {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return {
      predict: (x: number) => Math.max(0, Math.min(100, slope * x + intercept))
    };
  }

  // Helper methods

  private updateMetricsHistory(metrics: TestMetrics[]): void {
    this.metricsHistory.push(...metrics);
    
    // Keep only recent data based on retention policy
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retention.metricsHistory);
    
    this.metricsHistory = this.metricsHistory.filter(m => 
      new Date(m.timestamp) > cutoffDate
    );
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

  private getPerformanceThresholds(category: TestCategory): { excellent: number; good: number; fair: number; poor: number; critical: number } {
    const thresholds = {
      unit: { excellent: 1000, good: 2000, fair: 5000, poor: 8000, critical: 10000 },
      components: { excellent: 2000, good: 5000, fair: 10000, poor: 15000, critical: 20000 },
      integration: { excellent: 5000, good: 10000, fair: 20000, poor: 40000, critical: 60000 },
      property: { excellent: 10000, good: 20000, fair: 45000, poor: 70000, critical: 90000 },
      contract: { excellent: 3000, good: 8000, fair: 15000, poor: 25000, critical: 30000 },
      accessibility: { excellent: 2000, good: 5000, fair: 10000, poor: 20000, critical: 30000 },
      e2e: { excellent: 10000, good: 20000, fair: 40000, poor: 80000, critical: 120000 },
      performance: { excellent: 5000, good: 10000, fair: 20000, poor: 40000, critical: 60000 },
      security: { excellent: 2000, good: 5000, fair: 10000, poor: 15000, critical: 20000 },
      fuzzing: { excellent: 15000, good: 30000, fair: 60000, poor: 100000, critical: 150000 }
    };
    
    return thresholds[category] || thresholds.unit;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private calculateDurationTrend(category: TestCategory, metrics: TestMetrics[]): 'improving' | 'stable' | 'degrading' {
    // Simple trend calculation based on recent vs older durations
    const sorted = metrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    if (sorted.length < 4) return 'stable';
    
    const recent = sorted.slice(-2).map(m => m.duration);
    const older = sorted.slice(-4, -2).map(m => m.duration);
    
    const recentAvg = recent.reduce((sum, d) => sum + d, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (Math.abs(change) < 0.05) return 'stable';
    return change > 0 ? 'degrading' : 'improving';
  }

  private calculateReliabilityTrend(category: TestCategory, metrics: TestMetrics[]): 'improving' | 'stable' | 'degrading' {
    const sorted = metrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    if (sorted.length < 4) return 'stable';
    
    const recent = sorted.slice(-2).map(m => m.metadata.passRate);
    const older = sorted.slice(-4, -2).map(m => m.metadata.passRate);
    
    const recentAvg = recent.reduce((sum, r) => sum + r, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    if (Math.abs(change) < 0.02) return 'stable';
    return change > 0 ? 'improving' : 'degrading';
  }

  private calculateMaintainabilityTrend(category: TestCategory, metrics: TestMetrics[]): 'improving' | 'stable' | 'degrading' {
    // Maintainability trends are based on test count and complexity changes
    return 'stable'; // Simplified for now
  }

  private estimateTestComplexity(metrics: TestMetrics[]): number {
    // Estimate complexity based on duration and metadata
    return metrics.reduce((sum, m) => {
      let complexity = 1;
      
      // Longer tests tend to be more complex
      if (m.duration > 10000) complexity += 1;
      if (m.duration > 30000) complexity += 1;
      
      // Tests with setup/teardown are more complex
      if (m.metadata.setupTime > 1000) complexity += 0.5;
      if (m.metadata.importTime > 2000) complexity += 0.5;
      
      return sum + complexity;
    }, 0) / metrics.length;
  }

  private estimateSecurityCoverage(metrics: TestMetrics[]): number {
    // Estimate security test coverage based on patterns
    let coverage = 0.5; // Base coverage
    
    // More tests indicate better coverage
    const testCount = metrics.length;
    coverage += Math.min(0.3, testCount * 0.05);
    
    // High pass rates indicate effective coverage
    const avgPassRate = metrics.reduce((sum, m) => sum + m.metadata.passRate, 0) / metrics.length;
    coverage += (avgPassRate - 0.9) * 0.5;
    
    return Math.max(0, Math.min(1, coverage));
  }

  private estimateCodeCoverage(category: TestCategory, metrics: TestMetrics[]): number {
    // Estimate code coverage based on test patterns and category
    const baseCoverage = {
      unit: 0.8,
      components: 0.7,
      integration: 0.6,
      property: 0.5,
      contract: 0.6,
      accessibility: 0.4,
      e2e: 0.3,
      performance: 0.4,
      security: 0.7,
      fuzzing: 0.6
    };
    
    let coverage = baseCoverage[category] || 0.5;
    
    // Adjust based on test count and pass rate
    const testCount = metrics.length;
    const avgPassRate = metrics.reduce((sum, m) => sum + m.metadata.passRate, 0) / metrics.length;
    
    coverage += Math.min(0.2, testCount * 0.01);
    coverage += (avgPassRate - 0.9) * 0.2;
    
    return Math.max(0, Math.min(1, coverage));
  }

  private getCategoryWeight(category: TestCategory): number {
    const weights = {
      unit: 0.2,
      components: 0.2,
      integration: 0.2,
      property: 0.1,
      contract: 0.1,
      accessibility: 0.05,
      e2e: 0.1,
      performance: 0.05,
      security: 0.05,
      fuzzing: 0.05
    };
    
    return weights[category] || 0.1;
  }

  private calculateWeightedScore(factors: HealthFactor[]): number {
    return factors.reduce((sum, factor) => sum + factor.value * factor.weight, 0);
  }

  private determineGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= this.config.thresholds.excellent) return 'A';
    if (score >= this.config.thresholds.good) return 'B';
    if (score >= this.config.thresholds.fair) return 'C';
    if (score >= this.config.thresholds.poor) return 'D';
    return 'F';
  }

  private calculateConfidence(metrics: TestMetrics[], factors: HealthFactor[]): number {
    // Confidence based on data quality and quantity
    let confidence = 0.5; // Base confidence
    
    // More data increases confidence
    confidence += Math.min(0.3, metrics.length * 0.02);
    
    // Consistent factors increase confidence
    const factorVariance = this.calculateFactorVariance(factors);
    confidence += Math.max(0, 0.2 - factorVariance);
    
    return Math.max(0.1, Math.min(1, confidence));
  }

  private calculateFactorVariance(factors: HealthFactor[]): number {
    if (factors.length === 0) return 0;
    
    const values = factors.map(f => f.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / 100; // Normalize to 0-1 range
  }

  private calculateOverallConfidence(categoryScores: Record<string, HealthScore>): number {
    const confidences = Object.values(categoryScores).map(s => s.confidence);
    return confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  }

  private generateTrendPrediction(metric: string, changeRate: number): HealthPrediction {
    const predictedValue = 50 + changeRate; // Simple prediction
    const confidence = Math.max(0.1, 1 - Math.abs(changeRate) / 50);
    
    return {
      metric,
      timeframe: '24h',
      predictedValue,
      confidence,
      riskLevel: this.determineRiskLevel(predictedValue),
      factors: ['trend_analysis']
    };
  }

  private getTimeframeHours(timeframe: '1h' | '6h' | '24h' | '7d'): number {
    const hours = { '1h': 1, '6h': 6, '24h': 24, '7d': 168 };
    return hours[timeframe];
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  private getPredictionFactors(): string[] {
    return ['historical_trend', 'seasonal_patterns', 'recent_performance'];
  }

  private generateFactorRecommendation(factor: HealthFactor): HealthRecommendation | null {
    const recommendations: Record<string, HealthRecommendation> = {
      'Performance': {
        priority: factor.value < 40 ? 'critical' : factor.value < 60 ? 'high' : 'medium',
        category: 'performance',
        title: 'Optimize Test Performance',
        description: 'Tests are running slower than expected. Consider optimizing test execution and reducing setup time.',
        impact: 15,
        effort: 'medium',
        actions: [
          'Review test setup and teardown procedures',
          'Optimize test data generation',
          'Consider test parallelization',
          'Profile slow tests for bottlenecks'
        ]
      },
      'Reliability': {
        priority: factor.value < 50 ? 'critical' : factor.value < 70 ? 'high' : 'medium',
        category: 'reliability',
        title: 'Improve Test Reliability',
        description: 'Tests show inconsistent results. Address flakiness and improve test stability.',
        impact: 20,
        effort: 'high',
        actions: [
          'Identify and fix flaky tests',
          'Improve test isolation',
          'Add proper test data management',
          'Implement retry mechanisms for transient failures'
        ]
      },
      'Maintainability': {
        priority: 'medium',
        category: 'maintainability',
        title: 'Improve Test Maintainability',
        description: 'Tests could be more maintainable. Consider refactoring and improving test structure.',
        impact: 10,
        effort: 'medium',
        actions: [
          'Refactor complex tests',
          'Extract common test utilities',
          'Improve test documentation',
          'Standardize test patterns'
        ]
      },
      'Security': {
        priority: factor.value < 70 ? 'high' : 'medium',
        category: 'security',
        title: 'Enhance Security Testing',
        description: 'Security test coverage needs improvement. Add more comprehensive security tests.',
        impact: 12,
        effort: 'high',
        actions: [
          'Add security-focused test cases',
          'Implement security test automation',
          'Review security test coverage',
          'Add penetration testing scenarios'
        ]
      },
      'Coverage': {
        priority: factor.value < 60 ? 'high' : 'medium',
        category: 'maintainability',
        title: 'Improve Test Coverage',
        description: 'Test coverage is below optimal levels. Add more comprehensive tests.',
        impact: 18,
        effort: 'medium',
        actions: [
          'Identify untested code paths',
          'Add edge case testing',
          'Increase assertion coverage',
          'Add integration tests'
        ]
      }
    };
    
    return recommendations[factor.name] || null;
  }

  private generateCategoryRecommendations(category: TestCategory, score: HealthScore): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];
    
    // Add category-specific recommendations based on low-scoring factors
    const lowFactors = score.factors.filter(f => f.value < 60);
    
    for (const factor of lowFactors) {
      const recommendation = this.generateFactorRecommendation(factor);
      if (recommendation) {
        recommendation.title = `${category}: ${recommendation.title}`;
        recommendations.push(recommendation);
      }
    }
    
    return recommendations;
  }

  private cleanupOldData(): void {
    const now = new Date();
    
    // Clean up old health history
    const healthCutoff = new Date();
    healthCutoff.setDate(healthCutoff.getDate() - this.config.retention.trendsData);
    this.healthHistory = this.healthHistory.filter(h => new Date(h.overall.timestamp) > healthCutoff);
    
    // Clean up old trends
    const trendsCutoff = new Date();
    trendsCutoff.setDate(trendsCutoff.getDate() - this.config.retention.trendsData);
    // Trends are regenerated, so no cleanup needed
    
    // Clean up old predictions
    const predictionsCutoff = new Date();
    predictionsCutoff.setDate(predictionsCutoff.getDate() - this.config.retention.predictionsData);
    // Predictions are regenerated, so no cleanup needed
    
    // Clean up old recommendations
    const recommendationsCutoff = new Date();
    recommendationsCutoff.setDate(recommendationsCutoff.getDate() - this.config.retention.recommendationsData);
    // Recommendations are regenerated, so no cleanup needed
  }

  /**
   * Get current health metrics
   */
  getHealthMetrics(): HealthMetrics | null {
    return this.healthHistory.length > 0 ? this.healthHistory[this.healthHistory.length - 1] : null;
  }

  /**
   * Get health trends
   */
  getHealthTrends(): HealthTrend[] {
    return [...this.trends];
  }

  /**
   * Get health predictions
   */
  getHealthPredictions(): HealthPrediction[] {
    return [...this.predictions];
  }

  /**
   * Get health recommendations
   */
  getHealthRecommendations(): HealthRecommendation[] {
    return [...this.recommendations];
  }

  /**
   * Get health history
   */
  getHealthHistory(limit?: number): HealthMetrics[] {
    if (limit) {
      return this.healthHistory.slice(-limit);
    }
    return [...this.healthHistory];
  }
}

// CLI interface for testing the health scoring system
if (import.meta.url === `file://${process.argv[1]}`) {
  const healthScoring = new HealthScoringSystem({
    mlConfig: {
      enablePredictions: true,
      enableTrendAnalysis: true,
      enableAnomalyDetection: true,
      modelComplexity: 'medium',
      trainingDataPoints: 100,
      predictionHorizon: 24
    }
  });
  
  console.log('Health Scoring System Test');
  console.log('==========================');
  
  // Create sample test metrics
  const sampleMetrics: TestMetrics[] = [
    {
      testFile: 'tests/unit/utils.test.ts',
      duration: 1200,
      category: 'unit',
      timestamp: new Date().toISOString(),
      environment: 'local',
      metadata: {
        transformTime: 50,
        setupTime: 100,
        importTime: 200,
        testExecutionTime: 850,
        environmentTime: 0,
        flakinessScore: 0.05,
        passRate: 0.95
      }
    },
    {
      testFile: 'tests/components/MetricCard.test.ts',
      duration: 3500,
      category: 'components',
      timestamp: new Date().toISOString(),
      environment: 'local',
      metadata: {
        transformTime: 150,
        setupTime: 300,
        importTime: 400,
        testExecutionTime: 2650,
        environmentTime: 0,
        flakinessScore: 0.15,
        passRate: 0.85
      }
    },
    {
      testFile: 'tests/integration/api.test.ts',
      duration: 15000,
      category: 'integration',
      timestamp: new Date().toISOString(),
      environment: 'local',
      metadata: {
        transformTime: 500,
        setupTime: 1000,
        importTime: 1500,
        testExecutionTime: 12000,
        environmentTime: 0,
        flakinessScore: 0.25,
        passRate: 0.75
      }
    },
    {
      testFile: 'tests/security/auth.test.ts',
      duration: 8000,
      category: 'security',
      timestamp: new Date().toISOString(),
      environment: 'local',
      metadata: {
        transformTime: 300,
        setupTime: 500,
        importTime: 700,
        testExecutionTime: 6500,
        environmentTime: 0,
        flakinessScore: 0.1,
        passRate: 0.92
      }
    }
  ];
  
  // Calculate health scores
  const healthMetrics = healthScoring.calculateHealthScore(sampleMetrics);
  
  console.log('\\nOverall Health Score:');
  console.log(`Score: ${healthMetrics.overall.score.toFixed(1)}/100`);
  console.log(`Grade: ${healthMetrics.overall.grade}`);
  console.log(`Confidence: ${(healthMetrics.overall.confidence * 100).toFixed(1)}%`);
  
  console.log('\\nCategory Health Scores:');
  for (const [category, score] of Object.entries(healthMetrics.categories)) {
    console.log(`${category}: ${score.score.toFixed(1)}/100 (${score.grade})`);
  }
  
  console.log('\\nHealth Trends:');
  healthMetrics.trends.forEach(trend => {
    console.log(`${trend.metric}: ${trend.direction} (${trend.changeRate.toFixed(1)}%)`);
  });
  
  console.log('\\nHealth Predictions:');
  healthMetrics.predictions.slice(0, 3).forEach(prediction => {
    console.log(`${prediction.metric} (${prediction.timeframe}): ${prediction.predictedValue.toFixed(1)}/100 (${prediction.riskLevel})`);
  });
  
  console.log('\\nHealth Recommendations:');
  healthMetrics.recommendations.slice(0, 3).forEach(rec => {
    console.log(`${rec.title} (${rec.priority}): ${rec.description}`);
  });
  
  console.log('\\nHealth scoring system test completed');
}
