import { z } from 'zod';

// Core metric types for validation and type safety
export const MetricTypeSchema = z.enum([
  'percentage',
  'currency',
  'number',
  'ratio',
  'time',
  'count'
]);

export const TrendDirectionSchema = z.enum([
  'up',
  'down',
  'neutral',
  'positive',
  'negative'
]);

export const MetricSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: MetricTypeSchema,
  value: z.string(),
  previousValue: z.string().optional(),
  unit: z.string().optional(),
  context: z.string(),
  category: z.string(),
  trend: TrendDirectionSchema.optional(),
  caseStudySlug: z.string().optional(),
  capabilitySlug: z.string().optional(),
  skillTag: z.string().optional(),
  lastUpdated: z.coerce.date().optional(),
  description: z.string().optional(),
  targetValue: z.string().optional(),
  industry: z.string().optional(),
});

export const MetricCollectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  metrics: z.array(MetricSchema),
  category: z.string(),
  lastUpdated: z.coerce.date().optional(),
});

export const ChartDataSchema = z.object({
  labels: z.array(z.string()),
  datasets: z.array(z.object({
    label: z.string(),
    data: z.array(z.number()),
    backgroundColor: z.union([z.string(), z.array(z.string())]).optional(),
    borderColor: z.union([z.string(), z.array(z.string())]).optional(),
    borderWidth: z.number().default(1),
    fill: z.boolean().default(false),
  })),
});

export const ChartConfigSchema = z.object({
  type: z.enum(['line', 'bar', 'doughnut', 'pie', 'radar']),
  title: z.string(),
  description: z.string().optional(),
  data: ChartDataSchema,
  options: z.object({
    responsive: z.boolean().default(true),
    maintainAspectRatio: z.boolean().default(false),
    plugins: z.object({
      legend: z.object({
        display: z.boolean().default(true),
        position: z.enum(['top', 'bottom', 'left', 'right']).default('top'),
      }).optional(),
      tooltip: z.object({
        enabled: z.boolean().default(true),
      }).optional(),
    }).optional(),
    scales: z.object({
      y: z.object({
        beginAtZero: z.boolean().default(true),
      }).optional(),
      x: z.object({
        beginAtZero: z.boolean().default(true),
      }).optional(),
    }).optional(),
  }).optional(),
});

// Type exports
export type MetricType = z.infer<typeof MetricTypeSchema>;
export type TrendDirection = z.infer<typeof TrendDirectionSchema>;
export type Metric = z.infer<typeof MetricSchema>;
export type MetricCollection = z.infer<typeof MetricCollectionSchema>;
export type ChartData = z.infer<typeof ChartDataSchema>;
export type ChartConfig = z.infer<typeof ChartConfigSchema>;

// Internationalization configuration
export interface LocaleConfig {
  locale: string;
  currency: string;
  timezone: string;
}

export const DEFAULT_LOCALE: LocaleConfig = {
  locale: 'en-US',
  currency: 'USD',
  timezone: 'America/New_York'
};

// Locale-specific configurations
export const LOCALES: Record<string, LocaleConfig> = {
  'en-US': { locale: 'en-US', currency: 'USD', timezone: 'America/New_York' },
  'en-GB': { locale: 'en-GB', currency: 'GBP', timezone: 'Europe/London' },
  'fr-FR': { locale: 'fr-FR', currency: 'EUR', timezone: 'Europe/Paris' },
  'de-DE': { locale: 'de-DE', currency: 'EUR', timezone: 'Europe/Berlin' },
  'ja-JP': { locale: 'ja-JP', currency: 'JPY', timezone: 'Asia/Tokyo' },
  'zh-CN': { locale: 'zh-CN', currency: 'CNY', timezone: 'Asia/Shanghai' },
  'es-ES': { locale: 'es-ES', currency: 'EUR', timezone: 'Europe/Madrid' },
  'pt-BR': { locale: 'pt-BR', currency: 'BRL', timezone: 'America/Sao_Paulo' }
};

// Get current locale configuration
export function getLocaleConfig(userLocale?: string): LocaleConfig {
  return LOCALES[userLocale || 'en-US'] || DEFAULT_LOCALE;
}

// Utility functions for metrics processing
export function calculateTrend(current: string, previous: string): TrendDirection {
  const curr = parseFloat(current.replace(/[^0-9.-]/g, ''));
  const prev = parseFloat(previous.replace(/[^0-9.-]/g, ''));
  
  if (isNaN(curr) || isNaN(prev)) return 'neutral';
  
  if (curr > prev) return 'up';
  if (curr < prev) return 'down';
  return 'neutral';
}

