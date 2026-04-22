import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { RealtimeEvent } from './realtime-server';

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  category: 'test_failure' | 'performance' | 'infrastructure' | 'security';
  title: string;
  message: string;
  details?: any;
  timestamp: string;
  source: string;
  acknowledged: boolean;
  resolved: boolean;
  assignee?: string;
  tags: string[];
  metadata: AlertMetadata;
}

export interface AlertMetadata {
  severity: number; // 1-10
  urgency: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  frequency: number; // How many times this alert has occurred
  firstOccurrence: string;
  lastOccurrence: string;
  autoResolve?: boolean;
  autoDismiss?: number; // Auto-dismiss after N seconds
  escalationLevel: number;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: AlertCondition[];
  actions: AlertAction[];
  cooldown: number; // Cooldown period in seconds
  throttle: number; // Maximum alerts per time period
  schedule?: AlertSchedule;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
  threshold: number;
  duration?: number; // Duration condition must be met
  aggregation?: 'avg' | 'max' | 'min' | 'sum' | 'count';
}

export interface AlertAction {
  type: 'webhook' | 'email' | 'slack' | 'console' | 'log' | 'dashboard';
  config: Record<string, any>;
  enabled: boolean;
}

export interface AlertSchedule {
  enabled: boolean;
  timezone: string;
  activeHours: {
    start: string; // HH:MM
    end: string;   // HH:MM
  };
  activeDays: number[]; // 0-6 (Sunday-Saturday)
}

export interface AlertChannel {
  id: string;
  name: string;
  type: 'webhook' | 'email' | 'slack' | 'console' | 'log';
  config: Record<string, any>;
  enabled: boolean;
  rateLimit: {
    maxAlerts: number;
    period: number; // seconds
  };
  lastUsed?: number;
}

export interface AlertStatistics {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  acknowledged: number;
  resolved: number;
  active: number;
  averageResolutionTime: number;
  escalationRate: number;
}

/**
 * Comprehensive Alerting System for Test Monitoring
 */
export class AlertingSystem {
  private rules: Map<string, AlertRule> = new Map();
  private channels: Map<string, AlertChannel> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private statistics: AlertStatistics;
  private isRunning = false;
  private cooldowns: Map<string, number> = new Map();
  private throttles: Map<string, number[]> = new Map();

  constructor() {
    this.statistics = this.initializeStatistics();
    this.setupDefaultRules();
    this.setupDefaultChannels();
  }

  /**
   * Start the alerting system
   */
  start(): void {
    if (this.isRunning) {
      console.log('Alerting system is already running');
      return;
    }

    this.isRunning = true;
    console.log('Alerting system started');
    console.log(`Rules: ${this.rules.size}, Channels: ${this.channels.size}`);
  }

  /**
   * Stop the alerting system
   */
  stop(): void {
    this.isRunning = false;
    console.log('Alerting system stopped');
  }

