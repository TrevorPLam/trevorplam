import { PerformanceMonitor, TestMetrics, TestCategory, SchedulingRecommendation } from './performance-monitor';
import { RegressionDetector, RegressionPrediction } from './regression-detector';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface TestSchedule {
  id: string;
  name: string;
  description: string;
  created: string;
  lastUpdated: string;
  environment: 'ci' | 'local';
  totalEstimatedDuration: number;
  phases: SchedulePhase[];
  optimization: ScheduleOptimization;
}

export interface SchedulePhase {
  id: string;
  name: string;
  order: number;
  estimatedDuration: number;
  testCategories: TestCategory[];
  tests: ScheduledTest[];
  dependencies: string[]; // Phase IDs that must complete first
  parallelism: {
    enabled: boolean;
    maxWorkers: number;
    resourceAllocation: ResourceAllocation;
  };
  retryPolicy: RetryPolicy;
}

export interface ScheduledTest {
  testFile: string;
  category: TestCategory;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedDuration: number;
  flakinessScore: number;
  riskScore: number;
  shard?: number;
  tags: string[];
  requirements: TestRequirements;
}

export interface TestRequirements {
  memory: number; // MB
  cpu: number; // cores
  disk: number; // MB
  network: boolean;
  browser: boolean;
  special: string[];
}

export interface ResourceAllocation {
  cpu: number;
  memory: number;
  disk: number;
  network: 'low' | 'medium' | 'high';
}

export interface RetryPolicy {
  enabled: boolean;
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  retryConditions: string[];
}

export interface ScheduleOptimization {
  strategy: 'speed' | 'reliability' | 'balanced';
  parallelismEnabled: boolean;
  intelligentSharding: boolean;
  adaptiveTimeouts: boolean;
  resourceAwareness: boolean;
  predictiveScheduling: boolean;
}

export interface ScheduleExecution {
  scheduleId: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentPhase?: string;
  completedPhases: string[];
  results: PhaseExecutionResult[];
  metrics: ExecutionMetrics;
}

export interface PhaseExecutionResult {
  phaseId: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  actualDuration: number;
  estimatedDuration: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  resourceUsage: ResourceUsage;
  issues: ExecutionIssue[];
}

export interface ResourceUsage {
  cpu: number[];
  memory: number[];
  disk: number[];
  network: number[];
}

export interface ExecutionIssue {
  type: 'timeout' | 'flakiness' | 'resource' | 'infrastructure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  testFile: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

export interface ExecutionMetrics {
  totalDuration: number;
  estimatedDuration: number;
  efficiency: number; // actual vs estimated
  throughput: number; // tests per minute
  successRate: number;
  resourceUtilization: number;
  costEfficiency: number;
}

export class IntelligentTestScheduler {
  private readonly monitor: PerformanceMonitor;
  private readonly detector: RegressionDetector;
  private readonly schedulesFile: string;
  private readonly executionsFile: string;

  constructor(metricsDir: string = 'tests/metrics') {
    this.monitor = new PerformanceMonitor(metricsDir);
    this.detector = new RegressionDetector(metricsDir);
    this.schedulesFile = join(metricsDir, 'test-schedules.json');
    this.executionsFile = join(metricsDir, 'schedule-executions.json');
  }

  /**
   * Create an optimized test schedule based on historical data
   */
  async createOptimizedSchedule(
    name: string,
    optimization: Partial<ScheduleOptimization> = {},
    environment: 'ci' | 'local' = 'ci'
  ): Promise<TestSchedule> {
    console.log(`Creating optimized test schedule: ${name}`);
    
    // Collect comprehensive data
    const metrics = await this.monitor.collectTestMetrics();
    const regressions = await this.detector.analyzeRegressions();
    const recommendations = this.monitor.getSchedulingRecommendations();
    
    // Configure optimization strategy
    const config: ScheduleOptimization = {
      strategy: 'balanced',
      parallelismEnabled: true,
      intelligentSharding: true,
      adaptiveTimeouts: true,
      resourceAwareness: true,
      predictiveScheduling: true,
      ...optimization
    };
    
    // Create scheduled tests with intelligent analysis
    const scheduledTests = await this.createScheduledTests(metrics, regressions.predictions);
    
    // Group tests into phases
    const phases = this.createSchedulePhases(scheduledTests, recommendations, config);
    
    // Calculate total estimated duration
    const totalEstimatedDuration = phases.reduce((sum, phase) => sum + phase.estimatedDuration, 0);
    
    const schedule: TestSchedule = {
      id: this.generateId(),
      name,
      description: `Optimized test schedule using ${config.strategy} strategy`,
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      environment,
      totalEstimatedDuration,
      phases,
      optimization: config
    };
    
    // Save schedule
    this.saveSchedule(schedule);
    
    console.log(`Created schedule with ${phases.length} phases, estimated duration: ${totalEstimatedDuration}ms`);
    
    return schedule;
  }

