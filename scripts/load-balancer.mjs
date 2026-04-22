#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOAD_BALANCE_DATA_PATH = join(process.cwd(), 'data', 'load-balance.json');
const SYSTEM_METRICS_PATH = join(process.cwd(), 'data', 'system-metrics.json');

class LoadBalancer {
  constructor() {
    this.ensureDataDirectory();
    this.currentLoad = new Map();
    this.resourcePool = this.initializeResourcePool();
  }

  ensureDataDirectory() {
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
  }

  initializeResourcePool() {
    return {
      cpu: { total: 100, allocated: 0, available: 100 },
      memory: { total: 100, allocated: 0, available: 100 },
      workers: { total: 8, allocated: 0, available: 8 },
      io: { total: 100, allocated: 0, available: 100 }
    };
  }

  loadBalanceData() {
    if (existsSync(LOAD_BALANCE_DATA_PATH)) {
      try {
        return JSON.parse(readFileSync(LOAD_BALANCE_DATA_PATH, 'utf8'));
      } catch (error) {
        console.warn('Warning: Could not parse load balance data, starting fresh');
        return {};
      }
    }
    return {};
  }

  saveLoadBalanceData(data) {
    writeFileSync(LOAD_BALANCE_DATA_PATH, JSON.stringify(data, null, 2));
  }

  calculateTestWeight(testType, testCount = 1) {
    const weights = {
      unit: 1,
      components: 2,
      integration: 3,
      accessibility: 4,
      e2e: 5,
      performance: 6,
      security: 2,
      contract: 2
    };

    const baseWeight = weights[testType] || 1;
    return baseWeight * testCount;
  }

  allocateResources(testType, shardCount, testCount = 1) {
    const weight = this.calculateTestWeight(testType, testCount);
    const allocation = this.calculateOptimalAllocation(weight, shardCount);
    
    return {
      testType,
      shardCount,
      weight,
      allocation,
      estimatedDuration: this.estimateDuration(testType, weight),
      resourceLevel: this.determineResourceLevel(weight)
    };
  }

  calculateOptimalAllocation(weight, shardCount) {
    const baseAllocation = {
      cpu: Math.min(weight * 10, 80), // Max 80% CPU per test type
      memory: Math.min(weight * 8, 60), // Max 60% memory per test type
      workers: Math.min(Math.ceil(weight / 2), shardCount),
      io: Math.min(weight * 5, 40) // Max 40% I/O per test type
    };

    // Adjust for system constraints
    const adjustedAllocation = {};
    
    Object.entries(baseAllocation).forEach(([resource, amount]) => {
      const available = this.resourcePool[resource].available;
      adjustedAllocation[resource] = Math.min(amount, available);
    });

    return adjustedAllocation;
  }

  determineResourceLevel(weight) {
    if (weight <= 2) return 'standard';
    if (weight <= 4) return 'enhanced';
    return 'high';
  }

  estimateDuration(testType, weight) {
    const baseDurations = {
      unit: 5000, // 5 seconds
      components: 15000, // 15 seconds
      integration: 30000, // 30 seconds
      accessibility: 45000, // 45 seconds
      e2e: 60000, // 60 seconds
      performance: 90000, // 90 seconds
      security: 30000, // 30 seconds
      contract: 20000 // 20 seconds
    };

    return baseDurations[testType] * weight;
  }

  balanceShards(testSuites) {
    const allocations = [];
    let totalWeight = 0;

    // Calculate allocations for all test suites
    Object.entries(testSuites).forEach(([testType, config]) => {
      const allocation = this.allocateResources(
        testType, 
        config.shardCount, 
        config.testCount
      );
      allocations.push(allocation);
      totalWeight += allocation.weight;
    });

    // Distribute resources optimally
    const balancedDistribution = this.optimizeDistribution(allocations);
    
    return {
      totalWeight,
      allocations: balancedDistribution,
      resourceUtilization: this.calculateResourceUtilization(balancedDistribution),
      recommendations: this.generateBalanceRecommendations(balancedDistribution)
    };
  }

  optimizeDistribution(allocations) {
    // Sort by weight (heaviest first)
    const sorted = allocations.sort((a, b) => b.weight - a.weight);
    
    // Apply resource constraints and rebalance
    const optimized = [];
    const usedResources = { cpu: 0, memory: 0, workers: 0, io: 0 };
    
    sorted.forEach(allocation => {
      const adjustedAllocation = { ...allocation };
      
      Object.entries(allocation.allocation).forEach(([resource, amount]) => {
        const available = this.resourcePool[resource].total - usedResources[resource];
        const adjustedAmount = Math.min(amount, available);
        
        adjustedAllocation.allocation[resource] = adjustedAmount;
        usedResources[resource] += adjustedAmount;
      });
      
      optimized.push(adjustedAllocation);
    });

    return optimized;
  }