export function formatMetricValue(
  value: string, 
  type: MetricType, 
  unit?: string,
  locale: string = 'en-US'
): string {
  const localeConfig = getLocaleConfig(locale);
  const numericValue = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
  
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat(localeConfig.locale, {
        style: 'currency',
        currency: localeConfig.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numericValue);
    
    case 'percentage':
      const percentage = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
      return new Intl.NumberFormat(localeConfig.locale, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(percentage / 100);
    
    case 'number':
      return new Intl.NumberFormat(localeConfig.locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(numericValue);
    
    case 'ratio':
      return value; // Ratios are typically formatted as "X:Y"
    
    case 'time':
      // Format duration in human-readable format
      const timeValue = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
      if (timeValue < 60) {
        return new Intl.NumberFormat(localeConfig.locale).format(timeValue) + 's';
      } else if (timeValue < 3600) {
        return new Intl.NumberFormat(localeConfig.locale).format(Math.floor(timeValue / 60)) + 'm ' + 
               new Intl.NumberFormat(localeConfig.locale).format(timeValue % 60) + 's';
      } else {
        const hours = Math.floor(timeValue / 3600);
        const minutes = Math.floor((timeValue % 3600) / 60);
        const seconds = Math.floor(timeValue % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
      }
    
    case 'count':
      return new Intl.NumberFormat(localeConfig.locale, {
        notation: 'compact',
        compactDisplay: 'short',
      }).format(parseInt(value) || 0);
    
    default:
      return value;
  }
}

export function getTrendIcon(trend?: TrendDirection): string {
  switch (trend) {
    case 'up':
    case 'positive':
      return '↗';
    case 'down':
    case 'negative':
      return '↘';
    case 'neutral':
    default:
      return '→';
  }
}

export function getTrendColor(trend?: TrendDirection): string {
  switch (trend) {
    case 'up':
    case 'positive':
      return 'text-green-600';
    case 'down':
    case 'negative':
      return 'text-red-600';
    case 'neutral':
    default:
      return 'text-text-body';
  }
}

export function calculatePercentageChange(
  current: string, 
  previous: string, 
  locale: string = 'en-US'
): string {
  const curr = parseFloat(current.replace(/[^0-9.-]/g, ''));
  const prev = parseFloat(previous.replace(/[^0-9.-]/g, ''));
  
  if (isNaN(curr) || isNaN(prev) || prev === 0) return '0%';
  
  const change = ((curr - prev) / prev * 100);
  const changeNum = parseFloat(change.toFixed(1));
  
  const localeConfig = getLocaleConfig(locale);
  return new Intl.NumberFormat(localeConfig.locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: 'always'
  }).format(changeNum / 100);
}

// Format date with locale support
export function formatDate(
  date: Date, 
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  const localeConfig = getLocaleConfig(locale);
  return new Intl.DateTimeFormat(localeConfig.locale, options).format(date);
}

// Format relative time with locale support
export function formatRelativeTime(
  date: Date, 
  locale: string = 'en-US'
): string {
  const localeConfig = getLocaleConfig(locale);
  const rtf = new Intl.RelativeTimeFormat(localeConfig.locale, {
    numeric: 'auto',
  });
  
  const now = new Date();
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(diffInSeconds, 'second');
  } else if (Math.abs(diffInSeconds) < 3600) {
    return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
  } else if (Math.abs(diffInSeconds) < 86400) {
    return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
  } else {
    return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
  }
}

// Format large numbers with locale support
export function formatLargeNumber(
  value: number, 
  locale: string = 'en-US',
  options: Intl.NumberFormatOptions = {}
): string {
  const localeConfig = getLocaleConfig(locale);
  return new Intl.NumberFormat(localeConfig.locale, {
    notation: 'compact',
    compactDisplay: 'short',
    ...options
  }).format(value);
}

// Validate metric value
export function validateMetricValue(value: string, type: MetricType): boolean {
  const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
  
  if (isNaN(numericValue)) return false;
  
  switch (type) {
    case 'percentage':
      return numericValue >= 0 && numericValue <= 100;
    case 'currency':
      return numericValue >= 0;
    case 'count':
      return numericValue >= 0 && Number.isInteger(numericValue);
    case 'time':
      return numericValue >= 0;
    case 'number':
      return true; // Numbers can be any value
    case 'ratio':
      return numericValue > 0;
    default:
      return false;
  }
}

// Helper functions for legacy data conversion
export function inferMetricType(before: string, after: string): MetricType {
  // Check for currency
  if (before.includes('$') || after.includes('$')) return 'currency';
  
  // Check for percentage
  if (before.includes('%') || after.includes('%')) return 'percentage';
  
  // Check for time-based metrics
  if (before.toLowerCase().includes('day') || after.toLowerCase().includes('day')) return 'time';
  
  // Default to number
  return 'number';
}

export function inferCategory(skillTag?: string): string {
  if (!skillTag) return 'general';
  
  if (skillTag.toLowerCase().includes('cost')) return 'financial';
  if (skillTag.toLowerCase().includes('revenue')) return 'financial';
  if (skillTag.toLowerCase().includes('people')) return 'operational';
  if (skillTag.toLowerCase().includes('growth')) return 'performance';
  
  return 'general';
}

// Get metric unit display
export function getMetricUnit(type: MetricType, locale: string = 'en-US'): string {
  const localeConfig = getLocaleConfig(locale);
  
  switch (type) {
    case 'currency':
      return localeConfig.currency;
    case 'percentage':
      return '%';
    case 'time':
      return localeConfig.locale === 'en-US' ? 'seconds' : 's';
    case 'count':
      return '';
    case 'number':
      return '';
    case 'ratio':
      return ':1';
    default:
      return '';
  }
}
