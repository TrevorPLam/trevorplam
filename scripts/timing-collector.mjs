#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TIMING_DATA_PATH = join(process.cwd(), 'data', 'test-timing.json');
const SHARD_DATA_PATH = join(process.cwd(), 'data', 'shard-distribution.json');

class TimingCollector {
  constructor() {
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
  }

  loadTimingData() {
    if (existsSync(TIMING_DATA_PATH)) {
      try {
        return JSON.parse(readFileSync(TIMING_DATA_PATH, 'utf8'));
      } catch (error) {
        console.warn('Warning: Could not parse timing data, starting fresh');
        return {};
      }
    }
    return {};
  }

  saveTimingData(data) {
    writeFileSync(TIMING_DATA_PATH, JSON.stringify(data, null, 2));
  }

  collectTimingData(shard, type) {
    const timestamp = Date.now();
    const data = this.loadTimingData();
    
    if (!data[type]) {
      data[type] = {};
    }
    
    if (!data[type][shard]) {
      data[type][shard] = [];
    }
    
    data[type][shard].push({
      timestamp,
      shard: parseInt(shard),
      type,
      startTime: timestamp,
      status: 'started'
    });
    
    this.saveTimingData(data);
    console.log(`Started timing collection for ${type} shard ${shard}`);
  }

  updateTimingData(shard, type, resultsPattern) {
    const data = this.loadTimingData();
    const timestamp = Date.now();
    
    if (!data[type] || !data[type][shard]) {
      console.warn(`No timing data found for ${type} shard ${shard}`);
      return;
    }
    
    // Get the most recent entry for this shard/type
    const entries = data[type][shard];
    const currentEntry = entries[entries.length - 1];
    
    if (currentEntry) {
      currentEntry.endTime = timestamp;
      currentEntry.duration = timestamp - currentEntry.startTime;
      currentEntry.status = 'completed';
      
      // Try to extract test results from JSON files
      try {
        const testResults = this.extractTestResults(resultsPattern);
        currentEntry.testCount = testResults.testCount || 0;
        currentEntry.passed = testResults.passed || 0;
        currentEntry.failed = testResults.failed || 0;
        currentEntry.skipped = testResults.skipped || 0;
      } catch (error) {
        console.warn('Could not extract test results:', error.message);
      }
    }
    
    this.saveTimingData(data);
    console.log(`Updated timing data for ${type} shard ${shard}: ${currentEntry.duration}ms`);
  }