  calculateResourceUtilization(allocations) {
    const utilization = {};
    
    Object.keys(this.resourcePool).forEach(resource => {
      const total = allocations.reduce((sum, alloc) => 
        sum + (alloc.allocation[resource] || 0), 0
      );
      
      utilization[resource] = {
        allocated: total,
        total: this.resourcePool[resource].total,
        percentage: (total / this.resourcePool[resource].total) * 100
      };
    });

    return utilization;
  }

  generateBalanceRecommendations(allocations) {
    const recommendations = [];
    const utilization = this.calculateResourceUtilization(allocations);
    
    // Check for resource contention
    Object.entries(utilization).forEach(([resource, data]) => {
      if (data.percentage > 90) {
        recommendations.push({
          type: 'resource_contention',
          resource,
          priority: 'high',
          message: `${resource} utilization is at ${data.percentage.toFixed(1)}%. Consider reducing parallelism.`,
          action: 'Decrease concurrent test execution or increase resource limits'
        });
      } else if (data.percentage > 75) {
        recommendations.push({
          type: 'resource_pressure',
          resource,
          priority: 'medium',
          message: `${resource} utilization is high at ${data.percentage.toFixed(1)}%.`,
          action: 'Monitor for performance degradation'
        });
      } else if (data.percentage < 30) {
        recommendations.push({
          type: 'underutilization',
          resource,
          priority: 'low',
          message: `${resource} utilization is low at ${data.percentage.toFixed(1)}%. Consider increasing parallelism.`,
          action: 'Increase worker count or add more test types'
        });
      }
    });

    // Check for imbalanced shard distribution
    const shardCounts = allocations.map(alloc => alloc.shardCount);
    const avgShards = shardCounts.reduce((sum, count) => sum + count, 0) / shardCounts.length;
    
    allocations.forEach(allocation => {
      if (allocation.shardCount > avgShards * 1.5) {
        recommendations.push({
          type: 'shard_imbalance',
          testType: allocation.testType,
          priority: 'medium',
          message: `${allocation.testType} has ${allocation.shardCount} shards, significantly above average of ${avgShards.toFixed(1)}.`,
          action: 'Consider consolidating shards or redistributing tests'
        });
      }
    });

    return recommendations;
  }

  monitorSystemLoad() {
    const metrics = {
      timestamp: Date.now(),
      load: this.calculateCurrentLoad(),
      processes: this.getProcessInfo(),
      resources: this.getResourceSnapshot()
    };

    // Save metrics for historical analysis
    this.saveSystemMetrics(metrics);
    
    return metrics;
  }

  calculateCurrentLoad() {
    // In a real implementation, this would query actual system metrics
    // For now, return simulated data
    return {
      cpu1: Math.random() * 100,
      cpu5: Math.random() * 100,
      cpu15: Math.random() * 100,
      memory: {
        total: 16384, // MB
        used: Math.random() * 16384,
        free: 16384 - (Math.random() * 16384)
      },
      processes: Math.floor(Math.random() * 200) + 50
    };
  }

  getProcessInfo() {
    return {
      activeWorkers: Math.floor(Math.random() * 8) + 1,
      queuedJobs: Math.floor(Math.random() * 10),
      completedJobs: Math.floor(Math.random() * 100) + 50
    };
  }

  getResourceSnapshot() {
    return {
      ...this.resourcePool,
      timestamp: Date.now()
    };
  }

  saveSystemMetrics(metrics) {
    const existingMetrics = this.loadSystemMetrics();
    existingMetrics.push(metrics);
    
    // Keep only last 100 entries
    if (existingMetrics.length > 100) {
      existingMetrics.splice(0, existingMetrics.length - 100);
    }
    
    writeFileSync(SYSTEM_METRICS_PATH, JSON.stringify(existingMetrics, null, 2));
  }

  loadSystemMetrics() {
    if (existsSync(SYSTEM_METRICS_PATH)) {
      try {
        return JSON.parse(readFileSync(SYSTEM_METRICS_PATH, 'utf8'));
      } catch (error) {
        console.warn('Warning: Could not parse system metrics, starting fresh');
        return [];
      }
    }
    return [];
  }

  generateOptimizationPlan(testSuites) {
    const balance = this.balanceShards(testSuites);
    const systemLoad = this.monitorSystemLoad();
    
    const plan = {
      timestamp: Date.now(),
      currentLoad: systemLoad,
      proposedDistribution: balance,
      expectedImprovement: this.calculateExpectedImprovement(balance),
      implementationSteps: this.generateImplementationSteps(balance),
      risks: this.identifyRisks(balance)
    };

    return plan;
  }