  /**
   * Process a real-time event and potentially generate alerts
   */
  async processEvent(event: RealtimeEvent): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Check all enabled rules against the event
      for (const rule of this.rules.values()) {
        if (rule.enabled && this.shouldEvaluateRule(rule, event)) {
          const alerts = await this.evaluateRule(rule, event);
          
          for (const alert of alerts) {
            await this.triggerAlert(alert);
          }
        }
      }
    } catch (error) {
      console.error('Error processing event for alerts:', error);
    }
  }

  /**
   * Check if a rule should be evaluated for this event
   */
  private shouldEvaluateRule(rule: AlertRule, event: RealtimeEvent): boolean {
    // Check cooldown
    const cooldownKey = `${rule.id}-${event.type}`;
    const lastCooldown = this.cooldowns.get(cooldownKey) || 0;
    if (Date.now() - lastCooldown < rule.cooldown * 1000) {
      return false;
    }

    // Check schedule
    if (rule.schedule && rule.schedule.enabled) {
      if (!this.isWithinSchedule(rule.schedule)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate a rule against an event and generate alerts if conditions are met
   */
  private async evaluateRule(rule: AlertRule, event: RealtimeEvent): Promise<Alert[]> {
    const alerts: Alert[] = [];

    for (const condition of rule.conditions) {
      const conditionMet = await this.evaluateCondition(condition, event);
      
      if (conditionMet) {
        const alert = await this.createAlert(rule, condition, event);
        alerts.push(alert);
        
        // Update cooldown
        const cooldownKey = `${rule.id}-${event.type}`;
        this.cooldowns.set(cooldownKey, Date.now());
      }
    }

    return alerts;
  }

  /**
   * Evaluate a single condition
   */
  private async evaluateCondition(condition: AlertCondition, event: RealtimeEvent): Promise<boolean> {
    // Extract metric value from event
    const value = this.extractMetricValue(condition.metric, event);
    
    if (value === undefined) {
      return false;
    }

    // Apply operator
    switch (condition.operator) {
      case 'gt': return value > condition.threshold;
      case 'gte': return value >= condition.threshold;
      case 'lt': return value < condition.threshold;
      case 'lte': return value <= condition.threshold;
      case 'eq': return value === condition.threshold;
      case 'ne': return value !== condition.threshold;
      default: return false;
    }
  }

  /**
   * Extract metric value from event data
   */
  private extractMetricValue(metric: string, event: RealtimeEvent): number | undefined {
    const data = event.data;
    
    // Handle different event types and metrics
    switch (metric) {
      case 'test_duration':
        return data.duration || data.currentDuration;
      case 'test_progress':
        return data.progress;
      case 'pass_rate':
        return data.passRate || (data.numPassedTests / data.numTotalTests) * 100;
      case 'failure_rate':
        const passRate = data.passRate || (data.numPassedTests / data.numTotalTests) * 100;
        return 100 - passRate;
      case 'active_tests':
        return data.activeTests?.length || 0;
      case 'flakiness_score':
        return data.flakinessScore || 0;
      case 'regression_percentage':
        return data.regressionPercentage || 0;
      default:
        // Try to extract nested property
        return this.getNestedProperty(data, metric);
    }
  }

  /**
   * Get nested property from object
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Create an alert from rule, condition, and event
   */
  private async createAlert(rule: AlertRule, condition: AlertCondition, event: RealtimeEvent): Promise<Alert> {
    const alertId = this.generateAlertId();
    const now = new Date().toISOString();
    
    // Determine alert type and category
    const { type, category } = this.determineAlertType(event, condition);
    
    // Create alert
    const alert: Alert = {
      id: alertId,
      type,
      category,
      title: this.generateAlertTitle(rule, condition, event),
      message: this.generateAlertMessage(rule, condition, event),
      details: {
        rule: rule.name,
        condition: `${condition.metric} ${condition.operator} ${condition.threshold}`,
        event: event.type,
        eventData: event.data
      },
      timestamp: now,
      source: 'alerting-system',
      acknowledged: false,
      resolved: false,
      tags: this.generateAlertTags(event, rule),
      metadata: {
        severity: this.calculateSeverity(event, condition),
        urgency: this.calculateUrgency(event, condition),
        impact: this.calculateImpact(event, condition),
        frequency: 1,
        firstOccurrence: now,
        lastOccurrence: now,
        autoResolve: rule.actions.some(action => action.type === 'auto-resolve'),
        escalationLevel: 0
      }
    };

    // Store alert
    this.alerts.set(alertId, alert);
    this.alertHistory.push(alert);
    
    // Update statistics
    this.updateStatistics(alert);

    return alert;
  }

  /**
   * Trigger an alert through all configured channels
   */
  private async triggerAlert(alert: Alert): Promise<void> {
    console.log(`ALERT [${alert.type.toUpperCase()}]: ${alert.title}`);
    
    // Find the rule that generated this alert
    const rule = Array.from(this.rules.values()).find(r => 
      r.name === alert.details?.rule
    );

    if (!rule) {
      console.warn(`No rule found for alert: ${alert.id}`);
      return;
    }

    // Check throttle
    if (!this.checkThrottle(rule, alert)) {
      console.log(`Alert throttled: ${alert.id}`);
      return;
    }

    // Execute all enabled actions
    for (const action of rule.actions) {
      if (action.enabled) {
        try {
          await this.executeAction(action, alert);
        } catch (error) {
          console.error(`Error executing alert action ${action.type}:`, error);
        }
      }
    }
  }

  /**
   * Check if alert should be throttled
   */
  private checkThrottle(rule: AlertRule, alert: Alert): boolean {
    const throttleKey = `${rule.id}-${alert.category}`;
    const now = Date.now();
    const timestamps = this.throttles.get(throttleKey) || [];
    
    // Remove old timestamps outside the throttle period
    const validTimestamps = timestamps.filter(ts => now - ts < rule.throttle * 1000);
    
    // Check if we've exceeded the throttle limit
    if (validTimestamps.length >= rule.throttle) {
      return false;
    }
    
    // Add current timestamp
    validTimestamps.push(now);
    this.throttles.set(throttleKey, validTimestamps);
    
    return true;
  }

  /**
   * Execute an alert action
   */
  private async executeAction(action: AlertAction, alert: Alert): Promise<void> {
    switch (action.type) {
      case 'console':
        this.consoleAlert(alert);
        break;
      case 'log':
        this.logAlert(alert);
        break;
      case 'webhook':
        await this.webhookAlert(alert, action.config);
        break;
      case 'email':
        await this.emailAlert(alert, action.config);
        break;
      case 'slack':
        await this.slackAlert(alert, action.config);
        break;
      case 'dashboard':
        this.dashboardAlert(alert);
        break;
      default:
        console.warn(`Unknown alert action type: ${action.type}`);
    }
  }

  /**
   * Console alert action
   */
  private consoleAlert(alert: Alert): void {
    const timestamp = new Date(alert.timestamp).toLocaleString();
    const severity = alert.type.toUpperCase();
    
    console.log(`\n${severity} ALERT [${timestamp}]`);
    console.log(`Title: ${alert.title}`);
    console.log(`Message: ${alert.message}`);
    console.log(`Category: ${alert.category}`);
    console.log(`Severity: ${alert.metadata.severity}/10`);
    console.log(`---\n`);
  }

  /**
   * Log alert action
   */
  private logAlert(alert: Alert): void {
    const logEntry = {
      timestamp: alert.timestamp,
      level: alert.type,
      alert: {
        id: alert.id,
        title: alert.title,
        message: alert.message,
        category: alert.category,
        severity: alert.metadata.severity
      }
    };

    try {
      const logFile = 'tests/metrics/alerts.log';
      const logLine = JSON.stringify(logEntry) + '\n';
      
      // In a real implementation, would append to file
      console.log(`LOG ALERT: ${logLine.trim()}`);
    } catch (error) {
      console.error('Error logging alert:', error);
    }
  }

  /**
   * Webhook alert action
   */
  private async webhookAlert(alert: Alert, config: any): Promise<void> {
    const url = config.url;
    if (!url) {
      console.warn('Webhook URL not configured');
      return;
    }

    const payload = {
      alert,
      timestamp: new Date().toISOString(),
      service: 'test-monitoring'
    };

    try {
      // In a real implementation, would make HTTP request
      console.log(`WEBHOOK ALERT to ${url}:`, JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error('Error sending webhook alert:', error);
    }
  }

  /**
   * Email alert action
   */
  private async emailAlert(alert: Alert, config: any): Promise<void> {
    const to = config.to;
    const subject = `[${alert.type.toUpperCase()}] ${alert.title}`;
    const body = this.formatEmailBody(alert);

    try {
      // In a real implementation, would send email
      console.log(`EMAIL ALERT to ${to}:`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${body}`);
    } catch (error) {
      console.error('Error sending email alert:', error);
    }
  }

  /**
   * Slack alert action
   */
  private async slackAlert(alert: Alert, config: any): Promise<void> {
    const webhook = config.webhook;
    const channel = config.channel || '#alerts';
    
    const payload = {
      channel,
      username: 'Test Monitor',
      icon_emoji: ':warning:',
      text: `*${alert.title}*`,
      attachments: [{
        color: alert.type === 'critical' ? 'danger' : alert.type === 'warning' ? 'warning' : 'good',
        fields: [
          { title: 'Message', value: alert.message, short: false },
          { title: 'Category', value: alert.category, short: true },
          { title: 'Severity', value: `${alert.metadata.severity}/10`, short: true },
          { title: 'Time', value: new Date(alert.timestamp).toLocaleString(), short: true }
        ],
        footer: 'Test Monitoring System',
        ts: Math.floor(new Date(alert.timestamp).getTime() / 1000)
      }]
    };

    try {
      // In a real implementation, would send to Slack
      console.log(`SLACK ALERT to ${channel}:`, JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error('Error sending Slack alert:', error);
    }
  }

  /**
   * Dashboard alert action
   */
  private dashboardAlert(alert: Alert): void {
    // Update dashboard with new alert
    console.log(`DASHBOARD ALERT: ${alert.title} added to dashboard`);
  }

  /**
   * Format email body
   */
  private formatEmailBody(alert: Alert): string {
    return `
Alert Details:
=============
Title: ${alert.title}
Message: ${alert.message}
Category: ${alert.category}
Severity: ${alert.metadata.severity}/10
Urgency: ${alert.metadata.urgency}
Impact: ${alert.metadata.impact}
Time: ${new Date(alert.timestamp).toLocaleString()}

Additional Details:
==================
${JSON.stringify(alert.details, null, 2)}

Tags:
=====
${alert.tags.join(', ')}

This alert was generated by the Test Monitoring System.
`;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, userId?: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.acknowledged = true;
    alert.assignee = userId;
    
    console.log(`Alert acknowledged: ${alertId} by ${userId || 'unknown'}`);
    return true;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, userId?: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.resolved = true;
    alert.assignee = userId;
    
    // Update statistics
    this.statistics.resolved++;
    this.statistics.active--;
    
    console.log(`Alert resolved: ${alertId} by ${userId || 'unknown'}`);
    return true;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get alert statistics
   */
  getStatistics(): AlertStatistics {
    return { ...this.statistics };
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit?: number): Alert[] {
    if (limit) {
      return this.alertHistory.slice(-limit);
    }
    return [...this.alertHistory];
  }

  // Helper methods

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineAlertType(event: RealtimeEvent, condition: AlertCondition): { type: 'info' | 'warning' | 'critical', category: 'test_failure' | 'performance' | 'infrastructure' | 'security' } {
    // Default to warning, upgrade based on conditions
    let type: 'info' | 'warning' | 'critical' = 'warning';
    let category: 'test_failure' | 'performance' | 'infrastructure' | 'security' = 'infrastructure';

    if (event.type === 'test_complete' && event.data.status === 'failed') {
      type = 'critical';
      category = 'test_failure';
    } else if (condition.metric.includes('duration') || condition.metric.includes('performance')) {
      type = condition.threshold > 10000 ? 'critical' : 'warning';
      category = 'performance';
    } else if (condition.metric.includes('failure') || condition.metric.includes('error')) {
      type = 'critical';
      category = 'test_failure';
    } else if (condition.metric.includes('security')) {
      type = 'critical';
      category = 'security';
    }

    return { type, category };
  }

  private generateAlertTitle(rule: AlertRule, condition: AlertCondition, event: RealtimeEvent): string {
    const metric = condition.metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `${metric} Alert`;
  }

  private generateAlertMessage(rule: AlertRule, condition: AlertCondition, event: RealtimeEvent): string {
    const value = this.extractMetricValue(condition.metric, event);
    return `${condition.metric} is ${value} (threshold: ${condition.threshold})`;
  }

  private generateAlertTags(event: RealtimeEvent, rule: AlertRule): string[] {
    const tags = [event.type, rule.name];
    
    if (event.data.testFile) {
      tags.push('test-file');
    }
    
    if (event.data.category) {
      tags.push(event.data.category);
    }
    
    return tags;
  }

  private calculateSeverity(event: RealtimeEvent, condition: AlertCondition): number {
    let severity = 5; // Base severity

    // Adjust based on condition
    if (condition.threshold > 10000) severity += 2;
    if (condition.operator === 'eq' || condition.operator === 'ne') severity += 1;
    
    // Adjust based on event type
    if (event.type === 'test_complete' && event.data.status === 'failed') severity += 3;
    if (event.type === 'test_failure') severity += 2;
    
    return Math.min(10, Math.max(1, severity));
  }

  private calculateUrgency(event: RealtimeEvent, condition: AlertCondition): 'low' | 'medium' | 'high' | 'critical' {
    const severity = this.calculateSeverity(event, condition);
    
    if (severity >= 8) return 'critical';
    if (severity >= 6) return 'high';
    if (severity >= 4) return 'medium';
    return 'low';
  }

  private calculateImpact(event: RealtimeEvent, condition: AlertCondition): 'low' | 'medium' | 'high' | 'critical' {
    // Default to medium, adjust based on event
    let impact: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    
    if (event.type === 'test_complete' && event.data.status === 'failed') {
      impact = 'high';
    }
    
    if (condition.metric.includes('security') || condition.metric.includes('critical')) {
      impact = 'critical';
    }
    
    return impact;
  }

  private updateStatistics(alert: Alert): void {
    this.statistics.total++;
    this.statistics.active++;
    
    // Update by type
    this.statistics.byType[alert.type] = (this.statistics.byType[alert.type] || 0) + 1;
    
    // Update by category
    this.statistics.byCategory[alert.category] = (this.statistics.byCategory[alert.category] || 0) + 1;
    
    // Update by severity
    const severityRange = this.getSeverityRange(alert.metadata.severity);
    this.statistics.bySeverity[severityRange] = (this.statistics.bySeverity[severityRange] || 0) + 1;
  }

  private getSeverityRange(severity: number): string {
    if (severity >= 8) return 'critical';
    if (severity >= 6) return 'high';
    if (severity >= 4) return 'medium';
    return 'low';
  }

  private isWithinSchedule(schedule: AlertSchedule): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.getDay();
    
    // Check if current day is active
    if (!schedule.activeDays.includes(currentDay)) {
      return false;
    }
    
    // Check if current time is within active hours
    const [startHour, startMin] = schedule.activeHours.start.split(':').map(Number);
    const [endHour, endMin] = schedule.activeHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    return currentTime >= startTime && currentTime <= endTime;
  }

  private initializeStatistics(): AlertStatistics {
    return {
      total: 0,
      byType: {},
      byCategory: {},
      bySeverity: {},
      acknowledged: 0,
      resolved: 0,
      active: 0,
      averageResolutionTime: 0,
      escalationRate: 0
    };
  }

  private setupDefaultRules(): void {
    // Test failure rule
    this.rules.set('test-failure', {
      id: 'test-failure',
      name: 'Test Failure',
      description: 'Alert when tests fail',
      enabled: true,
      conditions: [{
        metric: 'failure_rate',
        operator: 'gt',
        threshold: 0
      }],
      actions: [
        { type: 'console', config: {}, enabled: true },
        { type: 'log', config: {}, enabled: true },
        { type: 'dashboard', config: {}, enabled: true }
      ],
      cooldown: 60,
      throttle: 5
    });

    // Performance rule
    this.rules.set('performance-regression', {
      id: 'performance-regression',
      name: 'Performance Regression',
      description: 'Alert when test performance degrades',
      enabled: true,
      conditions: [{
        metric: 'test_duration',
        operator: 'gt',
        threshold: 30000 // 30 seconds
      }],
      actions: [
        { type: 'console', config: {}, enabled: true },
        { type: 'log', config: {}, enabled: true },
        { type: 'dashboard', config: {}, enabled: true }
      ],
      cooldown: 300,
      throttle: 3
    });

    // High flakiness rule
    this.rules.set('high-flakiness', {
      id: 'high-flakiness',
      name: 'High Test Flakiness',
      description: 'Alert when tests show high flakiness',
      enabled: true,
      conditions: [{
        metric: 'flakiness_score',
        operator: 'gt',
        threshold: 0.2 // 20%
      }],
      actions: [
        { type: 'console', config: {}, enabled: true },
        { type: 'log', config: {}, enabled: true }
      ],
      cooldown: 600,
      throttle: 2
    });
  }

  private setupDefaultChannels(): void {
    // Console channel
    this.channels.set('console', {
      id: 'console',
      name: 'Console Output',
      type: 'console',
      config: {},
      enabled: true,
      rateLimit: {
        maxAlerts: 100,
        period: 60
      }
    });

    // Log channel
    this.channels.set('log', {
      id: 'log',
      name: 'Log File',
      type: 'log',
      config: {
        file: 'tests/metrics/alerts.log'
      },
      enabled: true,
      rateLimit: {
        maxAlerts: 50,
        period: 60
      }
    });

    // Dashboard channel
    this.channels.set('dashboard', {
      id: 'dashboard',
      name: 'Dashboard',
      type: 'dashboard',
      config: {},
      enabled: true,
      rateLimit: {
        maxAlerts: 20,
        period: 60
      }
    });
  }
}

// CLI interface for testing the alerting system
if (import.meta.url === `file://${process.argv[1]}`) {
  const alerting = new AlertingSystem();
  
  alerting.start();
  
  console.log('Alerting System Test');
  console.log('===================');
  
  // Simulate some events
  const testEvents: RealtimeEvent[] = [
    {
      type: 'test_complete',
      timestamp: new Date().toISOString(),
      data: {
        testFile: 'tests/unit/example.test.ts',
        status: 'failed',
        duration: 5000,
        error: 'Test assertion failed'
      }
    },
    {
      type: 'metrics_update',
      timestamp: new Date().toISOString(),
      data: {
        testFile: 'tests/integration/api.test.ts',
        duration: 45000, // High duration
        performance: 'slow'
      }
    },
    {
      type: 'test_progress',
      timestamp: new Date().toISOString(),
      data: {
        testFile: 'tests/components/ui.test.ts',
        flakinessScore: 0.3, // High flakiness
        progress: 50
      }
    }
  ];
  
  // Process events
  (async () => {
    for (const event of testEvents) {
      console.log(`\\nProcessing event: ${event.type}`);
      await alerting.processEvent(event);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Show statistics
    console.log('\\nAlert Statistics:');
    console.log(JSON.stringify(alerting.getStatistics(), null, 2));
    
    // Show active alerts
    console.log('\\nActive Alerts:');
    const activeAlerts = alerting.getActiveAlerts();
    activeAlerts.forEach(alert => {
      console.log(`- [${alert.type.toUpperCase()}] ${alert.title}: ${alert.message}`);
    });
    
    console.log('\\nAlerting system test completed');
  })();
}