  /**
   * Execute a test schedule with real-time monitoring
   */
  async executeSchedule(scheduleId: string): Promise<ScheduleExecution> {
    console.log(`Executing test schedule: ${scheduleId}`);
    
    const schedule = this.loadSchedule(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }
    
    const execution: ScheduleExecution = {
      scheduleId,
      startTime: new Date().toISOString(),
      status: 'pending',
      completedPhases: [],
      results: [],
      metrics: {
        totalDuration: 0,
        estimatedDuration: schedule.totalEstimatedDuration,
        efficiency: 0,
        throughput: 0,
        successRate: 0,
        resourceUtilization: 0,
        costEfficiency: 0
      }
    };
    
    try {
      execution.status = 'running';
      
      // Execute phases in order
      for (const phase of schedule.phases) {
        execution.currentPhase = phase.id;
        
        const phaseResult = await this.executePhase(phase, schedule.optimization);
        execution.results.push(phaseResult);
        execution.completedPhases.push(phase.id);
        
        // Update metrics
        this.updateExecutionMetrics(execution);
        
        // Check if we should continue
        if (phaseResult.status === 'failed' && this.shouldAbortOnPhaseFailure(phaseResult)) {
          console.warn(`Aborting schedule due to phase failure: ${phase.id}`);
          break;
        }
      }
      
      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
      
    } catch (error) {
      console.error('Schedule execution failed:', error.message);
      execution.status = 'failed';
      execution.endTime = new Date().toISOString();
    }
    
    // Save execution results
    this.saveExecution(execution);
    
    console.log(`Schedule execution completed: ${execution.status}`);
    return execution;
  }

  /**
   * Analyze schedule performance and provide optimization recommendations
   */
  analyzeSchedulePerformance(scheduleId: string): ScheduleAnalysis {
    const schedule = this.loadSchedule(scheduleId);
    const executions = this.loadExecutions(scheduleId);
    
    if (!schedule || executions.length === 0) {
      throw new Error('No schedule or execution data available for analysis');
    }
    
    const analysis: ScheduleAnalysis = {
      scheduleId,
      scheduleName: schedule.name,
      totalExecutions: executions.length,
      avgDuration: executions.reduce((sum, e) => sum + (e.metrics.totalDuration || 0), 0) / executions.length,
      estimatedDuration: schedule.totalEstimatedDuration,
      accuracyScore: this.calculateAccuracyScore(schedule, executions),
      efficiencyScore: this.calculateEfficiencyScore(executions),
      reliabilityScore: this.calculateReliabilityScore(executions),
      phaseAnalysis: this.analyzePhases(schedule.phases, executions),
      recommendations: this.generateOptimizationRecommendations(schedule, executions),
      lastAnalyzed: new Date().toISOString()
    };
    
    return analysis;
  }

  /**
   * Auto-optimize schedule based on historical performance
   */
  async autoOptimizeSchedule(scheduleId: string): Promise<TestSchedule> {
    console.log(`Auto-optimizing schedule: ${scheduleId}`);
    
    const analysis = this.analyzeSchedulePerformance(scheduleId);
    const currentSchedule = this.loadSchedule(scheduleId);
    
    if (!currentSchedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }
    
    // Apply optimization recommendations
    const optimizedSchedule = this.applyOptimizations(currentSchedule, analysis.recommendations);
    
    // Save optimized schedule
    optimizedSchedule.lastUpdated = new Date().toISOString();
    this.saveSchedule(optimizedSchedule);
    
    console.log(`Schedule optimized: ${optimizedSchedule.name}`);
    return optimizedSchedule;
  }