  calculateExpectedImprovement(balance) {
    // Estimate performance improvement based on better resource distribution
    const currentUtilization = Object.values(balance.resourceUtilization)
      .reduce((sum, res) => sum + res.percentage, 0) / 4;
    
    const targetUtilization = 75; // Target 75% utilization
    const improvement = Math.max(0, (currentUtilization - targetUtilization) / currentUtilization);
    
    return {
      executionTimeImprovement: improvement * 100, // percentage
      resourceEfficiency: targetUtilization,
      estimatedTimeReduction: improvement * 0.3 * 100 // 30% of utilization improvement
    };
  }

  generateImplementationSteps(balance) {
    const steps = [
      {
        step: 1,
        title: 'Update CI Configuration',
        description: 'Modify matrix strategy to use optimized shard distribution',
        files: ['.github/workflows/ci.yml'],
        estimatedTime: '15 minutes'
      },
      {
        step: 2,
        title: 'Deploy Resource Allocation Changes',
        description: 'Apply new resource levels based on test weights',
        files: ['scripts/load-balancer.mjs'],
        estimatedTime: '10 minutes'
      },
      {
        step: 3,
        title: 'Monitor Initial Run',
        description: 'Observe first run with new configuration and collect metrics',
        files: ['logs/test-orchestration.json'],
        estimatedTime: '30 minutes'
      },
      {
        step: 4,
        title: 'Fine-tune Based on Results',
        description: 'Adjust allocation based on actual performance data',
        files: ['data/load-balance.json'],
        estimatedTime: '20 minutes'
      }
    ];

    return steps;
  }

  identifyRisks(balance) {
    const risks = [];
    
    // High resource utilization risks
    Object.entries(balance.resourceUtilization).forEach(([resource, data]) => {
      if (data.percentage > 85) {
        risks.push({
          type: 'resource_exhaustion',
          resource,
          probability: 'high',
          impact: 'high',
          mitigation: `Reduce ${resource} allocation or increase system resources`
        });
      }
    });

    // Shard distribution risks
    const maxShards = Math.max(...balance.allocations.map(alloc => alloc.shardCount));
    if (maxShards > 6) {
      risks.push({
        type: 'fragmentation',
        probability: 'medium',
        impact: 'medium',
        mitigation: 'Consider consolidating shards to reduce overhead'
      });
    }

    return risks;
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const balancer = new LoadBalancer();
  
  switch (command) {
    case 'analyze': {
      const configPath = args.find(arg => arg.startsWith('--config='))?.split('=')[1];
      
      if (!configPath) {
        console.error('Error: --config is required for analyze command');
        process.exit(1);
      }
      
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf8'));
        const plan = balancer.generateOptimizationPlan(config);
        
        console.log('Load Balance Analysis:');
        console.log(JSON.stringify(plan, null, 2));
        
      } catch (error) {
        console.error('Analysis failed:', error.message);
        process.exit(1);
      }
      break;
    }
      
    case 'monitor': {
      const metrics = balancer.monitorSystemLoad();
      console.log('System Load Metrics:');
      console.log(JSON.stringify(metrics, null, 2));
      break;
    }
      
    case 'optimize': {
      const testSuites = {
        unit: { shardCount: 1, testCount: 50 },
        components: { shardCount: 1, testCount: 20 },
        integration: { shardCount: 1, testCount: 15 },
        accessibility: { shardCount: 1, testCount: 10 },
        e2e: { shardCount: 1, testCount: 8 },
        performance: { shardCount: 1, testCount: 5 },
        security: { shardCount: 1, testCount: 12 },
        contract: { shardCount: 1, testCount: 6 }
      };
      
      const balance = balancer.balanceShards(testSuites);
      console.log('Optimized Shard Distribution:');
      console.log(JSON.stringify(balance, null, 2));
      break;
    }
      
    case 'recommend': {
      const testSuites = {
        unit: { shardCount: 1, testCount: 50 },
        components: { shardCount: 1, testCount: 20 },
        integration: { shardCount: 1, testCount: 15 },
        accessibility: { shardCount: 1, testCount: 10 },
        e2e: { shardCount: 1, testCount: 8 },
        performance: { shardCount: 1, testCount: 5 },
        security: { shardCount: 1, testCount: 12 },
        contract: { shardCount: 1, testCount: 6 }
      };
      
      const balance = balancer.balanceShards(testSuites);
      console.log('Load Balancing Recommendations:');
      
      balance.recommendations.forEach(rec => {
        console.log(`\n[${rec.priority.toUpperCase()}] ${rec.type}:`);
        console.log(`  ${rec.message}`);
        console.log(`  Action: ${rec.action}`);
      });
      break;
    }
      
    default:
      console.log('Usage:');
      console.log('  node load-balancer.mjs analyze --config=<config-file>');
      console.log('  node load-balancer.mjs monitor');
      console.log('  node load-balancer.mjs optimize');
      console.log('  node load-balancer.mjs recommend');
      process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default LoadBalancer;