  extractTestResults(pattern) {
    // This would parse the JSON test results files
    // For now, return placeholder data
    return {
      testCount: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }

  calculateOptimalDistribution() {
    const data = this.loadTimingData();
    const distribution = {};
    
    for (const [type, shards] of Object.entries(data)) {
      const shardTimings = [];
      
      for (const [shardNum, entries] of Object.entries(shards)) {
        const completedEntries = entries.filter(entry => entry.status === 'completed' && entry.duration);
        if (completedEntries.length > 0) {
          const avgDuration = completedEntries.reduce((sum, entry) => sum + entry.duration, 0) / completedEntries.length;
          shardTimings.push({
            shard: parseInt(shardNum),
            avgDuration,
            sampleSize: completedEntries.length
          });
        }
      }
      
      if (shardTimings.length > 0) {
        // Calculate optimal distribution based on historical timing
        const totalAvgDuration = shardTimings.reduce((sum, shard) => sum + shard.avgDuration, 0);
        const targetShardDuration = totalAvgDuration / 8; // Target: 8 shards
        
        distribution[type] = {
          current: shardTimings,
          targetDuration: targetShardDuration,
          recommendations: this.generateRecommendations(shardTimings, targetShardDuration)
        };
      }
    }
    
    return distribution;
  }

  generateRecommendations(currentShards, targetDuration) {
    const recommendations = [];
    const variance = this.calculateVariance(currentShards.map(s => s.avgDuration));
    
    if (variance > targetDuration * 0.2) { // 20% variance threshold
      recommendations.push({
        type: 'high_variance',
        message: `High variance detected (${(variance / targetDuration * 100).toFixed(1)}%). Consider rebalancing shards.`,
        priority: 'high'
      });
    }
    
    // Find underutilized and overutilized shards
    const avgShardDuration = currentShards.reduce((sum, s) => sum + s.avgDuration, 0) / currentShards.length;
    
    currentShards.forEach(shard => {
      const ratio = shard.avgDuration / avgShardDuration;
      if (ratio < 0.7) {
        recommendations.push({
          type: 'underutilized',
          shard: shard.shard,
          message: `Shard ${shard.shard} is underutilized (${(ratio * 100).toFixed(1)}% of average)`,
          priority: 'medium'
        });
      } else if (ratio > 1.3) {
        recommendations.push({
          type: 'overutilized',
          shard: shard.shard,
          message: `Shard ${shard.shard} is overutilized (${(ratio * 100).toFixed(1)}% of average)`,
          priority: 'medium'
        });
      }
    });
    
    return recommendations;
  }

  calculateVariance(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    
    return Math.sqrt(avgSquaredDiff);
  }

  generateShardReport() {
    const distribution = this.calculateOptimalDistribution();
    const report = {
      timestamp: Date.now(),
      distribution,
      summary: {
        totalTestTypes: Object.keys(distribution).length,
        overallHealth: this.calculateOverallHealth(distribution)
      }
    };
    
    writeFileSync(SHARD_DATA_PATH, JSON.stringify(report, null, 2));
    return report;
  }

  calculateOverallHealth(distribution) {
    let totalVariance = 0;
    let varianceCount = 0;
    
    for (const [type, data] of Object.entries(distribution)) {
      if (data.current && data.current.length > 0) {
        const durations = data.current.map(shard => shard.avgDuration);
        const variance = this.calculateVariance(durations);
        const targetDuration = data.targetDuration;
        
        totalVariance += variance / targetDuration;
        varianceCount++;
      }
    }
    
    if (varianceCount === 0) return 'unknown';
    
    const avgVarianceRatio = totalVariance / varianceCount;
    
    if (avgVarianceRatio < 0.1) return 'excellent';
    if (avgVarianceRatio < 0.2) return 'good';
    if (avgVarianceRatio < 0.3) return 'fair';
    return 'poor';
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const collector = new TimingCollector();
  
  switch (command) {
    case 'collect':
      const shard = args.find(arg => arg.startsWith('--shard='))?.split('=')[1];
      const type = args.find(arg => arg.startsWith('--type='))?.split('=')[1];
      
      if (!shard || !type) {
        console.error('Error: --shard and --type are required for collect command');
        process.exit(1);
      }
      
      collector.collectTimingData(shard, type);
      break;
      
    case 'update':
      const updateShard = args.find(arg => arg.startsWith('--shard='))?.split('=')[1];
      const updateType = args.find(arg => arg.startsWith('--type='))?.split('=')[1];
      const results = args.find(arg => arg.startsWith('--results='))?.split('=')[1];
      
      if (!updateShard || !updateType || !results) {
        console.error('Error: --shard, --type, and --results are required for update command');
        process.exit(1);
      }
      
      collector.updateTimingData(updateShard, updateType, results);
      break;
      
    case 'report':
      const report = collector.generateShardReport();
      console.log('Shard Distribution Report:');
      console.log(JSON.stringify(report, null, 2));
      break;
      
    case 'optimize':
      const distribution = collector.calculateOptimalDistribution();
      console.log('Optimization Recommendations:');
      
      for (const [type, data] of Object.entries(distribution)) {
        console.log(`\n${type.toUpperCase()} Tests:`);
        data.recommendations.forEach(rec => {
          console.log(`  [${rec.priority.toUpperCase()}] ${rec.message}`);
        });
      }
      break;
      
    default:
      console.log('Usage:');
      console.log('  node timing-collector.mjs collect --shard=<number> --type=<type>');
      console.log('  node timing-collector.mjs update --shard=<number> --type=<type> --results=<pattern>');
      console.log('  node timing-collector.mjs report');
      console.log('  node timing-collector.mjs optimize');
      process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default TimingCollector;