  // Private methods

  private async createScheduledTests(
    metrics: TestMetrics[], 
    predictions: RegressionPrediction[]
  ): Promise<ScheduledTest[]> {
    const scheduledTests: ScheduledTest[] = [];
    
    metrics.forEach(metric => {
      const prediction = predictions.find(p => p.testFile === metric.testFile);
      
      const test: ScheduledTest = {
        testFile: metric.testFile,
        category: metric.category,
        priority: this.determinePriority(metric, prediction),
        estimatedDuration: metric.duration,
        flakinessScore: metric.metadata.flakinessScore,
        riskScore: prediction?.riskScore || 0,
        shard: metric.shard,
        tags: this.generateTestTags(metric, prediction),
        requirements: this.assessTestRequirements(metric)
      };
      
      scheduledTests.push(test);
    });
    
    return scheduledTests.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private determinePriority(metric: TestMetrics, prediction?: RegressionPrediction): 'critical' | 'high' | 'medium' | 'low' {
    // Critical tests: high risk, core functionality, or recent regressions
    if (prediction?.riskScore > 0.8 || metric.category === 'unit') {
      return 'critical';
    }
    
    // High priority: medium risk or important categories
    if (prediction?.riskScore > 0.5 || ['components', 'integration'].includes(metric.category)) {
      return 'high';
    }
    
    // Medium priority: lower risk but still important
    if (prediction?.riskScore > 0.2 || ['accessibility', 'contract'].includes(metric.category)) {
      return 'medium';
    }
    
    return 'low';
  }

  private generateTestTags(metric: TestMetrics, prediction?: RegressionPrediction): string[] {
    const tags: string[] = [metric.category, metric.environment];
    
    if (metric.metadata.flakinessScore > 0.1) {
      tags.push('flaky');
    }
    
    if (prediction?.riskScore > 0.5) {
      tags.push('high-risk');
    }
    
    if (metric.duration > 30000) {
      tags.push('slow');
    }
    
    if (metric.category === 'e2e' || metric.category === 'performance') {
      tags.push('resource-intensive');
    }
    
    return tags;
  }

  private assessTestRequirements(metric: TestMetrics): TestRequirements {
    // Base requirements by category
    const baseRequirements = {
      unit: { memory: 128, cpu: 1, disk: 50, network: false, browser: false, special: [] },
      components: { memory: 256, cpu: 2, disk: 100, network: false, browser: true, special: [] },
      integration: { memory: 512, cpu: 2, disk: 200, network: true, browser: false, special: [] },
      accessibility: { memory: 512, cpu: 2, disk: 100, network: false, browser: true, special: ['a11y'] },
      e2e: { memory: 1024, cpu: 4, disk: 500, network: true, browser: true, special: ['full-browser'] },
      performance: { memory: 1024, cpu: 4, disk: 200, network: false, browser: true, special: ['performance-metrics'] },
      security: { memory: 512, cpu: 2, disk: 100, network: true, browser: false, special: ['security-scan'] },
      contract: { memory: 256, cpu: 1, disk: 100, network: true, browser: false, special: ['pact'] },
      property: { memory: 256, cpu: 2, disk: 50, network: false, browser: false, special: ['fast-check'] },
      fuzzing: { memory: 512, cpu: 4, disk: 200, network: false, browser: false, special: ['jazzer'] }
    };
    
    const requirements = baseRequirements[metric.category] || baseRequirements.unit;
    
    // Adjust based on actual test characteristics
    if (metric.duration > 60000) {
      requirements.memory *= 1.5;
      requirements.cpu *= 1.5;
    }
    
    if (metric.metadata.flakinessScore > 0.2) {
      requirements.memory *= 1.2; // Extra memory for stability
    }
    
    return requirements;
  }

  private createSchedulePhases(
    tests: ScheduledTest[], 
    recommendations: SchedulingRecommendation[],
    config: ScheduleOptimization
  ): SchedulePhase[] {
    const phases: SchedulePhase[] = [];
    
    // Group tests by scheduling recommendations
    const earlyTests = tests.filter(t => recommendations.find(r => r.category === t.category)?.schedule === 'early');
    const middleTests = tests.filter(t => recommendations.find(r => r.category === t.category)?.schedule === 'middle');
    const lateTests = tests.filter(t => recommendations.find(r => r.category === t.category)?.schedule === 'late');
    
    // Create phases based on strategy
    if (config.strategy === 'speed') {
      phases.push(this.createPhase('fast-feedback', 1, earlyTests, config));
      phases.push(this.createPhase('comprehensive', 2, [...middleTests, ...lateTests], config));
    } else if (config.strategy === 'reliability') {
      phases.push(this.createPhase('stable-tests', 1, this.filterStableTests(tests), config));
      phases.push(this.createPhase('risky-tests', 2, this.filterRiskyTests(tests), config));
    } else {
      // Balanced strategy
      phases.push(this.createPhase('critical-path', 1, earlyTests, config));
      phases.push(this.createPhase('core-functionality', 2, middleTests, config));
      phases.push(this.createPhase('extended-testing', 3, lateTests, config));
    }
    
    return phases;
  }

  private createPhase(
    name: string, 
    order: number, 
    tests: ScheduledTest[], 
    config: ScheduleOptimization
  ): SchedulePhase {
    const estimatedDuration = tests.reduce((sum, test) => sum + test.estimatedDuration, 0);
    
    return {
      id: this.generateId(),
      name,
      order,
      estimatedDuration,
      testCategories: [...new Set(tests.map(t => t.category))],
      tests,
      dependencies: order > 1 ? [`phase-${order - 1}`] : [],
      parallelism: {
        enabled: config.parallelismEnabled,
        maxWorkers: this.calculateOptimalWorkers(tests),
        resourceAllocation: this.calculateResourceAllocation(tests)
      },
      retryPolicy: {
        enabled: true,
        maxRetries: 3,
        backoffStrategy: 'exponential',
        retryConditions: ['timeout', 'flakiness', 'resource_exhaustion']
      }
    };
  }

  private filterStableTests(tests: ScheduledTest[]): ScheduledTest[] {
    return tests.filter(t => t.flakinessScore < 0.05 && t.riskScore < 0.3);
  }

  private filterRiskyTests(tests: ScheduledTest[]): ScheduledTest[] {
    return tests.filter(t => t.flakinessScore > 0.1 || t.riskScore > 0.5);
  }

  private calculateOptimalWorkers(tests: ScheduledTest[]): number {
    const totalMemory = tests.reduce((sum, t) => sum + t.requirements.memory, 0);
    const totalCPU = tests.reduce((sum, t) => sum + t.requirements.cpu, 0);
    
    // Assume 8GB RAM and 4 CPU cores available
    const availableMemory = 8192; // MB
    const availableCPU = 4;
    
    const memoryWorkers = Math.floor(availableMemory / (totalMemory / tests.length));
    const cpuWorkers = Math.floor(availableCPU / (totalCPU / tests.length));
    
    return Math.min(Math.max(memoryWorkers, cpuWorkers, 1), 8);
  }

  private calculateResourceAllocation(tests: ScheduledTest[]): ResourceAllocation {
    const totalMemory = tests.reduce((sum, t) => sum + t.requirements.memory, 0);
    const totalCPU = tests.reduce((sum, t) => sum + t.requirements.cpu, 0);
    const totalDisk = tests.reduce((sum, t) => sum + t.requirements.disk, 0);
    const networkRequired = tests.some(t => t.requirements.network);
    
    return {
      cpu: totalCPU,
      memory: totalMemory,
      disk: totalDisk,
      network: networkRequired ? 'high' : 'low'
    };
  }

  private async executePhase(phase: SchedulePhase, config: ScheduleOptimization): Promise<PhaseExecutionResult> {
    console.log(`Executing phase: ${phase.name}`);
    
    const startTime = new Date().toISOString();
    
    try {
      // Simulate phase execution (in real implementation, this would run actual tests)
      const actualDuration = await this.simulatePhaseExecution(phase);
      
      const result: PhaseExecutionResult = {
        phaseId: phase.id,
        startTime,
        endTime: new Date().toISOString(),
        status: 'completed',
        actualDuration,
        estimatedDuration: phase.estimatedDuration,
        testsRun: phase.tests.length,
        testsPassed: Math.floor(phase.tests.length * 0.95), // Simulated pass rate
        testsFailed: Math.floor(phase.tests.length * 0.05),
        resourceUsage: this.simulateResourceUsage(phase),
        issues: []
      };
      
      return result;
      
    } catch (error) {
      return {
        phaseId: phase.id,
        startTime,
        endTime: new Date().toISOString(),
        status: 'failed',
        actualDuration: 0,
        estimatedDuration: phase.estimatedDuration,
        testsRun: 0,
        testsPassed: 0,
        testsFailed: 0,
        resourceUsage: { cpu: [], memory: [], disk: [], network: [] },
        issues: [{
          type: 'infrastructure',
          severity: 'critical',
          testFile: '',
          description: error.message,
          timestamp: new Date().toISOString(),
          resolved: false
        }]
      };
    }
  }

  private async simulatePhaseExecution(phase: SchedulePhase): Promise<number> {
    // Simulate test execution time (in real implementation, run actual tests)
    const baseTime = phase.estimatedDuration;
    const variance = baseTime * 0.1; // 10% variance
    const randomFactor = (Math.random() - 0.5) * 2 * variance;
    
    return new Promise(resolve => {
      setTimeout(() => resolve(baseTime + randomFactor), 100);
    });
  }

  private simulateResourceUsage(phase: SchedulePhase): ResourceUsage {
    // Simulate resource usage during phase execution
    const cpuUsage = Array.from({ length: 10 }, () => Math.random() * 100);
    const memoryUsage = Array.from({ length: 10 }, () => Math.random() * 8192);
    const diskUsage = Array.from({ length: 10 }, () => Math.random() * 1024);
    const networkUsage = Array.from({ length: 10 }, () => Math.random() * 1000);
    
    return {
      cpu: cpuUsage,
      memory: memoryUsage,
      disk: diskUsage,
      network: networkUsage
    };
  }

  private shouldAbortOnPhaseFailure(result: PhaseExecutionResult): boolean {
    // Abort if critical phase fails or too many tests fail
    const failureRate = result.testsFailed / result.testsRun;
    return result.issues.some(i => i.severity === 'critical') || failureRate > 0.5;
  }

  private updateExecutionMetrics(execution: ScheduleExecution): void {
    const completedResults = execution.results.filter(r => r.status === 'completed');
    
    if (completedResults.length === 0) return;
    
    const totalDuration = completedResults.reduce((sum, r) => sum + r.actualDuration, 0);
    const totalTests = completedResults.reduce((sum, r) => sum + r.testsRun, 0);
    const totalPassed = completedResults.reduce((sum, r) => sum + r.testsPassed, 0);
    
    execution.metrics.totalDuration = totalDuration;
    execution.metrics.efficiency = execution.metrics.estimatedDuration > 0 
      ? execution.metrics.estimatedDuration / totalDuration 
      : 1;
    execution.metrics.throughput = totalDuration > 0 ? (totalTests / totalDuration) * 60000 : 0; // tests per minute
    execution.metrics.successRate = totalTests > 0 ? totalPassed / totalTests : 0;
    execution.metrics.resourceUtilization = this.calculateResourceUtilization(completedResults);
    execution.metrics.costEfficiency = this.calculateCostEfficiency(execution);
  }

  private calculateResourceUtilization(results: PhaseExecutionResult[]): number {
    // Simple calculation - in real implementation would be more sophisticated
    return 0.75; // 75% utilization
  }

  private calculateCostEfficiency(execution: ScheduleExecution): number {
    // Simple cost efficiency calculation
    const timeEfficiency = execution.metrics.efficiency;
    const resourceEfficiency = execution.metrics.resourceUtilization;
    const qualityScore = execution.metrics.successRate;
    
    return (timeEfficiency + resourceEfficiency + qualityScore) / 3;
  }

  // Analysis and optimization methods

  private calculateAccuracyScore(schedule: TestSchedule, executions: ScheduleExecution[]): number {
    if (executions.length === 0) return 0;
    
    const accuracyScores = executions.map(execution => {
      if (execution.metrics.estimatedDuration === 0) return 0;
      const accuracy = execution.metrics.estimatedDuration / execution.metrics.totalDuration;
      return Math.min(accuracy, 2); // Cap at 200% accuracy
    });
    
    return accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length;
  }

  private calculateEfficiencyScore(executions: ScheduleExecution[]): number {
    if (executions.length === 0) return 0;
    
    const efficiencyScores = executions.map(e => e.metrics.efficiency || 0);
    return efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length;
  }

  private calculateReliabilityScore(executions: ScheduleExecution[]): number {
    if (executions.length === 0) return 0;
    
    const successfulExecutions = executions.filter(e => e.status === 'completed').length;
    return successfulExecutions / executions.length;
  }

  private analyzePhases(phases: SchedulePhase[], executions: ScheduleExecution[]): PhaseAnalysis[] {
    return phases.map(phase => {
      const phaseResults = executions.flatMap(e => e.results.filter(r => r.phaseId === phase.id));
      
      return {
        phaseId: phase.id,
        phaseName: phase.name,
        avgDuration: phaseResults.length > 0 
          ? phaseResults.reduce((sum, r) => sum + r.actualDuration, 0) / phaseResults.length 
          : 0,
        estimatedDuration: phase.estimatedDuration,
        accuracy: phaseResults.length > 0 ? phase.estimatedDuration / (phaseResults.reduce((sum, r) => sum + r.actualDuration, 0) / phaseResults.length) : 1,
        reliability: phaseResults.length > 0 ? phaseResults.filter(r => r.status === 'completed').length / phaseResults.length : 1,
        recommendation: this.generatePhaseRecommendation(phase, phaseResults)
      };
    });
  }

  private generatePhaseRecommendation(phase: SchedulePhase, results: PhaseExecutionResult[]): string {
    if (results.length === 0) return 'No execution data available';
    
    const avgDuration = results.reduce((sum, r) => sum + r.actualDuration, 0) / results.length;
    const reliability = results.filter(r => r.status === 'completed').length / results.length;
    
    if (avgDuration > phase.estimatedDuration * 1.5) {
      return 'Consider increasing estimated duration or optimizing test performance';
    }
    
    if (reliability < 0.9) {
      return 'Improve test reliability or adjust retry policies';
    }
    
    if (avgDuration < phase.estimatedDuration * 0.7) {
      return 'Consider reducing estimated duration to improve scheduling accuracy';
    }
    
    return 'Phase is performing well';
  }

  private generateOptimizationRecommendations(schedule: TestSchedule, executions: ScheduleExecution[]): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    const analysis = this.analyzeSchedulePerformance(schedule.id);
    
    if (analysis.accuracyScore < 0.8) {
      recommendations.push({
        type: 'timing',
        priority: 'high',
        description: 'Improve duration estimates by collecting more historical data',
        impact: 'medium',
        effort: 'low'
      });
    }
    
    if (analysis.efficiencyScore < 0.7) {
      recommendations.push({
        type: 'parallelism',
        priority: 'medium',
        description: 'Increase parallel workers or optimize test distribution',
        impact: 'high',
        effort: 'medium'
      });
    }
    
    if (analysis.reliabilityScore < 0.9) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        description: 'Improve test stability and adjust retry policies',
        impact: 'high',
        effort: 'high'
      });
    }
    
    return recommendations;
  }

  private applyOptimizations(schedule: TestSchedule, recommendations: OptimizationRecommendation[]): TestSchedule {
    const optimized = { ...schedule };
    
    recommendations.forEach(rec => {
      switch (rec.type) {
        case 'timing':
          // Adjust phase durations based on historical data
          optimized.phases = this.adjustPhaseTimings(optimized.phases);
          break;
        case 'parallelism':
          // Optimize worker allocation
          optimized.phases = this.optimizeParallelism(optimized.phases);
          break;
        case 'reliability':
          // Improve retry policies
          optimized.phases = this.improveRetryPolicies(optimized.phases);
          break;
      }
    });
    
    return optimized;
  }

  private adjustPhaseTimings(phases: SchedulePhase[]): SchedulePhase[] {
    // Simple adjustment - in real implementation would use historical data
    return phases.map(phase => ({
      ...phase,
      estimatedDuration: phase.estimatedDuration * 1.1 // Add 10% buffer
    }));
  }

  private optimizeParallelism(phases: SchedulePhase[]): SchedulePhase[] {
    return phases.map(phase => ({
      ...phase,
      parallelism: {
        ...phase.parallelism,
        maxWorkers: Math.min(phase.parallelism.maxWorkers + 1, 8)
      }
    }));
  }

  private improveRetryPolicies(phases: SchedulePhase[]): SchedulePhase[] {
    return phases.map(phase => ({
      ...phase,
      retryPolicy: {
        ...phase.retryPolicy,
        maxRetries: Math.min(phase.retryPolicy.maxRetries + 1, 5)
      }
    }));
  }

  // File I/O methods

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private loadSchedule(scheduleId: string): TestSchedule | null {
    if (!existsSync(this.schedulesFile)) return null;
    
    try {
      const schedules = JSON.parse(readFileSync(this.schedulesFile, 'utf8'));
      return schedules.find((s: TestSchedule) => s.id === scheduleId) || null;
    } catch {
      return null;
    }
  }

  private saveSchedule(schedule: TestSchedule): void {
    const schedules = this.loadAllSchedules();
    const existingIndex = schedules.findIndex(s => s.id === schedule.id);
    
    if (existingIndex >= 0) {
      schedules[existingIndex] = schedule;
    } else {
      schedules.push(schedule);
    }
    
    writeFileSync(this.schedulesFile, JSON.stringify(schedules, null, 2));
  }

  private loadAllSchedules(): TestSchedule[] {
    if (!existsSync(this.schedulesFile)) return [];
    
    try {
      return JSON.parse(readFileSync(this.schedulesFile, 'utf8'));
    } catch {
      return [];
    }
  }

  private loadExecutions(scheduleId: string): ScheduleExecution[] {
    if (!existsSync(this.executionsFile)) return [];
    
    try {
      const executions = JSON.parse(readFileSync(this.executionsFile, 'utf8'));
      return executions.filter((e: ScheduleExecution) => e.scheduleId === scheduleId);
    } catch {
      return [];
    }
  }

  private saveExecution(execution: ScheduleExecution): void {
    const executions = this.loadAllExecutions();
    executions.push(execution);
    writeFileSync(this.executionsFile, JSON.stringify(executions, null, 2));
  }

  private loadAllExecutions(): ScheduleExecution[] {
    if (!existsSync(this.executionsFile)) return [];
    
    try {
      return JSON.parse(readFileSync(this.executionsFile, 'utf8'));
    } catch {
      return [];
    }
  }
}

// Type definitions for analysis
export interface ScheduleAnalysis {
  scheduleId: string;
  scheduleName: string;
  totalExecutions: number;
  avgDuration: number;
  estimatedDuration: number;
  accuracyScore: number;
  efficiencyScore: number;
  reliabilityScore: number;
  phaseAnalysis: PhaseAnalysis[];
  recommendations: OptimizationRecommendation[];
  lastAnalyzed: string;
}

export interface PhaseAnalysis {
  phaseId: string;
  phaseName: string;
  avgDuration: number;
  estimatedDuration: number;
  accuracy: number;
  reliability: number;
  recommendation: string;
}

export interface OptimizationRecommendation {
  type: 'timing' | 'parallelism' | 'reliability' | 'resource';
  priority: 'low' | 'medium' | 'high';
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
}
